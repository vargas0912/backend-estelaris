const express = require('express');
const router = express.Router();

router.use('/periods', require('./accounting/periods'));

module.exports = router;
