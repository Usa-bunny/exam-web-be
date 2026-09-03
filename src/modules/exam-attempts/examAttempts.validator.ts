const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const saveAnswerValidator: ValidationChain[] = [
  body("question_id")
    .notEmpty()
    .withMessage("question_id is required")
    .isInt({ min: 1 })
    .withMessage("question_id must be an integer"),
  body("selected_option_id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("selected_option_id must be a positive integer"),
  body("essay_answer")
    .optional({ nullable: true })
    .isString()
    .withMessage("essay_answer must be text"),
];

module.exports = { saveAnswerValidator };
