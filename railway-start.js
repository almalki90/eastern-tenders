/**
 * Railway Startup Script
 * يشغّل decor-bot التفاعلي 24/7
 */

import { spawn } from 'child_process';

console.log('🚀 Railway: بدء تشغيل البوت التفاعلي 24/7...\n');

// تشغيل decor-bot التفاعلي
const decorBot = spawn('node', ['decor-bot.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

decorBot.on('error', (err) => {
  console.error('❌ خطأ في تشغيل decor-bot:', err);
  process.exit(1);
});

decorBot.on('close', (code) => {
  console.log(`⚠️ decor-bot توقف بالكود: ${code}`);
  console.log('🔄 إعادة التشغيل...');
  process.exit(code);
});

console.log('✅ البوت التفاعلي يعمل على Railway!');
console.log('🤖 البوت: @Khatwaabot');
console.log('📍 القناة: @afhafhdikor');
console.log('⏱️  متاح 24/7 للاستخدام\n');
