const { body } = require("express-validator");
import type { ValidationChain } from "express-validator";

const loginValidator: ValidationChain[] = [
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
];

module.exports = loginValidator;
