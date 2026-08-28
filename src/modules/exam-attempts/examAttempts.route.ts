const express = require("express");
const router = express.Router();
const ExamAttemptsController = require("./examAttempts.controller");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken);

router.get(
  "/:exam_id/detail",
  checkRole("student"),
  ExamAttemptsController.getExamDetailForStudent,
);

module.exports = router;
