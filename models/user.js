"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Course, {
        foreignKey: "created_by",
        as: "createdCourses",
        onDelete: "CASCADE",
      });

      User.hasMany(models.CourseUser, {
        foreignKey: "user_id",
        as: "courseEnrollments",
        onDelete: "CASCADE",
      });

      User.hasMany(models.ExamAttempt, {
        foreignKey: "user_id",
        as: "examAttempts",
        onDelete: "CASCADE",
      });

      User.belongsToMany(models.Course, {
        through: models.CourseUser,
        foreignKey: "user_id",
        otherKey: "course_id",
        as: "courses",
        onDelete: "CASCADE",
      });
    }
  }
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("admin", "teacher", "student"),
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
      modelName: "User",
      tableName: "Users",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    },
  );
  return User;
};
