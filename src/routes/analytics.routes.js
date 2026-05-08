const express = require('express');
const router = express.Router();
const { getSummary, checkBudget, setBudget } = require('../controllers/analytics.controller');

router.get('/summary', getSummary);
router.get('/check-budget', checkBudget);
router.post('/budget', setBudget);

module.exports = router;