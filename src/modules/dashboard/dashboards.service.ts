const db = require("../../../models");
const {
  User,
  Course,
  Exam,
  ExamAttempt,
  Question,
  CourseUser,
} = require("../../../models");
const { Op, fn, col } = require("sequelize");
const {
  getPaginationParams,
  formatPagination,
} = require("../../helpers/pagination");

class DashboardsService {
  async getAdminStats() {
    const now = new Date();

    const [totalUsers, totalCourses, ongoingExams, avgScoreResult, userRoles] =
      await Promise.all([
        User.count(),
        Course.count(),
        Exam.count({
          where: {
            start_time: { [Op.lte]: now },
            end_time: { [Op.gte]: now },
          },
        }),
        ExamAttempt.findOne({
          attributes: [[fn("AVG", col("score")), "average_score"]],
          where: {
            status: { [Op.in]: ["completed", "graded"] },
            score: { [Op.ne]: null },
          },
          raw: true,
        }),
        User.findAll({
          attributes: ["role", [fn("COUNT", col("id")), "count"]],
          group: ["role"],
          raw: true,
        }),
      ]);

    const averageScore = avgScoreResult?.average_score
      ? Number(parseFloat(avgScoreResult.average_score).toFixed(2))
      : 0;

    const roleMap: Record<string, number> = {
      admin: 0,
      teacher: 0,
      student: 0,
    };

    userRoles.forEach((role: any) => {
      roleMap[role.role] = Number(role.count);
    });

    const userComposition = Object.entries(roleMap).map(([role, count]) => ({
      role,
      count,
      percentage:
        totalUsers > 0 ? Number(((count / totalUsers) * 100).toFixed(1)) : 0,
    }));

    const courseAverages = await ExamAttempt.findAll({
      attributes: [
        [col("exam.course.title"), "course_title"],
        [fn("AVG", col("ExamAttempt.score")), "average_score"],
        [fn("COUNT", col("ExamAttempt.id")), "total_attempts"],
      ],
      where: {
        status: { [Op.in]: ["completed", "graded"] },
        score: { [Op.ne]: null },
      },
      include: [
        {
          model: Exam,
          as: "exam",
          attributes: [],
          required: true,
          include: [
            {
              model: Course,
              as: "course",
              attributes: [],
              required: true,
            },
          ],
        },
      ],
      group: ["exam.course.id", "exam.course.title"],
      order: [[fn("AVG", col("score")), "DESC"]],
      raw: true,
    });

    const formattedCourseAverages = courseAverages.map((course: any) => ({
      course_title: course.course_title,
      average_score: Number(parseFloat(course.average_score).toFixed(2)),
      total_attempts: Number(course.total_attempts),
    }));

    return {
      card_stats: {
        total_users: totalUsers,
        total_courses: totalCourses,
        ongoing_exams: ongoingExams,
        average_score: averageScore,
      },
      user_composition: userComposition,
      course_averages: formattedCourseAverages,
    };
  }

