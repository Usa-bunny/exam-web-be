const CoursesService = require("./courses.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: any;
}

class CoursesController {
  async create(req: RequestWithUser, res: Response) {
    try {
      const { title, description, teacher_id, student_ids } = req.body;
      const created_by = req.user.id;

      const course = await CoursesService.create({
        title,
        description,
        created_by,
        teacher_id,
        student_ids,
      });

      return successResponse(res, 201, "Success create course", course);
    } catch (error: any) {
      const status = error.message === "Teacher not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const query = req.query;
      const courses = await CoursesService.getAll(query);

      return successResponse(res, 200, "Success get list course", courses);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const course = await CoursesService.getById(id);

      return successResponse(res, 200, "Success get details course", course);
    } catch (error: any) {
      const status = error.message === "Course not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, teacher_id, student_ids } = req.body;

      const course = await CoursesService.update(id, {
        title,
        description,
        teacher_id,
        student_ids,
      });

      return successResponse(res, 200, "Succes update course", course);
    } catch (error: any) {
      const status =
        error.message === "Teacher not found" ||
        error.message === "Course not found"
          ? 404
          : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await CoursesService.delete(id);

      return successResponse(res, 200, "Success delete course");
    } catch (error: any) {
      const status = error.message === "Course not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async getByUserId(req: RequestWithUser, res: Response) {
    try {
      const user_id = req.user.id;

      const courses = await CoursesService.getByUserId(user_id);

      return successResponse(res, 200, "Success get details course", courses);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = new CoursesController();
