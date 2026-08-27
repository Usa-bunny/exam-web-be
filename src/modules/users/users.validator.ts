const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const createUserValidator: ValidationChain[] = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "teacher", "student"])
    .withMessage("Role must be admin, teacher, or student"),
];

const updateUserValidator: ValidationChain[] = [
  body("name").optional().notEmpty().withMessage("Name is required"),
  body("email")
    .optional()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Email is not valid"),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .optional()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["admin", "teacher", "student"])
    .withMessage("Role must be admin, teacher, or student"),
];

module.exports = { createUserValidator, updateUserValidator };
