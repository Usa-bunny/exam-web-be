"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Answer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Answer.belongsTo(models.ExamAttempt, {
        foreignKey: "attempt_id",
        as: "attempt",
      });

      Answer.belongsTo(models.Question, {
        foreignKey: "question_id",
        as: "question",
      });

      Answer.belongsTo(models.QuestionOption, {
        foreignKey: "selected_option_id",
        as: "selectedOption",
      });
    }
  }
  Answer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      attempt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      selected_option_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      essay_answer: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      percentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Answer",
      tableName: "Answers",
      timestamps: false,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ["attempt_id", "question_id"],
        },
      ],
    },
  );
  return Answer;
};
