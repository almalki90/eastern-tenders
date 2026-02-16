/**
 * Telegram Decor Bot - بوت أفكار الديكور
 * إرسال صور ديكور احترافية لقناة Telegram
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { getRandomDecorImage, CATEGORIES } from './pexels-service.js';

dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

/**
 * إرسال صورة ديكور مع وصف
 */
export async function sendDecorImage(category = null) {
  try {
    console.log(`\n📤 إرسال صورة ديكور...`);
    
    // اختيار تصنيف عشوائي إذا لم يُحدد
    if (!category) {
      const categories = Object.keys(CATEGORIES);
      category = categories[Math.floor(Math.random() * categories.length)];
    }
    
    // جلب الصورة
    const image = await getRandomDecorImage(category);
    
    // تجهيز النص
    const caption = `
🎨 *فكرة ديكور جديدة*

📂 التصنيف: *${category.replace('_', ' ')}*
📝 الوصف: ${image.description}

📸 تصوير: [${image.photographer}](${image.photographerUrl})
🔗 المصدر: Pexels

_${getRandomTip()}_
`.trim();
    
    // إرسال الصورة
    const response = await axios.post(`${TELEGRAM_API}/sendPhoto`, {
      chat_id: CHAT_ID,
      photo: image.url,
      caption: caption,
      parse_mode: 'Markdown'
    });
    
    if (response.data.ok) {
      console.log(`✅ تم الإرسال بنجاح!`);
      console.log(`📂 التصنيف: ${category}`);
      console.log(`📸 الصورة: ${image.url.substring(0, 50)}...`);
      return response.data.result;
    } else {
      throw new Error(response.data.description);
    }
    
  } catch (error) {
    console.error('❌ فشل الإرسال:', error.message);
    throw error;
  }
}

/**
 * نصائح عشوائية للديكور
 */
function getRandomTip() {
  const tips = [
    '💡 نصيحة: استخدم الإضاءة الطبيعية قدر الإمكان',
    '🎨 نصيحة: اختر لونين أساسيين ولون مميز واحد',
    '🪴 نصيحة: أضف نباتات داخلية لإحياء المساحة',
    '🪞 نصيحة: المرايا تضفي اتساعاً على الغرف الصغيرة',
    '🛋️ نصيحة: اترك مساحة كافية للحركة بين الأثاث',
    '🖼️ نصيحة: اللوحات الفنية تعكس شخصيتك',
    '📐 نصيحة: قس المساحة قبل شراء الأثاث',
    '🕯️ نصيحة: الشموع المعطرة تضيف أجواء دافئة',
    '🎭 نصيحة: امزج الأنماط القديمة مع الحديثة',
    '🌈 نصيحة: الألوان الفاتحة توسع المساحة'
  ];
  
  return tips[Math.floor(Math.random() * tips.length)];
}

/**
 * إرسال عدة صور
 */
export async function sendMultipleImages(count = 3) {
  console.log(`\n🚀 إرسال ${count} صور ديكور...\n`);
  
  const results = [];
  const categories = Object.keys(CATEGORIES);
  
  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    try {
      const result = await sendDecorImage(randomCategory);
      results.push({ success: true, category: randomCategory });
      console.log(`✅ ${i + 1}/${count} تم الإرسال\n`);
      
      // تأخير بين الرسائل
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`❌ ${i + 1}/${count} فشل الإرسال\n`);
      results.push({ success: false, error: error.message });
    }
  }
  
  console.log(`\n📊 النتائج: ${results.filter(r => r.success).length}/${count} نجح`);
  return results;
}

/**
 * اختبار البوت
 */
async function test() {
  console.log('🤖 اختبار بوت الديكور...\n');
  
  try {
    await sendDecorImage('غرف_نوم');
    console.log('\n🎉 الاختبار نجح!');
  } catch (error) {
    console.error('\n❌ الاختبار فشل:', error.message);
    process.exit(1);
  }
}

// تشغيل الاختبار إذا تم تنفيذ الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  test();
}
