/**
 * إرسال تلقائي للقناة - مرة واحدة فقط
 * للاستخدام مع GitHub Actions
 */

import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import fs from 'fs';
import { getRandomImage, CATEGORIES } from './multi-source-service.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
const CHANNEL_ID = process.env.TELEGRAM_CHAT_ID || '@afhafhdikor';

const FURNITURE_CATEGORIES = ['غرف_نوم', 'حمامات', 'مطابخ', 'غرف_معيشة', 'طاولات_طعام', 'مداخل', 'كراسي', 'ساعات', 'نباتات', 'قطع_ديكور'];
const DECOR_CATEGORIES = ['شموع', 'إضاءة', 'فازات', 'مرايا', 'لوحات_فنية', 'ديكورات_صغيرة'];

// متغير التناوب (سيُحفظ في ملف)
let isDecorTurn = false;

// قراءة حالة التناوب من ملف
try {
  if (fs.existsSync('.turn-state.json')) {
    const state = JSON.parse(fs.readFileSync('.turn-state.json', 'utf8'));
    isDecorTurn = state.isDecorTurn || false;
  }
} catch (err) {
  console.log('⚠️  لا يوجد ملف حالة، سنبدأ بالديكور');
}

/**
 * اختيار فئة بالتناوب
 */
function getRandomCategory() {
  // ملاحظة: GitHub Actions لا تدعم datasets المحلية (26GB)
  // لذلك سنستخدم فقط الديكور (APIs)
  const categories = DECOR_CATEGORIES;
  const categoryKey = categories[Math.floor(Math.random() * categories.length)];
  
  // تبديل للمرة القادمة (لكن حالياً فقط ديكور)
  isDecorTurn = !isDecorTurn;
  
  // حفظ الحالة
  try {
    fs.writeFileSync('.turn-state.json', JSON.stringify({ isDecorTurn }));
  } catch (err) {
    console.log('⚠️  تعذر حفظ حالة التناوب');
  }
  
  return categoryKey;
}

/**
 * إرسال 5 صور للقناة
 */
async function sendImagesToChannel() {
  try {
    const categoryKey = getRandomCategory();
    const category = CATEGORIES[categoryKey];
    
    console.log(`📤 بدء إرسال 5 صور إلى القناة...`);
    console.log(`📂 القسم: 🎨 ديكورات`);
    console.log(`📂 الفئة المختارة: ${category.emoji} ${category.name}`);
    
    // جلب 5 صور
    const images = [];
    for (let i = 0; i < 5; i++) {
      const image = await getRandomImage(categoryKey);
      images.push(image);
    }
    
    // إرسال الصور
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      const caption = `
${image.categoryEmoji} *${image.categoryName}*

📝 ${image.categoryDescription}

💡 احفظ الصورة ثم استخدمها للبحث عن المنتج في جوجل
      `.trim();
      
      await bot.sendPhoto(CHANNEL_ID, image.url, {
        caption: caption,
        parse_mode: 'Markdown'
      });
      
      console.log(`  ✅ تم إرسال صورة ${i + 1}/5`);
      
      // تأخير بين الصور
      if (i < images.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // إرسال رسالة تشجيعية مع الأزرار
    const motivationalMessage = `
🎨 *اضغط على الأزرار أدناه واستكشف المزيد*
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
    
  } catch (error) {
    console.error('❌ خطأ في إرسال الصور إلى القناة:', error.message);
    process.exit(1);
  }
}

// تشغيل النظام
console.log('🤖 GitHub Actions: إرسال الصور الآن...\n');
sendImagesToChannel()
  .then(() => {
    console.log('\n✅ اكتملت العملية بنجاح!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ فشلت العملية:', err.message);
    process.exit(1);
  });
