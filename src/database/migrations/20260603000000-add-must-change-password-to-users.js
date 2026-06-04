'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'must_change_password', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'role'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('users', 'must_change_password');
  }
};
