const { Course, User, CourseUser, sequelize } = require("../../../models");
const { Op } = require("sequelize");
const {
  getPaginationParams,
  formatPagination,
  buildSearchCondition,
} = require("../../helpers/pagination");

class CoursesService {
  async create(data: {
    title: string;
    description: string;
    created_by: number | string;
    teacher_id: number | string;
    student_ids: (number | string)[];
  }) {
    const transaction = await sequelize.transaction();

    try {
      const teacher = await User.findByPk(data.teacher_id, {
        transaction,
      });

      if (!teacher) throw new Error("Teacher not found");
      if (teacher.role !== "teacher") throw new Error("User is not a teacher");

      const newCourse = await Course.create(
        {
          title: data.title,
          description: data.description,
          created_by: data.created_by,
        },
        {
          transaction,
        },
      );

      await CourseUser.create(
        {
          course_id: newCourse.id,
          user_id: teacher.id,
          role: "teacher",
        },
        {
          transaction,
        },
      );

      if (Array.isArray(data.student_ids) && data.student_ids.length > 0) {
        const students = await User.findAll({
          where: {
            id: {
              [Op.in]: data.student_ids,
            },
            role: "student",
          },
          transaction,
        });

        if (students.length !== data.student_ids.length)
          throw new Error("Some student is not found or not a student");

        const courseUsers = students.map((student: any) => ({
          course_id: newCourse.id,
          user_id: student.id,
          role: "student",
        }));

        await CourseUser.bulkCreate(courseUsers, {
          transaction,
        });
      }

      await transaction.commit();

      return await this.getById(newCourse.id);
    } catch (error: any) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  }

  async getAll(query: {
    page?: number | string;
    limit?: number | string;
    search?: string;
  }) {
    const { page, limit, offset } = getPaginationParams(query);
    const search = query.search || "";

    const whereCondition = buildSearchCondition(search, ["title"]);

    const { count, rows } = await Course.findAndCountAll({
      distinct: true,
      where: whereCondition,
      include: [
        {
          model: User,
          as: "teachers",
          attributes: ["id", "name", "email", "role"],
          through: {
            attributes: [],
            where: {
              role: "teacher",
            },
          },
        },
        {
          model: User,
          as: "students",
          attributes: ["id", "name", "email"],
          through: {
            attributes: [],
            where: {
              role: "student",
            },
          },
        },
      ],
      limit,
      offset,
    });

    const data = rows.map((course: any) => {
      const { teachers, ...courseData } = course.toJSON();

      return {
        ...courseData,
        teacher: teachers[0] || null,
        students: undefined,
        total_students: course.students ? course.students.length : 0,
      };
    });

    return {
      data: data,
      pagination: formatPagination(count, limit, page),
    };
  }

  async getById(id: number | string) {
    const courses = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: "teachers",
          attributes: ["id", "name", "email", "role"],
          through: {
            attributes: [],
            where: {
              role: "teacher",
            },
          },
        },
        {
          model: User,
          as: "students",
          attributes: ["id", "name", "email"],
          through: {
            attributes: [],
            where: {
              role: "student",
            },
          },
        },
      ],
    });

    if (!courses) throw new Error("Course not found");

    const data = courses.toJSON();

    return {
      ...data,
      teacher: data.teachers[0] || null,
      teachers: undefined,
    };
  }

  async update(
    id: number | string,
    data: {
      title: string;
      description: string;
      teacher_id: number | string;
      student_ids: (number | string)[];
    },
  ) {
    const transaction = await sequelize.transaction();

    try {
      const course = await Course.findByPk(id, { transaction });

      if (!course) throw new Error("Course not found");

      await course.update(
        {
          title: data.title,
          description: data.description,
        },
        {
          transaction,
        },
      );

      if (data.teacher_id) {
        const teacher = await User.findByPk(data.teacher_id, { transaction });

        if (!teacher) throw new Error("Teacher not found");
        if (teacher.role !== "teacher")
          throw new Error("User is not a teacher");

        await CourseUser.destroy({
          where: {
            course_id: course.id,
            role: "teacher",
          },
          transaction,
        });

        await CourseUser.create(
          {
            course_id: course.id,
            user_id: teacher.id,
            role: "teacher",
          },
          {
            transaction,
          },
        );
      }

      if (Array.isArray(data.student_ids)) {
        const students = await User.findAll({
          where: {
            id: {
              [Op.in]: data.student_ids,
            },
            role: "student",
          },
          transaction,
        });

        if (students.length !== data.student_ids.length)
          throw new Error("Some student is not found or not a student");

        await CourseUser.destroy({
          where: {
            course_id: course.id,
            role: "student",
          },
          transaction,
        });

        const courseUsers = students.map((student: any) => ({
          course_id: course.id,
          user_id: student.id,
          role: "student",
        }));

        await CourseUser.bulkCreate(courseUsers, { transaction });
      }

      await transaction.commit();

      return await this.getById(course.id);
    } catch (error: any) {
      if (!transaction.finished) {
        await transaction.rollback();
      }

      throw error;
    }
  }

  async delete(id: number | string) {
    const course = await Course.findByPk(id);

    if (!course) throw new Error("Course not found");

    await course.destroy();

    return true;
  }

  async getByUserId(user_id: number | string) {
    const course = await Course.findAll({
      attributes: ["id", "title", "description"],
      include: [
        {
          model: User,
          as: "teachers",
          attributes: [],
          required: true,
          through: {
            attributes: [],
            where: {
              role: "teacher",
            },
          },
          where: {
            id: user_id,
          },
        },
      ],
    });

    return course;
  }
}

module.exports = new CoursesService();
