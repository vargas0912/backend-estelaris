'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    const newPrivileges = [
      { name: 'Ver compras', codeName: 'view_purchases', module: 'purchases', created_at: fecha, updated_at: fecha },
      { name: 'Registrar compra', codeName: 'create_purchase', module: 'purchases', created_at: fecha, updated_at: fecha },
      { name: 'Modificar compra', codeName: 'update_purchase', module: 'purchases', created_at: fecha, updated_at: fecha },
      { name: 'Cancelar compra', codeName: 'cancel_purchase', module: 'purchases', created_at: fecha, updated_at: fecha },
      { name: 'Eliminar compra', codeName: 'delete_purchase', module: 'purchases', created_at: fecha, updated_at: fecha }
    ];

    await queryInterface.bulkInsert('privileges', newPrivileges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', {
      module: 'purchases'
    }, {});
  }
};
