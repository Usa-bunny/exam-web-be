const AnswersService = require("./answers.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

class AnswersController {
  async correctAnswer(req: Request, res: Response) {
    try {
      const answers  = req.body.answers;

      const result = await AnswersService.correctAnswer(answers);

      return successResponse(res, 200, "Success corrected answers", result);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = new AnswersController();
