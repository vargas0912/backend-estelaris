'use strict';

const { data } = require('./json_files/expenses');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const expenses = data.map(item => ({
      ...item,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('expenses', expenses, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('expenses', null, {});
  }
};
