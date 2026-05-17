const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let conversationHistory = []; 

// Yenilenen Şık Mesaj Üretim Altyapısı
function appendMessage(role, content) {
  const wrapperDiv = document.createElement('div');
  wrapperDiv.className = `message-wrapper ${role}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'bubble';
  bubbleDiv.textContent = content;

  wrapperDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(wrapperDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  conversationHistory.push({ role: 'user', content: text });

  userInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = '...';

  try {
    const response = await postTransactionText(conversationHistory);
    
    appendMessage('ai', response.message);
    conversationHistory.push({ role: 'assistant', content: response.message });

  } catch (error) {
    appendMessage('error', `❌ Bir hata oluştu: ${error.message}`);
    conversationHistory.pop(); 
  } finally {
    sendBtn.disabled = false;
    sendBtn.textContent = 'Gönder';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  appendMessage('ai', "Merhaba! Harcamalarınızı veya gelirlerinizi doğal dille buraya yazabilirsiniz. Örnek: 'Marketten 450 TL harcadım.'");
});

sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});