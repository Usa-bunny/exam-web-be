require("dotenv").config();

const express = require("express");
import type { Express, Request, Response } from "express";
const db = require("../models");
const routes = require("./route");

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.use(routes);

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log("Database Connected");

    app.get("/", (req: Request, res: Response) => {
      res.send("Hello World!");
    });

    app.listen(port, () => {
      console.log(`App listening on  http://localhost:${port}`);
    });
  } catch (error: any) {
    console.error(`Failed connected: ${error.message}`);
    process.exit(1);
  }
}

startServer();
