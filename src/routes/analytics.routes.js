const express = require('express');
const router = express.Router();
const { getSummary, checkBudget, setBudget, deleteBudget } = require('../controllers/analytics.controller');

router.get('/summary', getSummary);
router.get('/check-budget', checkBudget);
router.post('/budget', setBudget);
router.delete('/budget/:id', deleteBudget); // YENİ: Silme Rotası Eklendi

module.exports = router;