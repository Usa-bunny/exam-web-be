"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class QuestionOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      QuestionOption.belongsTo(models.Question, {
        foreignKey: "question_id",
        as: "question",
      });

      QuestionOption.hasMany(models.Answer, {
        foreignKey: "selected_option_id",
        as: "answers",
        onDelete: "CASCADE",
      });
    }
  }
  QuestionOption.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      option_text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_correct: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "QuestionOption",
      tableName: "QuestionOptions",
      timestamps: false,
      underscored: true,
    },
  );
  return QuestionOption;
};
