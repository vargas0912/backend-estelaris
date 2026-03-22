const express = require('express');
const router = express.Router();

router.use('/accounts', require('./accounting/accounts'));

module.exports = router;
