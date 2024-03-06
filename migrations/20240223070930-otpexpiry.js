"use strict"
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'otpexpiry', {
      type: Sequelize.DATE, 
      allowNull: true, 
      defaultValue: null,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'otpexpiry');
  }
};
