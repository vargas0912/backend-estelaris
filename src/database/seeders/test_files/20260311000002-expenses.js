'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    // Los tests crearán los gastos vía API
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('expenses', null, {});
  }
};
