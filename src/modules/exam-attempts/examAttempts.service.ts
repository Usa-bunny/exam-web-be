const {
  ExamAttempt,
  Exam,
  Course,
  Question,
  ExamQuestion,
  QuestionOption,
  CourseUser,
} = require("../../../models");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");

class ExamAttemptsService {
  async getExamDetailForStudent(exam_id: any, user_id: any) {
    const now = new Date();

    const exam = await Exam.findOne({
      where: {
        id: exam_id,
      },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "description"],
          required: true,
          include: [
            {
              model: CourseUser,
              as: "courseEnrollments",
              attributes: [],
              where: {
                user_id,
                role: "student",
              },
              required: true,
            },
          ],
        },
        {
          model: Question,
          as: "questions",
          attributes: ["id", "question_text", "type"],
          through: {
            attributes: [],
          },
          order: [["id", "ASC"]],
          include: [
            {
              model: QuestionOption,
              as: "options",
              attributes: ["id", "option_text"],
            },
          ],
        },
      ],
    });

    if (!exam) throw new Error("Exam not found or you dont have access");

    const attempt = await ExamAttempt.findOne({
      where: {
        exam_id,
        user_id,
      },
      order: [["start_time", "DESC"]],
    });

    let status = "not_started";
    let remaining_seconds = null;

    if (now < new Date(exam.start_time)) status = "upcoming";

    if (attempt) {
      remaining_seconds = Math.max(
        Math.floor(
          (new Date(attempt.end_time).getTime() - now.getTime()) / 1000,
        ),
        0,
      );

      if (attempt.status === "in_progress" && remaining_seconds <= 0) {
        await attempt.update({
          status: "completed",
        });

        attempt.status = "completed";
      }

      if (attempt.status === "in_progress") status = "in_progress";

      if (attempt.status === "completed" || attempt.status === "graded")
        status = "completed";
    }

    if (!attempt && now > new Date(exam.end_time)) status = "closed";

    let questions = [];

    if (status === "in_progress" || status === "completed") {
      questions = exam.questions.map((question: any) => ({
        id: question.id,
        question_text: question.question_text,
        type: question.type,
        options:
          question.type === "multiple_choice"
            ? question.options.map((option: any) => ({
                id: option.id,
                option_text: option.option_text,
              }))
            : [],
      }));
    }

    return {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      course: {
        id: exam.course.id,
        title: exam.course.title,
        description: exam.course.description,
      },
      start_time: exam.start_time,
      end_time: exam.end_time,
      duration: exam.duration,
      status,
      attempt: attempt
        ? {
            id: attempt.id,
            status: attempt.status,
            start_time: attempt.start_time,
            end_time: attempt.end_time,
            score: attempt.score,
            remaining_seconds:
              attempt.status === "in_progress" ? remaining_seconds : null,
          }
        : null,
      total_questions: exam.questions.length,
      questions,
    };
  }
}

module.exports = new ExamAttemptsService();
