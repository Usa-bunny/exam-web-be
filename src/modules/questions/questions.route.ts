const express = require("express");
const router = express.Router();
const QuestionsController = require("./questions.controller");
const {
  createQuestionValidator,
  updateQuestionValidator,
} = require("./question.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken, checkRole("teacher"));

router.post("/", createQuestionValidator, validate, QuestionsController.create);
router.get("/course/:course_id", QuestionsController.getByCourseId);
router.get("/:id", QuestionsController.getById);
router.put(
  "/:id",
  updateQuestionValidator,
  validate,
  QuestionsController.update,
);
router.delete("/:id", QuestionsController.delete);

module.exports = router;
