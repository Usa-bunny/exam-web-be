const express = require("express");
const router = express.Router();
const ExamAttemptsController = require("./examAttempts.controller");
const { saveAnswerValidator } = require("./examAttempts.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken);

router.get(
  "/teacher",
  checkRole("teacher"),
  ExamAttemptsController.getAttemptsForTeacher,
);
router.get(
  "/my-attempts",
  checkRole("student"),
  ExamAttemptsController.getMyAttempts,
);
router.get(
  "/:exam_id",
  checkRole("teacher"),
  ExamAttemptsController.getDetailAttempt,
);

router.use(checkRole("student"));

router.get("/:exam_id/detail", ExamAttemptsController.getExamDetailForStudent);
router.post("/:exam_id/start", ExamAttemptsController.startExam);
router.post(
  "/:exam_id/answer",
  saveAnswerValidator,
  validate,
  ExamAttemptsController.saveAnswer,
);
router.post("/:exam_id/submit", ExamAttemptsController.submitExam);
router.get("/my-attempts/:exam_id", ExamAttemptsController.getDetailMyAttempt);

module.exports = router;
