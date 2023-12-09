'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const mun = [
      { key: 'A', name: 'Queretaro', active: 1, created_at: new Date(), updated_at: new Date(), state_id: 1 },
      { key: 'B', name: 'Michoacan', active: 1, created_at: new Date(), updated_at: new Date(), state_id: 1 },
      { key: 'C', name: 'Nayarit', active: 1, created_at: new Date(), updated_at: new Date(), state_id: 2 },
      { key: 'D', name: 'EDOMEX', active: 1, created_at: new Date(), updated_at: new Date(), state_id: 2 },
      { key: 'E', name: 'Colima', active: 1, created_at: new Date(), updated_at: new Date(), state_id: 3 }
    ];

    await queryInterface.bulkInsert('municipalities', mun, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('municipalities', null, {});
  }
};
