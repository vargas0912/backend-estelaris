'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_stocks', {
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
        onDelete: 'CASCADE'
      },
      branch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 3),
        defaultValue: 0
      },
      min_stock: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 3),
        defaultValue: 0
      },
      max_stock: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 3)
      },
      location: {
        allowNull: true,
        type: Sequelize.STRING(100),
        comment: 'Ubicación física en almacén (ej: A-01-03)'
      },
      last_count_date: {
        allowNull: true,
        type: Sequelize.DATE,
        comment: 'Fecha del último conteo físico'
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

    // Índice único para evitar duplicados producto-sucursal
    await queryInterface.addIndex('product_stocks', ['product_id', 'branch_id'], {
      unique: true,
      name: 'product_stocks_product_branch_unique'
    });

    // Índices para búsquedas rápidas
    await queryInterface.addIndex('product_stocks', ['product_id']);
    await queryInterface.addIndex('product_stocks', ['branch_id']);
    await queryInterface.addIndex('product_stocks', ['quantity']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_stocks');
  }
};
