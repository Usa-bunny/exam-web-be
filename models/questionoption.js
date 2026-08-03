'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class QuestionOption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  QuestionOption.init({
    question_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'QuestionOption',
  });
  return QuestionOption;
};