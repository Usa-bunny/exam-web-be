const express = require("express");
import type { Express } from "express";

const app: Express = express();
const authRoutes = require("./modules/auth/auth.route");
const usersRoutes = require("./modules/users/users.route");
const coursesRoutes = require("./modules/courses/courses.route");
const questionsRoutes = require("./modules/courses/courses.route");
const examsRoutes = require("./modules/exams/exams.route");
const examAttemptsRoutes = require("./modules/exam-attempts/examAttempts.route");

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/courses", coursesRoutes);
app.use("/questions", questionsRoutes);
app.use("/exams", examsRoutes);
app.use("/exam-attempts", examAttemptsRoutes);

module.exports = app;
