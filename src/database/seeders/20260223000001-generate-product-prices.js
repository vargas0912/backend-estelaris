'use strict';

const CHUNK_SIZE = 100;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [products] = await queryInterface.sequelize.query(
      'SELECT id, base_price FROM products WHERE is_active = 1 AND deleted_at IS NULL'
    );

    const [priceLists] = await queryInterface.sequelize.query(
      'SELECT id, discount_percent FROM price_lists WHERE is_active = 1 AND deleted_at IS NULL'
    );

    if (!products.length || !priceLists.length) {
      return;
    }

    const productIds = products.map(p => p.id);
    const priceListIds = priceLists.map(pl => pl.id);

    await queryInterface.sequelize.query(
      `DELETE FROM product_prices
       WHERE product_id IN (:productIds)
         AND price_list_id IN (:priceListIds)
         AND min_quantity = 1
         AND deleted_at IS NOT NULL`,
      { replacements: { productIds, priceListIds } }
    );

    const now = new Date();
    const records = [];

    for (const product of products) {
      const basePrice = parseFloat(product.base_price);
      for (const priceList of priceLists) {
        const discount = parseFloat(priceList.discount_percent) || 0;
        records.push({
          product_id: product.id,
          price_list_id: priceList.id,
          price: parseFloat((basePrice * (1 - discount / 100)).toFixed(2)),
          min_quantity: 1,
          created_at: now,
          updated_at: now
        });
      }
    }

    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      const chunk = records.slice(i, i + CHUNK_SIZE);
      await queryInterface.bulkInsert('product_prices', chunk, { ignoreDuplicates: true });
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_prices', { min_quantity: 1 }, {});
  }
};
