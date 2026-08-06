const express = require("express");
const router = express.Router();
const AuthController = require("./auth.controller");
const loginValidator = require("./auth.validator");
const validate = require("../../middlewares/validate");

router.post("/login", loginValidator, validate, AuthController.login);

module.exports = router;
