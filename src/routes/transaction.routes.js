const express = require('express');
const { processRequest } = require('../controllers/transaction.controller');

const router = express.Router();

router.post('/', processRequest);

module.exports = router;
