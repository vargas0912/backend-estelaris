'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const expenseTypes = [
      { name: 'Nómina', created_at: new Date(), updated_at: new Date() },
      { name: 'Renta', created_at: new Date(), updated_at: new Date() },
      { name: 'Teléfono', created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('expense_types', expenseTypes, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('expense_types', null, {});
  }
};
