/**
 * Scheduled Decor Bot - بوت ديكور مجدول
 * إرسال تلقائي كل 6 ساعات
 */

import cron from 'node-cron';
import dotenv from 'dotenv';
import { sendDecorImage, sendMultipleImages } from './telegram-bot.js';

dotenv.config();

const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('🤖 نظام الجدولة التلقائية يعمل!\n');
console.log('⏰ سيتم إرسال صورة كل 6 ساعات');
console.log('📍 القناة:', CHAT_ID);
console.log('');

/**
 * جدولة: كل 6 ساعات
 * 0 */6 * * * = كل 6 ساعات (12 صباحاً، 6 صباحاً، 12 ظهراً، 6 مساءً)
 */
cron.schedule('0 */6 * * *', async () => {
  console.log(`\n⏰ [${new Date().toLocaleString('ar-SA')}] وقت الإرسال التلقائي!`);
  
  try {
    await sendDecorImage();
    console.log('✅ تم الإرسال بنجاح!');
  } catch (error) {
    console.error('❌ فشل الإرسال:', error.message);
  }
}, {
  timezone: 'Asia/Riyadh'
});

/**
 * للاختبار: إرسال كل دقيقة (احذف بعد الاختبار)
 */
// cron.schedule('* * * * *', async () => {
//   console.log(`\n⏰ [${new Date().toLocaleString('ar-SA')}] اختبار..`);
//   await sendDecorImage();
// });

/**
 * إرسال صورة عند بدء التشغيل
 */
(async () => {
  console.log('📤 إرسال صورة ترحيبية...\n');
  try {
    await sendDecorImage();
    console.log('\n✅ تم إرسال الصورة الترحيبية!');
    console.log('⏱️  الآن في وضع الانتظار للجدولة التلقائية...\n');
  } catch (error) {
    console.error('\n❌ فشل الإرسال الترحيبي:', error.message);
  }
})();

/**
 * الحفاظ على البرنامج يعمل
 */
process.on('SIGINT', () => {
  console.log('\n\n👋 إيقاف البوت...');
  process.exit(0);
});
