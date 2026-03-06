const REQUIRED_ENV_KEYS = ['BOT_TOKEN'];

function getEnv() {
  const missing = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }

  return {
    botToken: process.env.BOT_TOKEN,
    webhookSecret: process.env.WEBHOOK_SECRET || '',
    vercelUrl: process.env.VERCEL_URL || '',
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}

module.exports = { getEnv };
