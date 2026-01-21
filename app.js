require('dotenv').config();

const Server = require('./src/server');

const server = new Server();

// No iniciar el servidor en modo test (supertest no lo necesita)
if (process.env.NODE_ENV !== 'test') {
  server.listen();
}

module.exports = server;
