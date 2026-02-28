'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchase_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      purch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'purchases',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      payment_amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      payment_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      payment_method: {
        allowNull: false,
        type: Sequelize.ENUM('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta')
      },
      reference_number: {
        allowNull: true,
        type: Sequelize.STRING(100),
        comment: 'Folio bancario, número de cheque u otra referencia'
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT
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

    await queryInterface.addIndex('purchase_payments', ['purch_id']);
    await queryInterface.addIndex('purchase_payments', ['user_id']);
    await queryInterface.addIndex('purchase_payments', ['payment_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchase_payments');
  }
};
