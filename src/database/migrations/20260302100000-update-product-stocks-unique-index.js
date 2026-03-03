'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // 1. Eliminar índice único actual (product_id, branch_id)
    await queryInterface.removeIndex('product_stocks', 'product_stocks_product_branch_unique');

    // 2. Nuevo índice único por lote + sucursal
    // MySQL permite múltiples NULLs en unique index → stocks manuales (sin bar_code) no rompen
    await queryInterface.addIndex('product_stocks', ['bar_code', 'branch_id'], {
      unique: true,
      name: 'product_stocks_barcode_branch_unique'
    });

    // 3. Índice de búsqueda no-único por producto + sucursal (performance)
    await queryInterface.addIndex('product_stocks', ['product_id', 'branch_id'], {
      unique: false,
      name: 'product_stocks_product_branch_idx'
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('product_stocks', 'product_stocks_barcode_branch_unique');
    await queryInterface.removeIndex('product_stocks', 'product_stocks_product_branch_idx');

    await queryInterface.addIndex('product_stocks', ['product_id', 'branch_id'], {
      unique: true,
      name: 'product_stocks_product_branch_unique'
    });
  }
};
