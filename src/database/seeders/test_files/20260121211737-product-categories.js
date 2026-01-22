'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productCategories = [
      { id: 1, name: 'Electrónica', description: 'Productos electrónicos', created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Línea Blanca', description: 'Refrigeradores, lavadoras, etc.', created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Muebles', description: 'Muebles para el hogar', created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('product_categories', productCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_categories', null, {});
  }
};
