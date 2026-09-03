const express = require("express");
const router = express.Router();
const AnswersController = require("./answers.controller");
const correctAnswersValidator = require("./answers.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken);

router.patch(
  "/correct",
  checkRole("teacher"),
  correctAnswersValidator,
  validate,
  AnswersController.correctAnswer,
);

module.exports = router;
