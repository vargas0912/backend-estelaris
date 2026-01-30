'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const fecha = new Date();

    const newPrivileges = [
      // Clientes (actualizar los existentes y agregar nuevos)
      { name: 'Ver cliente', codeName: 'view_customer', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Ver clientes', codeName: 'view_customers', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Ver clientes por sucursal', codeName: 'view_customers_by_branch', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Ver clientes por municipio', codeName: 'view_customers_by_municipality', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Crear cliente', codeName: 'create_customer', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Modificar cliente', codeName: 'update_customer', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Eliminar cliente', codeName: 'delete_customer', module: 'customers', created_at: fecha, updated_at: fecha },
      { name: 'Activar portal de cliente', codeName: 'activate_customer_portal', module: 'customers', created_at: fecha, updated_at: fecha },

      // Direcciones de Clientes (nuevos)
      { name: 'Ver dirección de cliente', codeName: 'view_customer_address', module: 'customerAddresses', created_at: fecha, updated_at: fecha },
      { name: 'Ver direcciones de cliente', codeName: 'view_customer_addresses', module: 'customerAddresses', created_at: fecha, updated_at: fecha },
      { name: 'Crear dirección', codeName: 'create_customer_address', module: 'customerAddresses', created_at: fecha, updated_at: fecha },
      { name: 'Modificar dirección', codeName: 'update_customer_address', module: 'customerAddresses', created_at: fecha, updated_at: fecha },
      { name: 'Eliminar dirección', codeName: 'delete_customer_address', module: 'customerAddresses', created_at: fecha, updated_at: fecha }
    ];

    // Primero eliminar los privilegios antiguos de customers si existen
    await queryInterface.bulkDelete('privileges', {
      module: 'customers'
    }, {});

    // Insertar todos los privilegios nuevos
    await queryInterface.bulkInsert('privileges', newPrivileges, {});
  },

  async down(queryInterface, Sequelize) {
    // Eliminar los privilegios agregados
    await queryInterface.bulkDelete('privileges', {
      module: ['customers', 'customerAddresses']
    }, {});
  }
};
