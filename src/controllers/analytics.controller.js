const Transaction = require('../models/transaction.model');

async function getSummary(req, res) {
  try {
    const transactions = await Transaction.find();

    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};
    const monthlyTrend = {};

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        
        // Pasta grafik için kategori dağılımı
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;

        // Çizgi grafik için aylık harcama eğrisi (Örn: "2024-05")
        const date = new Date(t.date);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + t.amount;
      }
    });

    res.json({
      totalIncome,
      totalExpense,
      categoryBreakdown,
      monthlyTrend
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching summary' });
  }
}

async function checkBudget(req, res) {
  // Şimdilik basit tutalım
  res.json({ alert: false, message: '' });
}

module.exports = { getSummary, checkBudget };