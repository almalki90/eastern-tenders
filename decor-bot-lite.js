/**
 * بوت الديكور - نسخة خفيفة (بدون datasets محلية)
 * للاستخدام على Railway - فقط Unsplash + Pexels
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { getRandomUnsplashImage, UNSPLASH_DECOR_CATEGORIES } from './unsplash-service.js';
import { getRandomPexelsImage, PEXELS_DECOR_CATEGORIES } from './pexels-service.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 بوت الديكور (Railway Lite) يعمل الآن...\n');
console.log('✅ فقط فئات الديكور (Unsplash + Pexels)\n');

// تعريف الفئات
const CATEGORIES = {
  ...UNSPLASH_DECOR_CATEGORIES,
  ...PEXELS_DECOR_CATEGORIES
};

// الرسائل الترحيبية
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🎨 *مرحباً في بوت أفكار الديكور!*

📍 *النسخة الخفيفة (Railway Edition)*

اختر فئة من الديكورات:
🕯️ شموع
💡 إضاءة ديكورية
🏺 فازات وأواني
🪞 مرايا ديكورية
🖼️ لوحات فنية
🎨 ديكورات صغيرة

أرسل اسم الفئة أو /help للمساعدة
  `.trim();
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

bot.onText(/\/help/, (msg) => {
  const helpMessage = `
📖 *كيفية الاستخدام:*

1️⃣ أرسل اسم الفئة (مثلاً: شموع)
2️⃣ سأرسل لك 6 صور مميزة
3️⃣ استمتع بالأفكار!

*الفئات المتاحة:*
🕯️ شموع
💡 إضاءة ديكورية  
🏺 فازات وأواني
🪞 مرايا ديكورية
🖼️ لوحات فنية
🎨 ديكورات صغيرة
  `.trim();
  
  bot.sendMessage(msg.chat.id, helpMessage, { parse_mode: 'Markdown' });
});

// معالجة الرسائل
bot.on('message', async (msg) => {
  if (msg.text?.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  
  // البحث عن الفئة
  let categoryKey = null;
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (cat.name === text || key === text) {
      categoryKey = key;
      break;
    }
  }
  
  if (!categoryKey) {
    bot.sendMessage(chatId, '❓ اختر فئة صحيحة أو أرسل /help');
    return;
  }
  
  const category = CATEGORIES[categoryKey];
  const loadingMsg = await bot.sendMessage(chatId, '⏳ جاري تحميل الصور...');
  
  try {
    // جلب 6 صور
    const images = [];
    for (let i = 0; i < 6; i++) {
      const useUnsplash = Math.random() < 0.5;
      const image = useUnsplash 
        ? await getRandomUnsplashImage(categoryKey)
        : await getRandomPexelsImage(categoryKey);
      images.push(image);
    }
    
    await bot.deleteMessage(chatId, loadingMsg.message_id);
    
    // إرسال الصور
    for (const image of images) {
      const caption = `
${category.emoji} *${category.name}*

📝 ${category.description}

💡 احفظ الصورة ثم استخدمها للبحث عن المنتج في جوجل
      `.trim();
      
      await bot.sendPhoto(chatId, image.url, {
        caption: caption,
        parse_mode: 'Markdown'
      });
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    bot.sendMessage(chatId, '❌ حدث خطأ، حاول مرة أخرى');
  }
});

console.log('✅ البوت جاهز!');
