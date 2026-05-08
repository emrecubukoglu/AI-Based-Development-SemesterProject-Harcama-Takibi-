const API_BASE_URL = 'http://localhost:3000';

async function postTransactionText(messages) {
  const response = await fetch(`${API_BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // "text" yerine "messages" dizisini gönderiyoruz
    body: JSON.stringify({ messages }) 
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function getTransactions() {
  const response = await fetch(`${API_BASE_URL}/api/transactions`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function updateTransaction(id, data) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function getAnalyticsSummary() {
  const response = await fetch(`${API_BASE_URL}/api/analytics/summary`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function checkBudget() {
  const response = await fetch(`${API_BASE_URL}/api/analytics/check-budget`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function deleteTransaction(id) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

async function setBudget(category, limitAmount) {
  const response = await fetch(`${API_BASE_URL}/api/analytics/budget`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, limitAmount })
  });
  return await response.json();
}

async function deleteBudget(id) {
  const response = await fetch(`${API_BASE_URL}/api/analytics/budget/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}


async function addManualTransaction(data) {
  const response = await fetch(`${API_BASE_URL}/api/transactions/manual`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
}