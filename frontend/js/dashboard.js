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
    if (summary.budgetStatus) renderBudgetStatus(summary.budgetStatus);
  } catch (error) {
    console.error('Error loading summary cards:', error);
  }
}

function renderBudgetStatus(budgetStatus) {
  const listContainer = document.getElementById('budget-status-list');
  listContainer.innerHTML = '';
  if (!budgetStatus || budgetStatus.length === 0) {
      listContainer.innerHTML = '<div class="text-muted">Henüz tanımlanmış bir kategori limiti bulunmuyor.</div>';
      return;
  }
  budgetStatus.forEach(item => {
    const isDanger = item.status === 'danger';
    const isWarning = item.status === 'warning';
    const bgColor = isDanger ? 'bg-danger text-white' : (isWarning ? 'bg-warning' : '');
    const progressColor = isDanger ? 'bg-white' : (isWarning ? 'bg-dark' : 'bg-primary');
    const btnClass = isDanger ? 'btn-light text-danger' : 'btn-danger text-white';

    const itemHtml = `
      <div class="list-group-item ${bgColor} mb-2 border rounded shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          <strong>${item.category}</strong>
          <div>
            <span class="me-3">${item.spent} TL / ${item.limit} TL (%${item.percentage})</span>
            <button class="btn btn-sm ${btnClass} fw-bold" onclick="handleDeleteBudget('${item.id}')" title="Limiti Sil">Sil</button>
          </div>
        </div>
        <div class="progress mt-2" style="height: 10px;">
          <div class="progress-bar ${progressColor}" role="progressbar" style="width: ${Math.min(item.percentage, 100)}%"></div>
        </div>
      </div>
    `;
    listContainer.innerHTML += itemHtml;
  });
}


window.handleDeleteBudget = async function(id) {
  if (confirm('Bu bütçe limitini kalıcı olarak silmek istediğinize emin misiniz?')) {
    await deleteBudget(id);
    await loadSummaryCards(); 
  }
};


window.handleDeleteTransaction = async function(id) {
  if (confirm('Bu işlemi kalıcı olarak silmek istediğinize emin misiniz?')) {
    await deleteTransaction(id);
    await loadTransactionsTable();
    await loadSummaryCards();
  }
};

