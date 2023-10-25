const express = require('express');
const cors = require('cors');

const { sequelize } = require('./models/index');

class Server {
  constructor (environment) {
    this.app = express();
    this.port = process.env.PORT || 3000;

    this.dbConnect();
    // this.morgan();
    this.middlewares();
  }

  start () {
    this.server = this.express.listen(3000);
  }

  stop () {
    this.app.close();
  }

  async dbConnect () {
    try {
      await sequelize.authenticate();
      // await sequelize.sync({force:true});
      console.log(`MySQL is online. Environment: ${process.env.NODE_ENV}`);
    } catch (e) {
      console.log('MYSQL Error de conexión', e);
    }
    // Modo pruccion
    // if (environment === 'test') {
    //   await sequelize.authentication().then(() => {
    //     console.log('Sequelize is online');
    //   });
    // } else {
    //   // Modo desarrollo
    //   // Verificar como hacer que en production siempre haga 'sequelize.authenticate'
    //   // await sequelize.sync({ force: false }).then(() => {
    //   await sequelize.authentication().then(() => {
    //     console.log(`Sequelize is online. Environment: ${process.env.NODE_ENV}`);
    //   });
    // }
  }

  middlewares () {
    this.app.use(cors());

    this.app.use(express.json());

    this.app.use(express.static('storage'));

    this.app.use('/api', require('./routes'));
  }

  listen () {
    this.app.listen(this.port, () => {
      console.log('Run server on port:', this.port);
    });
  }
}

module.exports = Server;
