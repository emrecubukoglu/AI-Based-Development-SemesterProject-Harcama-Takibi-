const Transaction = require('../models/transaction.model');
const Budget = require('../models/budget.model');
const { parseTransactionText } = require('../services/groq.service');

async function processRequest(req, res) {
  try {
    const { messages } = req.body; 
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'Messages array is required.' });

    const parsedData = await parseTransactionText(messages);

    if (parsedData.status === 'ask' || parsedData.status === 'cancel') {
      return res.status(200).json({ status: parsedData.status, message: parsedData.message });
    }

    const txData = parsedData.transaction;
    txData.user_id = 'test_user_123'; 

    if (txData.type === 'budget') {
      const budget = await Budget.findOneAndUpdate({ category: txData.category }, { limitAmount: txData.amount }, { new: true, upsert: true });
      return res.status(201).json({ status: 'complete', message: parsedData.message, isBudget: true, data: budget });
    }

    // YENİ: DÜZENLİ İŞLEMLER İÇİN AYNI AY İÇİNDE ÇİFT KAYIT (MÜKERRER) KORUMASI
    if (txData.is_recurring) {
      const txDate = new Date(txData.date);
      // Hedeflenen tarihin ait olduğu ayın başlangıç ve bitiş sınırlarını hesapla
      const startOfMonth = new Date(txDate.getFullYear(), txDate.getMonth(), 1);
      const endOfMonth = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const existingRecurring = await Transaction.findOne({
        user_id: 'test_user_123',
        category: txData.category,
        type: txData.type,
        is_recurring: true,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      if (existingRecurring) {
        const monthName = txDate.toLocaleString('tr-TR', { month: 'long' });
        return res.status(200).json({ 
          status: 'cancel', 
          message: `⚠️ İşlem Reddedildi: ${monthName} ayı için zaten tanımlanmış bir "${txData.category}" düzenli ${txData.type === 'income' ? 'gelir' : 'gider'} kaydınız bulunuyor. Aynı ay içinde mükerrer düzenli işlem ekleyemezsiniz!` 
        });
      }
    }

    const transaction = new Transaction(txData);
    const savedTransaction = await transaction.save();
    res.status(201).json({ status: 'complete', message: parsedData.message, data: savedTransaction });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Manuel Girişler İçin Çift Kayıt Koruması
async function createManualTransaction(req, res) {
  try {
    const { type, amount, category, description, date, is_recurring, recurring_info } = req.body;
    
    if (is_recurring) {
      const txDate = new Date(date);
      const startOfMonth = new Date(txDate.getFullYear(), txDate.getMonth(), 1);
      const endOfMonth = new Date(txDate.getFullYear(), txDate.getMonth() + 1, 0, 23, 59, 59, 999);

      const existingRecurring = await Transaction.findOne({
        user_id: 'test_user_123',
        category,
        type,
        is_recurring: true,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      if (existingRecurring) {
        return res.status(400).json({ error: 'Bu ay için bu kategoriye ait düzenli işlem zaten mevcut!' });
      }
    }

    const transaction = new Transaction({
      user_id: 'test_user_123',
      type, amount: Number(amount), category, description, date, is_recurring, recurring_info
    });
    
    const saved = await transaction.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Manuel işlem eklenemedi.' });
  }
}

async function getAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
}

async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
}

async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Silinecek işlem bulunamadı' });
    res.json({ message: 'İşlem başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Silme işlemi sırasında hata oluştu' });
  }
}

module.exports = { processRequest, createManualTransaction, getAllTransactions, updateTransaction, deleteTransaction };