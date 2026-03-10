'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('system_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      category: {
        allowNull: false,
        type: Sequelize.STRING(50),
        comment: 'Categoría de la configuración (ej: formats, inventory)'
      },
      key: {
        allowNull: false,
        type: Sequelize.STRING(100),
        comment: 'Clave única de la configuración'
      },
      value: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'Valor de la configuración'
      },
      label: {
        allowNull: false,
        type: Sequelize.STRING(150),
        comment: 'Etiqueta descriptiva para mostrar en frontend'
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT,
        comment: 'Descripción extendida de la configuración'
      },
      data_type: {
        allowNull: false,
        type: Sequelize.ENUM('string', 'integer', 'decimal', 'boolean'),
        comment: 'Tipo de dato del valor almacenado'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('system_settings', ['category']);
    await queryInterface.addIndex('system_settings', ['key'], { unique: true, name: 'system_settings_key_unique' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('system_settings');
  }
};
