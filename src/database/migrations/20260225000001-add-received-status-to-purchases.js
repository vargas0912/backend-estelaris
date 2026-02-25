'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('purchases', 'status', {
      allowNull: false,
      type: Sequelize.ENUM('Pendiente', 'Recibido', 'Pagado', 'Cancelado'),
      defaultValue: 'Pendiente'
    });

    await queryInterface.addColumn('purchases', 'received_at', {
      allowNull: true,
      type: Sequelize.DATEONLY,
      comment: 'Fecha en que se recibió físicamente la mercadería'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('purchases', 'received_at');

    await queryInterface.changeColumn('purchases', 'status', {
      allowNull: false,
      type: Sequelize.ENUM('Pendiente', 'Pagado', 'Cancelado'),
      defaultValue: 'Pendiente'
    });
  }
};
