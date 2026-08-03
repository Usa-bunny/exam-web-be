"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CourseUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CourseUser.belongsTo(models.Course, {
        foreignKey: "course_id",
        as: "course"
      })

      CourseUser.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user"
      })
    }
  }
  CourseUser.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM("teacher", "student"),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "CourseUser",
      tableName: "CourseUsers",
      underscored: true,
      timestamps: true,
    },
  );
  return CourseUser;
};
