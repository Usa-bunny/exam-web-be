"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await bcrypt.hash("password123", 10);
    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Admin",
          email: "admin@gmail.com",
          password,
          role: "admin",
          created_at: new Date(),
        },
        {
          name: "Sensei",
          email: "teacher@gmail.com",
          password,
          role: "teacher",
          created_at: new Date(),
        },
        {
          name: "Gakusei",
          email: "student@gmail.com",
          password,
          role: "student",
          created_at: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", {
      email: [
        "admin@example.com",
        "teacher@example.com",
        "student@example.com",
      ],
    });
  },
};
