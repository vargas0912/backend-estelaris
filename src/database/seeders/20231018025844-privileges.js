'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const privileges = [
      { name: 'Crear sucursal', codeName: 'create_branch', module: 'branches', created_at: '2023-10-05 04:26:24.0', updated_at: '2023-10-05 04:26:24.0' },
      { name: 'Ver sucursal', codeName: 'view_branch', module: 'branches', created_at: '2023-10-05 04:26:45.0', updated_at: '2023-10-05 04:26:45.0' },
      { name: 'Ver sucursales', codeName: 'view_branches', module: 'branches', created_at: '2023-10-05 04:26:51.0', updated_at: '2023-10-05 04:26:51.0' },
      { name: 'Modificar sucursales', codeName: 'update_branch', module: 'branches', created_at: '2023-10-05 04:27:07.0', updated_at: '2023-10-05 04:27:07.0' },
      { name: 'Eliminar sucursales', codeName: 'delete_branch', module: 'branches', created_at: '2023-10-05 04:27:19.0', updated_at: '2023-10-05 04:27:19.0' },
      { name: 'Ver empleados', codeName: 'view_employees', module: 'employees', created_at: '2023-10-05 16:05:24.0', updated_at: '2023-10-05 16:05:24.0' },
      { name: 'Ver empleado', codeName: 'view_employee', module: 'employees', created_at: '2023-10-05 16:05:37.0', updated_at: '2023-10-05 16:05:37.0' },
      { name: 'Modificar empleados', codeName: 'update_employee', module: 'employees', created_at: '2023-10-05 16:06:30.0', updated_at: '2023-10-05 16:06:30.0' },
      { name: 'Crear empleados', codeName: 'create_employee', module: 'employees', created_at: '2023-10-05 16:06:48.0', updated_at: '2023-10-05 16:06:48.0' },
      { name: 'Eliminar empleados', codeName: 'delete_employee', module: 'employees', created_at: '2023-10-05 16:07:08.0', updated_at: '2023-10-05 16:07:08.0' },
      { name: 'Ver privilegio', codeName: 'view_privilege', module: 'privileges', created_at: '2023-10-05 21:12:01.0', updated_at: '2023-10-05 21:12:01.0' },
      { name: 'Crear privilegio', codeName: 'create_privilege', module: 'privileges', created_at: '2023-10-05 21:12:32.0', updated_at: '2023-10-05 21:12:32.0' },
      { name: 'Actualizar privilegio', codeName: 'update_privilege', module: 'privileges', created_at: '2023-10-05 21:12:45.0', updated_at: '2023-10-05 21:12:45.0' },
      { name: 'Eliminar privilegio', codeName: 'delete_privilege', module: 'privileges', created_at: '2023-10-05 21:12:58.0', updated_at: '2023-10-05 21:12:58.0' },
      { name: 'Ver usuario - privilegio', codeName: 'view_user_privilege', module: 'privileges', created_at: '2023-10-05 21:17:12.0', updated_at: '2023-10-05 21:17:12.0' },
      { name: 'Crear usuario - privilegio', codeName: 'create_user_privilege', module: 'privileges', created_at: '2023-10-05 21:17:30.0', updated_at: '2023-10-05 21:17:30.0' },
      { name: 'Eliminar usuario - privilegio', codeName: 'delete_user_privilege', module: 'privileges', created_at: '2023-10-05 21:17:45.0', updated_at: '2023-10-05 21:17:45.0' },
      { name: 'Ver usuarios', codeName: 'view_users', module: 'users', created_at: '2023-10-06 04:07:09.0', updated_at: '2023-10-06 04:09:32.0' },
      { name: 'Ver usuario', codeName: 'view_user', module: 'users', created_at: '2023-10-06 04:12:21.0', updated_at: '2023-10-06 04:12:21.0' },
      { name: 'Ver privilegios por modulo', codeName: 'view_module', module: 'privileges', created_at: '2023-10-06 04:43:59.0', updated_at: '2023-10-06 05:10:57.0' },
      { name: 'Modificar usuarios', codeName: 'update_user', module: 'users', created_at: '2023-10-06 04:52:33.0', updated_at: '2023-10-06 04:52:33.0' },
      { name: 'Eliminar usuarios', codeName: 'delete_user', module: 'users', created_at: '2023-10-06 05:13:20.0', updated_at: '2023-10-06 05:13:20.0' },
      { name: 'Ver categoria', codeName: 'view_category', module: 'categories', created_at: '2023-10-06 23:50:12.0', updated_at: '2023-10-06 23:54:14.0' },
      { name: 'Ver categorias', codeName: 'view_categories', module: 'categories', created_at: '2023-10-06 23:50:25.0', updated_at: '2023-10-06 23:54:54.0' },
      { name: 'Crear categoria', codeName: 'create_category', module: 'categories', created_at: '2023-10-06 23:50:48.0', updated_at: '2023-10-06 23:55:28.0' },
      { name: 'Editar categoria', codeName: 'update_category', module: 'categories', created_at: '2023-10-06 23:51:09.0', updated_at: '2023-10-06 23:51:09.0' },
      { name: 'Eliminar categoria', codeName: 'delete_category', module: 'categories', created_at: '2023-10-06 23:51:20.0', updated_at: '2023-10-06 23:51:20.0' },
      { name: 'Ver clientes', codeName: 'view_customers', module: 'customers', created_at: '2023-10-10 04:32:26.0', updated_at: '2023-10-10 04:32:26.0' },
      { name: 'Ver cliente', codeName: 'view_customer', module: 'customers', created_at: '2023-10-10 04:32:49.0', updated_at: '2023-10-10 04:32:49.0' },
      { name: 'Crear clientes', codeName: 'create_customer', module: 'customers', created_at: '2023-10-10 04:32:59.0', updated_at: '2023-10-10 04:32:59.0' },
      { name: 'Actualizar clientes', codeName: 'update_customer', module: 'customers', created_at: '2023-10-10 04:33:15.0', updated_at: '2023-10-10 04:33:15.0' },
      { name: 'Eliminar clientes', codeName: 'delete_customer', module: 'customers', created_at: '2023-10-10 04:33:25.0', updated_at: '2023-10-10 04:33:25.0' },
      { name: 'registrar usuarios', codeName: 'register_user', module: 'users', created_at: '2023-10-11 04:03:07.0', updated_at: '2023-10-11 04:03:07.0' }

    ];

    await queryInterface.bulkInsert('privileges', privileges, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
