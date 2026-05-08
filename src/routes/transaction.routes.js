const express = require('express');
const router = express.Router();
const { processRequest, getAllTransactions, updateTransaction } = require('../controllers/transaction.controller');

router.post('/', processRequest);            // AI ile kaydet
router.get('/', getAllTransactions);         // Tabloya verileri çek
router.put('/:id', updateTransaction);       // Düzenlemeleri kaydet

module.exports = router;