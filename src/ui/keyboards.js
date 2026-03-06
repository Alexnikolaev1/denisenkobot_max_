const { Markup } = require('telegraf');

const BUTTONS = {
  services: '📸 О нас',
  works: '🖼 Портфолио',
  price: '💼 Тарифы',
  contacts: '📞 Контакты',
  resources: '🌐 Сайт и проекты',
  contactOwner: '💬 Запросить консультацию',
  back: '← Главное меню',
};

const REGIONS = {
  moscow: { id: 'main', displayName: 'Москвы', callbackData: 'region_moscow', label: '📍 Москва' },
  moscowRegion: { id: 'main', displayName: 'Московской области', callbackData: 'region_mo', label: '📍 Московская область' },
  zernograd: { id: 'zernograd', displayName: 'Зернограда', callbackData: 'region_zernograd', label: '📍 Зерноград' },
};

const keyboards = {
  mainMenu: Markup.keyboard([
    [BUTTONS.services, BUTTONS.works],
    [BUTTONS.price, BUTTONS.contacts],
    [BUTTONS.resources],
  ]).resize(),

  backMenu: Markup.keyboard([[BUTTONS.back]]).resize(),

  backWithContactMenu: Markup.keyboard([[BUTTONS.contactOwner], [BUTTONS.back]]).resize(),

  regionMenu: Markup.inlineKeyboard([
    [Markup.button.callback(REGIONS.moscow.label, REGIONS.moscow.callbackData)],
    [Markup.button.callback(REGIONS.moscowRegion.label, REGIONS.moscowRegion.callbackData)],
    [Markup.button.callback(REGIONS.zernograd.label, REGIONS.zernograd.callbackData)],
  ]),

  startInlineMenu: Markup.inlineKeyboard([
    [Markup.button.callback('✨ Начать знакомство', 'start_intro')],
  ]),

  worksInlineLinks: Markup.inlineKeyboard([
    [Markup.button.url('📱 Telegram-канал', 'https://t.me/mosalbum')],
    [Markup.button.url('📸 MAX-канал', 'https://max.ru/join/zUPzdbO-Se9dSMt7oZRJOyjoUvYTNvXQXsT6yWyMf1Y')],
    [Markup.button.url('💬 Моя ВК-страница', 'https://vk.com/denisenko.tatyana')],
  ]),

  contactsInlineLinks: Markup.inlineKeyboard([
    [Markup.button.url('💬 Написать в Telegram', 'https://t.me/tataprophoto')],
    [Markup.button.url('🌐 Открыть сайт', 'https://denisenko.info/')],
  ]),

  resourcesInlineLinks: Markup.inlineKeyboard([
    [Markup.button.url('🌐 denisenko.info', 'https://denisenko.info/')],
    [Markup.button.url('📱 Telegram-канал', 'https://t.me/mosalbum')],
    [Markup.button.url('📱 MAX-канал Mosalbum', 'https://max.ru/join/zUPzdbO-Se9dSMt7oZRJOyjoUvYTNvXQXsT6yWyMf1Y')],
    [Markup.button.url('💬 VK - Моя страница', 'https://vk.com/denisenko.tatyana')],
  ]),
};

module.exports = { BUTTONS, REGIONS, keyboards };
