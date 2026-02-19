'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('customer_addresses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: {
            tableName: 'customers'
          },
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      address_type: {
        type: Sequelize.ENUM('billing', 'shipping'),
        allowNull: false
      },
      street: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      neighborhood: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      postal_code: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: false,
        defaultValue: 'México'
      },
      municipality_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: {
            tableName: 'municipalities'
          },
          key: 'id'
        }
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    // Crear índices para mejorar rendimiento de queries
    await queryInterface.addIndex('customer_addresses', ['customer_id']);
    await queryInterface.addIndex('customer_addresses', ['municipality_id']);
    await queryInterface.addIndex('customer_addresses', ['is_default']);
    await queryInterface.addIndex('customer_addresses', ['address_type']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('customer_addresses');
  }
};
