const { Groq } = require('groq-sdk');

const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TRANSACTION_SYSTEM_PROMPT = `You are a strict parser for financial transaction text. Return only valid JSON that matches the Transaction schema exactly. Do not add markdown, explanation, analysis, or any text outside the JSON object. 


Required fields:
- user_id: string
- type: string, must be either \"income\" or \"expense\"
- amount: number, cannot be negative
- category: string
- description: string
- date: string in ISO 8601 format
- is_recurring: boolean
- recurring_info: object when is_recurring is true, otherwise null or omitted

IMPORTANT: You must return the 'category' and 'description' values STRICTLY in Turkish.

If is_recurring is true, recurring_info must include:
- frequency_days: integer >= 1
- last_processed_date: string in ISO 8601 format

Use the same schema names as Database_spec.md and follow transaction.model.js validations exactly. Return only one top-level JSON object with no comments, no markdown, no explanations.`;

function normalizeAssistantContent(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === 'string' ? part : part?.text ?? ''))
      .join('');
  }

  return '';
}

function validateTransactionPayload(payload) {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    throw new Error('Parsed transaction must be a JSON object.');
  }

  const { type, amount, is_recurring, recurring_info } = payload;

  if (type !== 'income' && type !== 'expense') {
    throw new Error('Parsed transaction type must be either "income" or "expense".');
  }

  if (typeof amount !== 'number' || Number.isNaN(amount) || amount < 0) {
    throw new Error('Parsed transaction amount must be a non-negative number.');
  }

  if (is_recurring === true) {
    if (typeof recurring_info !== 'object' || recurring_info === null) {
      throw new Error('recurring_info must be provided when is_recurring is true.');
    }

    const { frequency_days, last_processed_date } = recurring_info;
    if (!Number.isInteger(frequency_days) || frequency_days < 1) {
      throw new Error('recurring_info.frequency_days must be an integer greater than or equal to 1.');
    }

    if (typeof last_processed_date !== 'string' || !last_processed_date.trim()) {
      throw new Error('recurring_info.last_processed_date must be a valid ISO date string.');
    }
  }
}

async function parseTransactionText(promptText) {
  if (typeof promptText !== 'string' || !promptText.trim()) {
    throw new Error('promptText must be a non-empty string.');
  }

  const response = await groqClient.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    stream: false,
    messages: [
      { role: 'system', content: TRANSACTION_SYSTEM_PROMPT },
      { role: 'user', content: promptText },
    ],
  });

  const choice = response.choices?.[0];
  const rawContent = normalizeAssistantContent(choice?.message?.content);

  if (!rawContent) {
    throw new Error('Groq AI returned an empty response.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawContent);
  } catch (error) {
    throw new Error(`Failed to parse Groq AI response as JSON: ${error.message}`);
  }

  validateTransactionPayload(parsed);
  return parsed;
}

module.exports = {
  parseTransactionText,
};
