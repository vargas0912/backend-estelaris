const express = require('express');
const router = express.Router();

router.use('/accounts', require('./accounting/accounts'));
router.use('/periods', require('./accounting/periods'));
router.use('/reports', require('./accounting/reports'));

module.exports = router;
