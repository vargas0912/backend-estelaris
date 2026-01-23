'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productCategories = [
      { id: 1, name: 'Electrónica', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 2, name: 'Línea Blanca', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 3, name: 'Comedores', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 4, name: 'Salas', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 5, name: 'Motos', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 6, name: 'Muebles', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 7, name: 'Bicicletas', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 8, name: 'Recamaras', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 9, name: 'Tubulares', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 10, name: 'Electrodomésticos', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 11, name: 'Infantiles', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 12, name: 'Varios', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 13, name: 'Computadoras', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 14, name: 'Celulares', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 15, name: 'Pintura', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 16, name: 'Decoración', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 17, name: 'Colchones', description: null, created_at: new Date(), updated_at: new Date() },
      { id: 18, name: 'Camas Tubulares', description: null, created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('product_categories', productCategories, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('product_categories', null, {});
  }
};
