'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_details', {
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
        onDelete: 'CASCADE'
      },
      product_id: {
        allowNull: false,
        type: Sequelize.STRING(20),
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      qty: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 3)
      },
      unit_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      discount: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      tax_rate: {
        allowNull: false,
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 16
      },
      subtotal: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      purch_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'purchases',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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
      }
    });

    await queryInterface.addIndex('sale_details', ['sale_id']);
    await queryInterface.addIndex('sale_details', ['product_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sale_details');
  }
};
