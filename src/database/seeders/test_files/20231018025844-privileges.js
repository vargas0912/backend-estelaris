'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    // Privilegios con IDs explícitos coherentes con user_privileges
    const privileges = [
      // IDs 1-3: Privilegios (gestión de privilegios)
      { id: 1, name: 'Crear privilegio', codename: 'create_privilege', module: 'privileges', created_at: fecha, updated_at: fecha },
      { id: 2, name: 'Actualizar privilegio', codename: 'update_privilege', module: 'privileges', created_at: fecha, updated_at: fecha },
      { id: 3, name: 'Eliminar privilegio', codename: 'delete_privilege', module: 'privileges', created_at: fecha, updated_at: fecha },

      // IDs 4-6: User Privileges (asignación de privilegios a usuarios)
      { id: 4, name: 'Ver usuario - privilegio', codename: 'view_user_privilege', module: 'privileges', created_at: fecha, updated_at: fecha },
      { id: 5, name: 'Crear usuario - privilegio', codename: 'create_user_privilege', module: 'privileges', created_at: fecha, updated_at: fecha },
      { id: 6, name: 'Eliminar usuario - privilegio', codename: 'delete_user_privilege', module: 'privileges', created_at: fecha, updated_at: fecha },

      // IDs 7-12: Users (gestión de usuarios)
      { id: 7, name: 'Ver usuarios', codename: 'view_users', module: 'users', created_at: fecha, updated_at: fecha },
      { id: 8, name: 'Ver usuario', codename: 'view_user', module: 'users', created_at: fecha, updated_at: fecha },
      { id: 9, name: 'Ver privilegios por modulo', codename: 'view_module', module: 'privileges', created_at: fecha, updated_at: fecha },
      { id: 10, name: 'Modificar usuarios', codename: 'update_user', module: 'users', created_at: fecha, updated_at: fecha },
      { id: 11, name: 'Eliminar usuarios', codename: 'delete_user', module: 'users', created_at: fecha, updated_at: fecha },
      { id: 12, name: 'Registrar usuarios', codename: 'register_user', module: 'users', created_at: fecha, updated_at: fecha }
    ];

    await queryInterface.bulkInsert('privileges', privileges, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('privileges', null, {});
  }
};
