'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_stocks', 'purch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'purchases', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'ID de la compra que originó este lote de stock'
    });

    await queryInterface.addColumn('product_stocks', 'bar_code', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Código de barra del lote: {product_id}-{purch_id}'
    });

    await queryInterface.removeColumn('product_stocks', 'batch_ref');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_stocks', 'batch_ref', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Referencia del lote de origen, formato: {product_id}-{purchase_id}'
    });

    await queryInterface.removeColumn('product_stocks', 'bar_code');
    await queryInterface.removeColumn('product_stocks', 'purch_id');
  }
};
