'use strict';

const { data } = require('./json_files/expense-types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const expenseTypes = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('expense_types', expenseTypes, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('expense_types', null, {});
  }
};
