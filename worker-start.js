/**
 * Worker Startup Script
 * يشغّل النشر التلقائي للقناة فقط (كل 6 ساعات)
 * لا يشغل البوت التفاعلي
 */

import { spawn } from 'child_process';

console.log('📢 Worker: بدء خدمة النشر التلقائي للقناة...\n');

// تشغيل النشر التلقائي للقناة فقط
const channelWorker = spawn('node', ['channel-auto-post.js'], {
  stdio: 'inherit',
  cwd: process.cwd()
});

channelWorker.on('error', (err) => {
  console.error('❌ خطأ في تشغيل channel-auto-post:', err);
  process.exit(1);
});

channelWorker.on('close', (code) => {
  console.log(`⚠️ channel-auto-post توقف بالكود: ${code}`);
  process.exit(code);
});

console.log('✅ خدمة النشر التلقائي تعمل!');
console.log('📍 القناة: @afhafhdikor');
console.log('⏱️  إرسال تلقائي كل 6 ساعات\n');
