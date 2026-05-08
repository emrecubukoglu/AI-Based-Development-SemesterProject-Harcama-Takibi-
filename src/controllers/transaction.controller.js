const Transaction = require('../models/transaction.model');
const { parseTransactionText } = require('../services/groq.service');

// Mevcut AI Kayıt Fonksiyonumuz
async function processRequest(req, res) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const parsedData = await parseTransactionText(text);
    const transaction = new Transaction(parsedData);
    const savedTransaction = await transaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// YENİ: Tüm işlemleri tablo için getir
async function getAllTransactions(req, res) {
  try {
    // En yeniler en üstte olacak şekilde getir
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
}

// YENİ: Tablodan gelen manuel düzenlemeleri kaydet
async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
}

module.exports = { processRequest, getAllTransactions, updateTransaction };