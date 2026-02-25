'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchase_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'purchases',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
        type: Sequelize.DECIMAL(12, 2),
        comment: 'qty × unit_price × (1 - discount/100)'
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

    await queryInterface.addIndex('purchase_details', ['purch_id']);
    await queryInterface.addIndex('purchase_details', ['product_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchase_details');
  }
};
