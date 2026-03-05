'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_deliveries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sale_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'sales',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customer_address_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'customer_addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('Preparando', 'Recolectado', 'En_Transito', 'En_Ruta_Entrega', 'Entregado', 'Devuelto'),
        defaultValue: 'Preparando'
      },
      driver_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      transport_plate: {
        allowNull: true,
        type: Sequelize.STRING(20)
      },
      estimated_date: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      delivered_at: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT
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

    await queryInterface.addIndex('sale_deliveries', ['sale_id']);
    await queryInterface.addIndex('sale_deliveries', ['status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sale_deliveries');
  }
};
