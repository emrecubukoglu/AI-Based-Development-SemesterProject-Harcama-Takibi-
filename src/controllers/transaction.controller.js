const Transaction = require('../models/transaction.model');
const { parseTransactionText } = require('../services/groq.service');

async function processRequest(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required and must be a non-empty string.' });
    }

    const parsedData = await parseTransactionText(text);

    const transaction = new Transaction(parsedData);
    const savedTransaction = await transaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error while processing the transaction.' });
  }
}

module.exports = { processRequest };