'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: { tableName: 'privilege_templates' },
        key: 'id'
      }
    });
    await queryInterface.addColumn('users', 'template_applied_version', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('userprivileges', 'source_template_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: { tableName: 'privilege_templates' },
        key: 'id'
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('userprivileges', 'source_template_id');
    await queryInterface.removeColumn('users', 'template_applied_version');
    await queryInterface.removeColumn('users', 'template_id');
  }
};
