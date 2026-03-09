require('dotenv').config();

const Server = require('./src/server');

const server = new Server();

// No iniciar el servidor cuando Jest está corriendo (supertest no lo necesita)
if (!process.env.DISABLE_RATE_LIMIT) {
  server.listen();
}

module.exports = server;
