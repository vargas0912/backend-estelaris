'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sale_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'sales',
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
        type: Sequelize.ENUM('Efectivo', 'Transferencia', 'Vale despensa', 'Tarjeta')
      },
      reference_number: {
        allowNull: true,
        type: Sequelize.STRING(100)
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

    await queryInterface.addIndex('sale_payments', ['sale_id']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sale_payments');
  }
};