function loadCharts(summaryData) {
  if (categoryChart) categoryChart.destroy();
  if (trendChart) trendChart.destroy();

  const categoryLabels = Object.keys(summaryData.categoryBreakdown || {});
  const categoryData = Object.values(summaryData.categoryBreakdown || {});
  categoryChart = new Chart(categoryChartCanvas, {
    type: 'doughnut',
    data: {
      labels: categoryLabels,
      datasets: [{ data: categoryData, backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'] }]
    },
    options: { responsive: true }
  });

  const trendLabels = Object.keys(summaryData.monthlyTrend || {});
  const trendData = Object.values(summaryData.monthlyTrend || {});
  trendChart = new Chart(trendChartCanvas, {
    type: 'line',
    data: {
      labels: trendLabels,
      datasets: [{ label: 'Aylık Harcama', data: trendData, borderColor: '#FF6384', fill: false }]
    },
    options: { responsive: true }
  });
}

async function loadTransactionsTable() {
  try {
    const transactions = await getTransactions();
    transactionsTbody.innerHTML = '';
    
    
    const recurringTransactions = transactions.filter(t => t.is_recurring);
    renderRecurringTransactions(recurringTransactions);

    
    transactions.forEach(transaction => {
      const row = document.createElement('tr');

      const dateCell = document.createElement('td');
      const rawDate = new Date(transaction.date);
      dateCell.textContent = rawDate.toLocaleDateString('tr-TR');
      dateCell.dataset.rawdate = rawDate.toISOString().split('T')[0];
      row.appendChild(dateCell);

      const typeCell = document.createElement('td');
      const typeBadge = document.createElement('span');
      typeBadge.className = `badge ${transaction.type === 'income' ? 'bg-success' : 'bg-danger'}`;
      typeBadge.textContent = transaction.type === 'income' ? 'Gelir' : 'Gider';
      typeCell.appendChild(typeBadge);
      row.appendChild(typeCell);

      const categoryCell = document.createElement('td');
      categoryCell.textContent = (transaction.is_recurring ? '🔁 ' : '') + transaction.category;
      row.appendChild(categoryCell);

      const amountCell = document.createElement('td');
      amountCell.textContent = `${transaction.amount.toFixed(2)} TL`;
      amountCell.dataset.rawamount = transaction.amount;
      row.appendChild(amountCell);

      const descriptionCell = document.createElement('td');
      descriptionCell.textContent = transaction.description;
      row.appendChild(descriptionCell);

      const actionCell = document.createElement('td'); 
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn-sm btn-primary me-2';
      editBtn.textContent = 'Düzenle';
      editBtn.onclick = () => enableEdit(row, transaction._id);
      actionCell.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-danger';
      deleteBtn.textContent = 'Sil';
      deleteBtn.onclick = () => window.handleDeleteTransaction(transaction._id);
      actionCell.appendChild(deleteBtn);
      
      row.appendChild(actionCell);
      transactionsTbody.appendChild(row);
    });
  } catch (error) {
    console.error('Error loading transactions table:', error);
  }
}

function renderRecurringTransactions(transactions) {
  const container = document.getElementById('recurring-list');
  if(!container) return;
  
  container.innerHTML = '';
  if (transactions.length === 0) {
      container.innerHTML = '<div class="text-muted">Aktif düzenli bir gelir/gider kaydı bulunmuyor.</div>';
      return;
  }

  transactions.forEach(t => {
    const isIncome = t.type === 'income';
    const colorClass = isIncome ? 'success' : 'danger';
    const icon = isIncome ? '📈' : '📉';
    const day = new Date(t.recurring_info?.last_processed_date || t.date).getDate();

    container.innerHTML += `
      <div class="list-group-item mb-2 border border-${colorClass} rounded shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>${icon} ${t.category}</strong>
            <span class="badge bg-${colorClass} ms-2">${t.amount} TL</span>
            <br>
            <small class="text-muted">🗓️ Her ayın ${day}. günü - ${t.description}</small>
          </div>
          <button class="btn btn-sm btn-outline-danger fw-bold" onclick="window.handleDeleteTransaction('${t._id}')">İptal Et</button>
        </div>
      </div>
    `;
  });
}

function enableEdit(row, id) {
  const cells = row.querySelectorAll('td');
  const dateCell = cells[0];
  const categoryCell = cells[2];
  const amountCell = cells[3];
  const descriptionCell = cells[4];
  const editCell = cells[5];

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = dateCell.dataset.rawdate;
  dateInput.className = 'form-control form-control-sm';
  dateCell.innerHTML = '';
  dateCell.appendChild(dateInput);

  const categoryInput = document.createElement('input');
  categoryInput.type = 'text';
  categoryInput.value = categoryCell.textContent.replace('🔁 ', '');
  categoryInput.className = 'form-control form-control-sm';
  categoryCell.innerHTML = '';
  categoryCell.appendChild(categoryInput);

  const amountInput = document.createElement('input');
  amountInput.type = 'number';
  amountInput.value = amountCell.dataset.rawamount;
  amountInput.className = 'form-control form-control-sm';
  amountCell.innerHTML = '';
  amountCell.appendChild(amountInput);

  const descriptionInput = document.createElement('input');
  descriptionInput.type = 'text';
  descriptionInput.value = descriptionCell.textContent;
  descriptionInput.className = 'form-control form-control-sm';
  descriptionCell.innerHTML = '';
  descriptionCell.appendChild(descriptionInput);

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-sm btn-success';
  saveBtn.textContent = 'Kaydet';
  saveBtn.onclick = async () => {
    try {
      await updateTransaction(id, {
        date: dateInput.value,
        category: categoryInput.value,
        amount: Number(amountInput.value),
        description: descriptionInput.value,
      });
      loadTransactionsTable();
      await loadSummaryCards(); 
    } catch (error) {
      alert('Güncelleme sırasında hata oluştu.');
    }
  };
  editCell.innerHTML = '';
  editCell.appendChild(saveBtn);
}



window.downloadReport = async function(type) {
  try {
      const transactions = await getTransactions();
      let filtered = transactions;
      const now = new Date();
      
      if (type === 'weekly') {
          const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = transactions.filter(t => new Date(t.date) >= lastWeek);
      } else if (type === 'monthly') {
          const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = transactions.filter(t => new Date(t.date) >= lastMonth);
      }

      if (filtered.length === 0) {
          alert('Bu dönem için raporlanacak işlem bulunamadı.');
          return;
      }

     

      const replaceTr = (str) => {
          if (!str) return '';
          return str.replace(/ı/g, 'i').replace(/İ/g, 'I').replace(/ğ/g, 'g').replace(/Ğ/g, 'G')
                    .replace(/ü/g, 'u').replace(/Ü/g, 'U').replace(/ş/g, 's').replace(/Ş/g, 'S')
                    .replace(/ö/g, 'o').replace(/Ö/g, 'O').replace(/ç/g, 'c').replace(/Ç/g, 'C');
      };

      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

     
      doc.setFontSize(18);
      const title = type === 'weekly' ? 'Haftalik Harcama Raporu' : 'Aylik Harcama Raporu';
      doc.text(title, 14, 22);
      
      
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Olusturulma Tarihi: ${now.toLocaleDateString('tr-TR')}`, 14, 30);

      
      const tableColumn = ["Tarih", "Tur", "Kategori", "Tutar (TL)", "Aciklama", "Duzenli"];
      const tableRows = [];

      filtered.forEach(t => {
          const tDate = new Date(t.date).toLocaleDateString('tr-TR');
          const tType = t.type === 'income' ? 'Gelir' : 'Gider';
          const tRec = t.is_recurring ? 'Evet' : 'Hayir';
          
          const rowData = [
              tDate,
              tType,
              replaceTr(t.category),
              t.amount.toFixed(2),
              replaceTr(t.description),
              tRec
          ];
          tableRows.push(rowData);
      });

      
      doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 40,
          theme: 'grid',
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      
      const fileName = `Harcama_Raporu_${type === 'weekly' ? 'Haftalik' : 'Aylik'}.pdf`;
      doc.save(fileName);

  } catch (error) {
      console.error(error);
      alert('PDF rapor oluşturulurken hata oluştu.');
  }
};


document.addEventListener('DOMContentLoaded', async () => {
  
  
  await loadSummaryCards();
  await loadTransactionsTable();

  
  const dateInput = document.getElementById('manual-date');
  if(dateInput) dateInput.valueAsDate = new Date();

  
  const manualForm = document.getElementById('manualAddForm');
  if(manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const type = document.getElementById('manual-type').value;
      const category = document.getElementById('manual-category').value;
      const amount = document.getElementById('manual-amount').value;
      const date = document.getElementById('manual-date').value;
      const description = document.getElementById('manual-description').value;
      const is_recurring = document.getElementById('manual-recurring').checked;

      let recurring_info = undefined;
      if (is_recurring) {
         recurring_info = { frequency_days: 30, last_processed_date: date };
      }

      try {
        await addManualTransaction({ type, category, amount, date, description, is_recurring, recurring_info });
        
        // Modalı Kapat
        const modalEl = document.getElementById('manualAddModal');
        const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
        modal.hide();
        
        
        e.target.reset();
        document.getElementById('manual-date').valueAsDate = new Date();
        
        
        await loadTransactionsTable();
        await loadSummaryCards();
      } catch (error) {
        alert('İşlem eklenirken bir hata oluştu!');
      }
    });
  }
});