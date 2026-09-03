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

  async startExam(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;
      const result = await ExamAttemptsService.startExam(exam_id, user_id);

      return successResponse(res, 200, "Success start exam", result);
    } catch (error: any) {
      const status =
        error.message === "Exam not found or you dont have access" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async saveAnswer(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;
      const bodyData = req.body;

      const result = await ExamAttemptsService.saveAnswer(
        user_id,
        exam_id,
        bodyData,
      );

      return successResponse(res, 200, "Success save exam", result);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async submitExam(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;
      const result = await ExamAttemptsService.submitExam(user_id, exam_id);

      return successResponse(res, 200, "Success submit exam", result);
    } catch (error: any) {
      const status = error.message === "Attempt not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async getMyAttempts(req: RequestWithUser, res: Response) {
    try {
      const user_id = req.user.id;
      const query = req.query;

      const attempts = await ExamAttemptsService.getMyAttempts(user_id, query);

      return successResponse(res, 200, "Success get list of attempt", attempts);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getAttemptsForTeacher(req: RequestWithUser, res: Response) {
    try {
      const user_id = req.user.id;
      const query = req.query;

      const attempts = await ExamAttemptsService.getAttemptsForTeacher(
        user_id,
        query,
      );

      return successResponse(res, 200, "Success get list of attempt", attempts);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getDetailAttempt(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const { user_id } = req.query;

      const attempt = await ExamAttemptsService.getDetailAttempt(
        exam_id,
        user_id,
      );

      return successResponse(res, 200, "Succcess get detail attempt", attempt);
    } catch (error: any) {
      const status = error.message === "Attempt not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async getDetailMyAttempt(req: RequestWithUser, res: Response) {
    try {
      const { exam_id } = req.params;
      const user_id = req.user.id;

      const attempt = await ExamAttemptsService.getDetailAttempt(
        exam_id,
        user_id,
      );

      return successResponse(res, 200, "Succcess get detail attempt", attempt);
    } catch (error: any) {
      const status = error.message === "Attempt not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }
}

module.exports = new ExamAttemptsController();
