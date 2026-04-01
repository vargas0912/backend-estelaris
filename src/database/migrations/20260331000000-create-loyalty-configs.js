'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loyalty_configs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'SET NULL' },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      points_per_peso: { type: Sequelize.DECIMAL(10, 4), allowNull: false, defaultValue: 0.1 },
      earn_on_tax: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      earn_on_discount: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      earn_on_credit: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      earn_on_credit_when: { type: Sequelize.ENUM('sale', 'paid'), allowNull: false, defaultValue: 'paid' },
      peso_per_point: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0.10 },
      min_points_redeem: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 100 },
      max_redeem_pct: { type: Sequelize.DECIMAL(5, 2), allowNull: false, defaultValue: 20.00 },
      max_redeem_points: { type: Sequelize.INTEGER, allowNull: true },
      points_expiry_days: { type: Sequelize.INTEGER, allowNull: true },
      rounding_strategy: { type: Sequelize.ENUM('floor', 'round', 'ceil'), allowNull: false, defaultValue: 'floor' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });
    await queryInterface.addIndex('loyalty_configs', ['branch_id']);
    await queryInterface.addIndex('loyalty_configs', ['is_active']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('loyalty_configs');
  }
};
