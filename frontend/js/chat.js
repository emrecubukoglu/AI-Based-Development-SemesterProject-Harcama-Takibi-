const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function appendMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `d-flex mb-2 ${role === 'user' ? 'justify-content-end' : 'justify-content-start'}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = `p-2 rounded ${role === 'user' ? 'bg-primary text-white' : role === 'error' ? 'bg-danger text-white' : 'bg-light text-dark'}`;
  bubbleDiv.style.maxWidth = '70%';
  bubbleDiv.textContent = content;

  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);

  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  // Append user message
  appendMessage('user', text);

  // Clear input and disable button
  userInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = 'Gönderiliyor...';

  try {
    const response = await postTransactionText(text);
    const { category, amount, type } = response;
    const aiMessage = `✅ Kaydedildi! ${category} — ${amount} TL (${type})`;
    appendMessage('ai', aiMessage);
  } catch (error) {
    appendMessage('error', `❌ Bir hata oluştu: ${error.message}`);
  } finally {
    // Re-enable button
    sendBtn.disabled = false;
    sendBtn.textContent = 'Gönder';
  }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
  appendMessage('ai', "Merhaba! Harcamalarını veya gelirlerini doğal dille yazabilirsin. Örnek: 'Bugün marketten 450 TL harcadım.'");
});

sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});