"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Exam extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Exam.belongsTo(models.User, {
        foreignKey: "created_by",
        as: "creator"
      })

      Exam.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course"
      })

      Exam.hasMany(models.ExamAttempt, {
        foreignKey: "exam_id",
        as: "attempts",
        onDelete: "CASCADE",
      });

      Exam.belongsToMany(models.Question, {
        through: models.ExamQuestion,
        foreignKey: "exam_id",
        otherKey: "question_id",
        as: "questions",
      });
    }
  }
  Exam.init(
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
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.DATE,
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
      modelName: "Exam",
      tableName: "Exams",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
  return Exam;
};
