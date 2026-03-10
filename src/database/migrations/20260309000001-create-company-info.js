'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('company_info', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_name: {
        allowNull: false,
        type: Sequelize.STRING(150),
        comment: 'Razón social de la empresa'
      },
      trade_name: {
        allowNull: true,
        type: Sequelize.STRING(150),
        comment: 'Nombre comercial'
      },
      rfc: {
        allowNull: false,
        type: Sequelize.STRING(13),
        comment: 'RFC de la empresa (12 o 13 caracteres)'
      },
      fiscal_regime: {
        allowNull: false,
        type: Sequelize.STRING(100),
        comment: 'Régimen fiscal SAT'
      },
      fiscal_address: {
        allowNull: false,
        type: Sequelize.TEXT,
        comment: 'Domicilio fiscal completo'
      },
      zip_code: {
        allowNull: false,
        type: Sequelize.STRING(10),
        comment: 'Código postal del domicilio fiscal'
      },
      fiscal_email: {
        allowNull: true,
        type: Sequelize.STRING(100),
        comment: 'Correo para facturación electrónica'
      },
      phone: {
        allowNull: true,
        type: Sequelize.STRING(20),
        comment: 'Teléfono de contacto'
      },
      logo_url: {
        allowNull: true,
        type: Sequelize.STRING(500),
        comment: 'URL del logo de la empresa'
      },
      website: {
        allowNull: true,
        type: Sequelize.STRING(255),
        comment: 'Sitio web de la empresa'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('company_info');
  }
};
