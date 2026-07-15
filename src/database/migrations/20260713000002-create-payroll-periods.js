'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payroll_periods', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      branch_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: { tableName: 'branches' },
          key: 'id'
        }
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      start_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      end_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      payment_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      frequency: {
        allowNull: false,
        type: Sequelize.ENUM('Quincenal', 'Mensual', 'Semanal')
      },
      status: {
        allowNull: false,
        defaultValue: 'Borrador',
        type: Sequelize.ENUM('Borrador', 'Aprobado', 'Pagado')
      },
      total_gross: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      total_deductions: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
      },
      total_net: {
        allowNull: false,
        defaultValue: 0.00,
        type: Sequelize.DECIMAL(12, 2)
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
    await queryInterface.dropTable('payroll_periods');
  }
};
