const express = require("express");
import type { Express } from "express";

const app: Express = express();
const authRoutes = require("./modules/auth/auth.route");

app.use("/auth", authRoutes);

module.exports = app;
