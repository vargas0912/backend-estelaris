'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const fecha = new Date();

    const newPrivileges = [
      { name: 'Ver sucursales de usuario', codeName: 'view_user_branches', module: 'userBranches', created_at: fecha, updated_at: fecha },
      { name: 'Asignar sucursal a usuario', codeName: 'create_user_branch', module: 'userBranches', created_at: fecha, updated_at: fecha },
      { name: 'Remover sucursal de usuario', codeName: 'delete_user_branch', module: 'userBranches', created_at: fecha, updated_at: fecha }
    ];

    await queryInterface.bulkInsert('privileges', newPrivileges, {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('privileges', {
      module: 'userBranches'
    }, {});
  }
};
