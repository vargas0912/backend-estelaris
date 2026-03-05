'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sale_installments', {
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
        onDelete: 'CASCADE'
      },
      installment_number: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      due_date: {
        allowNull: false,
        type: Sequelize.DATEONLY
      },
      amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2)
      },
      paid_amount: {
        allowNull: false,
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('Pendiente', 'Pagado'),
        defaultValue: 'Pendiente'
      },
      paid_date: {
        allowNull: true,
        type: Sequelize.DATEONLY
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    await queryInterface.addIndex('sale_installments', ['sale_id']);
    await queryInterface.addIndex('sale_installments', ['sale_id', 'installment_number'], { unique: true });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sale_installments');
  }
};
