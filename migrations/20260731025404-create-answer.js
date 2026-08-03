"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Answers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attempt_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "ExamAttempts",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      question_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Questions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      selected_option_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "QuestionOptions",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      essay_answer: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_correct: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      percentage: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("Answers", ["attempt_id", "question_id"], {
      unique: true,
      name: "attempt_question_unique",
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Answers");
  },
};
