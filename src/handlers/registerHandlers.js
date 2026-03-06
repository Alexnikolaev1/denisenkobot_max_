const fs = require('fs');
const path = require('path');
const { MESSAGES } = require('../content/messages');
const { BUTTONS, REGIONS, keyboards } = require('../ui/keyboards');

const START_PHOTO_PATH = path.resolve(process.cwd(), 'main.jpg');
const CONTACTS_PHOTO_PATH = path.resolve(process.cwd(), 'main2.jpg');

function firstName(ctx) {
  return ctx.from?.first_name || 'дорогой гость';
}

function requireRegion(ctx, next) {
  if (!ctx.session?.region) {
    return ctx.replyWithHTML(MESSAGES.regionRequired);
  }
  return next();
}

async function handleRegion(ctx, region) {
  await ctx.answerCbQuery();
  ctx.session.region = region.id;
  ctx.session.regionName = region.displayName;
  await ctx.replyWithHTML(MESSAGES.regionAccepted(region.displayName), keyboards.mainMenu);
}

async function sendHtml(ctx, html, extra = {}) {
  await ctx.replyWithHTML(html, {
    disable_web_page_preview: true,
    ...extra,
  });
}

async function sendPhotoIfExists(ctx, photoPath) {
  if (!fs.existsSync(photoPath)) {
    console.warn(`[photo-missing] ${photoPath}`);
    return;
  }
  await ctx.replyWithPhoto({ source: photoPath });
}

function registerHandlers(bot) {
  bot.start(async (ctx) => {
    await sendPhotoIfExists(ctx, START_PHOTO_PATH);
    await ctx.replyWithHTML(MESSAGES.start(firstName(ctx)), keyboards.startInlineMenu);
  });

  bot.action('start_intro', async (ctx) => {
    await ctx.answerCbQuery();
    await sendHtml(ctx, MESSAGES.chooseRegion, keyboards.regionMenu);
  });

  bot.action(REGIONS.moscow.callbackData, (ctx) => handleRegion(ctx, REGIONS.moscow));
  bot.action(REGIONS.moscowRegion.callbackData, (ctx) => handleRegion(ctx, REGIONS.moscowRegion));
  bot.action(REGIONS.zernograd.callbackData, (ctx) => handleRegion(ctx, REGIONS.zernograd));

  bot.hears(BUTTONS.back, requireRegion, async (ctx) => {
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, keyboards.mainMenu);
  });

  bot.hears(BUTTONS.services, requireRegion, async (ctx) => {
    await sendHtml(ctx, MESSAGES.services, keyboards.backMenu);
  });

  bot.hears(BUTTONS.works, requireRegion, async (ctx) => {
    await sendHtml(ctx, MESSAGES.worksIntro);
    await sendHtml(ctx, MESSAGES.worksLinks, keyboards.worksInlineLinks);
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, keyboards.backMenu);
  });

  bot.hears(BUTTONS.price, requireRegion, async (ctx) => {
    const isZernograd = ctx.session?.region === 'zernograd';
    await sendHtml(ctx, isZernograd ? MESSAGES.priceZernograd : MESSAGES.priceMain, keyboards.backWithContactMenu);
  });

  bot.hears(BUTTONS.contactOwner, requireRegion, async (ctx) => {
    await sendPhotoIfExists(ctx, CONTACTS_PHOTO_PATH);
    await sendHtml(ctx, MESSAGES.contactDirect, keyboards.contactsInlineLinks);
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, keyboards.backMenu);
  });

  bot.hears(BUTTONS.contacts, requireRegion, async (ctx) => {
    await sendPhotoIfExists(ctx, CONTACTS_PHOTO_PATH);
    await sendHtml(ctx, MESSAGES.contacts, keyboards.contactsInlineLinks);
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, keyboards.backMenu);
  });

  bot.hears(BUTTONS.resources, requireRegion, async (ctx) => {
    await sendHtml(ctx, MESSAGES.resources, keyboards.resourcesInlineLinks);
    await sendHtml(ctx, MESSAGES.mainMenuPrompt, keyboards.backMenu);
  });

  bot.on('text', async (ctx) => {
    if (!ctx.session?.region) {
      await ctx.reply(MESSAGES.unknownBeforeStart);
      return;
    }

    await sendHtml(ctx, MESSAGES.unknownInMenu, keyboards.mainMenu);
  });
}

module.exports = { registerHandlers };
