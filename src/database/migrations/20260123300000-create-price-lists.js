'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('price_lists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING(100)
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING(255)
      },
      discount_percent: {
        allowNull: true,
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0,
        comment: 'Descuento % sobre base_price del producto'
      },
      is_active: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      priority: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Prioridad para aplicar precios (mayor = más prioritario)'
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

    await queryInterface.addIndex('price_lists', ['is_active']);
    await queryInterface.addIndex('price_lists', ['priority']);
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('price_lists');
  }
};
