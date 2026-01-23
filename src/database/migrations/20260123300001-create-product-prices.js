'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_prices', {
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
      price_list_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'price_lists',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      price: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        comment: 'Precio específico para este producto en esta lista'
      },
      min_quantity: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 3),
        defaultValue: 1,
        comment: 'Cantidad mínima para aplicar este precio (precios escalonados)'
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

    // Índice único para evitar duplicados producto-lista-cantidad
    await queryInterface.addIndex('product_prices', ['product_id', 'price_list_id', 'min_quantity'], {
      unique: true,
      name: 'product_prices_unique'
    });

    await queryInterface.addIndex('product_prices', ['product_id']);
    await queryInterface.addIndex('product_prices', ['price_list_id']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_prices');
  }
};
