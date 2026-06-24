'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addIndex('products', ['name'], {
      name: 'ft_products_name',
      type: 'FULLTEXT'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('products', 'ft_products_name');
  }
};
