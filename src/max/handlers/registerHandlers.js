const { REGIONS, keyboards } = require('../ui/keyboards');
const { MESSAGES } = require('../../content/messages');
const {
  getStartPhotoAttachment,
  isValidImageAttachmentJson,
} = require('../utils/sendImages');

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getUserName(ctx) {
  const raw = ctx.user?.name || 'дорогой гость';
  return escapeHtml(raw);
}

async function handleStart(ctx) {
  ctx.session.region = undefined;
  ctx.session.regionName = undefined;

  const attachments = [keyboards.startInlineMenu];
  try {
    const photo = await getStartPhotoAttachment(ctx);
    if (photo && isValidImageAttachmentJson(photo)) {
      attachments.unshift(photo);
    }
  } catch (e) {
    console.error('[start-photo]', e);
  }

  const text = MESSAGES.start(getUserName(ctx));
  try {
    await sendHtml(ctx, text, { attachments });
  } catch (e) {
    console.error('[start-send-with-photo]', e?.message || e);
    if (attachments.length > 1) {
      await sendHtml(ctx, text, { attachments: [keyboards.startInlineMenu] });
    } else {
      throw e;
    }
  }
}

/**
 * Ответ на callback в MAX требует непустое тело: `message` или `notification`.
 */
async function ackCallback(ctx) {
  return ctx.answerOnCallback({ notification: '\u200b' });
}

async function requireRegion(ctx, next) {
  if (!ctx.session?.region) {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.regionRequired);
    return;
  }
  return next();
}

/**
 * У message_callback в MAX иногда нет chat_id — ctx.reply() падает.
 * Тогда шлём в личку по user_id.
 */
async function sendHtml(ctx, html, extra = {}) {
  const opts = { format: 'html', ...extra };
  if (typeof ctx.chatId === 'number') {
    return ctx.reply(html, opts);
  }
  const uid = ctx.user?.user_id;
  if (typeof uid === 'number') {
    return ctx.api.sendMessageToUser(uid, html, opts);
  }
  throw new Error('sendHtml: нет chatId и user_id');
}

async function handleRegion(ctx, region) {
  ctx.session.region = region.id;
  ctx.session.regionName = region.displayName;

  await ctx.answerOnCallback({
    message: {
      text: MESSAGES.regionAccepted(region.displayName),
      format: 'html',
      attachments: [keyboards.mainMenu],
    },
  });
}

function registerHandlers(bot) {
  bot.on('bot_started', handleStart);
  bot.command('start', handleStart);

  bot.action('start_intro', async (ctx) => {
    await ctx.answerOnCallback({
      message: {
        text: MESSAGES.chooseRegion,
        format: 'html',
        attachments: [keyboards.regionMenu],
      },
    });
  });

  bot.action(REGIONS.moscow.callbackData, (ctx) => handleRegion(ctx, REGIONS.moscow));
  bot.action(REGIONS.moscowRegion.callbackData, (ctx) => handleRegion(ctx, REGIONS.moscowRegion));
  bot.action(REGIONS.zernograd.callbackData, (ctx) => handleRegion(ctx, REGIONS.zernograd));

  bot.action('back', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.mainMenu] });
  });

  bot.action('services', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.services, { attachments: [keyboards.backMenu] });
  });

  bot.action('works', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.worksIntro);
    await sendHtml(ctx, MESSAGES.worksLinks, { attachments: [keyboards.worksInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('price', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    const isZernograd = ctx.session?.region === 'zernograd';
    await sendHtml(ctx, isZernograd ? MESSAGES.priceZernograd : MESSAGES.priceMain, {
      attachments: [keyboards.backWithContactMenu],
    });
  });

  bot.action('contact_owner', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.contactDirect, { attachments: [keyboards.contactsInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('contacts', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.contacts, { attachments: [keyboards.contactsInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.action('resources', requireRegion, async (ctx) => {
    await ackCallback(ctx);
    await sendHtml(ctx, MESSAGES.resources, { attachments: [keyboards.resourcesInlineLinks] });
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, { attachments: [keyboards.backMenu] });
  });

  bot.on('message_created', async (ctx) => {
    if (!ctx.session?.region) {
      await sendHtml(ctx, MESSAGES.unknownBeforeStart);
      return;
    }

    await sendHtml(ctx, MESSAGES.unknownInMenu, { attachments: [keyboards.mainMenu] });
  });
}

module.exports = { registerHandlers };
