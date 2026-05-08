const { Groq } = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getSystemPrompt = () => `You are a financial AI assistant. Today's real date is: ${new Date().toISOString()}.
Analyze the conversation history to extract financial transactions (income, expense) or budget limits.

OUTPUT FORMAT: You MUST return ONLY a JSON object matching this schema:
{
  "status": "complete" | "ask" | "cancel",
  "message": "Your conversational reply to the user in Turkish.",
  "transaction": {
     "type": "income" | "expense" | "budget",
     "amount": number,
     "category": "String (Single Root Word)",
     "description": "String",
     "date": "ISO 8601 Date String",
     "is_recurring": boolean,
     "recurring_info": {
        "frequency_days": number,
        "last_processed_date": "ISO 8601 Date String"
     }
  } 
} // NOTE: Only include the 'transaction' object if status is "complete".

RULES:
1. MISSING AMOUNT (CRITICAL): If the user DOES NOT explicitly state a numeric amount (e.g., "Kira ödüyorum", "Maaşım yattı"), YOU MUST set status to "ask" and ask them the amount in the "message" field. NEVER guess the amount. NEVER set the amount to 0.
2. IRRELEVANT REPLY: If you previously asked for an amount, and the user replies with something irrelevant, set status to "cancel" and say "Harcama veya gelir tutarını belirtmediğiniz için ekleme yapamadım."
3. COMPLETE: If all info is present, set status to "complete" and fill the "transaction" object.
4. CATEGORY: NEVER use long names. Use single root words (e.g., "Market", "Yemek", "Maaş", "Kira").
5. DATE: Always use today's real date unless the user explicitly specifies a past date.
6. RECURRING: If the transaction is naturally recurring like "kira" (rent), "maaş" (salary), "fatura" (bill), or explicitly states "her ay" (every month), set "is_recurring" to true. For monthly, "frequency_days" is 30.

Return ONLY valid JSON. No markdown, no explanations.`;

function normalizeAssistantContent(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.map((part) => (typeof part === 'string' ? part : part?.text ?? '')).join('');
  return '';
}

function validateTransactionPayload(payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error('Parsed response must be a JSON object.');
  }

  if (!['complete', 'ask', 'cancel'].includes(payload.status)) {
    throw new Error('Invalid status returned from AI.');
  }

  // YENİ: ARKA UÇ MÜDAHALESİ (Backend Override)
  // Eğer AI "complete" deyip tutarı 0 gönderirse, bunu reddedip "ask" (soru) durumuna çeviriyoruz!
  if (payload.status === 'complete') {
    const tx = payload.transaction;
    
    if (!tx || typeof tx.amount !== 'number' || tx.amount <= 0) {
      payload.status = 'ask';
      payload.message = 'İşlemin tutarını belirtmediniz. Lütfen ne kadar olduğunu (örneğin: 15000 TL) yazar mısınız?';
      delete payload.transaction;
      return; // Sorunu düzelttiğimiz için doğrudan çıkış yapıyoruz
    }
    
    // Düzenli işlem eksik verisi varsa normal işleme çevir
    if (tx.is_recurring === true) {
      const info = tx.recurring_info;
      if (!info || typeof info !== 'object' || !Number.isInteger(info.frequency_days) || info.frequency_days < 1) {
        tx.is_recurring = false;
        tx.recurring_info = undefined;
      }
    }
  }
}

async function parseTransactionText(messages) {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array.');
  }

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    stream: false,
    messages: [
      { role: 'system', content: getSystemPrompt() },
      ...messages
    ],
  });

  const choice = response.choices?.[0];
  const rawContent = normalizeAssistantContent(choice?.message?.content);

  if (!rawContent) throw new Error('Groq AI returned an empty response.');

  let parsed;
  try {
    const cleanedContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
    parsed = JSON.parse(cleanedContent);
  } catch (error) {
    throw new Error(`Failed to parse Groq AI response as JSON: ${error.message}`);
  }

  validateTransactionPayload(parsed);
  return parsed;
}

module.exports = { parseTransactionText };