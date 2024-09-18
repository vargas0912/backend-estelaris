'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const privileges = [
      {
        name: 'Crear privilegio',
        codename: 'create_privilege',
        module: 'privileges',
        created_at: '2023-10-05 21:12:32.0',
        updated_at: '2023-10-05 21:12:32.0'
      },
      {
        name: 'Actualizar privilegio',
        codename: 'update_privilege',
        module: 'privileges',
        created_at: '2023-10-05 21:12:45.0',
        updated_at: '2023-10-05 21:12:45.0'
      },
      {
        name: 'Eliminar privilegio',
        codename: 'delete_privilege',
        module: 'privileges',
        created_at: '2023-10-05 21:12:58.0',
        updated_at: '2023-10-05 21:12:58.0'
      },
      {
        name: 'Ver usuario - privilegio',
        codename: 'view_user_privilege',
        module: 'privileges',
        created_at: '2023-10-05 21:17:12.0',
        updated_at: '2023-10-05 21:17:12.0'
      },
      {
        name: 'Crear usuario - privilegio',
        codename: 'create_user_privilege',
        module: 'privileges',
        created_at: '2023-10-05 21:17:30.0',
        updated_at: '2023-10-05 21:17:30.0'
      },
      {
        name: 'Eliminar usuario - privilegio',
        codename: 'delete_user_privilege',
        module: 'privileges',
        created_at: '2023-10-05 21:17:45.0',
        updated_at: '2023-10-05 21:17:45.0'
      },
      {
        name: 'Ver usuarios',
        codename: 'view_users',
        module: 'users',
        created_at: '2023-10-06 04:07:09.0',
        updated_at: '2023-10-06 04:09:32.0'
      },
      {
        name: 'Ver usuario',
        codename: 'view_user',
        module: 'users',
        created_at: '2023-10-06 04:12:21.0',
        updated_at: '2023-10-06 04:12:21.0'
      },
      {
        name: 'Ver privilegios por modulo',
        codename: 'view_module',
        module: 'privileges',
        created_at: '2023-10-06 04:43:59.0',
        updated_at: '2023-10-06 05:10:57.0'
      },
      {
        name: 'Modificar usuarios',
        codename: 'update_user',
        module: 'users',
        created_at: '2023-10-06 04:52:33.0',
        updated_at: '2023-10-06 04:52:33.0'
      },
      {
        name: 'Eliminar usuarios',
        codename: 'delete_user',
        module: 'users',
        created_at: '2023-10-06 05:13:20.0',
        updated_at: '2023-10-06 05:13:20.0'
      },
      {
        name: 'registrar usuarios',
        codename: 'register_user',
        module: 'users',
        created_at: '2023-10-11 04:03:07.0',
        updated_at: '2023-10-11 04:03:07.0'
      }

    ];

    await queryInterface.bulkInsert('privileges', privileges, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
