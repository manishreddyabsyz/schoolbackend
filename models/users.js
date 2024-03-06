'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users.init({
    username: DataTypes.STRING,
    role: DataTypes.STRING,
    designation: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    subject: DataTypes.STRING,
    access_token: DataTypes.STRING,
    otp:DataTypes.INTEGER,
    otpexpiry:DataTypes.DATE,
    firstname:DataTypes.STRING,
    lastname:DataTypes.STRING,
    dob:DataTypes.DATE,
    phonenumber:DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};