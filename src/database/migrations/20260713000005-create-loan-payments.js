'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('loan_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      loan_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'employee_loans' },
          key: 'id'
        }
      },
      payroll_line_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'payroll_lines' },
          key: 'id'
        }
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      payment_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('loan_payments');
  }
};
