const express = require("express");
const router = express.Router();
const QuestionController = require("./question.controller");
const {
  createQuestionValidator,
  updateQuestionValidator,
} = require("./question.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken, checkRole("teacher"));

router.post("/", createQuestionValidator, validate, QuestionController.create);
router.get("/course/:course_id", QuestionController.getByCourseId);
router.get("/:id", QuestionController.getById);
router.put(
  "/:id",
  updateQuestionValidator,
  validate,
  QuestionController.update,
);
router.delete("/:id", QuestionController.delete);

module.exports = router;
