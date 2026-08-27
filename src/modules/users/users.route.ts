const express = require("express");
const router = express.Router();
const UsersController = require("./users.controller");
const {
  createUserValidator,
  updateUserValidator,
} = require("./users.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken, checkRole("admin"));

router.post("/", createUserValidator, validate, UsersController.create);
router.get("/", UsersController.getAll);
router.get("/:id", UsersController.getById);
router.put("/:id", updateUserValidator, validate, UsersController.update);
router.delete("/:id", UsersController.delete);

module.exports = router;
