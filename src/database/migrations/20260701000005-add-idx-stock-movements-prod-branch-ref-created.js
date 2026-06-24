'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `stock_movements` ADD INDEX `idx_stock_mov_prod_branch_ref_created` (`product_id`, `branch_id`, `reference_type`, `created_at`), ALGORITHM=INPLACE, LOCK=NONE'
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE `stock_movements` DROP INDEX `idx_stock_mov_prod_branch_ref_created`'
    );
  }
};
