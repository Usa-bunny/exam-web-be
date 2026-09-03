const express = require("express");
const router = express.Router();
const AnswersController = require("./answer.controller");
const correctAnswersValidator = require("./answer.validator");
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
