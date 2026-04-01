'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('point_transactions', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      customer_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'customers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      type: { type: Sequelize.ENUM('earn', 'redeem', 'expire', 'adjust', 'void'), allowNull: false },
      points: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      balance_after: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      reference_type: { type: Sequelize.ENUM('sale', 'payment', 'admin', 'expiry'), allowNull: false },
      reference_id: { type: Sequelize.INTEGER, allowNull: true },
      expires_at: { type: Sequelize.DATE, allowNull: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'RESTRICT' },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
    await queryInterface.addIndex('point_transactions', ['customer_id']);
    await queryInterface.addIndex('point_transactions', ['type']);
    await queryInterface.addIndex('point_transactions', ['reference_type']);
    await queryInterface.addIndex('point_transactions', ['expires_at']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('point_transactions');
  }
};
