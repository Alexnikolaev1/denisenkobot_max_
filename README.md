# 🤖 Telegram-бот «Фотостудия Денисенко»

Продакшн-ориентированный Telegram-бот на Telegraf с чистой модульной архитектурой: контент отделен от логики, webhook защищен secret token, сессии управляются middleware с TTL.

## Что улучшено

- Устранен архитектурный монолит: логика разделена на `config / content / handlers / middlewares / ui`.
- Приведены в порядок точки входа для Vercel и локального запуска.
- Добавлена централизованная валидация переменных окружения.
- Улучшен webhook-скрипт: использует Telegram API через JSON, поддерживает `secret_token`.
- Добавлена единая обработка ошибок в боте (`bot.catch`), чтобы падения не ломали сценарии.
- Сессии хранятся в memory-store с автоматической очисткой устаревших данных.

## Структура проекта

```text
denisenko-bot/
├── api/
│   └── webhook.js                 # Vercel serverless endpoint
├── scripts/
│   └── set-webhook.js             # Регистрация webhook в Telegram
├── src/
│   ├── bot.js                     # Инициализация бота + middleware + handlers
│   ├── config/
│   │   └── env.js                 # Валидация env переменных
│   ├── content/
│   │   └── messages.js            # Тексты и контентные блоки
│   ├── handlers/
│   │   └── registerHandlers.js    # Роутинг команд/кнопок
│   ├── middlewares/
│   │   └── memorySession.js       # In-memory сессии + TTL cleanup
│   └── ui/
│       └── keyboards.js           # Кнопки, inline-клавиатуры, регионы
├── bot.js                         # Обратная совместимость (реэкспорт src/bot)
├── webhook.js                     # Обратная совместимость (реэкспорт api/webhook)
├── local.js                       # Локальный long polling запуск
├── set-webhook.js                 # Обратная совместимость (реэкспорт scripts/...)
├── vercel.json
├── .env.example
└── package.json
```

## Переменные окружения

Скопируйте `.env.example` в `.env`:

```bash
cp .env.example .env
```

Обязательные:
- `BOT_TOKEN`

Опциональные:
- `VERCEL_URL` (нужен для скрипта регистрации webhook)
- `WEBHOOK_SECRET` (рекомендуется для защиты webhook)

## Локальный запуск

```bash
npm install
npm start
```

Проверка корректности модулей:

```bash
npm run check
```

## Деплой на Vercel

1. Добавьте в Vercel Environment Variables:
   - `BOT_TOKEN`
   - `WEBHOOK_SECRET` (рекомендуется)
2. Выполните деплой:

```bash
vercel deploy --prod
```

3. Зарегистрируйте webhook:

```bash
npm run set-webhook
```

Telegram будет отправлять обновления на:
`https://<your-vercel-app>/api/webhook`

## Расширение бота

- Новые тексты: `src/content/messages.js`
- Новые кнопки/регионы: `src/ui/keyboards.js`
- Новые сценарии: `src/handlers/registerHandlers.js`
- Новые middleware: `src/middlewares/*`
