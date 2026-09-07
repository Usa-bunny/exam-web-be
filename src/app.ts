require("dotenv").config();

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

// Setup server untuk Socket.io
const server = http.createServer(app);
socket.init(server);

// Hubungkan ke database (dipisah agar tetap jalan di serverless Vercel)
db.sequelize.authenticate()
  .then(() => console.log("Database Connected"))
  .catch((error: any) => console.error(`Failed connected: ${error.message}`));

// JALANKAN LISTEN HANYA SAAT DI LOKAL
// Vercel menggunakan environment 'production' dan mengeksekusi app secara serverless
if (process.env.NODE_ENV !== "production") {
  // Gunakan server.listen agar Socket.io dan Express berjalan di port yang sama
  server.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
  });
}

// WAJIB UNTUK VERCEL: Ekspor aplikasi Express kamu
module.exports = app;