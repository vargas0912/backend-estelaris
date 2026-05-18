'use strict';

const { data } = require('./json_files/municipalities');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const municipalities = data.map(item => ({
      id: item.id,
      state_id: item.state_id,
      key: item.key,
      name: item.name,
      active: item.active,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('municipalities', municipalities, {});

    const maxId = Math.max(...data.map(item => item.id));
    await queryInterface.sequelize.query(
      `ALTER TABLE municipalities AUTO_INCREMENT = ${maxId + 1}`
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('municipalities', null, {});
  }
};
