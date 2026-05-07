'use strict';

const CHILD_TABLES = [
  'campaign_products',
  'product_prices',
  'product_stocks',
  'purchase_details',
  'sale_details',
  'stock_movements',
  'transfer_details'
];

module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE `products` MODIFY COLUMN `id` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL'
      );
      for (const table of CHILD_TABLES) {
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table}\` MODIFY COLUMN \`product_id\` VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL`
        );
      }
    } finally {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=0');
    try {
      await queryInterface.sequelize.query(
        'ALTER TABLE `products` MODIFY COLUMN `id` VARCHAR(20) NOT NULL'
      );
      for (const table of CHILD_TABLES) {
        await queryInterface.sequelize.query(
          `ALTER TABLE \`${table}\` MODIFY COLUMN \`product_id\` VARCHAR(20) NOT NULL`
        );
      }
    } finally {
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=1');
    }
  }
};
