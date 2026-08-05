'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payroll_lines', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      payroll_period_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'payroll_periods' },
          key: 'id'
        }
      },
      employee_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'employees' },
          key: 'id'
        }
      },
      base_salary: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      worked_days: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(5, 2)
      },
      gross_pay: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      loan_deduction: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      other_deductions: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      net_pay: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      payment_method: {
        allowNull: false,
        defaultValue: 'Transferencia',
        type: Sequelize.ENUM('Efectivo', 'Transferencia')
      },
      reference_number: {
        allowNull: true,
        type: Sequelize.STRING
      },
      status: {
        allowNull: false,
        defaultValue: 'Pendiente',
        type: Sequelize.ENUM('Pendiente', 'Pagado')
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
    await queryInterface.dropTable('payroll_lines');
  }
};
