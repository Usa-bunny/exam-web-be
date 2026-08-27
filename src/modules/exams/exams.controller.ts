const ExamsService = require("./exams.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: any;
}

class ExamsController {
  async create(req: RequestWithUser, res: Response) {
    try {
      const { course_id, title, description, duration, start_time, end_time } =
        req.body;

      const user_id = req.user.id;

      const exam = await ExamsService.create({
        course_id,
        title,
        description,
        duration,
        start_time,
        end_time,
        created_by: user_id,
      });

      return successResponse(res, 201, "Success created exam", exam);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getAll(req: RequestWithUser, res: Response) {
    try {
      const query = req.query;
      const user_id = req.user.id;

      const exams = await ExamsService.getAll(query, user_id);

      return successResponse(res, 200, "Success get list exams", exams);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getById(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;

      const exam = await ExamsService.getById(exam_id, user_id);

      return successResponse(res, 200, "Success get detail exam", exam);
    } catch (error: any) {
      const status = error.message === "Exam not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async update(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;
      const { course_id, title, description, duration, start_time, end_time } =
        req.body;

      const exam = await ExamsService.update(exam_id, {
        course_id,
        title,
        description,
        duration,
        start_time,
        end_time,
        created_by: user_id
      })

      return successResponse(res, 200, "Success update exam", exam)
    } catch (error: any) {
      const status = error.message === "Course not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async delete(req:RequestWithUser, res:Response){
    try {
      const {exam_id} = req.params;
      const user_id = req.user.id;

      await ExamsService.delete(exam_id, user_id)

      return successResponse(res, 200, "Success delete exam")
    } catch (error:any) {
      const status = error.message === "Exam not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }
}

module.exports = new ExamsController();
