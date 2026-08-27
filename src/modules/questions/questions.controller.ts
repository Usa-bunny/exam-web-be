const QuestionsService = require("./questions.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: any;
}

class QuestionsController {
  async create(req: RequestWithUser, res: Response) {
    try {
      const { question_text, type, options, course_id } = req.body;
      const user_id = req.user.id;

      const question = await QuestionsService.create({
        question_text,
        type,
        options,
        course_id,
        created_by: user_id,
      });

      return successResponse(res, 201, "Success create question", question);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getByCourseId(req: RequestWithUser, res: Response) {
    try {
      const { course_id } = req.params;
      const user_id = req.user.id;

      const data = await QuestionsService.getByCourseId(
        course_id,
        req.query,
        user_id,
      );

      return successResponse(res, 200, "Success get question list", data);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getById(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      const question = await QuestionsService.getById(id, user_id);

      return successResponse(res, 200, "Success get question detail", question);
    } catch (error: any) {
      const status = error.message === "Question not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async update(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      const { question_text, type, options } = req.body;
      const user_id = req.user.id;

      const question = await QuestionsService.update(id, {
        question_text,
        type,
        options,
        created_by: user_id,
      });

      return successResponse(res, 200, "Success update question", question);
    } catch (error: any) {
      const status = error.message === "Question not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }

  async delete(req: RequestWithUser, res: Response) {
    try {
      const { id } = req.params;
      const user_id = req.user.id;

      await QuestionsService.delete(id, user_id);

      return successResponse(res, 200, "Success delete question");
    } catch (error: any) {
      const status = error.message === "Question not found" ? 404 : 500;
      return errorResponse(res, status, error.message);
    }
  }
}

module.exports = new QuestionsController();
