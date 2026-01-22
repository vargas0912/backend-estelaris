'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const branches = [
      {
        name: 'Sucursal Centro',
        address: 'Av. Principal 100, Centro',
        phone: '5551001000',
        municipality_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sucursal Norte',
        address: 'Blvd. Norte 200, Zona Industrial',
        phone: '5552002000',
        municipality_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Sucursal Sur',
        address: 'Calle Sur 300, Residencial',
        phone: '5553003000',
        municipality_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('branches', branches, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('branches', null, {});
  }
};
