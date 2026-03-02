'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('transfer_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      transfer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'transfers', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        allowNull: false,
        type: Sequelize.STRING(20),
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      qty: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 3),
        comment: 'Cantidad enviada'
      },
      qty_received: {
        allowNull: true,
        type: Sequelize.DECIMAL(12, 3),
        comment: 'Cantidad confirmada en destino'
      },
      unit_cost: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        comment: 'Costo unitario al momento del envío'
      },
      purch_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: { model: 'purchases', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Trazabilidad al origen de compra'
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT,
        comment: 'Observaciones de discrepancia'
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

    await queryInterface.addIndex('transfer_details', ['transfer_id']);
    await queryInterface.addIndex('transfer_details', ['product_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('transfer_details');
  }
};
