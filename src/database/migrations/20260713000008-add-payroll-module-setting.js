'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('system_settings', [
      {
        category: 'modules',
        key: 'payroll_module_enabled',
        value: 'true',
        label: 'Módulo de nómina habilitado',
        description: 'Habilita o deshabilita el acceso al módulo de nómina, préstamos y vacaciones de empleados',
        data_type: 'boolean',
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('system_settings', {
      key: { [Sequelize.Op.in]: ['payroll_module_enabled'] }
    }, {});
  }
};
