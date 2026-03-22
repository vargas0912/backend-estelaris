const express = require('express');
const router = express.Router();

router.use('/accounts', require('./accounting/accounts'));
router.use('/periods', require('./accounting/periods'));

module.exports = router;
