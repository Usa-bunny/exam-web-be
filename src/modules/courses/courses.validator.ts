const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const createCourseValidator: ValidationChain[] = [
  body("title").notEmpty().withMessage("Title course must be fill"),
  body("description").optional(),
];

const updateCourseValidator: ValidationChain[] = [
  body("title").optional().notEmpty().withMessage("Title course must be fill"),
  body("description").optional(),
];

module.exports = { createCourseValidator, updateCourseValidator };
