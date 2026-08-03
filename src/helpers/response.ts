const successResponse = (
  res: any,
  status = 200,
  message: any,
  data = null,
) => {
  return res.status(status).json({
    success: true,
    message,
    data,
    errors: null,
  });
};

const errorResponse = (
  res: any,
  status: any,
  message: any,
  errors = null,
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
