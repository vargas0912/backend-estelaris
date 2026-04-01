'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_points', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      customer_id: { type: Sequelize.INTEGER, allowNull: false, unique: true, references: { model: 'customers', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      total_points: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      lifetime_points: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      updated_at: { type: Sequelize.DATE, allowNull: false }
    });
    await queryInterface.addIndex('customer_points', ['customer_id']);
  },
  async down(queryInterface) {
    await queryInterface.dropTable('customer_points');
  }
};
