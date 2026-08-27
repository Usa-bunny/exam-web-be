const { Question, QuestionOption, Course, Exam } = require("../../../models");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");

class QuestionsService {
  async create(data: any) {
    const course = await Course.findByPk(data.course_id);

    if (!course) throw new Error("Course not found");

    if (
      data.type === "multiple_choice" &&
      (!Array.isArray(data.options) || data.options.length === 0)
    )
      throw new Error("Options must be fill for multiple choice question");

    const newQuestion = await Question.create({
      question_text: data.question_text,
      type: data.type,
      created_by: data.created_by,
      course_id: data.course_id,
    });

    if (newQuestion.type === "multiple_choice" && Array.isArray(data.options)) {
      const options = data.options.map((option: any) => ({
        question_id: newQuestion.id,
        option_text: option.option_text,
        is_correct: option.is_correct || false,
      }));
      await QuestionOption.bulkCreate(options);
    }

    return await this.getById(newQuestion.id, data.created_by);
  }

  async getByCourseId(course_id: any, query: any, user_id: any) {
    const { page, limit, offset } = getPaginationParams(query);
    const search = query.search || "";
    const type = query.type || null;

    const whereCondition = {
      created_by: user_id,
      course_id: course_id,
      ...buildSearchCondition(search, ["question_text"]),
    };

    if (type) whereCondition.type = type;

    const { count, rows } = await Question.findAndCountAll({
      distinct: true,
      where: whereCondition,
      include: [
        {
          model: Exam,
          as: "exams",
          attributes: ["id"],
          through: {
            attributes: [],
          },
        },
      ],
      limit,
      offset,
    });

    return {
      data: rows.map((question: any) => ({
        ...question.toJSON(),
        total_exams: question.exams.length,
        exams: undefined,
      })),
      pagination: formatPagination(count, limit, page),
    };
  }

  async getById(id: any, user_id: any) {
    const question = await Question.findOne({
      where: {
        id,
        created_by: user_id,
      },
      include: [
        {
          model: QuestionOption,
          as: "options",
          attributes: ["id", "option_text", "is_correct"],
          required: false,
        },
      ],
    });

    if (!question) throw new Error("Question not found");

    return {
      id: question.id,
      question_text: question.question_text,
      type: question.type,
      options:
        question.type === "multiple_choice" ? question.options : undefined,
    };
  }

  async update(id: any, data: any) {
    const question = await Question.findOne({
      where: {
        id,
        created_by: data.created_by,
      },
    });

    if (!question) throw new Error("Question not found");

    if (data.course_id) {
      const course = await Course.findByPk(data.course_id);
      if (!course) throw new Error("Course not found");
    }

    const questionType = data.type || question.type;

    if (questionType === "essay" && question.type === "multiple_choice") {
       await QuestionOption.destroy({ where: { question_id: question.id } });
    }

    await question.update({
      question_text: data.question_text ?? question.question_text,
      type: questionType,
      course_id: data.course_id ?? question.course_id,
    });

    if (questionType === "multiple_choice" && data.options) {
      if (!Array.isArray(data.options) || data.options.length === 0) {
        throw new Error("Options must be a non-empty array");
      }

      await QuestionOption.destroy({
        where: { question_id: question.id },
      });

      const options = data.options.map((option: any) => ({
        question_id: question.id,
        option_text: option.option_text,
        is_correct: option.is_correct || false,
      }));

      await QuestionOption.bulkCreate(options);
    }

    return await this.getById(question.id, data.created_by);
  }

  async delete(id: any, user_id: any) {
    const question = await Question.findOne({
      where: {
        id,
        created_by: user_id,
      },
    });

    if (!question) throw new Error("Question not found");

    const questionOptions = await QuestionOption.findAll({
      where: {
        question_id: id
      }
    })

    if (questionOptions.length > 0){
      await QuestionOption.destroy({
        where: {
          question_id: id
        }
      })
    }

    await question.destroy();
    return true;
  }
}

module.exports = new QuestionsService();
