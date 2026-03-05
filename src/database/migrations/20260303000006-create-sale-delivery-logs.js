'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_delivery_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      delivery_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'sale_deliveries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('Preparando', 'Recolectado', 'En_Transito', 'En_Ruta_Entrega', 'Entregado', 'Devuelto')
      },
      location: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      created_by: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('sale_delivery_logs', ['delivery_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sale_delivery_logs');
  }
};
