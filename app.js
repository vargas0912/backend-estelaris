require('dotenv').config();

const Server = require('./src/server');

const server = new Server();

const service = server.listen();

module.exports = { server, service };
