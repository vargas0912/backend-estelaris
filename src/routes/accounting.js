const express = require('express');
const router = express.Router();

router.use('/accounts', require('./accounting/accounts'));
router.use('/periods', require('./accounting/periods'));
router.use('/vouchers', require('./accounting/vouchers'));
router.use('/reports', require('./accounting/reports'));
router.use('/sat', require('./accounting/sat'));

module.exports = router;
