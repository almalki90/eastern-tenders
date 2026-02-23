/**
 * بوت ديكور تفاعلي - مقسم إلى أثاث وديكورات
 * يسمح للمستخدم باختيار القسم أولاً ثم التصنيف
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import { getRandomImage, CATEGORIES, getDetailedStats } from './multi-source-service.js';
import { getRandomWallhavenImage, WALLHAVEN_CATEGORIES, searchWallhaven } from './wallhaven-service.js';
import { searchUnsplash } from './unsplash-service.js';
import { translateToEnglish } from './translate-service.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

console.log('🤖 بوت الديكور يعمل الآن (أثاث + ديكورات)...\n');

// عرض الإحصائيات عند بدء التشغيل
const stats = getDetailedStats();
console.log(`📦 إجمالي الصور المتاحة: ${stats.total.toLocaleString('ar-EG')}`);
console.log(`📂 عدد التصنيفات: ${Object.keys(stats.categories).length}\n`);

// تخزين اختيار المستخدم للقسم
const userSourceSelection = {};

// تخزين حالة البحث المخصص
const userSearchMode = {};

// تخزين آخر استعلام بحث للمستخدم
const userLastSearch = {};

/**
 * معلومات الأقسام - مقسمة إلى أثاث وديكورات وورق جدران
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
    description: 'ملايين الصور - تصاميم كاملة',
    emoji: '🎨',
    type: 'decor',
    categories: ['مطابخ', 'غرف_نوم', 'غرف_معيشة', 'مداخل', 'أسقف', 'أرضيات', 'جدران', 'حمامات', 'أسطح', 'حدائق_خلفية', 'صالات_جلوس', 'ديكور_تلفزيون']
  },
  wallpapers: {
    name: 'ورق جدران',
    description: 'صور عالية الجودة 4K+ - خلفيات احترافية',
    emoji: '🖼️',
    type: 'wallpapers',
    categories: ['nature', 'city', 'space', 'art', 'animals', 'cars', 'gaming', 'flowers', 'ocean', 'kids']
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
 * أزرار اختيار القسم (أثاث / ديكورات / ورق جدران)
 */
