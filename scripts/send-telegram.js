import https from 'https';
import fs from 'fs';
import path from 'path';

// معلومات البوت
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8312577403:AAGHSB9L3xx4BxWgbtzjU4VnoMWwvVDcMgo';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// ملف تتبع المناقصات المرسلة
const SENT_TENDERS_FILE = path.join(process.cwd(), 'data', 'sent-tenders.json');

// قراءة المناقصات المرسلة سابقاً
function loadSentTenders() {
  try {
    if (fs.existsSync(SENT_TENDERS_FILE)) {
      const data = fs.readFileSync(SENT_TENDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('خطأ في قراءة الملف:', e);
  }
  return { sent: [], lastUpdate: null };
}

// حفظ المناقصات المرسلة
function saveSentTenders(sentData) {
  try {
    fs.writeFileSync(SENT_TENDERS_FILE, JSON.stringify(sentData, null, 2), 'utf-8');
  } catch (e) {
    console.error('خطأ في حفظ الملف:', e);
  }
}

// إرسال رسالة للتليجرام
async function sendTelegramMessage(text, chatId = CHAT_ID) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({
      chat_id: parseInt(chatId),
      text: text,
      parse_mode: 'HTML'
    });

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// تنسيق التاريخ
function formatDate(dateStr) {
  if (!dateStr) return 'غير محدد';
  
  try {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    return date.toLocaleDateString('ar-SA', options);
  } catch (e) {
    return dateStr;
  }
}

// تنسيق التاريخ والوقت
function formatDateTime(date) {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleString('ar-SA', options);
}

// تنظيف HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// النوم
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// تنسيق رسالة المناقصة
function formatTenderMessage(tender, index, total) {
  const title = escapeHtml(tender.title);
  const region = escapeHtml(tender.region || 'غير محدد');
  const entity = escapeHtml(tender.entity || 'غير محدد');
  const deadline = formatDate(tender.deadline);
  const description = escapeHtml(tender.description?.substring(0, 200) || 'لا يوجد وصف');
  const source = escapeHtml(tender.source || 'غير محدد');
  const link = tender.link || 'https://almalki90.github.io/eastern-tenders';
  
  return `🔢 <b>مناقصة ${index} من ${total}</b>
━━━━━━━━━━━━━━━━━

🏛️ <b>${title}</b>

📍 <b>المنطقة:</b> ${region}

🏢 <b>الجهة:</b> ${entity}

📅 <b>آخر موعد:</b> ${deadline}

📝 <b>الوصف:</b>
${description}${tender.description?.length > 200 ? '...' : ''}

📡 <b>المصدر:</b> ${source}

🔗 <a href="${link}">عرض التفاصيل الكاملة</a>

━━━━━━━━━━━━━━━━━
⏰ <i>تم التحديث: ${formatDateTime(new Date())}</i>`;
}

// إرسال المناقصات الجديدة
async function sendNewTenders() {
  console.log('🤖 بدء عملية إرسال المناقصات للتليجرام...\n');

  try {
    // قراءة البيانات
    const tendersPath = path.join(process.cwd(), 'data', 'tenders.json');
    if (!fs.existsSync(tendersPath)) {
      console.error('❌ ملف المناقصات غير موجود!');
      return;
    }

    const tenders = JSON.parse(fs.readFileSync(tendersPath, 'utf-8'));
    console.log(`📊 عدد المناقصات الكلي: ${tenders.length}`);

    // قراءة المناقصات المرسلة سابقاً
    const sentData = loadSentTenders();
    const sentIds = new Set(sentData.sent || []);
    console.log(`📋 عدد المناقصات المرسلة سابقاً: ${sentIds.size}`);

    // تصفية المناقصات الجديدة فقط
    const newTenders = tenders.filter(t => !sentIds.has(t.id));
    console.log(`✨ عدد المناقصات الجديدة: ${newTenders.length}\n`);

    let chatId = CHAT_ID;
    if (!chatId) {
      throw new Error('TELEGRAM_CHAT_ID غير محدد!');
    }

    if (newTenders.length === 0) {
      console.log('✅ لا توجد مناقصات جديدة للإرسال');
      
      const confirmMessage = `✅ <b>تحديث نظام المناقصات</b>

⏰ الوقت: ${formatDateTime(new Date())}
📊 إجمالي المناقصات: ${tenders.length}
✨ مناقصات جديدة: 0

💡 لا توجد مناقصات جديدة في هذا التحديث.`;

      await sendTelegramMessage(confirmMessage, chatId);
      console.log('✅ تم إرسال رسالة التأكيد');
      return;
    }

    // إرسال رسالة البداية
    const headerMessage = `🔔 <b>تحديث المناقصات الجديدة</b>

⏰ الوقت: ${formatDateTime(new Date())}
📊 إجمالي المناقصات: ${tenders.length}
✨ مناقصات جديدة: ${newTenders.length}

━━━━━━━━━━━━━━━━━`;

    await sendTelegramMessage(headerMessage, chatId);
    console.log('✅ تم إرسال رسالة البداية\n');
    await sleep(1000);

    // إرسال كل مناقصة جديدة
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < newTenders.length; i++) {
      const tender = newTenders[i];
      
      try {
        console.log(`📤 إرسال مناقصة ${i + 1}/${newTenders.length}: ${tender.title.substring(0, 50)}...`);
        
        const message = formatTenderMessage(tender, i + 1, newTenders.length);
        await sendTelegramMessage(message, chatId);
        
        // إضافة للمرسلة
        sentIds.add(tender.id);
        successCount++;
        
        console.log(`✅ تم الإرسال بنجاح\n`);
        
        // انتظار لتجنب Rate Limiting
        await sleep(1200);
        
      } catch (error) {
        console.error(`❌ فشل إرسال المناقصة: ${error.message}\n`);
        failCount++;
        await sleep(3000);
      }
    }

    // حفظ المناقصات المرسلة
    saveSentTenders({
      sent: Array.from(sentIds),
      lastUpdate: new Date().toISOString(),
      totalSent: sentIds.size
    });

    // إرسال رسالة النهاية
    const footerMessage = `━━━━━━━━━━━━━━━━━
✅ <b>اكتمل الإرسال</b>

📊 نجح: ${successCount}
❌ فشل: ${failCount}
📈 إجمالي المرسل: ${sentIds.size}

🔗 عرض جميع المناقصات:
https://almalki90.github.io/eastern-tenders

📡 الاشتراك في RSS:
https://almalki90.github.io/eastern-tenders/feed.xml`;

    await sendTelegramMessage(footerMessage, chatId);
    
    console.log('\n✨ اكتملت العملية بنجاح!');
    console.log(`📊 الإحصائيات النهائية:`);
    console.log(`   ✅ نجح: ${successCount}`);
    console.log(`   ❌ فشل: ${failCount}`);
    console.log(`   📈 إجمالي المرسل: ${sentIds.size}`);

  } catch (error) {
    console.error('\n❌ خطأ في عملية الإرسال:', error);
    throw error;
  }
}

// تشغيل السكريبت
if (import.meta.url === `file://${process.argv[1]}`) {
  sendNewTenders()
    .then(() => {
      console.log('\n🎉 تمت العملية بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 فشلت العملية:', error);
      process.exit(1);
    });
}

export { sendNewTenders, sendTelegramMessage };
