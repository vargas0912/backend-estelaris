'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('sale_payments', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'branches', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
      after: 'user_id'
    });

    await queryInterface.addIndex('sale_payments', ['branch_id']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('sale_payments', ['branch_id']);
    await queryInterface.removeColumn('sale_payments', 'branch_id');
  }
};
