const AuthService = require("./auth.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login({ email, password });

      return successResponse(res, 200, "Login success", result);
    } catch (error: any) {
      const status = error.message === "Invalid email or password" ? 401 : (error.statusCode || 500);
      return errorResponse(res, status, error.message, error.errors);
    }
  }
}
 
module.exports = new AuthController();
