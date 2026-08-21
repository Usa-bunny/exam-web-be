const { validationResult } = require("express-validator");
const { errorResponse } = require("../helpers/response");
import type { Request, Response, NextFunction } from "express";

const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error: any) => ({
      field: error.path,
      message: error.msg,
    }));

    return errorResponse(res, 400, "Validation Error", formattedErrors);
  }

  next();
};

module.exports = validate;
