const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');


let conversationHistory = []; 

function appendMessage(role, content) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `d-flex mb-2 ${role === 'user' ? 'justify-content-end' : 'justify-content-start'}`;

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = `p-2 rounded ${role === 'user' ? 'bg-primary text-white' : role === 'error' ? 'bg-danger text-white' : 'bg-light text-dark'}`;
  bubbleDiv.style.maxWidth = '70%';
  bubbleDiv.textContent = content;

  messageDiv.appendChild(bubbleDiv);
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function handleSend() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage('user', text);
  
  
  conversationHistory.push({ role: 'user', content: text });

  userInput.value = '';
  sendBtn.disabled = true;
  sendBtn.textContent = 'Bekleniyor...';

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
  appendMessage('ai', "Merhaba! Harcamalarını veya gelirlerini doğal dille yazabilirsin. Örnek: 'Bugün marketten 450 TL harcadım.'");
});

sendBtn.addEventListener('click', handleSend);

userInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
});