'use strict';

const { encrypt } = require('../../utils/handlePassword');
const { data } = require('./json_files/users');

const MIN_PASSWORD_LENGTH = 12;

/**
 * Las credenciales del superadmin NO se guardan en el repositorio:
 * se toman de las variables de entorno SPADM (email) y SPADM_PWD (contraseña).
 */
const resolveUser = (user) => {
  if (user.role !== 'superadmin') return user;

  const email = (process.env.SPADM || '').trim() || user.email;
  const password = (process.env.SPADM_PWD || '').trim();

  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Define SPADM_PWD en el .env (mínimo ${MIN_PASSWORD_LENGTH} caracteres) ` +
      'para crear el superadmin. La contraseña ya no se guarda en el repositorio.'
    );
  }

  return { ...user, email, password };
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  // eslint-disable-next-line no-unused-vars
  async up(queryInterface, Sequelize) {
    const users = await Promise.all(
      data.map(resolveUser).map(async(user) => ({
        name: user.name,
        email: user.email,
        password: await encrypt(user.password),
        role: user.role,
        created_at: new Date(),
        updated_at: new Date()
      }))
    );

    await queryInterface.bulkInsert('users', users, {});
  },

  // eslint-disable-next-line no-unused-vars
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
