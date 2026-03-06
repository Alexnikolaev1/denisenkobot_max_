const { Telegraf } = require('telegraf');
const { getEnv } = require('./config/env');
const { createMemorySession } = require('./middlewares/memorySession');
const { registerHandlers } = require('./handlers/registerHandlers');
const { MESSAGES } = require('./content/messages');

function createBot() {
  const { botToken } = getEnv();
  const bot = new Telegraf(botToken);

  bot.use(createMemorySession({ ttlMs: 1000 * 60 * 60 * 12, cleanupEvery: 300 }));

  registerHandlers(bot);

  bot.catch(async (error, ctx) => {
    console.error('[bot-error]', error);
    if (ctx?.reply) {
      await ctx.reply(MESSAGES.commonError);
    }
  });

  return bot;
}

module.exports = createBot();
module.exports.createBot = createBot;
