const MODEL = 'openrouter/free';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function callAI(prompt, system = 'You are a helpful invoice assistant.') {
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const settingsKey = getSettingsKey();
  const key = settingsKey || envKey;
  if (!key) return null;
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
        'HTTP-Referer': window.location.origin,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export function isAIAvailable() {
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const settingsKey = getSettingsKey();
  return !!(settingsKey || envKey);
}

function getSettingsKey() {
  try {
    const s = localStorage.getItem('ik_openrouter_key');
    return s || '';
  } catch { return ''; }
}
