const {
  ExamAttempt,
  Exam,
  Course,
  Question,
  QuestionOption,
  CourseUser,
  ExamQuestion,
  Answer,
  User,
} = require("../../../models");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");
const socket = require("../../socket");

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

  async startExam(exam_id: any, user_id: any) {
    const now = new Date();

    const exam = await Exam.findOne({
      where: {
        id: exam_id,
      },
      include: [
        {
          model: Course,
          as: "course",
          required: true,
          include: [
            {
              model: CourseUser,
              as: "courseEnrollments",
              where: {
                user_id,
                role: "student",
              },
              attributes: [],
              required: true,
            },
          ],
        },
      ],
    });

    if (!exam) throw new Error("Exam not found or you dont have access");

    if (now < new Date(exam.start_time))
      throw new Error("Exam has not started yet");

    if (now > new Date(exam.end_time))
      throw new Error("Exam has already ended");

    let existingAttempt = await ExamAttempt.findOne({
      where: {
        exam_id,
        user_id,
      },
    });

    if (
      existingAttempt &&
      existingAttempt.status === "in_progress" &&
      new Date(existingAttempt.end_time) < now
    ) {
      await existingAttempt.update({
        status: "completed",
      });

      existingAttempt.status = "completed";
    }

    if (existingAttempt) {
      if (
        existingAttempt.status === "completed" ||
        existingAttempt.status === "graded"
      )
        throw new Error("You already complete this exam");

      return {
        attempt_id: existingAttempt.id,
        status: existingAttempt.status,
        start_time: existingAttempt.start_time,
        end_time: existingAttempt.end_time,
      };
    }

    const startTime = now;

    const durationEndTime = new Date(
      startTime.getTime() + exam.duration * 60 * 1000,
    );

    const endTime = new Date(
      Math.min(durationEndTime.getTime(), new Date(exam.end_time).getTime()),
    );

    const attempt = await ExamAttempt.create({
      exam_id,
      user_id,
      start_time: startTime,
      end_time: endTime,
      status: "in_progress",
      score: 0,
    });

    await this.emitExamMonitorUpdate(exam_id);

    return {
      attempt_id: attempt.id,
      status: attempt.status,
      start_time: attempt.start_time,
      end_time: attempt.end_time,
    };
  }

  async saveAnswer(user_id: any, exam_id: any, bodyData: any) {
    let {
      question_id,
      selected_option_id = null,
      essay_answer = null,
    } = bodyData;

    const attempt = await ExamAttempt.findOne({
      where: {
        exam_id,
        user_id,
        status: "in_progress",
      },
    });

    if (!attempt) throw new Error("Attempt not found");

    if (attempt.user_id !== user_id)
      throw new Error("You dont have access to this exam");

    if (attempt.status !== "in_progress") throw new Error("Exam is finished");

    if (new Date() > new Date(attempt.end_time)) {
      await attempt.update({
        status: "completed",
      });

      throw new Error("Exam time is up");
    }

    const question = await Question.findByPk(question_id);

    if (!question) throw new Error("Question not found");

    const examQuestion = await ExamQuestion.findOne({
      where: {
        exam_id: attempt.exam_id,
        question_id,
      },
    });

    if (!examQuestion) throw new Error("Question is not in this Exam");

    let option = null;

    if (question.type === "multiple_choice") {
      if (selected_option_id) {
        option = await QuestionOption.findOne({
          where: { id: selected_option_id, question_id },
        });
        if (!option) option = { is_correct: false };
        essay_answer = null;
      } else {
        option = { is_correct: false };
      }
    }

    if (question.type === "essay") {
      if (!essay_answer || essay_answer.trim() === "") essay_answer = null;

      selected_option_id = null;
    }

    const isCorrectValue =
      question.type === "multiple_choice"
        ? (option?.is_correct ?? false)
        : question.type === "essay"
          ? essay_answer === null
            ? false
            : null
          : null;

    const scoreValue =
      isCorrectValue === true ? 100 : isCorrectValue === false ? 0 : null;

    await Answer.upsert({
      attempt_id: attempt.id,
      question_id,
      selected_option_id,
      essay_answer,
      is_correct: isCorrectValue,
      percentage: scoreValue,
    });

    return {
      attempt_id: attempt.id,
      question_id,
      saved: true,
    };
  }

  async submitExam(user_id: any, exam_id: any) {
    const attempt = await ExamAttempt.findOne({
      where: {
        exam_id,
        user_id,
        status: "in_progress",
      },
      include: [
        {
          model: Exam,
          as: "exam",
          include: [
            {
              model: Question,
              as: "questions",
            },
          ],
        },
        {
          model: Answer,
          as: "answers",
        },
      ],
    });

    if (!attempt) throw new Error("Attempt not found");

    if (attempt.user_id !== user_id)
      throw new Error("You dont have access to this exam");

    if (attempt.status !== "in_progress") throw new Error("Exam is finished");

    const now = new Date();

    if (now > new Date(attempt.exam.end_time)) {
      await attempt.update({
        status: "completed",
      });

      throw new Error("Exam time is up");
    }

    const answeredQuestionIds = attempt.answers.map(
      (answer: any) => answer.question_id,
    );
    for (const question of attempt.exam.questions) {
      if (!answeredQuestionIds.includes(question.id)) {
        await Answer.upsert({
          attempt_id: attempt.id,
          question_id: question.id,
          selected_option_id: null,
          essay_answer: null,
          is_correct: false,
          percentage: 0,
        });
      }
    }

    const hasEssayQuestion = attempt.answers.some(
      (answer: any) => answer.is_correct === null,
    );

    let totalScoreSum = 0;
    for (const answer of attempt.answers) {
      if (answer.percentage !== null && answer.percentage !== undefined) {
        totalScoreSum += answer.percentage;
      } else {
        totalScoreSum += answer.is_correct ? 100 : 0;
      }
    }

    const finalScore =
      attempt.exam.questions.length > 0
        ? Math.round(totalScoreSum / attempt.exam.questions.length)
        : 0;

    await attempt.update({
      status: hasEssayQuestion ? "completed" : "graded",
      score: hasEssayQuestion ? null : finalScore,
      end_time: new Date(),
    });

    await this.emitExamMonitorUpdate(exam_id);

    return {
      attempt_id: attempt.id,
      score: hasEssayQuestion ? null : finalScore,
      need_review: hasEssayQuestion,
      status: hasEssayQuestion ? "completed" : "graded",
    };
  }

  async getMyAttempts(user_id: any, query: any) {
    const { page, limit, offset } = getPaginationParams(query);
    const search = query.search || "";

    const where = {
      user_id,
      ...buildSearchCondition(search, ["$exam.title$", "$exam.course.title$"]),
    };

    const { count, rows } = await ExamAttempt.findAndCountAll({
      where,
      include: [
        {
          model: Exam,
          as: "exam",
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title"],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["start_time", "DESC"]],
    });

    const attempts = rows.map((attempt: any) => ({
      exam_id: attempt.exam_id,
      attempt_id: attempt.id,
      exam_title: attempt.exam.title,
      exam_description: attempt.exam.description,
      course_title: attempt.exam.course.title,
      end_time: attempt.end_time,
      score: attempt.score,
      status: attempt.status,
    }));

    return {
      data: attempts,
      pagination: formatPagination(count, limit, page),
    };
  }

  async getAttemptsForTeacher(user_id: any, query: any) {
    const { page, limit, offset } = getPaginationParams(query);
    const search = query.search || "";
    const status = query.status || "";

    const whereCondition = {
      ...buildSearchCondition(search, ["$user.name$", "$user.email$"]),
    };

    if (status) {
      whereCondition.status = status;
    }

    const { count, rows } = await ExamAttempt.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Exam,
          as: "exam",
          where: { created_by: user_id },
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title", "description"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      subQuery: false,
      limit,
      offset,
      order: [["start_time", "DESC"]],
    });

    const attempts = rows.map((attempt: any) => ({
      user_id: attempt.user_id,
      exam_id: attempt.exam_id,
      attempt_id: attempt.id,
      student_name: attempt.user ? attempt.user.name : "",
      exam_title: attempt.exam ? attempt.exam.title : "",
      exam_description: attempt.exam ? attempt.exam.description : "",
      score: attempt.score,
      status: attempt.status,
    }));

    return {
      data: attempts,
      pagination: formatPagination(count, limit, page),
    };
  }

  async getDetailAttempt(exam_id: any, user_id: any) {
    const attempt = await ExamAttempt.findOne({
      where: {
        exam_id,
        user_id,
      },
      include: [
        {
          model: Exam,
          as: "exam",
          attributes: ["id", "title", "description"],
          include: [
            {
              model: Course,
              as: "course",
              attributes: ["id", "title"],
            },
          ],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!attempt) throw new Error("Attempt not found");

    const answers = await Answer.findAll({
      where: { attempt_id: attempt.id },
      include: [
        {
          model: Question,
          as: "question",
          include: [
            {
              model: QuestionOption,
              as: "options",
              attributes: ["id", "option_text"],
            },
          ],
        },
      ],
      order: [
        [
          {
            model: Question,
            as: "question",
          },
          "id",
          "ASC",
        ],
      ],
    });

    const formattedQuestions = answers.map((answer: any) => {
      const question = answer.question;
      let selectedOptionText = null;

      if (question.type === "multiple_choice") {
        const sortedOptions = (question.options || []).sort(
          (a: any, b: any) => a.id - b.id,
        );
        const selectedIndex = sortedOptions.findIndex(
          (opt: any) => opt.id === answer.selected_option_id,
        );
        if (selectedIndex !== -1) {
          const letter = String.fromCharCode(65 + selectedIndex);
          selectedOptionText = `${letter}. ${sortedOptions[selectedIndex].option_text}`;
        }
      }

      return {
        id: question.id,
        question_text: question.question_text,
        type: question.type,
        options: question && question.options ? question.options : [],
        answer: {
          id: answer.id,
          selected_option: selectedOptionText,
          essay_answer: answer.essay_answer,
          is_correct: answer.is_correct,
          percentage: answer.percentage,
        },
      };
    });

    return {
      attempt_id: attempt.id,
      student_name: attempt.user ? attempt.user.name : "",
      exam_title: attempt.exam.title,
      course_title: attempt.exam.course.title,
      completion_time: attempt.end_time ? attempt.end_time : "-",
      score: attempt.score,
      max_score: 100,
      status: attempt.status,
      questions: formattedQuestions,
    };
  }

  async emitExamMonitorUpdate(exam_id: any) {
    const io = socket.getIO();
    console.log(`[SOCKET] Emit exam-monitor:refresh => exam: ${exam_id}`);
    io.to("monitor").emit("exam-monitor:refresh", { exam_id });
  }
}

module.exports = new ExamAttemptsService();
