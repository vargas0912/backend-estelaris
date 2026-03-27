'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sales', 'ticket', {
      type: Sequelize.STRING(20),
      allowNull: true,
      after: 'invoice'
    });

    await queryInterface.addIndex('sales', ['ticket'], {
      unique: true,
      name: 'sales_ticket_unique'
    });

    await queryInterface.addIndex('sales', ['branch_id', 'ticket'], {
      name: 'idx_sales_branch_ticket'
    });
  },
  async down(queryInterface) {
    await queryInterface.removeIndex('sales', 'sales_ticket_unique');
    await queryInterface.removeIndex('sales', 'idx_sales_branch_ticket');
    await queryInterface.removeColumn('sales', 'ticket');
  }
};
