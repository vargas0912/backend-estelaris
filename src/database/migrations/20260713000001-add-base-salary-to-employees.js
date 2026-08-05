'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'base_salary', {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0.00,
      after: 'hire_date'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('employees', 'base_salary');
  }
};
