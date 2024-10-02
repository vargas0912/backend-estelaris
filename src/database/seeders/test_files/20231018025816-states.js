/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const states = [
      { key: 'A', name: 'Queretaro', abrev: 'Qro', active: 1, created_at: new Date(), updated_at: new Date() },
      { key: 'B', name: 'Michoacan', abrev: 'Mich', active: 1, created_at: new Date(), updated_at: new Date() },
      { key: 'C', name: 'Nayarit', abrev: 'Ny', active: 1, created_at: new Date(), updated_at: new Date() },
      { key: 'D', name: 'EDOMEX', abrev: 'EDOMEX', active: 1, created_at: new Date(), updated_at: new Date() },
      { key: 'E', name: 'Colima', abrev: 'Col', active: 1, created_at: new Date(), updated_at: new Date() }
    ];

    await queryInterface.bulkInsert('states', states, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states', null, {});
  }
};
