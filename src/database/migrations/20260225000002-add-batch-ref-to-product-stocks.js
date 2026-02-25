'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('product_stocks', 'batch_ref', {
      allowNull: true,
      type: Sequelize.STRING(100),
      comment: 'Referencia del lote de origen, formato: {product_id}-{purchase_id}'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('product_stocks', 'batch_ref');
  }
};
