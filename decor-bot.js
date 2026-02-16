/**
 * بوت ديكور تفاعلي - نظام اختيار المصادر
 * يسمح للمستخدم باختيار المصدر أولاً ثم التصنيف
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import { getRandomImage, CATEGORIES, getDetailedStats } from './multi-source-service.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 بوت الديكور يعمل الآن (نظام اختيار المصادر)...\n');

// عرض الإحصائيات عند بدء التشغيل
const stats = getDetailedStats();
console.log(`📦 إجمالي الصور المتاحة: ${stats.total.toLocaleString('ar-EG')}`);
console.log(`🗂️ عدد المصادر: ${Object.keys(stats.sources).length}`);
console.log(`📂 عدد التصنيفات: ${Object.keys(stats.categories).length}\n`);

// تخزين اختيار المستخدم للمصدر
const userSourceSelection = {};

/**
 * معلومات المصادر
 */
const SOURCES = {
  ikea1: {
    name: 'IKEA Original',
    description: '2,532 صورة - أثاث ومنتجات IKEA الأصلية',
    emoji: '🇸🇪',
    categories: ['غرف_نوم', 'كراسي', 'ساعات', 'غرف_معيشة', 'طاولات_طعام', 'نباتات', 'قطع_ديكور']
  },
  ikea2: {
    name: 'IKEA Extended',
    description: '5,024 صورة - غرف IKEA الكاملة',
    emoji: '🏠',
    categories: ['غرف_نوم', 'حمامات', 'مطابخ', 'غرف_معيشة', 'طاولات_طعام', 'مداخل']
  },
  all: {
    name: 'جميع المصادر',
    description: '7,556 صورة - كل المصادر مدمجة',
    emoji: '🌐',
    categories: Object.keys(CATEGORIES)
  }
};

/**
 * نصائح عشوائية للديكور
 */
function getRandomTip() {
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
  
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * أزرار اختيار المصدر
 */
const sourceKeyboard = {
  reply_markup: {
    keyboard: [
      ['🇸🇪 IKEA Original'],
      ['🏠 IKEA Extended'],
      ['🌐 جميع المصادر'],
      ['📊 الإحصائيات']
    ],
    resize_keyboard: true
  }
};

/**
 * إنشاء أزرار التصنيفات حسب المصدر المختار
 */
function getCategoryKeyboard(sourceKey) {
  const source = SOURCES[sourceKey];
  if (!source) return sourceKeyboard;

  const categories = source.categories;
  const buttons = [];
  
  // ترتيب الأزرار في صفوف (زرين في كل صف)
  for (let i = 0; i < categories.length; i += 2) {
    const row = [];
    
    const cat1 = CATEGORIES[categories[i]];
    if (cat1) {
      row.push(`${cat1.emoji} ${cat1.name}`);
    }
    
    if (i + 1 < categories.length) {
      const cat2 = CATEGORIES[categories[i + 1]];
      if (cat2) {
        row.push(`${cat2.emoji} ${cat2.name}`);
      }
    }
    
    buttons.push(row);
  }
  
  // إضافة أزرار إضافية
  buttons.push(['🎲 مفاجأة', '🔙 المصادر']);
  
  return {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true
    }
  };
}

/**
 * تعيين Menu Button (الزر الأزرق بجانب خانة الكتابة)
 */
async function setMenuButton(chatId) {
  try {
    await bot.setChatMenuButton({
      chat_id: chatId,
      menu_button: {
        type: 'commands'
      }
    });
    
    // تعيين قائمة الأوامر
    await bot.setMyCommands([
      { command: 'start', description: 'بدء البوت' },
      { command: 'sources', description: 'اختيار المصدر' },
      { command: 'stats', description: 'الإحصائيات' },
      { command: 'help', description: 'المساعدة' }
    ], { scope: { type: 'chat', chat_id: chatId } });
    
  } catch (error) {
    console.warn('⚠️ تعذر تعيين Menu Button:', error.message);
  }
}

/**
 * أمر البداية
 */
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || 'عزيزي';
  
  // تعيين Menu Button
  await setMenuButton(chatId);
  
  const welcomeMessage = `
🎨 *مرحباً ${userName}!*

أهلاً بك في بوت أفكار الديكور 🏠

📦 *المحتوى المتاح:*
• *${stats.total.toLocaleString('ar-EG')} صورة* حقيقية
• *${Object.keys(SOURCES).length - 1} مصادر* متنوعة
• *${Object.keys(CATEGORIES).length} تصنيفات* مختلفة

🔹 اختر المصدر أولاً من الأزرار أدناه
🔹 ثم اختر التصنيف الذي تريد
🔹 أو استخدم الأوامر من القائمة الزرقاء ☰

📌 اختر المصدر:
  `.trim();
  
  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    ...sourceKeyboard
  });
});