const sourceKeyboard = {
  reply_markup: {
    keyboard: [
      ['🪑 أثاث', '🎨 ديكورات'],
      ['🖼️ ورق جدران'],
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
  
  // تحديد مصدر التصنيفات (عادي أو Wallhaven)
  const categorySource = sourceKey === 'wallpapers' ? WALLHAVEN_CATEGORIES : CATEGORIES;
  
  // ترتيب الأزرار في صفوف (زرين في كل صف)
  for (let i = 0; i < categories.length; i += 2) {
    const row = [];
    
    const cat1 = categorySource[categories[i]];
    if (cat1) {
      row.push(`${cat1.emoji} ${cat1.name}`);
    }
    
    if (i + 1 < categories.length) {
      const cat2 = categorySource[categories[i + 1]];
      if (cat2) {
        row.push(`${cat2.emoji} ${cat2.name}`);
      }
    }
    
    buttons.push(row);
  }
  
  // إضافة أزرار إضافية
  if (sourceKey === 'wallpapers') {
    // زر البحث المخصص فقط لورق الجدران
    buttons.push(['🔍 بحث مخصص', '🎲 مفاجأة']);
  } else {
    // بقية الأقسام: مفاجأة فقط
    buttons.push(['🎲 مفاجأة']);
  }
  buttons.push(['🔙 الأقسام']);
  
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
• *${Object.keys(SOURCES).length} أقسام* (أثاث + ديكورات + ورق جدران)
• *${Object.keys(CATEGORIES).length + Object.keys(WALLHAVEN_CATEGORIES).length} تصنيفاً* مختلفاً

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

🖼️ *ورق جدران*
• ${SOURCES.wallpapers.description}
• مناظر طبيعية، فضاء، فن، حيوانات، سيارات
• التصنيفات: مناظر، مدن، فضاء، فن، حيوانات، إلخ

🖼️ *ورق جدران*
• ${SOURCES.wallpapers.description}
• مناظر طبيعية، فضاء، فن، حيوانات، سيارات
• التصنيفات: مناظر، مدن، فضاء، فن، حيوانات، إلخ

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
  
  // اختيار قسم ورق الجدران
  if (text?.includes('ورق جدران') || text?.includes('🖼️')) {
    userSourceSelection[chatId] = 'wallpapers';
    
    bot.sendMessage(chatId,
      `✅ تم اختيار: *ورق جدران*\n\n${SOURCES.wallpapers.description}\n\nاختر التصنيف:`,
      {
        parse_mode: 'Markdown',
        ...getCategoryKeyboard('wallpapers')
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
  
  // زر البحث المخصص (فقط لورق الجدران)
  if (text?.includes('بحث مخصص') || text?.includes('🔍')) {
    // التحقق من أن المستخدم في قسم ورق الجدران
    if (selectedSource !== 'wallpapers') {
      bot.sendMessage(chatId, '⚠️ البحث المخصص متاح فقط في قسم 🖼️ ورق الجدران', getCategoryKeyboard(selectedSource));
      return;
    }
    
    userSearchMode[chatId] = selectedSource;
    bot.sendMessage(chatId, 
      `🔍 *البحث المخصص*\n\nاكتب ما تبحث عنه بالعربية:\n\nأمثلة:\n• جبال في الغروب\n• مدينة ليلية\n• قطة لطيفة\n• سيارة رياضية\n• زهور ملونة\n• بحر وشاطئ\n\n💡 أو اضغط 🔙 للرجوع`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [['🔙 الأقسام']],
          resize_keyboard: true
        }
      }
    );
    return;
  }
  
  // إذا كان المستخدم في وضع البحث المخصص
  if (userSearchMode[chatId]) {
    const searchQuery = text.trim();
    const selectedSource = userSourceSelection[chatId];
    
    // رسالة تحميل
    const loadingMsg = await bot.sendMessage(chatId, '⏳ جاري البحث...');
    
    try {
      // ترجمة النص إلى الإنجليزية
      const englishQuery = await translateToEnglish(searchQuery);
      
      // التحقق إذا لم توجد ترجمة
      if (!englishQuery) {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
        
        await bot.sendMessage(chatId, 
          `❌ *لم يتم العثور على ترجمة لـ:* "${searchQuery}"\n\n💡 جرب كلمة أخرى من القاموس\n\n🔤 مثال: ثلج، قمر، سحب، نجوم، بحيرة، شلال، زهور، فراشة، ذئب، نسر`,
          { parse_mode: 'Markdown' }
        );
        
        // الاحتفاظ بالمستخدم في وضع البحث (لا نحذف userSearchMode)
        return;
      }
      
      console.log(`🔍 البحث: "${searchQuery}" → "${englishQuery}"`); 
      
      // حفظ آخر استعلام بحث ناجح
      userLastSearch[chatId] = {
        arabicQuery: searchQuery,
        englishQuery: englishQuery,
        source: selectedSource
      };
      
      // إلغاء وضع البحث بعد نجاح الترجمة
      delete userSearchMode[chatId]; 
      
      // جلب 8 صور
      const images = [];
      const targetCount = 6;
      const fetchCount = 8;
      
      for (let i = 0; i < fetchCount; i++) {
        try {
          let image;
          
          // البحث حسب القسم
          if (selectedSource === 'wallpapers') {
            image = await searchWallhaven(englishQuery);
          } else {
            // للديكورات والأثاث، استخدام Unsplash
            image = await searchUnsplash(englishQuery);
          }
          
          images.push(image);
          
          // توقف عند الوصول للعدد المطلوب
          if (images.length >= targetCount) break;
          
        } catch (fetchError) {
          console.warn(`⚠️ فشل جلب صورة ${i + 1}:`, fetchError.message);
        }
      }
      
      // حذف رسالة التحميل
      await bot.deleteMessage(chatId, loadingMsg.message_id);
      
      // التحقق من وجود صور
      if (images.length === 0) {
        bot.sendMessage(chatId, 
          `❌ لم يتم العثور على صور لـ: *${searchQuery}*\n\n💡 جرب كلمات أخرى أو اضغط 🔍 للبحث مرة أخرى`,
          {
            parse_mode: 'Markdown',
            ...getCategoryKeyboard(selectedSource)
          }
        );
        return;
      }
      
      // إرسال الصور
      let sentCount = 0;
      for (let i = 0; i < images.length && sentCount < targetCount; i++) {
        const image = images[i];
        
        // إرسال الصورة
        if (image.isWallhaven) {
          const caption = `
🔍 *بحث مخصص*

📝 ${searchQuery}
📐 الدقة: ${image.resolution}
          `.trim();
          
          try {
            await bot.sendPhoto(chatId, image.url, {
              caption: caption,
              parse_mode: 'Markdown'
            });
            sentCount++;
          } catch (photoError) {
            console.log(`⚠️ فشل تحميل الصورة الأصلية، استخدام thumbnail...`);
            try {
              await bot.sendPhoto(chatId, image.thumb, {
                caption: caption + '\n\n⚠️ (نسخة مصغرة)',
                parse_mode: 'Markdown'
              });
              sentCount++;
            } catch (thumbError) {
              console.error(`❌ فشل إرسال thumbnail:`, thumbError.message);
              continue;
            }
          }
        } else if (image.isUnsplash) {
          const caption = `
🔍 *بحث مخصص*

📝 ${searchQuery}
          `.trim();
          
          try {
            await bot.sendPhoto(chatId, image.url, {
              caption: caption,
              parse_mode: 'Markdown'
            });
            sentCount++;
          } catch (photoError) {
            console.warn(`⚠️ فشل إرسال صورة، محاولة استخدام جودة أقل:`, photoError.message);
            
            let fallbackUrl = image.url.replace('/regular/', '/small/');
            
            try {
              await bot.sendPhoto(chatId, fallbackUrl, {
                caption: caption,
                parse_mode: 'Markdown'
              });
              sentCount++;
            } catch (thumbError) {
              console.error(`❌ فشل إرسال fallback:`, thumbError.message);
              continue;
            }
          }
        }
        
        // تأخير صغير بين الصور
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // إرسال keyboard مع زر "التالي"
      const keyboard = {
        reply_markup: {
          keyboard: [
            [{ text: '➡️ التالي' }],
            [{ text: '🔍 بحث مخصص' }],
            [{ text: '🎲 مفاجأة' }, { text: '🔙 الأقسام' }]
          ],
          resize_keyboard: true
        }
      };
      
      await bot.sendMessage(chatId, '✅ تم إرسال النتائج!\n\n➡️ اضغط *التالي* للمزيد\n🔍 أو ابحث عن كلمة جديدة', {
        parse_mode: 'Markdown',
        ...keyboard
      });
      
      console.log(`✅ تم إرسال ${sentCount} صور من البحث "${searchQuery}" [${selectedSource}] → ${msg.from.first_name}`);
      
      // إشعار إذا كان العدد أقل من 6
      if (sentCount < 6) {
        await bot.sendMessage(chatId, `⚠️ تم إرسال ${sentCount} صور فقط بسبب فشل بعض الصور.`);
      }
      
    } catch (error) {
      console.error('❌ خطأ في البحث:', error);
      
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}
      
      bot.sendMessage(
        chatId,
        `❌ عذراً، حدث خطأ في البحث: ${error.message}\n\nحاول مرة أخرى.`,
        getCategoryKeyboard(selectedSource)
      );
    }
    
    return;
  }
  
  // تحديد التصنيف
  let categoryKey = null;
  
  // تحديد المصدر المناسب حسب القسم
  const categorySource = selectedSource === 'wallpapers' ? WALLHAVEN_CATEGORIES : CATEGORIES;
  
  for (const [key, category] of Object.entries(categorySource)) {
    if (text?.includes(category.name) || text?.includes(category.emoji)) {
      categoryKey = key;
      break;
    }
  }
  
  // خيار "التالي" - إعادة البحث بنفس الاستعلام
  if (text?.includes('التالي') || text?.includes('➡️')) {
    const lastSearch = userLastSearch[chatId];
    
    if (!lastSearch) {
      bot.sendMessage(chatId, '⚠️ لا يوجد بحث سابق.\n\n💡 اضغط 🔍 بحث مخصص أولاً', getCategoryKeyboard(selectedSource));
      return;
    }
    
    // إعادة البحث بنفس الاستعلام
    const { arabicQuery, englishQuery, source } = lastSearch;
    
    // رسالة تحميل
    const loadingMsg = await bot.sendMessage(chatId, '⏳ جاري جلب المزيد من الصور...');
    
    try {
      // جلب 8 صور جديدة
      const images = [];
      const targetCount = 6;
      const fetchCount = 8;
      
      for (let i = 0; i < fetchCount; i++) {
        try {
          let image;
          
          if (source === 'wallpapers') {
            image = await searchWallhaven(englishQuery);
          } else {
            image = await searchUnsplash(englishQuery);
          }
          
          images.push(image);
          
          if (images.length >= targetCount) break;
          
        } catch (fetchError) {
          console.warn(`⚠️ فشل جلب صورة ${i + 1}:`, fetchError.message);
        }
      }
      
      // حذف رسالة التحميل
      await bot.deleteMessage(chatId, loadingMsg.message_id);
      
      // التحقق من وجود صور
      if (images.length === 0) {
        bot.sendMessage(chatId, 
          `❌ لم يتم العثور على صور إضافية لـ: *${arabicQuery}*\n\n💡 جرب بحث جديد`,
          {
            parse_mode: 'Markdown',
            ...getCategoryKeyboard(source)
          }
        );
        return;
      }
      
      // إرسال الصور
      let sentCount = 0;
      for (let i = 0; i < images.length && sentCount < targetCount; i++) {
        const image = images[i];
        
        if (image.isWallhaven) {
          const caption = `
🔍 *بحث: ${arabicQuery}*

📐 الدقة: ${image.resolution}
          `.trim();
          
          try {
            await bot.sendPhoto(chatId, image.url, {
              caption: caption,
              parse_mode: 'Markdown'
            });
            sentCount++;
          } catch (photoError) {
            try {
              await bot.sendPhoto(chatId, image.thumb, {
                caption: caption + '\n\n⚠️ (نسخة مصغرة)',
                parse_mode: 'Markdown'
              });
              sentCount++;
            } catch (thumbError) {
              continue;
            }
          }
        } else if (image.isUnsplash) {
          const caption = `🔍 *بحث: ${arabicQuery}*`.trim();
          
          try {
            await bot.sendPhoto(chatId, image.url, {
              caption: caption,
              parse_mode: 'Markdown'
            });
            sentCount++;
          } catch (photoError) {
            let fallbackUrl = image.url.replace('/regular/', '/small/');
            
            try {
              await bot.sendPhoto(chatId, fallbackUrl, {
                caption: caption,
                parse_mode: 'Markdown'
              });
              sentCount++;
            } catch (thumbError) {
              continue;
            }
          }
        }
        
        if (i < images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      
      // إرسال keyboard مع زر "التالي"
      const keyboard = {
        reply_markup: {
          keyboard: [
            [{ text: '➡️ التالي' }],
            [{ text: '🔍 بحث مخصص' }],
            [{ text: '🎲 مفاجأة' }, { text: '🔙 الأقسام' }]
          ],
          resize_keyboard: true
        }
      };
      
      await bot.sendMessage(chatId, '✅ تم إرسال المزيد من النتائج!\n\n➡️ اضغط *التالي* للمزيد\n🔍 أو ابحث عن كلمة جديدة', {
        parse_mode: 'Markdown',
        ...keyboard
      });
      
      console.log(`✅ تم إرسال ${sentCount} صور إضافية من البحث "${arabicQuery}"`);
      
      if (sentCount < 6) {
        await bot.sendMessage(chatId, `⚠️ تم إرسال ${sentCount} صور فقط.`);
      }
      
    } catch (error) {
      console.error('❌ خطأ في جلب المزيد:', error);
      
      try {
        await bot.deleteMessage(chatId, loadingMsg.message_id);
      } catch (e) {}
      
      bot.sendMessage(
        chatId,
        `❌ عذراً، حدث خطأ: ${error.message}`,
        getCategoryKeyboard(source)
      );
    }
    
    return;
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
    // جلب 8 صور (للتعويض عن أي صور فاشلة)
    const images = [];
    const targetCount = 6; // عدد الصور المطلوب
    const fetchCount = 8; // جلب عدد أكبر للتعويض
    
    for (let i = 0; i < fetchCount; i++) {
      try {
        let image;
        if (selectedSource === 'wallpapers') {
          // جلب من Wallhaven API
          image = await getRandomWallhavenImage(categoryKey);
        } else {
          // جلب من المصادر الأخرى (أثاث/ديكورات)
          image = await getRandomImage(categoryKey);
        }
        images.push(image);
        
        // توقف عند الوصول للعدد المطلوب
        if (images.length >= targetCount) break;
        
      } catch (fetchError) {
        console.warn(`⚠️ فشل جلب صورة ${i + 1}:`, fetchError.message);
      }
    }
    
    // حذف رسالة التحميل
    await bot.deleteMessage(chatId, loadingMsg.message_id);
    
    // إرسال الصور واحدة تلو الأخرى
    let sentCount = 0;
    for (let i = 0; i < images.length && sentCount < targetCount; i++) {
      const image = images[i];
      
      // التحقق من نوع الصورة (Unsplash / Pexels / Wallhaven / محلية)
      if (image.isWallhaven) {
        // إرسال صورة من Wallhaven (ورق جدران)
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.categoryDescription}
📐 الدقة: ${image.resolution}
        `.trim();
        
        try {
          // محاولة إرسال الصورة الأصلية
          await bot.sendPhoto(chatId, image.url, {
            caption: caption,
            parse_mode: 'Markdown'
          });
          sentCount++;
        } catch (photoError) {
          // في حالة الفشل، استخدام thumbnail
          console.log(`⚠️ فشل تحميل الصورة الأصلية، استخدام thumbnail...`);
          try {
            await bot.sendPhoto(chatId, image.thumb, {
              caption: caption + '\n\n⚠️ (نسخة مصغرة)',
              parse_mode: 'Markdown'
            });
            sentCount++;
          } catch (thumbError) {
            console.error(`❌ فشل إرسال thumbnail ل Wallhaven:`, thumbError.message);
            continue;
          }
        }
        
      } else if (image.isUnsplash || image.isPexels) {
        // إرسال صورة من Unsplash أو Pexels (ديكورات)
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.categoryDescription}
        `.trim();
        
        try {
          // محاولة إرسال الصورة الأصلية
          await bot.sendPhoto(chatId, image.url, {
            caption: caption,
            parse_mode: 'Markdown'
          });
          sentCount++;
        } catch (photoError) {
          console.warn(`⚠️ فشل إرسال صورة ${image.sourceKey}، محاولة استخدام جودة أقل:`, photoError.message);
          
          // fallback: استخدام جودة أقل
          let fallbackUrl = image.url;
          if (image.isUnsplash) {
            fallbackUrl = image.url.replace('/regular/', '/small/');
          }
          
          try {
            await bot.sendPhoto(chatId, fallbackUrl, {
              caption: caption,
              parse_mode: 'Markdown'
            });
            sentCount++;
          } catch (thumbError) {
            console.error(`❌ فشل إرسال fallback أيضاً:`, thumbError.message);
            // تخطي هذه الصورة والمتابعة
            continue;
          }
        }
        
      } else {
        // إرسال صورة محلية (أثاث)
        const photoBuffer = fs.readFileSync(image.path);
        
        // عرض اسم المنتج مع تعليمات البحث
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.description}

💡 احفظ الصورة ثم استخدمها للبحث عن المنتج في جوجل
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
        sentCount++;
      }
      
      // تأخير صغير بين الصور
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    // إرسال keyboard للاختيار
    await bot.sendMessage(chatId, '📱 اختر فئة أخرى:', getCategoryKeyboard(selectedSource));
    
    console.log(`✅ تم إرسال ${sentCount} صور من ${images[0]?.categoryName || categoryKey} [${selectedSource}] → ${msg.from.first_name}`);
    
    // إرسال تحذير إذا كان عدد الصور أقل من 6
    if (sentCount < 6) {
      await bot.sendMessage(chatId, `⚠️ تم إرسال ${sentCount} صور فقط بسبب فشل بعض الصور. حاول مرة أخرى!`);
    }
    
  } catch (error) {
    console.error('❌ خطأ تفصيلي:', error);
    console.error('Stack:', error.stack);
    
    try {
      await bot.deleteMessage(chatId, loadingMsg.message_id);
    } catch (e) {}
    
    bot.sendMessage(
      chatId,
      `❌ عذراً، حدث خطأ: ${error.message}\n\nحاول مرة أخرى.`,
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
