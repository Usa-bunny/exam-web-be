const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const createQuestionValidator: ValidationChain[] = [
  body("course_id")
    .notEmpty()
    .withMessage("course_id is required")
    .isInt()
    .withMessage("course_id must be an integer"),
  body("question_text").notEmpty().withMessage("question_text is required"),
  body("type")
    .notEmpty()
    .withMessage("type is required")
    .isIn(["multiple_choice", "essay"])
    .withMessage("type must be either multiple_choice or essay"),
];

const updateQuestionValidator: ValidationChain[] = [
  body("course_id").optional().isInt().withMessage("course_id must be an integer"),
  body("question_text")
    .optional()
    .notEmpty()
    .withMessage("question_text is required"),
  body("type")
    .optional()
    .isIn(["multiple_choice", "essay"])
    .withMessage("type must be either multiple_choice or essay"),
];

module.exports = { createQuestionValidator, updateQuestionValidator };
