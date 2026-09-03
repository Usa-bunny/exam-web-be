const { body } = require("express-validator");

const correctAnswersValidator = [
  body("answers")
    .notEmpty()
    .withMessage("answers is required")
    .isArray({ min: 1 })
    .withMessage("answers must be a non-empty array"),
  body("answers.*.id")
    .notEmpty()
    .withMessage("answer ID is required")
    .isInt({ min: 1 })
    .withMessage("answer ID must be a positive integer"),
  body("answers.*.is_correct")
    .optional({ nullable: true })
    .isBoolean()
    .withMessage("is_correct must be a boolean"),
  body("answers.*.percentage")
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 100 })
    .withMessage("percentage must be a number between 0 and 100"),
];

module.exports = correctAnswersValidator;