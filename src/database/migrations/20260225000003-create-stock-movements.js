'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stock_movements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      branch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      reference_type: {
        allowNull: false,
        type: Sequelize.ENUM('purchase', 'sale', 'adjustment', 'reversal')
      },
      reference_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        comment: 'ID del documento origen (compra, venta, etc.)'
      },
      qty_change: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 3),
        comment: 'Cantidad modificada. Positivo = entrada, negativo = salida'
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      created_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
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

    await queryInterface.addIndex('stock_movements', ['product_id']);
    await queryInterface.addIndex('stock_movements', ['branch_id']);
    await queryInterface.addIndex('stock_movements', ['reference_type', 'reference_id']);
    await queryInterface.addIndex('stock_movements', ['created_by']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('stock_movements');
  }
};
