'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('employee_loans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      employee_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'employees' },
          key: 'id'
        }
      },
      branch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'branches' },
          key: 'id'
        }
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      balance: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      reason: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      disbursement_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      installment_amount: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      status: {
        allowNull: false,
        defaultValue: 'Pendiente',
        type: Sequelize.ENUM('Pendiente', 'Activo', 'Liquidado', 'Cancelado')
      },
      approved_by: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'users' },
          key: 'id'
        }
      },
      user_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'users' },
          key: 'id'
        }
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
    await queryInterface.dropTable('employee_loans');
  }
};
