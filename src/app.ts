require("dotenv").config();
require("pg");

const express = require("express");
import type { Express, Request, Response } from "express";
const db = require("../models");
const routes = require("./route");
const cors = require("cors");
const http = require("http");
const socket = require("./socket");

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(routes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

const server = http.createServer(app);
socket.init(server);

db.sequelize
  .authenticate()
  .then(() => console.log("Database Connected"))
  .catch((error: any) => console.error(`Failed connected: ${error.message}`));

if (process.env.NODE_ENV !== "production") {
  server.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
  });
}

module.exports = app;
