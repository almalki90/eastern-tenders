/**
 * بوت ديكور تفاعلي - مقسم إلى أثاث وديكورات
 * يسمح للمستخدم باختيار القسم أولاً ثم التصنيف
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import { getRandomImage, CATEGORIES, getDetailedStats } from './multi-source-service.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 بوت الديكور يعمل الآن (أثاث + ديكورات)...\n');

// عرض الإحصائيات عند بدء التشغيل
const stats = getDetailedStats();
console.log(`📦 إجمالي الصور المتاحة: ${stats.total.toLocaleString('ar-EG')}`);
console.log(`📂 عدد التصنيفات: ${Object.keys(stats.categories).length}\n`);

// تخزين اختيار المستخدم للقسم
const userSourceSelection = {};

/**
 * معلومات الأقسام - مقسمة إلى أثاث وديكورات
 */
const SOURCES = {
  furniture: {
    name: 'أثاث',
    description: '26,127 صورة - أثاث وغرف كاملة',
    emoji: '🪑',
    type: 'furniture',
    categories: ['غرف_نوم', 'حمامات', 'مطابخ', 'غرف_معيشة', 'طاولات_طعام', 'مداخل', 'كراسي', 'ساعات', 'نباتات', 'قطع_ديكور']
  },
  decor: {
    name: 'ديكورات',
    description: 'ملايين الصور - ديكور حقيقي',
    emoji: '🎨',
    type: 'decor',
    categories: ['شموع', 'إضاءة', 'فازات', 'مرايا', 'لوحات_فنية', 'ديكورات_صغيرة']
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
 * أزرار اختيار القسم (أثاث / ديكورات)
 */
const sourceKeyboard = {
  reply_markup: {
    keyboard: [
      ['🪑 أثاث', '🎨 ديكورات'],
      ['📊 الإحصائيات']
    ],
    resize_keyboard: true
  }
};

/**
 * إنشاء أزرار التصنيفات حسب القسم المختار
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
  buttons.push(['🎲 مفاجأة', '🔙 الأقسام']);
  
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
      { command: 'sources', description: 'اختيار القسم' },
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
• *${Object.keys(SOURCES).length} قسمين* (أثاث + ديكورات)
• *${Object.keys(CATEGORIES).length} تصنيفاً* مختلفاً

🔹 اختر القسم من الأزرار أدناه
🔹 ثم اختر التصنيف الذي تريد
🔹 أو استخدم الأوامر من القائمة الزرقاء ☰

📌 اختر القسم:
  `.trim();
  
  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    ...sourceKeyboard
  });
});

/**
 * أمر الأقسام
 */
bot.onText(/\/sources/, (msg) => {
  const chatId = msg.chat.id;
  
  const sourcesMessage = `
🗂️ *اختر القسم المناسب:*

🪑 *أثاث*
• ${SOURCES.furniture.description}
• غرف كاملة وأثاث منزلي متنوع
• التصنيفات: غرف نوم، حمامات، مطابخ، غرف معيشة، إلخ

🎨 *ديكورات*
• ${SOURCES.decor.description}
• شموع، مرايا، لوحات، إضاءة، فازات
• التصنيفات: شموع، إضاءة، فازات، مرايا، إلخ

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
/sources - اختيار القسم
/stats - إحصائيات مفصلة
/help - عرض المساعدة

🔹 *طريقة الاستخدام:*
1️⃣ اختر القسم (أثاث أو ديكورات)
2️⃣ اختر التصنيف (غرف نوم، شموع، إلخ)
3️⃣ استمتع بالصور والنصائح!

💡 *نصيحة:* استخدم القائمة الزرقاء ☰ للوصول السريع للأوامر

🌐 المصادر: GitHub Open Source + Unsplash API
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
  
  statsMessage += `\n🌐 GitHub Open Source + Unsplash API`;
  
  bot.sendMessage(chatId, statsMessage, {
    parse_mode: 'Markdown',
    ...sourceKeyboard
  });
}

/**
 * معالجة الرسائل
 */
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  // تجاهل الأوامر
  if (text?.startsWith('/')) return;
  
  // اختيار قسم الأثاث
  if (text?.includes('أثاث') || text?.includes('🪑')) {
    userSourceSelection[chatId] = 'furniture';
    
    bot.sendMessage(chatId, 
      `✅ تم اختيار: *أثاث*\n\n${SOURCES.furniture.description}\n\nاختر التصنيف:`,
      {
        parse_mode: 'Markdown',
        ...getCategoryKeyboard('furniture')
      }
    );
    return;
  }
  
  // اختيار قسم الديكورات
  if (text?.includes('ديكورات') || text?.includes('🎨')) {
    userSourceSelection[chatId] = 'decor';
    
    bot.sendMessage(chatId,
      `✅ تم اختيار: *ديكورات*\n\n${SOURCES.decor.description}\n\nاختر التصنيف:`,
      {
        parse_mode: 'Markdown',
        ...getCategoryKeyboard('decor')
      }
    );
    return;
  }
  
  // زر الرجوع للأقسام
  if (text?.includes('الأقسام') || text?.includes('🔙')) {
    delete userSourceSelection[chatId];
    bot.sendMessage(chatId, '🔙 اختر القسم:', sourceKeyboard);
    return;
  }
  
  // زر الإحصائيات
  if (text?.includes('إحصائيات') || text?.includes('📊')) {
    sendDetailedStats(chatId);
    return;
  }
  
  // التحقق من اختيار القسم أولاً
  const selectedSource = userSourceSelection[chatId];
  if (!selectedSource) {
    bot.sendMessage(chatId, '⚠️ اختر القسم أولاً من الأزرار أدناه:', sourceKeyboard);
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
  const loadingMsg = await bot.sendMessage(chatId, '⏳ جاري البحث عن 6 صور...');
  
  try {
    // جلب 6 صور
    const images = [];
    for (let i = 0; i < 6; i++) {
      const image = await getRandomImage(categoryKey);
      images.push(image);
    }
    
    // حذف رسالة التحميل
    await bot.deleteMessage(chatId, loadingMsg.message_id);
    
    // إرسال الصور واحدة تلو الأخرى
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      // التحقق من نوع الصورة (Unsplash أو محلية)
      if (image.isUnsplash) {
        // إرسال صورة من Unsplash
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.categoryDescription}

💡 *${getRandomTip()}*
        `.trim();
        
        await bot.sendPhoto(chatId, image.url, {
          caption: caption,
          parse_mode: 'Markdown'
        });
        
      } else {
        // إرسال صورة محلية (أثاث)
        const photoBuffer = fs.readFileSync(image.path);
        
        // عرض اسم المنتج في كل صورة (مع النصيحة)
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.description}

💡 *${getRandomTip()}*
        `.trim();
        
        // إعداد الأزرار حسب نوع القسم
        let replyMarkup = {};
        
        if (selectedSource === 'furniture') {
          // زر واحد فقط: البحث بالصورة في Google
          replyMarkup = {
            reply_markup: {
              inline_keyboard: [
                [
                  { 
                    text: '🔍 ابحث عن هذا المنتج بالصورة', 
                    url: 'https://images.google.com/'
                  }
                ]
              ]
            }
          };
        }
        
        // إرسال الصورة مع الأزرار
        await bot.sendPhoto(chatId, photoBuffer, {
          caption: caption,
          parse_mode: 'Markdown',
          ...replyMarkup
        });
      }
      
      // تأخير صغير بين الصور
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // إرسال تعليمات البحث بعد كل الصور (فقط للأثاث)
    if (selectedSource === 'furniture') {
      const instructionsMessage = `
📌 *كيف تبحث عن المنتج؟*

1️⃣ اضغط على زر *"🔍 ابحث عن هذا المنتج بالصورة"* تحت الصورة
2️⃣ ستفتح صفحة *Google Images*
3️⃣ اضغط على أيقونة *الكاميرا* 📷 في شريط البحث
4️⃣ *احفظ الصورة* من Telegram على جهازك
5️⃣ *ارفع الصورة* في Google Images
6️⃣ ستظهر لك نتائج *منتجات مطابقة* أو *مشابهة*! 🎯

💡 *نصيحة:* استخدم اسم المنتج الظاهر في البطاقة للبحث الأدق
      `.trim();
      
      await bot.sendMessage(chatId, instructionsMessage, {
        parse_mode: 'Markdown'
      });
    }
    
    // إرسال keyboard للاختيار
    await bot.sendMessage(chatId, '📱 اختر فئة أخرى:', getCategoryKeyboard(selectedSource));
    
    console.log(`✅ تم إرسال 6 صور من ${images[0].categoryName} [${selectedSource}] → ${msg.from.first_name}`);
    
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
