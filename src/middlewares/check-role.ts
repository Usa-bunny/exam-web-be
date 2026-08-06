const { errorResponse } = require("../helpers/response");
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: any; 
}

const checkRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if(!req.user){
        return errorResponse(res, 401, "Unauthorized")
    }

    if(!roles.includes(req.user.role)){
        return errorResponse(res, 403, "Access denied")
    }

    next()
  };
};

module.exports = checkRole;
