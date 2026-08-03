"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Course.hasMany(models.CourseUser, {
        foreignKey: "course_id",
        as: "courseEnrollments",
        onDelete: "CASCADE",
      });

      Course.hasMany(models.Exam, {
        foreignKey: "course_id",
        as: "exams",
        onDelete: "CASCADE",
      });

      Course.hasMany(models.Question, {
        foreignKey: "course_id",
        as: "questions",
        onDelete: "CASCADE",
      });

      User.belongsToMany(models.User, {
        through: models.CourseUser,
        foreignKey: "user_id",
        otherKey: "course_id",
        as: "students",
        onDelete: "CASCADE",
      });

      User.belongsToMany(models.User, {
        through: models.CourseUser,
        foreignKey: "user_id",
        otherKey: "course_id",
        as: "teachers",
        onDelete: "CASCADE",
      });
    }
  }
  Course.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      modelName: "Course",
      tableName: "Courses",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
  return Course;
};
