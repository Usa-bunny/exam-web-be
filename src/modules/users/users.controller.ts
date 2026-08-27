const UsersService = require("./users.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

class UsersController {
  async create(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;

      const user = await UsersService.create({
        name,
        email,
        password,
        role,
      });

      return successResponse(res, 201, "Success create user", user);
    } catch (error: any) {
      return errorResponse(res, error.statusCode, error.message);
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const query = req.query;

      const users = await UsersService.getAll(query);

      return successResponse(res, 200, "Success get users list", users);
    } catch (error: any) {
      return errorResponse(res, error.statusCode, error.message);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await UsersService.getById(id);

      return successResponse(res, 200, "Success get user detail", user);
    } catch (error: any) {
      return errorResponse(res, error.statusCode, error.message);
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { name, email, password, role } = req.body;

      const user = await UsersService.update(id, {
        name,
        email,
        password,
        role,
      });

      return successResponse(res, 200, "Success update user", user);
    } catch (error: any) {
      return errorResponse(res, error.statusCode, error.message);
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await UsersService.delete(id);

      return successResponse(res, 200, "Success delete user");
    } catch (error: any) {
      return errorResponse(res, error.statusCode, error.message);
    }
  }
}

module.exports = new UsersController();