/**
 * أمر المصادر
 */
bot.onText(/\/sources/, (msg) => {
  const chatId = msg.chat.id;
  
  const sourcesMessage = `
🗂️ *اختر المصدر المناسب:*

🇸🇪 *IKEA Original*
• ${SOURCES.ikea1.description}
• التصنيفات: غرف نوم، كراسي، ساعات، غرف معيشة، طاولات، نباتات، قطع ديكور

🏠 *IKEA Extended*  
• ${SOURCES.ikea2.description}
• التصنيفات: غرف نوم، حمامات، مطابخ، غرف معيشة، طاولات، مداخل

🌐 *جميع المصادر*
• ${SOURCES.all.description}
• جميع التصنيفات متاحة

اختر من الأزرار أدناه 👇
  `.trim();
  
  bot.sendMessage(chatId, sourcesMessage, {
    parse_mode: 'Markdown',
    ...sourceKeyboard
  });
});

/**
 * أمر المساعدة
 */
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
📖 *دليل استخدام البوت*

🔹 *الأوامر المتاحة:*
/start - بدء البوت
/sources - اختيار المصدر
/stats - إحصائيات مفصلة
/help - عرض المساعدة

🔹 *طريقة الاستخدام:*
1️⃣ اختر المصدر (IKEA Original / Extended / الكل)
2️⃣ اختر التصنيف (غرف نوم، مطابخ، إلخ)
3️⃣ استمتع بالصور والنصائح!

💡 *نصيحة:* استخدم القائمة الزرقاء ☰ للوصول السريع للأوامر

