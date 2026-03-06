const bot = require('../src/bot');
const { getEnv } = require('../src/config/env');

function isValidWebhookSecret(req, expected) {
  if (!expected) {
    return true;
  }
  const actual = req.headers['x-telegram-bot-api-secret-token'];
  return actual === expected;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    res.status(200).json({ status: 'ok', service: 'denisenko-bot' });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { webhookSecret } = getEnv();

    if (!isValidWebhookSecret(req, webhookSecret)) {
      res.status(401).json({ ok: false, error: 'Invalid webhook secret' });
      return;
    }

    await bot.handleUpdate(req.body);
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[webhook-error]', error);
    res.status(500).json({ ok: false, error: 'Webhook handler failed' });
  }
};
