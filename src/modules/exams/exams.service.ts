const {
  Exam,
  Course,
  Question,
  ExamQuestion,
  QuestionOption,
} = require("../../../models");
const { Op } = require("sequelize");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");

class ExamsService {
  async create(data: any) {
    const course = await Course.findByPk(data.course_id);

    if (!course) throw new Error("Course not found");

    const newExam = await Exam.create({ ...data });

    return await this.getById(newExam.id, data.created_by);
  }

  async getAll(query: any, user_id: any) {
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

  async getById(id: any, user_id: any) {
    const exam = await Exam.findOne({
      where: {
        id,
        created_by: user_id,
      },
    });

    if (!exam) throw new Error("Exam not found");

    return exam;
  }

  async update(id: any, data: any) {
    if (data.course_id) {
      const course = await Course.findByPk(data.course_id);
      if (!course) throw new Error("Course not found");
    }

    const exam = await this.getById(id, data.created_by);

    await exam.update(data);

    return exam;
  }

  async delete(id: any, user_id: any) {
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

  async assignQuestions(exam_id: any, question_ids: any, user_id: any) {
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

  async getAssignQuestions(exam_id:any, user_id:any){
    const exam = await Exam.findOne({
      where: {
        id: exam_id,
        created_by: user_id
      },
      include: [
        {
          model: Question,
          as: "questions",
          include: [
            {
              model: QuestionOption,
              as: "options"
            }
          ]
        }
      ]
    })

    if (!exam) throw new Error("Exam not found");

    return exam.questions;
  }
}

module.exports = new ExamsService();
