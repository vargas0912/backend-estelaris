'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // No se pre-seeden transferencias: los tests las crean dinámicamente
    // igual que el módulo de purch-payments
  },

  async down(queryInterface, Sequelize) {}
};
