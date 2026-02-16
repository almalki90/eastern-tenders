/**
 * نظام الإرسال التلقائي للقناة
 * يرسل 5 صور كل 6 ساعات إلى قناة Telegram
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import { getRandomImage, CATEGORIES } from './multi-source-service.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const CHANNEL_ID = '@afhafhdikor'; // معرف القناة

console.log('🤖 نظام الإرسال التلقائي للقناة يعمل الآن...\n');

/**
 * فئات الأثاث والديكور
 */
const FURNITURE_CATEGORIES = ['غرف_نوم', 'حمامات', 'مطابخ', 'غرف_معيشة', 'طاولات_طعام', 'مداخل', 'كراسي', 'ساعات', 'نباتات', 'قطع_ديكور'];
const DECOR_CATEGORIES = ['شموع', 'إضاءة', 'فازات', 'مرايا', 'لوحات_فنية', 'ديكورات_صغيرة'];

/**
 * اختيار فئة عشوائية
 */
function getRandomCategory() {
  const allCategories = [...FURNITURE_CATEGORIES, ...DECOR_CATEGORIES];
  return allCategories[Math.floor(Math.random() * allCategories.length)];
}

/**
 * إرسال 5 صور إلى القناة
 */
async function sendImagesToChannel() {
  try {
    console.log(`📤 بدء إرسال 5 صور إلى القناة...`);
    
    // اختيار فئة عشوائية
    const categoryKey = getRandomCategory();
    const category = CATEGORIES[categoryKey];
    
    console.log(`📂 الفئة المختارة: ${category.emoji} ${category.name}`);
    
    // جلب 5 صور
    const images = [];
    for (let i = 0; i < 5; i++) {
      const image = await getRandomImage(categoryKey);
      images.push(image);
    }
    
    // إرسال الصور واحدة تلو الأخرى
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (image.isUnsplash) {
        // صورة من Unsplash (ديكورات)
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.categoryDescription}

💡 احفظ الصورة ثم استخدمها للبحث عن المنتج في جوجل
        `.trim();
        
        await bot.sendPhoto(CHANNEL_ID, image.url, {
          caption: caption,
          parse_mode: 'Markdown'
        });
        
      } else {
        // صورة محلية (أثاث)
        const photoBuffer = fs.readFileSync(image.path);
        
        const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.description}

💡 احفظ الصورة ثم استخدمها للبحث عن المنتج في جوجل
        `.trim();
        
        await bot.sendPhoto(CHANNEL_ID, photoBuffer, {
          caption: caption,
          parse_mode: 'Markdown'
        });
      }
      
      console.log(`  ✅ تم إرسال صورة ${i + 1}/5`);
      
      // تأخير بين الصور
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // إرسال رسالة تشجيعية مع الأزرار
    const motivationalMessage = `
🎨 *استكشف المزيد من الأفكار!*

هل أعجبتك هذه الصور؟ 
لدينا *26,127+ صورة أثاث* و *ملايين صور الديكور* في انتظارك! 🏠

✨ اكتشف أفكار ديكور جديدة يومياً
🛋️ تصفح آلاف الصور من جميع الفئات
🔍 ابحث عن المنتجات المشابهة بسهولة

*اضغط على الأزرار أدناه للبدء:*
    `.trim();
    
    await bot.sendMessage(CHANNEL_ID, motivationalMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🪑 أثاث', url: 'https://t.me/Khatwaabot?start=furniture' },
            { text: '🎨 ديكورات', url: 'https://t.me/Khatwaabot?start=decor' }
          ]
        ]
      }
    });
    
    console.log(`✅ تم إرسال 5 صور بنجاح إلى القناة!`);
    console.log(`📊 الفئة: ${category.name}`);
    console.log(`⏰ الإرسال التالي بعد 6 ساعات\n`);
    
  } catch (error) {
    console.error('❌ خطأ في إرسال الصور إلى القناة:', error.message);
  }
}

/**
 * جدولة الإرسال كل 6 ساعات
 */
function scheduleChannelPosts() {
  // الإرسال الفوري عند بدء التشغيل
  console.log('🚀 إرسال أول دفعة الآن...\n');
  sendImagesToChannel();
  
  // الإرسال كل 6 ساعات (21,600,000 ميلي ثانية)
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  setInterval(() => {
    console.log(`⏰ حان وقت الإرسال التلقائي!`);
    sendImagesToChannel();
  }, SIX_HOURS);
  
  console.log('⏱️  الجدولة: كل 6 ساعات');
  console.log(`📍 القناة: ${CHANNEL_ID}`);
  console.log('✅ النظام جاهز!\n');
}

// تشغيل النظام
scheduleChannelPosts();

// معالجة الأخطاء
process.on('unhandledRejection', (error) => {
  console.error('⚠️ خطأ غير متوقع:', error.message);
});
