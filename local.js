require('dotenv').config();

const bot = require('./src/bot');
const { getEnv } = require('./src/config/env');

getEnv();

console.log('🤖 Денисенко-бот запускается в режиме long polling...');
console.log('Нажмите Ctrl+C для остановки.\n');

bot.launch({
  allowedUpdates: ['message', 'callback_query'],
}).then(() => {
  console.log('✅ Бот запущен! Откройте Telegram и напишите /start');
}).catch((err) => {
  console.error('❌ Ошибка запуска:', err.message);
  process.exit(1);
});

process.once('SIGINT',  () => { console.log('\nОстановка...'); bot.stop('SIGINT'); });
process.once('SIGTERM', () => { console.log('\nОстановка...'); bot.stop('SIGTERM'); });
