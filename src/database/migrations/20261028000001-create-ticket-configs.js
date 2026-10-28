'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ticket_configs', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'branches', key: 'id' }, onUpdate: 'CASCADE', onDelete: 'CASCADE' },
      type: { type: Sequelize.ENUM('sale', 'payment'), allowNull: false },
      title: { type: Sequelize.STRING(100), allowNull: true },
      header_text: { type: Sequelize.STRING(255), allowNull: true },
      footer_text: { type: Sequelize.STRING(255), allowNull: true },
      show_logo: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_iva: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_barcode: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_folio: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_cashier: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      show_branch_address: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      paper_width: { type: Sequelize.ENUM('58mm', '80mm'), allowNull: false, defaultValue: '80mm' },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
      deleted_at: { type: Sequelize.DATE, allowNull: true }
    });

    // MySQL permite varios NULL en un UNIQUE, así que la unicidad de la fila global
    // (branch_id NULL) la garantiza la capa de servicio; el índice protege las filas por sucursal.
    await queryInterface.addIndex('ticket_configs', ['branch_id', 'type'], { unique: true, name: 'ticket_configs_branch_type_unique' });

    // Filas globales por defecto: sin ellas el resolve cae a las constantes del código.
    const now = new Date();
    await queryInterface.bulkInsert('ticket_configs', [
      { branch_id: null, type: 'sale', title: 'TICKET DE VENTA', footer_text: '¡Gracias por su compra!', created_at: now, updated_at: now },
      { branch_id: null, type: 'payment', title: 'COMPROBANTE DE ABONO', footer_text: 'Conserve este comprobante', created_at: now, updated_at: now }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ticket_configs');
  }
};
