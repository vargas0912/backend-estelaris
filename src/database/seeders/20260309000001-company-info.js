'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('company_info', [
      {
        company_name: 'Estelaris S.A. de C.V.',
        trade_name: null,
        rfc: 'EST000000AAA',
        fiscal_regime: '601 - General de Ley Personas Morales',
        fiscal_address: 'Av. Ejemplo 123, Col. Centro',
        zip_code: '06000',
        fiscal_email: null,
        phone: null,
        logo_url: null,
        website: null,
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('company_info', null, {});
  }
};
