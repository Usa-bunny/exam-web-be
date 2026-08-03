"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ExamAttempt extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ExamAttempt.belongsTo(models.Exam, {
        foreignKey: "exam_id",
        as: "exam",
      });

      ExamAttempt.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
      });

      ExamAttempt.hasMany(models.Answer, {
        foreignKey: "attempt_id",
        as: "answers",
        onDelete: "CASCADE",
      });
    }
  }
  ExamAttempt.init(
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("in_progress", "completed", "graded"),
        allowNull: false,
        defaultValue: "in_progress",
      },
    },
    {
      sequelize,
      modelName: "ExamAttempt",
      tableName: "ExamAttempts",
      timestamps: false,
      underscored: true,
    },
  );
  return ExamAttempt;
};
