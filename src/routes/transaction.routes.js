const express = require('express');
const router = express.Router();
const { processRequest, getAllTransactions, updateTransaction, deleteTransaction } = require('../controllers/transaction.controller');

router.post('/', processRequest);            // AI ile kaydet
router.get('/', getAllTransactions);         // Tabloya verileri çek
router.put('/:id', updateTransaction);       // Düzenlemeleri kaydet
router.delete('/:id', deleteTransaction);   // YENİ: Veritabanından işlem sil

module.exports = router;