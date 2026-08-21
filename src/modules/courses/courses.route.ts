const express = require("express");
const router = express.Router();
const CoursesController = require("./courses.controller");
const {
  createCourseValidator,
  updateCourseValidator,
} = require("./courses.validator");
const validate = require("../../middlewares/validate");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken);

router.get("/my-courses", checkRole("teacher"), CoursesController.getByUserId);

router.use(checkRole("admin"));

router.post("/", createCourseValidator, validate, CoursesController.create);
router.get("/", CoursesController.getAll);
router.get("/:id", CoursesController.getById);
router.put("/:id", updateCourseValidator, validate, CoursesController.update);
router.delete("/:id", CoursesController.delete);

module.exports = router;