🌐 المصادر: GitHub Open Source
  `.trim();
  
  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    ...sourceKeyboard
  });
});

/**
 * أمر الإحصائيات
 */
bot.onText(/\/stats/, (msg) => {
  sendDetailedStats(msg.chat.id);
});

/**
 * إرسال إحصائيات مفصلة
 */
function sendDetailedStats(chatId) {
  const stats = getDetailedStats();
  
  let statsMessage = `📊 *إحصائيات شاملة*\n\n`;
  statsMessage += `📦 *إجمالي الصور:* ${stats.total.toLocaleString('ar-EG')}\n\n`;
  
  statsMessage += `🗂️ *حسب المصدر:*\n`;
  for (const source of Object.values(stats.sources)) {
    statsMessage += `  • ${source.name}: ${source.count.toLocaleString('ar-EG')}\n`;
  }
  
  statsMessage += `\n📂 *حسب التصنيف:*\n`;
  for (const cat of Object.values(stats.categories)) {
    statsMessage += `${cat.emoji} ${cat.name}: ${cat.count.toLocaleString('ar-EG')}\n`;
  }
  
  statsMessage += `\n🌐 GitHub Open Source Datasets`;
  
  bot.sendMessage(chatId, statsMessage, {
    parse_mode: 'Markdown',
    ...sourceKeyboard
  });
}

/**
 * جلب الصور من مصدر محدد
 */
function getImageFromSource(categoryKey, sourceKey) {
  // إذا كان المصدر "all" استخدم الطريقة العادية
  if (sourceKey === 'all') {
    return getRandomImage(categoryKey);
  }
  
  // جلب صورة من مصدر محدد
  const category = CATEGORIES[categoryKey];
  if (!category || !category.sources[sourceKey] || category.sources[sourceKey].length === 0) {
    throw new Error(`هذا التصنيف غير متوفر في المصدر المختار`);
  }
  
  const image = getRandomImage(categoryKey);
  
  // تأكد أن الصورة من المصدر المطلوب
  let attempts = 0;
  const maxAttempts = 50;
  
  while (image.sourceKey !== sourceKey && attempts < maxAttempts) {
    const newImage = getRandomImage(categoryKey);
    if (newImage.sourceKey === sourceKey) {
      return newImage;
    }
    attempts++;
  }
  
  // إذا لم نجد صورة من المصدر المحدد، أرجع أي صورة
  return image;
}

/**
 * معالجة الرسائل
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // تجاهل الأوامر
  if (text?.startsWith('/')) return;
  
  // اختيار المصدر
  if (text?.includes('IKEA Original') || text?.includes('🇸🇪')) {
    userSourceSelection[chatId] = 'ikea1';
    
    bot.sendMessage(chatId, 
      `✅ تم اختيار: *IKEA Original*\n\n${SOURCES.ikea1.description}\n\nاختر التصنيف:`,
      {
        parse_mode: 'Markdown',
        ...getCategoryKeyboard('ikea1')
      }
    );
    return;
  }
  
  if (text?.includes('IKEA Extended') || text?.includes('🏠')) {
    userSourceSelection[chatId] = 'ikea2';
    
    bot.sendMessage(chatId,
      `✅ تم اختيار: *IKEA Extended*\n\n${SOURCES.ikea2.description}\n\nاختر التصنيف:`,
      {
        parse_mode: 'Markdown',
        ...getCategoryKeyboard('ikea2')
      }
    );
    return;
  }
  
  if (text?.includes('جميع المصادر') || text?.includes('🌐')) {
    userSourceSelection[chatId] = 'all';
    
    bot.sendMessage(chatId,
      `✅ تم اختيار: *جميع المصادر*\n\n${SOURCES.all.description}\n\nاختر التصنيف:`,
      {
        parse_mode: 'Markdown',
        ...getCategoryKeyboard('all')
      }
    );
    return;
  }
  
  // زر الرجوع للمصادر
  if (text?.includes('المصادر') || text?.includes('🔙')) {
    delete userSourceSelection[chatId];
    bot.sendMessage(chatId, '🔙 اختر المصدر:', sourceKeyboard);
    return;
  }
  
  // زر الإحصائيات
  if (text?.includes('إحصائيات') || text?.includes('📊')) {
    sendDetailedStats(chatId);
    return;
  }
  
  // التحقق من اختيار المصدر أولاً
  const selectedSource = userSourceSelection[chatId];
  if (!selectedSource) {
    bot.sendMessage(chatId, '⚠️ اختر المصدر أولاً من الأزرار أدناه:', sourceKeyboard);
    return;
  }
  
  // تحديد التصنيف
  let categoryKey = null;
  
  for (const [key, category] of Object.entries(CATEGORIES)) {
    if (text?.includes(category.name) || text?.includes(category.emoji)) {
      categoryKey = key;
      break;
    }
  }
  
  // خيار المفاجأة
  if (text?.includes('مفاجأة') || text?.includes('🎲')) {
    const availableCategories = SOURCES[selectedSource].categories;
    categoryKey = availableCategories[Math.floor(Math.random() * availableCategories.length)];
  }
  
  if (!categoryKey) {
    bot.sendMessage(chatId, '❓ اختر من الأزرار أدناه', getCategoryKeyboard(selectedSource));
    return;
  }
  
  // إرسال "جاري التحميل..."
  const loadingMsg = await bot.sendMessage(chatId, '⏳ جاري البحث...');
  
  try {
    // جلب الصورة من المصدر المحدد
    const image = getImageFromSource(categoryKey, selectedSource);
    
    // قراءة الصورة
    const photoBuffer = fs.readFileSync(image.path);
    
    // تجهيز النص
    const sourceName = SOURCES[selectedSource].name;
    const caption = `
🎨 *${image.categoryEmoji} ${image.categoryName}*

📝 ${image.description}

📦 المصدر: *${sourceName}*
🗂️ من: ${image.source}

💡 *${getRandomTip()}*
    `.trim();
    
    // إرسال الصورة
    await bot.sendPhoto(chatId, photoBuffer, {
      caption: caption,
      parse_mode: 'Markdown',
      ...getCategoryKeyboard(selectedSource)
    });
    
    // حذف رسالة التحميل
    await bot.deleteMessage(chatId, loadingMsg.message_id);
    
    console.log(`✅ ${image.categoryName} [${sourceName}] → ${msg.from.first_name}`);
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}
    
    bot.sendMessage(
      chatId,
      '❌ عذراً، حدث خطأ. حاول مرة أخرى.',
      getCategoryKeyboard(selectedSource)
    );
  }
});

/**
 * معالجة الأخطاء
 */
bot.on('polling_error', (error) => {
  console.error('⚠️ خطأ في الاتصال:', error.message);
});

console.log('✅ البوت جاهز! ابدأ المحادثة على Telegram\n');
console.log(`📦 الصور المتاحة: ${stats.total.toLocaleString('ar-EG')}\n`);