  async getTeacherStats(teacherId: any, query: any = {}) {
    const { page, limit, offset } = getPaginationParams(query, 5);

    const [
      totalExams,
      totalQuestions,
      totalCourses,
      totalAttempts,
      statusCounts,
    ] = await Promise.all([
      Exam.count({
        where: { created_by: teacherId },
      }),
      Question.count({
        where: { created_by: teacherId },
      }),
      CourseUser.count({
        where: {
          user_id: teacherId,
          role: "teacher",
        },
      }),
      ExamAttempt.count({
        include: [
          {
            model: Exam,
            as: "exam",
            where: { created_by: teacherId },
            required: true,
          },
        ],
      }),
      ExamAttempt.findAll({
        attributes: ["status", [fn("COUNT", col("ExamAttempt.id")), "count"]],
        include: [
          {
            model: Exam,
            as: "exam",
            where: { created_by: teacherId },
            attributes: [],
            required: true,
          },
        ],
        group: ["status"],
        raw: true,
      }),
    ]);

    const examAveragesQuery = await ExamAttempt.findAndCountAll({
      attributes: [
        [col("exam.id"), "id"],
        [col("exam.title"), "exam_title"],
        [col("exam.start_time"), "start_time"],
        [fn("AVG", col("score")), "average_score"],
      ],
      where: {
        status: { [Op.in]: ["completed", "graded"] },
        score: { [Op.ne]: null },
      },
      include: [
        {
          model: Exam,
          as: "exam",
          where: { created_by: teacherId },
          attributes: [],
          required: true,
        },
      ],
      group: ["exam.id", "exam.title", "exam.start_time"],
      order: [[col("exam.id"), "DESC"]],
      limit,
      offset,
      raw: true,
    });

    const totalExamAverages = Array.isArray(examAveragesQuery.count)
      ? examAveragesQuery.count.length
      : examAveragesQuery.count;

    const examAverages = {
      data: examAveragesQuery.rows.map((item: any) => ({
        exam_title: item.exam_title,
        average_score: Number(parseFloat(item.average_score).toFixed(2)),
        start_time: item.start_time,
        id: item.id,
      })),
      pagination: formatPagination(totalExamAverages, limit, page),
    };

    let completedCount = 0;
    let inProgressCount = 0;

    statusCounts.forEach((item: any) => {
      if (item.status === "completed" || item.status === "graded") {
        completedCount += parseInt(item.count, 10);
      } else if (item.status === "in_progress") {
        inProgressCount += parseInt(item.count, 10);
      }
    });

    const totalStatusAttempts = completedCount + inProgressCount;
    let completedPercent =
      totalStatusAttempts > 0
        ? Math.round((completedCount / totalStatusAttempts) * 100)
        : 0;
    let inProgressPercent =
      totalStatusAttempts > 0
        ? Math.round((inProgressCount / totalStatusAttempts) * 100)
        : 0;

    if (
      totalStatusAttempts > 0 &&
      completedPercent + inProgressPercent !== 100
    ) {
      inProgressPercent = 100 - completedPercent;
    }

    const examAttemptStatus = [
      {
        status: "Selesai",
        count: completedCount,
        percentage: completedPercent,
      },
      {
        status: "Sedang Dikerjakan",
        count: inProgressCount,
        percentage: inProgressPercent,
      },
    ];

    return {
      card_stats: {
        total_exams: totalExams,
        total_questions: totalQuestions,
        total_courses: totalCourses,
        total_attempts: totalAttempts,
      },
      exam_averages: examAverages,
      exam_attempt_status: examAttemptStatus,
    };
  }

  async getStudentStats(studentId: any) {
    const now = new Date();

    const [
      enrolledCoursesCount,
      completedExamsCount,
      studentAvgResult,
      enrolledCourses,
    ] = await Promise.all([
      CourseUser.count({
        where: {
          user_id: studentId,
          role: "student",
        },
      }),
      ExamAttempt.count({
        where: {
          user_id: studentId,
          status: { [Op.in]: ["completed", "graded"] },
        },
      }),
      ExamAttempt.findOne({
        attributes: [[fn("AVG", col("score")), "average_score"]],
        where: {
          user_id: studentId,
          status: { [Op.in]: ["completed", "graded"] },
          score: { [Op.ne]: null },
        },
        raw: true,
      }),
      CourseUser.findAll({
        where: {
          user_id: studentId,
          role: "student",
        },
        attributes: ["course_id"],
        raw: true,
      }),
    ]);

    const averageScore =
      studentAvgResult && studentAvgResult.average_score
        ? Number(parseFloat(studentAvgResult.average_score).toFixed(2))
        : 0;

    const courseIds = enrolledCourses.map((course: any) => course.course_id);
    let availableExamsCount = 0;

    if (courseIds.length > 0) {
      const activeExams = await Exam.findAll({
        where: {
          course_id: { [Op.in]: courseIds },
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now },
        },
        attributes: ["id"],
        raw: true,
      });

      const activeExamIds = activeExams.map((exam: any) => exam.id);

      if (activeExamIds.length > 0) {
        const completedAttempts = await ExamAttempt.findAll({
          where: {
            user_id: studentId,
            exam_id: { [Op.in]: activeExamIds },
            status: { [Op.in]: ["completed", "graded"] },
          },
          attributes: ["exam_id"],
          raw: true,
        });

        const completedExamIds = completedAttempts.map(
          (completedAttempt: any) => completedAttempt.exam_id,
        );
        availableExamsCount = activeExamIds.filter(
          (id: any) => !completedExamIds.includes(id),
        ).length;
      }
    }

    return {
      card_stats: {
        available_exams: availableExamsCount,
        completed_exams: completedExamsCount,
        enrolled_courses: enrolledCoursesCount,
        average_score: averageScore,
      },
    };
  }
}

module.exports = new DashboardsService();
