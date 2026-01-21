'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const positions = [
      {
        name: 'Vendedor',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Maniobras Generales',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Agente de Ventas',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Programador',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Administrador',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Director General',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Recepcionista',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Propietario',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('positions', positions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('positions', null, {});
  }
};
