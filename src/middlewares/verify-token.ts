const jwt = require("jsonwebtoken");
const { errorResponse } = require("../helpers/response");
const JWT_SECRET = process.env.JWT_SECRET;
import type { Request, Response, NextFunction } from "express";

interface AuthenticatedRequest extends Request {
  user?: any; 
}

const verifyToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return errorResponse(res, 401, "Token not found");
    }

    if (!authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Token must be Bearer format");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded ;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token Expired");
    }
    if (error.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Token is invalid");
    }
    return errorResponse(res, 500, error.message, error.errors);
  }
};

module.exports = verifyToken;
