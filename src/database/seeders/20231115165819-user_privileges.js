'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    const data = [
      { user_id: 1, privilege_id: 1, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 2, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 3, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 4, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 5, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 6, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 7, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 8, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 9, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 10, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 11, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 12, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 13, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 14, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 15, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 16, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 17, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 18, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 19, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 20, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 21, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 22, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 23, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 24, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 25, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 26, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 27, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 28, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 29, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 30, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 31, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 32, created_at: fecha, updated_at: fecha },
      { user_id: 1, privilege_id: 33, created_at: fecha, updated_at: fecha }
    ];

    await queryInterface.bulkInsert('userprivileges', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('userprivileges', null, {});
  }

};
