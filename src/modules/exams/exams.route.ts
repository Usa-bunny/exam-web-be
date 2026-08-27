const express = require("express");
const router = express.Router();
const ExamsController = require("./exams.controller");
const {
  createExamValidator,
  updateExamValidator,
} = require("./exams.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken, checkRole("teacher"));

router.post("/", createExamValidator, validate, ExamsController.create);
router.get("/", ExamsController.getAll);
router.get("/:exam_id", ExamsController.getById);
router.put("/:exam_id", updateExamValidator, validate, ExamsController.update);
router.delete("/:exam_id", ExamsController.delete);

module.exports = router;
