const Transaction = require('../models/transaction.model');
const Budget = require('../models/budget.model');

async function checkBudget(req, res) {
  // Şimdilik basit tutalım
  res.json({ alert: false, message: '' });
}

//Bütçe Limiti Kaydetme / Güncelleme Fonksiyonu
async function setBudget(req, res) {
  try {
    const { category, limitAmount } = req.body;
    
    if (!category || limitAmount === undefined) {
      return res.status(400).json({ error: 'Kategori ve limitAmount zorunludur.' });
    }
    const Budget = require('../models/budget.model');
    const budget = await Budget.findOneAndUpdate(
      { category: category },
      { limitAmount: Number(limitAmount) },
      { new: true, upsert: true } 
    );

    res.status(200).json(budget);
  } catch (error) {
    console.error('Bütçe kaydedilirken hata:', error);
    res.status(500).json({ error: 'Bütçe kaydedilemedi.' });
  }
}

async function getSummary(req, res) {
  try {
    const transactions = await Transaction.find();
    const budgets = await Budget.find();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    // Limit Durumu Analizi
    const budgetStatus = budgets.map(b => {
      const spent = categoryBreakdown[b.category] || 0;
      const percentage = (spent / b.limitAmount) * 100;
      
      let status = 'ok';
      if (percentage >= 100) status = 'danger';
      else if (percentage >= 80) status = 'warning';

      return {
        category: b.category,
        limit: b.limitAmount,
        spent: spent,
        percentage: percentage.toFixed(1),
        status: status
      };
    });

    res.json({
      totalIncome,
      totalExpense,
      categoryBreakdown,
      budgetStatus // Frontend artık bu listeyi kullanacak
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching summary' });
  }
}

module.exports = { getSummary, checkBudget, setBudget };