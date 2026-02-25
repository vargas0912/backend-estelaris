'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      supplier_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      purch_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      invoice_number: {
        allowNull: true,
        type: Sequelize.STRING(50),
        comment: 'Folio de factura del proveedor'
      },
      purch_type: {
        allowNull: false,
        type: Sequelize.ENUM('Contado', 'Credito'),
        defaultValue: 'Contado'
      },
      payment_method: {
        allowNull: true,
        type: Sequelize.ENUM('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta')
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('Pendiente', 'Pagado', 'Cancelado'),
        defaultValue: 'Pendiente'
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
      purch_total: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      due_date: {
        allowNull: true,
        type: Sequelize.DATEONLY,
        comment: 'Fecha límite de pago para compras a crédito'
      },
      notes: {
        allowNull: true,
        type: Sequelize.TEXT,
        comment: 'Observaciones internas de la compra'
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

    await queryInterface.addIndex('purchases', ['supplier_id']);
    await queryInterface.addIndex('purchases', ['branch_id']);
    await queryInterface.addIndex('purchases', ['user_id']);
    await queryInterface.addIndex('purchases', ['purch_date']);
    await queryInterface.addIndex('purchases', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchases');
  }
};
