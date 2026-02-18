/**
 * Railway Startup Script
 * يشغّل فقط channel-auto-post (الإرسال التلقائي)
 * decor-bot يعمل فقط عند المحادثة المباشرة
 */

import { spawn } from 'child_process';

console.log('🚀 Railway: بدء تشغيل نظام الإرسال التلقائي...\n');

// تشغيل channel-auto-post فقط
const autoPost = spawn('node', ['channel-auto-post.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

autoPost.on('error', (err) => {
  console.error('❌ خطأ في تشغيل channel-auto-post:', err);
  process.exit(1);
});

autoPost.on('close', (code) => {
  console.log(`⚠️ channel-auto-post توقف بالكود: ${code}`);
  process.exit(code);
});

console.log('✅ النظام يعمل على Railway!');
console.log('📍 القناة: @afhafhdikor');
console.log('⏱️  إرسال تلقائي كل 6 ساعات\n');
