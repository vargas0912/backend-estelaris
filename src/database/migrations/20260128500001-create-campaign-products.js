'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('campaign_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'campaigns',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      discount_type: {
        type: Sequelize.ENUM('percentage', 'fixed_price'),
        allowNull: false,
        comment: 'percentage: discount by %, fixed_price: set specific offer price'
      },
      discount_value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'For percentage: value like 25.00 (25%), for fixed_price: the offer price'
      },
      max_quantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum units available for this offer (null = unlimited)'
      },
      sold_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Units sold so far'
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
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Índice único para evitar duplicados de producto en la misma campaña
    await queryInterface.addIndex('campaign_products', ['campaign_id', 'product_id'], {
      unique: true,
      name: 'idx_campaign_products_unique',
      where: {
        deleted_at: null
      }
    });

    // Índices para búsquedas frecuentes
    await queryInterface.addIndex('campaign_products', ['campaign_id'], {
      name: 'idx_campaign_products_campaign_id'
    });

    await queryInterface.addIndex('campaign_products', ['product_id'], {
      name: 'idx_campaign_products_product_id'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('campaign_products');
  }
};
