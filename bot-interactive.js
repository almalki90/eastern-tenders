/**
 * Interactive Telegram Decor Bot - بوت ديكور تفاعلي
 * دعم الأوامر التفاعلية والجدولة التلقائية
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { getRandomDecorImage, CATEGORIES } from './pexels-service.js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

/**
 * تنسيق رسالة الصورة
 */
function formatImageCaption(image, category) {
  const categoryName = category.replace('_', ' ');
  const tips = [
    '💡 استخدم الإضاءة الطبيعية قدر الإمكان',
    '🎨 اختر لونين أساسيين ولون مميز واحد',
    '🪴 أضف نباتات داخلية لإحياء المساحة',
    '🪞 المرايا تضفي اتساعاً على الغرف الصغيرة',
    '🛋️ اترك مساحة كافية للحركة بين الأثاث',
    '🖼️ اللوحات الفنية تعكس شخصيتك',
    '📐 قس المساحة قبل شراء الأثاث',
    '🕯️ الشموع المعطرة تضيف أجواء دافئة',
    '🎭 امزج الأنماط القديمة مع الحديثة',
    '🌈 الألوان الفاتحة توسع المساحة'
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  return `
🎨 *فكرة ديكور جديدة*

📂 التصنيف: *${categoryName}*
📝 ${image.description}

💡 نصيحة: ${randomTip}

📸 تصوير: [${image.photographer}](${image.photographerUrl})
🔗 المصدر: Pexels
  `.trim();
}

/**
 * إرسال صورة ديكور
 */
async function sendDecorImage(chatId, category = null) {
  try {
    // اختيار تصنيف عشوائي إذا لم يُحدد
    if (!category) {
      const categories = Object.keys(CATEGORIES);
      category = categories[Math.floor(Math.random() * categories.length)];
    }
    
    await bot.sendChatAction(chatId, 'upload_photo');
    
    const image = await getRandomDecorImage(category);
    const caption = formatImageCaption(image, category);
    
    await bot.sendPhoto(chatId, image.url, {
      caption: caption,
      parse_mode: 'Markdown'
    });
    
    return true;
  } catch (error) {
    console.error('❌ خطأ في إرسال الصورة:', error.message);
    await bot.sendMessage(chatId, '❌ عذراً، حدث خطأ في جلب الصورة. حاول مرة أخرى.');
    return false;
  }
}

/**
 * أمر /start
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  const welcomeMessage = `
🎨 *مرحباً بك في بوت أفكار الديكور!*

أرسل لك صور احترافية وأفكار إبداعية لتصميم منزلك 🏠✨

*📋 الأوامر المتاحة:*

🎲 /inspire - فكرة ديكور عشوائية
📂 /category - اختر تصنيف محدد
📚 /categories - عرض كل التصنيفات
ℹ️ /help - المساعدة

*🎯 التصنيفات المتاحة:*
🛏️ غرف نوم
🛋️ غرف معيشة
🍽️ مطابخ
🚿 حمامات
🚪 مداخل
🌿 حدائق
💡 إضاءة
🎨 ألوان
🏠 ديكور عام

استمتع بالإلهام! 💫
  `.trim();
  
  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

/**
 * أمر /inspire - صورة عشوائية
 */
bot.onText(/\/inspire/, async (msg) => {
  const chatId = msg.chat.id;
  await sendDecorImage(chatId);
});

/**
 * أمر /categories - عرض التصنيفات
 */
bot.onText(/\/categories/, async (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    keyboard: [
      ['🛏️ غرف نوم', '🛋️ غرف معيشة', '🍽️ مطابخ'],
      ['🚿 حمامات', '🚪 مداخل', '🌿 حدائق'],
      ['💡 إضاءة', '🎨 ألوان', '🏠 ديكور عام'],
      ['🎲 عشوائي']
    ],
    resize_keyboard: true,
    one_time_keyboard: true
  };
  
  bot.sendMessage(chatId, '📂 اختر التصنيف:', { reply_markup: keyboard });
});

/**
 * أمر /help
 */
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
ℹ️ *كيف تستخدم البوت؟*

*🎲 صورة عشوائية:*
أرسل /inspire أو اضغط على "عشوائي"

*📂 اختيار تصنيف:*
أرسل /categories ثم اختر التصنيف المطلوب

*💬 مباشرة:*
أرسل اسم التصنيف مثل:
• غرف نوم
• مطابخ
• حمامات

*📊 جودة الصور:*
جميع الصور بجودة HD احترافية من Pexels

*⏱️ التحديث:*
البوت يرسل صور تلقائياً كل 6 ساعات للقنوات المشتركة

*🤝 المساهمة:*
للاقتراحات والملاحظات تواصل معنا

استمتع! 🎨✨
  `.trim();
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

/**
 * معالجة الرسائل النصية (التصنيفات)
 */
bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase().trim();
  
  // مطابقة التصنيفات
  const categoryMap = {
    'غرف نوم': 'غرف_نوم',
    'غرف معيشة': 'غرف_معيشة',
    'مطابخ': 'مطابخ',
    'حمامات': 'حمامات',
    'مداخل': 'مداخل',
    'حدائق': 'حدائق',
    'إضاءة': 'إضاءة',
    'ألوان': 'ألوان',
    'ديكور عام': 'ديكور_عام',
    'عشوائي': null
  };
  
  for (const [key, value] of Object.entries(categoryMap)) {
    if (text.includes(key.toLowerCase())) {
      await sendDecorImage(chatId, value);
      return;
    }
  }
});

/**
 * معالجة الأخطاء
 */
bot.on('polling_error', (error) => {
  console.error('❌ خطأ في polling:', error.message);
});

console.log('🤖 بوت الديكور يعمل الآن! ✅');
console.log('📱 اسم البوت: @' + bot.options.username || 'DecorBot');
console.log('⏱️  في انتظار الرسائل...\n');
