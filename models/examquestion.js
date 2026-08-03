"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExamQuestion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ExamQuestion.belongsTo(models.Exam, {
        foreignKey: "exam_id",
        as: "exam"
      })

      ExamQuestion.belongsTo(models.Question, {
        foreignKey: "question_id",
        as: "question"
      })
    }
  }
  ExamQuestion.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ExamQuestion",
      tableName: "ExamQuestions",
      timestamps: false,
      underscored: true,
    },
  );
  return ExamQuestion;
};
