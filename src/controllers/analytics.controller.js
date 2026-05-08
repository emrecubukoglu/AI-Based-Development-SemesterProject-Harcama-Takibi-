const Transaction = require('../models/transaction.model');
const Budget = require('../models/budget.model');

async function getSummary(req, res) {
  try {
    const transactions = await Transaction.find();
    const budgets = await Budget.find();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};
    const monthlyTrend = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;

        const date = new Date(t.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + t.amount;
      }
    });

    const budgetStatus = budgets.map(b => {
      const spent = categoryBreakdown[b.category] || 0;
      const percentage = (spent / b.limitAmount) * 100;
      
      let status = 'ok';
      if (percentage >= 100) status = 'danger';
      else if (percentage >= 80) status = 'warning';

      return {
        id: b._id, // YENİ: Silme işlemi için ID'yi frontend'e gönderiyoruz
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
      monthlyTrend,
      budgetStatus
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching summary' });
  }
}

async function checkBudget(req, res) {
  res.json({ alert: false, message: '' });
}

async function setBudget(req, res) {
  try {
    const { category, limitAmount } = req.body;
    
    if (!category || limitAmount === undefined) {
      return res.status(400).json({ error: 'Kategori ve limitAmount zorunludur.' });
    }

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

// YENİ: Bütçe Limiti Silme Fonksiyonu
async function deleteBudget(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Budget.findByIdAndDelete(id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Silinecek bütçe limiti bulunamadı' });
    }
    
    res.json({ message: 'Bütçe limiti başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Silme işlemi sırasında hata oluştu' });
  }
}

module.exports = { getSummary, checkBudget, setBudget, deleteBudget };