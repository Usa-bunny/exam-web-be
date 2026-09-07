"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Question extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Question.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator",
      });

      Question.hasMany(models.QuestionOption, {
        foreignKey: "question_id",
        as: "options",
        onDelete: "CASCADE",
      });

      Question.hasMany(models.Answer, {
        foreignKey: "question_id",
        as: "answers",
        onDelete: "CASCADE",
      });

      Question.belongsToMany(models.Exam, {
        through: models.ExamQuestion,
        foreignKey: "question_id",
        otherKey: "exam_id",
        as: "exams",
      });

      Question.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course",
        onDelete: "CASCADE"
      });

    }
  }
  Question.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("multiple_choice", "essay"),
        allowNull: false,
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Question",
      tableName: "Questions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
      underscored: true,
    },
  );
  return Question;
};
