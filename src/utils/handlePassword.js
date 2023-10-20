const bcryptjs = require('bcryptjs');

/**
 * Encrypt password
 * @param {String} passwordPlain Password without encrypt
 * @returns {hash}
 */
const encrypt = async (passwordPlain) => {
  const hash = await bcryptjs.hash(passwordPlain, 10);

  return hash;
};

/**
 * Compare password
 * @param {String} passwordPlain Password without encrypt
 * @param {String} hashPassword Password with hash encrypt
 * @returns { Boolean } False or true
 */
const compare = async (passwordPlain, hashPassword) => {
  return bcryptjs.compare(passwordPlain, hashPassword);
};

module.exports = { encrypt, compare };
