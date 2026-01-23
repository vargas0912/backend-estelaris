'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const employees = [
      {
        name: 'Empleado Test 1',
        email: 'empleado1@test.com',
        phone: '(722) 111-1111',
        hire_date: '2020-01-15',
        position_id: 1,
        branch_id: 1,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Empleado Test 2',
        email: 'empleado2@test.com',
        phone: '(722) 222-2222',
        hire_date: '2021-06-20',
        position_id: 2,
        branch_id: 1,
        active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Empleado Test 3',
        email: 'empleado3@test.com',
        phone: '',
        hire_date: '2022-03-10',
        position_id: 3,
        branch_id: 2,
        active: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('employees', employees, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('employees', null, {});
  }
};
