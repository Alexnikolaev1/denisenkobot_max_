require('dotenv').config();

const { getEnv } = require('../src/config/env');

async function setWebhook() {
  const { botToken, vercelUrl, webhookSecret } = getEnv();
  if (!vercelUrl) {
    throw new Error('Missing environment variable: VERCEL_URL');
  }

  const webhookUrl = `${vercelUrl.replace(/\/$/, '')}/api/webhook`;
  const apiUrl = `https://api.telegram.org/bot${botToken}/setWebhook`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: webhookSecret || undefined,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Telegram API HTTP ${response.status}`);
  }

  const result = await response.json();
  if (!result.ok) {
    throw new Error(result.description || 'Unknown Telegram error');
  }

  console.log('✅ Вебхук установлен успешно');
  console.log(`📡 URL: ${webhookUrl}`);
  if (webhookSecret) {
    console.log('🔐 Secret token включен');
  }
}

setWebhook().catch((error) => {
  console.error('❌ Не удалось установить вебхук:', error.message);
  process.exit(1);
});
