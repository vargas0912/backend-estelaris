'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    // Asignar todos los 12 privilegios al usuario superadmin (id: 1)
    const data = [
      { user_id: 1, privilege_id: 1, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 2, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 3, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 4, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 5, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 6, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 7, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 8, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 9, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 10, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 11, active: true, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 12, active: true, created_at: fecha, updated_at: fecha }
    ];

    await queryInterface.bulkInsert('userprivileges', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userprivileges', null, {});
  }
};
