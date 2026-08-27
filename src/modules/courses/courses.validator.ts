const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const createCourseValidator: ValidationChain[] = [
  body("title").notEmpty().withMessage("Course title is required"),
  body("description").optional(),
  body("teacher_id")
    .notEmpty()
    .withMessage("teacher_id is required")
    .isInt()
    .withMessage("teacher_id must be an integer"),
  body("student_ids")
    .optional()
    .isArray()
    .withMessage("student_ids must be an array of integers"),
];

const updateCourseValidator: ValidationChain[] = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Course title cannot be empty"),
  body("description").optional(),
  body("teacher_id")
    .optional()
    .isInt()
    .withMessage("teacher_id must be an integer"),
  body("student_ids")
    .optional()
    .isArray()
    .withMessage("student_ids must be an array of integers"),
];

module.exports = { createCourseValidator, updateCourseValidator };
