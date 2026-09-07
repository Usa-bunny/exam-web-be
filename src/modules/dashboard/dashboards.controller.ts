const DashboardsService = require("./dashboards.service");
const { successResponse, errorResponse } = require("../../helpers/response");
import type { Request, Response } from "express";

interface RequestWithUser extends Request {
  user?: any;
}

class DashboardController {
  async getAdminStats(req: Request, res: Response) {
    try {
      const result = await DashboardsService.getAdminStats();

      return successResponse(res, 200, "Success get Admin Statistic", result);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getTeacherStats(req: RequestWithUser, res: Response) {
    try {
      const teacherId = req.user.id;
      const query = req.query;

      const result = await DashboardsService.getTeacherStats(teacherId, query);

      return successResponse(res, 200, "Success get Teacher Statistic", result);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }

  async getStudentStats(req: RequestWithUser, res: Response) {
    try {
      const studentId = req.user.id;

      const result = await DashboardsService.getStudentStats(studentId);

      return successResponse(res, 200, "Success get Student Statistic", result);
    } catch (error: any) {
      return errorResponse(res, 500, error.message);
    }
  }
}

module.exports = new DashboardController();
