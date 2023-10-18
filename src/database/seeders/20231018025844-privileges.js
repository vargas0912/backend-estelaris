'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const privileges = [
      { name: 'Crear sucursal', codename: 'create_branch', module: 'branches', created_at: '2023-10-05 04:26:24.0', updated_at: '2023-10-05 04:26:24.0' },
      { name: 'Ver sucursal', codename: 'view_branch', module: 'branches', created_at: '2023-10-05 04:26:45.0', updated_at: '2023-10-05 04:26:45.0' },
      { name: 'Ver sucursales', codename: 'view_branches', module: 'branches', created_at: '2023-10-05 04:26:51.0', updated_at: '2023-10-05 04:26:51.0' },
      { name: 'Modificar sucursales', codename: 'update_branch', module: 'branches', created_at: '2023-10-05 04:27:07.0', updated_at: '2023-10-05 04:27:07.0' },
      { name: 'Eliminar sucursales', codename: 'delete_branch', module: 'branches', created_at: '2023-10-05 04:27:19.0', updated_at: '2023-10-05 04:27:19.0' },
      { name: 'Ver empleados', codename: 'view_employees', module: 'employees', created_at: '2023-10-05 16:05:24.0', updated_at: '2023-10-05 16:05:24.0' },
      { name: 'Ver empleado', codename: 'view_employee', module: 'employees', created_at: '2023-10-05 16:05:37.0', updated_at: '2023-10-05 16:05:37.0' },
      { name: 'Modificar empleados', codename: 'update_employee', module: 'employees', created_at: '2023-10-05 16:06:30.0', updated_at: '2023-10-05 16:06:30.0' },
      { name: 'Crear empleados', codename: 'create_employee', module: 'employees', created_at: '2023-10-05 16:06:48.0', updated_at: '2023-10-05 16:06:48.0' },
      { name: 'Eliminar empleados', codename: 'delete_employee', module: 'employees', created_at: '2023-10-05 16:07:08.0', updated_at: '2023-10-05 16:07:08.0' },
      { name: 'Ver privilegio', codename: 'view_privilege', module: 'privileges', created_at: '2023-10-05 21:12:01.0', updated_at: '2023-10-05 21:12:01.0' },
      { name: 'Crear privilegio', codename: 'create_privilege', module: 'privileges', created_at: '2023-10-05 21:12:32.0', updated_at: '2023-10-05 21:12:32.0' },
      { name: 'Actualizar privilegio', codename: 'update_privilege', module: 'privileges', created_at: '2023-10-05 21:12:45.0', updated_at: '2023-10-05 21:12:45.0' },
      { name: 'Eliminar privilegio', codename: 'delete_privilege', module: 'privileges', created_at: '2023-10-05 21:12:58.0', updated_at: '2023-10-05 21:12:58.0' },
      { name: 'Ver usuario - privilegio', codename: 'view_user_privilege', module: 'privileges', created_at: '2023-10-05 21:17:12.0', updated_at: '2023-10-05 21:17:12.0' },
      { name: 'Crear usuario - privilegio', codename: 'create_user_privilege', module: 'privileges', created_at: '2023-10-05 21:17:30.0', updated_at: '2023-10-05 21:17:30.0' },
      { name: 'Eliminar usuario - privilegio', codename: 'delete_user_privilege', module: 'privileges', created_at: '2023-10-05 21:17:45.0', updated_at: '2023-10-05 21:17:45.0' },
      { name: 'Ver usuarios', codename: 'view_users', module: 'users', created_at: '2023-10-06 04:07:09.0', updated_at: '2023-10-06 04:09:32.0' },
      { name: 'Ver usuario', codename: 'view_user', module: 'users', created_at: '2023-10-06 04:12:21.0', updated_at: '2023-10-06 04:12:21.0' },
      { name: 'Ver privilegios por modulo', codename: 'view_module', module: 'privileges', created_at: '2023-10-06 04:43:59.0', updated_at: '2023-10-06 05:10:57.0' },
      { name: 'Modificar usuarios', codename: 'update_user', module: 'users', created_at: '2023-10-06 04:52:33.0', updated_at: '2023-10-06 04:52:33.0' },
      { name: 'Eliminar usuarios', codename: 'delete_user', module: 'users', created_at: '2023-10-06 05:13:20.0', updated_at: '2023-10-06 05:13:20.0' },
      { name: 'Ver categoria', codename: 'view_category', module: 'categories', created_at: '2023-10-06 23:50:12.0', updated_at: '2023-10-06 23:54:14.0' },
      { name: 'Ver categorias', codename: 'view_categories', module: 'categories', created_at: '2023-10-06 23:50:25.0', updated_at: '2023-10-06 23:54:54.0' },
      { name: 'Crear categoria', codename: 'create_category', module: 'categories', created_at: '2023-10-06 23:50:48.0', updated_at: '2023-10-06 23:55:28.0' },
      { name: 'Editar categoria', codename: 'update_category', module: 'categories', created_at: '2023-10-06 23:51:09.0', updated_at: '2023-10-06 23:51:09.0' },
      { name: 'Eliminar categoria', codename: 'delete_category', module: 'categories', created_at: '2023-10-06 23:51:20.0', updated_at: '2023-10-06 23:51:20.0' },
      { name: 'Ver clientes', codename: 'view_customers', module: 'customers', created_at: '2023-10-10 04:32:26.0', updated_at: '2023-10-10 04:32:26.0' },
      { name: 'Ver cliente', codename: 'view_customer', module: 'customers', created_at: '2023-10-10 04:32:49.0', updated_at: '2023-10-10 04:32:49.0' },
      { name: 'Crear clientes', codename: 'create_customer', module: 'customers', created_at: '2023-10-10 04:32:59.0', updated_at: '2023-10-10 04:32:59.0' },
      { name: 'Actualizar clientes', codename: 'update_customer', module: 'customers', created_at: '2023-10-10 04:33:15.0', updated_at: '2023-10-10 04:33:15.0' },
      { name: 'Eliminar clientes', codename: 'delete_customer', module: 'customers', created_at: '2023-10-10 04:33:25.0', updated_at: '2023-10-10 04:33:25.0' },
      { name: 'registrar usuarios', codename: 'register_user', module: 'users', created_at: '2023-10-11 04:03:07.0', updated_at: '2023-10-11 04:03:07.0' }
    ];

    await queryInterface.bulkInsert('privileges', privileges, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
