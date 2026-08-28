const ExamAttemptsService = require("./examAttempts.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response, NextFunction } from "express";

interface RequestWithUser extends Request {
  user?: any;
}

class ExamAttemptsController {
  async getExamDetailForStudent(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;
      const result = await ExamAttemptsService.getExamDetailForStudent(
        exam_id,
        user_id,
      );

      return successResponse(res, 200, "Success get detail exam", result);
    } catch (error: any) {
      const status =
        error.message === "Exam not found or you dont have access" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }
}

module.exports = new ExamAttemptsController();
