const express = require('express');
const router = express.Router();
const { processRequest, createManualTransaction, getAllTransactions, updateTransaction, deleteTransaction } = require('../controllers/transaction.controller');

router.post('/', processRequest);            
router.post('/manual', createManualTransaction); // YENİ: Manuel Kayıt Rotası
router.get('/', getAllTransactions);         
router.put('/:id', updateTransaction);       
router.delete('/:id', deleteTransaction);   

module.exports = router;