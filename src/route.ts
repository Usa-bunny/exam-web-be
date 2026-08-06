const express = require("express");
import type { Express } from "express";

const app: Express = express();
const authRoutes = require("./modules/auth/auth.route");
const usersRoutes = require("./modules/users/users.route");

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

module.exports = app;
