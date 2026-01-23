'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sku: {
        allowNull: false,
        unique: true,
        type: Sequelize.STRING(50)
      },
      barcode: {
        allowNull: true,
        unique: true,
        type: Sequelize.STRING(50)
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(200)
      },
      description: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      short_description: {
        allowNull: true,
        type: Sequelize.STRING(500)
      },
      category_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'product_categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      unit_of_measure: {
        allowNull: false,
        type: Sequelize.ENUM('piece', 'kg', 'lt', 'mt', 'box'),
        defaultValue: 'piece'
      },
      cost_price: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      base_price: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0.00
      },
      weight: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 3)
      },
      dimensions: {
        allowNull: true,
        type: Sequelize.JSON
      },
      images: {
        allowNull: true,
        type: Sequelize.JSON
      },
      is_active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_featured: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      seo_title: {
        allowNull: true,
        type: Sequelize.STRING(100)
      },
      seo_description: {
        allowNull: true,
        type: Sequelize.STRING(200)
      },
      seo_keywords: {
        allowNull: true,
        type: Sequelize.STRING(200)
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

    // Add index for faster searches
    await queryInterface.addIndex('products', ['sku']);
    await queryInterface.addIndex('products', ['barcode']);
    await queryInterface.addIndex('products', ['category_id']);
    await queryInterface.addIndex('products', ['is_active']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
