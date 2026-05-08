const express = require('express');
const router = express.Router();
const { getSummary, checkBudget } = require('../controllers/analytics.controller');

router.get('/summary', getSummary);
router.get('/check-budget', checkBudget);

module.exports = router;