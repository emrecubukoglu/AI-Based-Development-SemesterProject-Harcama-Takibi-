const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const netBalanceEl = document.getElementById('net-balance');
const transactionsTbody = document.getElementById('transactions-tbody');
const budgetAlertEl = document.getElementById('budget-alert');
const categoryChartCanvas = document.getElementById('categoryChart');
const trendChartCanvas = document.getElementById('trendChart');

let categoryChart = null;
let trendChart = null;

async function loadSummaryCards() {
  try {
    const summary = await getAnalyticsSummary();
    totalIncomeEl.textContent = summary.totalIncome || 0;
    totalExpenseEl.textContent = summary.totalExpense || 0;
    const netBalance = (summary.totalIncome || 0) - (summary.totalExpense || 0);
    netBalanceEl.textContent = netBalance;
    if (netBalance < 0) {
      netBalanceEl.style.color = 'red';
    } else {
      netBalanceEl.style.color = '';
    }
    loadCharts(summary);
  } catch (error) {
    console.error('Error loading summary cards:', error);
    alert('Özet kartları yüklenirken hata oluştu.');
  }
}

function loadCharts(summaryData) {
  // Destroy existing charts
  if (categoryChart) {
    categoryChart.destroy();
  }
  if (trendChart) {
    trendChart.destroy();
  }

  // Category Pie Chart
  const categoryLabels = Object.keys(summaryData.categoryBreakdown || {});
  const categoryData = Object.values(summaryData.categoryBreakdown || {});
  categoryChart = new Chart(categoryChartCanvas, {
    type: 'doughnut',
    data: {
      labels: categoryLabels,
      datasets: [{
        data: categoryData,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
      }]
    },
    options: {
      responsive: true,
    }
  });

  // Trend Line Chart
  const trendLabels = Object.keys(summaryData.monthlyTrend || {});
  const trendData = Object.values(summaryData.monthlyTrend || {});
  trendChart = new Chart(trendChartCanvas, {
    type: 'line',
    data: {
      labels: trendLabels,
      datasets: [{
        label: 'Aylık Harcama',
        data: trendData,
        borderColor: '#FF6384',
        fill: false,
      }]
    },
    options: {
      responsive: true,
    }
  });
}

async function loadTransactionsTable() {
  try {
    const transactions = await getTransactions();
    transactionsTbody.innerHTML = '';
    transactions.forEach(transaction => {
      const row = document.createElement('tr');

      const dateCell = document.createElement('td');
      dateCell.textContent = new Date(transaction.date).toLocaleDateString('tr-TR');
      row.appendChild(dateCell);

      const typeCell = document.createElement('td');
      const typeBadge = document.createElement('span');
      typeBadge.className = `badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`;
      typeBadge.textContent = transaction.type === 'income' ? 'Gelir' : 'Gider';
      typeCell.appendChild(typeBadge);
      row.appendChild(typeCell);

      const categoryCell = document.createElement('td');
      categoryCell.textContent = transaction.category;
      row.appendChild(categoryCell);

      const amountCell = document.createElement('td');
      amountCell.textContent = `${transaction.amount.toFixed(2)} TL`;
      row.appendChild(amountCell);

      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = transaction.description;
      row.appendChild(descriptionCell);

      const editCell = document.createElement('td');
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-primary';
      editBtn.textContent = 'Düzenle';
      editBtn.onclick = () => enableEdit(row, transaction._id);
      editCell.appendChild(editBtn);
      row.appendChild(editCell);

      transactionsTbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading transactions table:', error);
    alert('İşlemler tablosu yüklenirken hata oluştu.');
  }
}

function enableEdit(row, id) {
  const cells = row.querySelectorAll('td');
  const categoryCell = cells[2];
  const descriptionCell = cells[4];
  const editCell = cells[5];

  // Make category and description editable
  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.value = categoryCell.textContent;
  categoryInput.className = 'form-control form-control-sm';
  categoryCell.innerHTML = '';
  categoryCell.appendChild(categoryInput);

  const descriptionInput = document.createElement('input');
  descriptionInput.type = 'text';
  descriptionInput.value = descriptionCell.textContent;
  descriptionInput.className = 'form-control form-control-sm';
  descriptionCell.innerHTML = '';
  descriptionCell.appendChild(descriptionInput);

  // Change edit button to save
  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-sm btn-success';
  saveBtn.textContent = 'Kaydet';
  saveBtn.onclick = async () => {
    try {
      await updateTransaction(id, {
        category: categoryInput.value,
        description: descriptionInput.value,
      });
      // Reload table
      loadTransactionsTable();
    } catch (error) {
      console.error('Error updating transaction:', error);
      alert('Güncelleme sırasında hata oluştu.');
    }
  };
  editCell.innerHTML = '';
  editCell.appendChild(saveBtn);
}

async function checkBudgetAlert() {
  try {
    const budgetData = await checkBudget();
    if (budgetData.alert) {
      budgetAlertEl.classList.remove('d-none');
      budgetAlertEl.textContent = budgetData.message || 'Bütçe aşımı uyarısı!';
    } else {
      budgetAlertEl.classList.add('d-none');
    }
  } catch (error) {
    console.error('Error checking budget:', error);
    // Don't show alert on error
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSummaryCards();
  await loadTransactionsTable();
  await checkBudgetAlert();
});