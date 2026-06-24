'use strict';

/**
 * Remove redundant single-column indexes on product_stocks that are covered by
 * the compound index product_stocks_product_branch_idx (product_id, branch_id).
 *
 * NOTE: product_stocks_branch_id is intentionally NOT dropped here because MySQL
 * requires it to satisfy the foreign key constraint on branch_id (the compound
 * index product_stocks_product_branch_idx starts with product_id, not branch_id,
 * so it does not satisfy the FK left-prefix requirement for branch_id).
 */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // product_stocks_product_id: covered by compound idx (product_id, branch_id)
    await queryInterface.removeIndex('product_stocks', 'product_stocks_product_id');
    // product_stocks_quantity: high write overhead, minimal query benefit
    await queryInterface.removeIndex('product_stocks', 'product_stocks_quantity');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addIndex('product_stocks', ['product_id'], {
      name: 'product_stocks_product_id',
      using: 'BTREE'
    });
    await queryInterface.addIndex('product_stocks', ['quantity'], {
      name: 'product_stocks_quantity',
      using: 'BTREE'
    });
  }
};
