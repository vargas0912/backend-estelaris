'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employees', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      unique: true,
      references: { model: 'users', key: 'id' },
      onDelete: 'SET NULL',
      after: 'active'
    });

    await queryInterface.addIndex('employees', ['user_id'], {
      name: 'idx_employees_user_id'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('employees', 'idx_employees_user_id');
    await queryInterface.removeColumn('employees', 'user_id');
  }
};
