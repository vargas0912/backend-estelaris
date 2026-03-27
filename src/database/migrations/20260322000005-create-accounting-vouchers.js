'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('accounting_vouchers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      folio: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('ingreso', 'egreso', 'diario', 'ajuste'),
        allowNull: false
      },
      period_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'accounting_periods',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      branch_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('borrador', 'aplicada', 'cancelada'),
        allowNull: false,
        defaultValue: 'borrador'
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      reference_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      created_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Unique index: period_id + folio
    await queryInterface.addIndex('accounting_vouchers', ['period_id', 'folio'], {
      unique: true,
      name: 'accounting_vouchers_period_folio_unique'
    });

    // Índice por branch_id
    await queryInterface.addIndex('accounting_vouchers', ['branch_id'], {
      name: 'accounting_vouchers_branch_id'
    });

    // Índice por status
    await queryInterface.addIndex('accounting_vouchers', ['status'], {
      name: 'accounting_vouchers_status'
    });

    // Índice compuesto reference_type + reference_id
    await queryInterface.addIndex('accounting_vouchers', ['reference_type', 'reference_id'], {
      name: 'accounting_vouchers_reference'
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('accounting_vouchers');
  }
};
