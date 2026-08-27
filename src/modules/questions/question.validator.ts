const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const createQuestionValidator: ValidationChain[] = [
  body("course_id")
    .notEmpty()
    .withMessage("course_id must be fill")
    .isInt()
    .withMessage("course_id must be integer"),
  body("question_text").notEmpty().withMessage("question_text must be fill"),
  body("type")
    .notEmpty()
    .withMessage("type must be fill")
    .isIn(["multiple_choice", "essay"])
    .withMessage("type must fill multiple_choice or essay"),
];

const updateQuestionValidator: ValidationChain[] = [
  body("course_id").optional().isInt().withMessage("course_id must be integer"),
  body("question_text")
    .optional()
    .notEmpty()
    .withMessage("question_text must be fill"),
  body("type")
    .optional()
    .isIn(["multiple_choice", "essay"])
    .withMessage("type must fill multiple_choice or essay"),
];

module.exports = { createQuestionValidator, updateQuestionValidator };
