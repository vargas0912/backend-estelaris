const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const env = process.env.NODE_ENV || 'development';
const config = require('./config')[env];

const sequelize = new Sequelize(config);

const dbConnectMySql = async() => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync({ force: false });
    logger.info(`MySQL is online. Environment: ${process.env.NODE_ENV}`);
  } catch (e) {
    logger.error('MySQL connection error:', { error: e.message, stack: e.stack });
    throw e; // Re-lanzar el error para que pueda ser manejado por el caller
  }
};

module.exports = { sequelize, dbConnectMySql };
