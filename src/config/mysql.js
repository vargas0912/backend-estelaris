const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const sequelize = new Sequelize(config);

const dbConnectMySql = async () => {
  try {
    // await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log(`MySQL is online. Environment: ${process.env.NODE_ENV}`);
  } catch (e) {
    console.log('MYSQL Error de conexión', e);
  }
};

module.exports = { sequelize, dbConnectMySql };
