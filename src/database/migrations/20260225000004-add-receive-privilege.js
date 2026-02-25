'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const fecha = new Date();
    await queryInterface.bulkInsert('privileges', [
      {
        name: 'Recibir compra',
        codeName: 'receive_purchase',
        module: 'purchases',
        created_at: fecha,
        updated_at: fecha
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('privileges', { codeName: 'receive_purchase' });
  }
};
