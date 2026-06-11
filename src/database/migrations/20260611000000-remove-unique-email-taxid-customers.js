'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('customers', 'email');
    await queryInterface.removeConstraint('customers', 'tax_id');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint('customers', {
      fields: ['email'],
      type: 'unique',
      name: 'email'
    });
    await queryInterface.addConstraint('customers', {
      fields: ['tax_id'],
      type: 'unique',
      name: 'tax_id'
    });
  }
};
