const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const createUserValidator: ValidationChain[] = [
  body("name").notEmpty().withMessage("Nama must be fill"),
  body("email")
    .notEmpty()
    .withMessage("Email must be fill")
    .isEmail()
    .withMessage("Email is not valid"),
  body("password")
    .notEmpty()
    .withMessage("Password must be fill")
    .isLength({ min: 6 })
    .withMessage("Password minimal must have 6 character"),
  body("role")
    .notEmpty()
    .withMessage("Role must be fill")
    .isIn(["admin", "teacher", "student"])
    .withMessage("Role must be admin, teacher, or student"),
];

const updateUserValidator: ValidationChain[] = [
  body("name").optional().notEmpty().withMessage("Nama must be fill"),
  body("email")
    .optional()
    .notEmpty()
    .withMessage("Email must be fill")
    .isEmail()
    .withMessage("Email is not valid"),
  body("password")
    .optional()
    .notEmpty()
    .withMessage("Password must be fill")
    .isLength({ min: 6 })
    .withMessage("Password minimal must have 6 character"),
  body("role")
    .optional()
    .notEmpty()
    .withMessage("Role must be fill")
    .isIn(["admin", "teacher", "student"])
    .withMessage("Role must be admin, teacher, or student"),
];

module.exports = { createUserValidator, updateUserValidator };
