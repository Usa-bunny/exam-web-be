import type { Response } from "express";

const successResponse = (
  res: Response,
  status: number = 200,
  message: string,
  data: any = null,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    errors: null,
  });
};

const errorResponse = (
  res: Response,
  status: number = 500,
  message: string,
  errors: any = null,
) => {
  return res.status(status).json({
    success: false,
    message,
    data: null,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
