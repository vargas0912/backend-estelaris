require('dotenv').config();
module.exports = {
  development: {
    // Conexion
    username: process.env.MYSQL_DEV_USER,
    password: process.env.MYSQL_DEV_PASSWORD,
    database: process.env.MYSQL_DEV_DB_NAME,
    host: process.env.MYSQL_DEV_HOST,
    dialect: 'mysql',

    // Configuracion de seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelizeSeeds',

    define: {
      timestamps: true,
      paranoid: true,
      // Fk type user_id en vez de userId
      underscored: true
    }
  },
  test: {
    username: process.env.MYSQL_TEST_USER,
    password: process.env.MYSQL_TEST_PASSWORD,
    database: process.env.MYSQL_TEST_DB_NAME,
    host: process.env.MYSQL_TEST_HOST,
    port: process.env.MYSQL_TEST_PORT,
    dialect: 'mysql',

    // Configuracion de seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelizeSeeds',

    define: {
      timestamps: true,
      paranoid: true,

      // Fk type user_id
      underscored: true
    }
  },
  production: {
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DB_NAME,
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',

    // Configuracion de seeds
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelizeSeeds',

    define: {
      timestamps: true,
      paranoid: true,
      // Fk type user_id
      underscored: true
    }
  }
};
