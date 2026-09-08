const {
  User,
  Exam,
  Course,
  Question,
  ExamQuestion,
  QuestionOption,
  CourseUser,
  ExamAttempt,
} = require("../../../models");
const { Op } = require("sequelize");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");

class ExamsService {
  async create(data: {
    course_id: number | string;
    title: string;
    description: string;
    duration: number | string;
    start_time: Date;
    end_time: Date;
    created_by: number | string;
  }) {
    const course = await Course.findByPk(data.course_id);

    if (!course) throw new Error("Course not found");

    const newExam = await Exam.create({ ...data });

    return await this.getById(newExam.id, data.created_by);
  }

  async getAll(
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      course_id?: number | string;
    },
    user_id: number | string,
  ) {
    const { page, limit, offset } = getPaginationParams(query);
    const search = query.search || "";
    const course_id = query.course_id || null;

    const whereCondition = {
      created_by: user_id,
      ...buildSearchCondition(search, ["title"]),
    };

    if (course_id) whereCondition.course_id = course_id;

    const { count, rows } = await Exam.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows,
      pagination: formatPagination(count, limit, page),
    };
  }

  async getById(id: number | string, user_id: number | string) {
    const exam = await Exam.findOne({
      where: {
        id,
        created_by: user_id,
      },
    });

    if (!exam) throw new Error("Exam not found");

    return exam;
  }

  async update(
    id: number | string,
    data: {
      course_id: number | string;
      title: string;
      description: string;
      duration: number | string;
      start_time: Date;
      end_time: Date;
      created_by: number | string;
    },
  ) {
    if (data.course_id) {
      const course = await Course.findByPk(data.course_id);
      if (!course) throw new Error("Course not found");
    }

    const exam = await this.getById(id, data.created_by);

    await exam.update(data);

    return exam;
  }

  async delete(id: number | string, user_id: number | string) {
    const exam = await Exam.findOne({
      where: {
        id,
        created_by: user_id,
      },
    });

    if (!exam) throw new Error("Exam not found");

    await exam.destroy();

    return true;
  }

  async assignQuestions(
    exam_id: number | string,
    question_ids: number | string,
    user_id: number | string,
  ) {
    if (!Array.isArray(question_ids) || question_ids.length === 0)
      throw new Error("Question IDs must be an array");

    const exam = await Exam.findOne({
      where: {
        id: exam_id,
        created_by: user_id,
      },
    });

    if (!exam) throw new Error("Exam not found");

    const questions = await Question.findAll({
      where: {
        id: {
          [Op.in]: question_ids,
        },
        created_by: user_id,
      },
    });

    if (questions.length !== question_ids.length)
      throw new Error("One or more questions not found");

    await ExamQuestion.destroy({
      where: {
        exam_id,
      },
    });

    await ExamQuestion.bulkCreate(
      question_ids.map((question_id: any) => ({
        exam_id,
        question_id,
      })),
    );

    return {
      exam_id,
      total_questions: question_ids.length,
    };
  }

  async getAssignQuestions(exam_id: number | string, user_id: number | string) {
    const exam = await Exam.findOne({
      where: {
        id: exam_id,
        created_by: user_id,
      },
      include: [
        {
          model: Question,
          as: "questions",
          include: [
            {
              model: QuestionOption,
              as: "options",
            },
          ],
        },
      ],
    });

    if (!exam) throw new Error("Exam not found");

    return exam.questions;
  }

  async getMyExams(
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      status?:
        | "berlangsung"
        | "pending"
        | "selesai"
        | "tersedia"
        | "terlewat"
        | "mendatang"
        | "";
    },
    user_id: number | string,
  ) {
    const { page, limit, offset } = getPaginationParams(query);

    const search = query.search || "";
    const statusFilter = query.status || "";

    const now = new Date();

    const studentCourses = await CourseUser.findAll({
      where: {
        user_id,
        role: "student",
      },
      attributes: ["course_id"],
    });

    const courseIds = studentCourses.map((course: any) => course.course_id);

    if (!courseIds.length) {
      return {
        data: [],
        pagination: {
          ...formatPagination(0, limit, page),
          per_page: limit,
          has_next_page: false,
          has_prev_page: false,
        },
      };
    }

    const completeOrGradedAttempts = await ExamAttempt.findAll({
      where: {
        user_id,
        status: {
          [Op.in]: ["completed", "graded"],
        },
      },
      attributes: ["exam_id"],
    });

    const excludeExamIds = completeOrGradedAttempts.map(
      (attempt: any) => attempt.exam_id,
    );

    const examWhere: Record<string, any> = {
      course_id: {
        [Op.in]: courseIds,
      },
      ...buildSearchCondition(search, ["title"]),
    };

    if (excludeExamIds.length > 0) {
      examWhere.id = {
        [Op.notIn]: excludeExamIds,
      };
    }

    const attemptInclude: any = {
      model: ExamAttempt,
      as: "attempts",
      attributes: ["id", "status"],
      required: false,
      where: {
        user_id,
      },
    };

    switch (statusFilter) {
      case "berlangsung":
        attemptInclude.required = true;
        attemptInclude.where.status = "in_progress";
        break;
      case "pending":
      case "selesai":
        return {
          data: [],
          pagination: formatPagination(0, limit, page),
        };
      case "tersedia":
        examWhere.start_time = {
          [Op.lte]: now,
        };
        examWhere.end_time = {
          [Op.gte]: now,
        };
        attemptInclude.required = false;
        break;
      case "terlewat":
        examWhere.end_time = {
          [Op.lt]: now,
        };
        attemptInclude.required = false;
        break;
      case "mendatang":
        examWhere.start_time = {
          [Op.gt]: now,
        };
        break;
    }

    const { count, rows } = await Exam.findAndCountAll({
      where: examWhere,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
        attemptInclude,
      ],
      distinct: true,
      limit,
      offset,
      order: [["start_time", "DESC"]],
    });

    let data = rows.map((exam: any) => {
      const attempt = exam.attempts?.[0];

      let status = "tersedia";

      if (attempt?.status === "in_progress") {
        status = "berlangsung";
      } else if (new Date(exam.start_time) > now) {
        status = "mendatang";
      } else if (new Date(exam.end_time) < now) {
        status = "terlewat";
      }

      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        course: exam.course?.title,
        start_time: exam.start_time,
        end_time: exam.end_time,
        duration: exam.duration,
        status,
      };
    });

    if (statusFilter === "tersedia")
      data = data.filter((item: any) => item.status === "tersedia");

    if (statusFilter === "terlewat")
      data = data.filter((item: any) => item.status === "terlewat");

    const totalData =
      statusFilter === "tersedia" || statusFilter === "terlewat"
        ? data.length
        : count;

    return {
      data,
      pagination: formatPagination(totalData, limit, page),
    };
  }

  async getActiveExams() {
    const now = new Date();

    return await Exam.findAll({
      attributes: [
        "id",
        "course_id",
        "title",
        "description",
        "start_time",
        "end_time",
      ],
      where: {
        start_time: {
          [Op.lte]: now,
        },
        end_time: {
          [Op.gte]: now,
        },
      },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["start_time", "ASC"]],
    });
  }

  async getExamAttempts(
    exam_id: number | string,
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
    } = {},
  ) {
    const { page, limit, offset } = getPaginationParams(query);

    const { rows, count } = await ExamAttempt.findAndCountAll({
      where: { exam_id },
      attributes: ["id", "start_time", "end_time", "status", "score"],
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
      limit,
      offset,
      order: [["start_time", "DESC"]],
    });

    return {
      data: rows,
      pagination: formatPagination(count, limit, page),
    };
  }

  async getExamMonitor(
    exam_id: number | string,
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
    } = {},
  ) {
    const exam = await Exam.findByPk(exam_id, {
      attributes: [
        "id",
        "course_id",
        "title",
        "description",
        "start_time",
        "end_time",
      ],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });

    if (!exam) throw new Error("Exam not found");

    const attempts = await this.getExamAttempts(exam_id, query);

    return {
      ...exam.toJSON(),
      attempts: attempts.data,
      pagination: attempts.pagination,
    };
  }
}

module.exports = new ExamsService();
