const express = require("express");
const router = express.Router();
const DashboardController = require("./dashboard.controller");
const verifyToken = require("../../middlewares/verify-token");
const checkRole = require("../../middlewares/check-role");

router.use(verifyToken);

router.get("/admin", checkRole("admin"), DashboardController.getAdminStats);
router.get("/teacher", checkRole("teacher"), DashboardController.getTeacherStats);
router.get("/student", checkRole("student"), DashboardController.getStudentStats);

module.exports = router;