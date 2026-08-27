const { Exam, Course } = require("../../../models");
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

  async update(id:any, data:any){
    if (data.course_id){
        const course = await Course.findByPk(data.course_id);
        if (!course) throw new Error("Course not found")
    }

    const exam = await this.getById(id, data.created_by)

    await exam.update(data);

    return exam;
  }

  async delete(id:any, user_id:any){
    const exam = await Exam.findOne({
        where: {
            id,
            created_by: user_id
        }
    })

    if (!exam) throw new Error("Exam not found")

    await exam.destroy();
    
    return true;
  }
}

module.exports = new ExamsService();
