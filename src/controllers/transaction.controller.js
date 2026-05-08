const Transaction = require('../models/transaction.model');
const Budget = require('../models/budget.model'); // YENİ: Bütçe modeli eklendi
const { parseTransactionText } = require('../services/groq.service');

// Mevcut AI Kayıt Fonksiyonumuz (Bütçe kontrolü eklendi)
async function processRequest(req, res) {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text is required.' });
    }

    const parsedData = await parseTransactionText(text);

    // YENİ: EĞER YAPAY ZEKA BUNUN BİR BÜTÇE LİMİTİ OLDUĞUNU ANLARSA:
    if (parsedData.type === 'budget') {
      const budget = await Budget.findOneAndUpdate(
        { category: parsedData.category },
        { limitAmount: parsedData.amount },
        { new: true, upsert: true } // Varsa güncelle, yoksa yeni oluştur
      );
      
      // Frontend'e bunun bir bütçe işlemi olduğunu bildiren özel bir yanıt dön
      return res.status(201).json({
        isBudget: true,
        category: parsedData.category,
        amount: parsedData.amount,
        type: 'budget'
      });
    }

    // NORMAL HARCAMA VEYA GELİR İSE (Mevcut kod):
    const transaction = new Transaction(parsedData);
    const savedTransaction = await transaction.save();

    res.status(201).json(savedTransaction);
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Tüm işlemleri tablo için getir
async function getAllTransactions(req, res) {
  try {
    // En yeniler en üstte olacak şekilde getir
    const transactions = await Transaction.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching transactions' });
  }
}

// Tablodan gelen manuel düzenlemeleri kaydet
async function updateTransaction(req, res) {
  try {
    const { id } = req.params;
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Error updating transaction' });
  }
}

// Veritabanından işlem sil
async function deleteTransaction(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Transaction.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Silinecek işlem bulunamadı' });
    }
    
    res.json({ message: 'İşlem başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Silme işlemi sırasında hata oluştu' });
  }
}

module.exports = { processRequest, getAllTransactions, updateTransaction, deleteTransaction };