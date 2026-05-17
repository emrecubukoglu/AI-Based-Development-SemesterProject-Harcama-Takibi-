const { Groq } = require('groq-sdk');
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const getSystemPrompt = () => `You are a financial AI assistant. Today's real date is: ${new Date().toISOString()}.
Analyze the conversation history to extract financial transactions (income, expense) or budget limits.

STRICT CATEGORY LIST: You MUST classify the transaction into EXACTLY ONE of these 10 categories:
1. "Market" (Groceries, supermarket shopping)
2. "Yemek" (Restaurants, fast food, delivery, cafes)
3. "Kira" (Rent payments)
4. "Fatura" (Electricity, water, gas, internet, phone bills)
5. "Ulaşım" (Fuel, public transport, taxi, car maintenance)
6. "Eğitim" (Courses, books, school/university fees)
7. "Sağlık" (Pharmacy, doctor, hospital, health insurance)
8. "Eğlence" (Movies, games, concerts, hobbies, subscriptions like Netflix)
9. "Giyim" (Clothes, shoes, accessories)
10. "Maaş" (Salary, main income source)

CRITICAL CATEGORY RULE: If a transaction does not fit perfectly into any of the 10 categories above, you MUST classify it as "Diğer". Do not create new categories under any circumstances.

OUTPUT FORMAT: You MUST return ONLY a JSON object matching this schema:
{
  "status": "complete" | "ask" | "cancel",
  "message": "Your conversational reply to the user in Turkish.",
  "transaction": {
     "type": "income" | "expense" | "budget",
     "amount": number,
     "category": "Market" | "Yemek" | "Kira" | "Fatura" | "Ulaşım" | "Eğitim" | "Sağlık" | "Eğlence" | "Giyim" | "Maaş" | "Diğer",
     "description": "String",
     "date": "ISO 8601 Date String",
     "is_recurring": boolean,
     "recurring_info": {
        "frequency_days": number,
        "last_processed_date": "ISO 8601 Date String"
     }
  } 
}`;

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
  if (payload.status === 'complete') {
    const tx = payload.transaction;
    if (!tx || typeof tx.amount !== 'number' || tx.amount <= 0) {
      payload.status = 'ask';
      payload.message = 'İşlemin tutarını belirtmediniz. Lütfen ne kadar olduğunu (örneğin: 15000 TL) yazar mısınız?';
      delete payload.transaction;
      return;
    }
    const allowedCategories = ["Market", "Yemek", "Kira", "Fatura", "Ulaşım", "Eğitim", "Sağlık", "Eğlence", "Giyim", "Maaş", "Diğer"];
    if (!allowedCategories.includes(tx.category)) {
      tx.category = "Diğer";
    }
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