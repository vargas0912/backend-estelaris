'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sales', {
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
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customer_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customer_address_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'customer_addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      employee_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      price_list_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'price_lists',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      sales_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      sales_type: {
        allowNull: false,
        type: Sequelize.ENUM('Contado', 'Credito'),
        defaultValue: 'Contado'
      },
      payment_periods: {
        allowNull: true,
        type: Sequelize.ENUM('Semanal', 'Quincenal', 'Mensual')
      },
      total_days_term: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      invoice: {
        allowNull: true,
        type: Sequelize.STRING(50)
      },
      subtotal: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      discount_amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      tax_amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      sales_total: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      due_payment: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      due_date: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('Pendiente', 'Pagado', 'Cancelado'),
        defaultValue: 'Pendiente'
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

    await queryInterface.addIndex('sales', ['branch_id']);
    await queryInterface.addIndex('sales', ['customer_id']);
    await queryInterface.addIndex('sales', ['employee_id']);
    await queryInterface.addIndex('sales', ['status']);
    await queryInterface.addIndex('sales', ['due_date']);
    await queryInterface.addIndex('sales', ['sales_date']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales');
  }
};
