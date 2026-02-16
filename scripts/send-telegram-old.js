import https from 'https';
import fs from 'fs';
import path from 'path';

// معلومات البوت
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8312577403:AAGHSB9L3xx4BxWgbtzjU4VnoMWwvVDcMgo';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''; // سيتم تحديده لاحقاً

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
async function sendTelegramMessage(message, chatId = CHAT_ID) {
  // Debug
  console.log(`📤 محاولة إرسال رسالة (${message.length} حرف)...`);
  if (!message || message.trim().length === 0) {
    throw new Error('الرسالة فارغة!');
  }
  
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      chat_id: parseInt(chatId),
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: false
    });

    // Debug
    console.log('📋 JSON Data:', data.substring(0, 200));

    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
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
    req.write(data);
    req.end();
  });
}

// الحصول على معرف الدردشة (Chat ID) من البوت
async function getChatId() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.telegram.org',
      port: 443,
      path: `/bot${BOT_TOKEN}/getUpdates`,
      method: 'GET'
    };

    https.get(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.ok && data.result.length > 0) {
            const chatId = data.result[data.result.length - 1].message?.chat?.id;
            if (chatId) {
              resolve(chatId);
            } else {
              reject(new Error('لم يتم العثور على Chat ID. أرسل رسالة للبوت أولاً!'));
            }
          } else {
            reject(new Error('لا توجد رسائل. أرسل /start للبوت أولاً!'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// تنسيق رسالة المناقصة
function formatTenderMessage(tender, index, total) {
  const nowStr = formatDateTime(new Date());
  
  let message = `🔢 مناقصة ${index} من ${total}
━━━━━━━━━━━━━━━━━

🏛️ ${escapeHtml(tender.title)}

📍 المنطقة: ${escapeHtml(tender.region || 'غير محدد')}

🏢 الجهة: ${escapeHtml(tender.entity || 'غير محدد')}

📅 آخر موعد: ${formatDate(tender.deadline)}

📝 الوصف:
${escapeHtml(tender.description?.substring(0, 200) || 'لا يوجد وصف')}${tender.description?.length > 200 ? '...' : ''}

📡 المصدر: ${escapeHtml(tender.source || 'غير محدد')}

🔗 ${tender.link || 'https://almalki90.github.io/eastern-tenders'}

━━━━━━━━━━━━━━━━━
⏰ تم التحديث: ${nowStr}`;

  return message;
}

// تنسيق التاريخ
function formatDate(dateStr) {
  if (!dateStr) return 'غير محدد';
  
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  } catch (e) {
    return dateStr;
  }
}

// تنسيق التاريخ والوقت
function formatDateTime(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// تنظيف HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// النوم لمدة معينة
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

    if (newTenders.length === 0) {
      console.log('✅ لا توجد مناقصات جديدة للإرسال');
      
      // إرسال رسالة تأكيد
      const nowStr = formatDateTime(new Date());
      const confirmMessage = `✅ تحديث نظام المناقصات

⏰ الوقت: ${nowStr}
📊 إجمالي المناقصات: ${tenders.length}
✨ مناقصات جديدة: 0

💡 لا توجد مناقصات جديدة في هذا التحديث.`;

      try {
        let chatId = CHAT_ID;
        if (!chatId) {
          console.log('🔍 محاولة الحصول على Chat ID...');
          chatId = await getChatId();
          console.log(`✅ تم الحصول على Chat ID: ${chatId}`);
        }
        
        await sendTelegramMessage(confirmMessage, chatId);
        console.log('✅ تم إرسال رسالة التأكيد');
      } catch (e) {
        console.log('⚠️  لم يتم إرسال رسالة التأكيد:', e.message);
      }
      
      return;
    }

    // الحصول على Chat ID
    let chatId = CHAT_ID;
    if (!chatId) {
      console.log('🔍 محاولة الحصول على Chat ID...');
      chatId = await getChatId();
      console.log(`✅ تم الحصول على Chat ID: ${chatId}\n`);
    }

    // إرسال رسالة البداية
    const now = new Date();
    const nowStr = formatDateTime(now);
    const headerMessage = `🔔 تحديث المناقصات الجديدة

⏰ الوقت: ${nowStr}
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
        
        // انتظار قصير لتجنب Rate Limiting (30 رسالة/ثانية)
        await sleep(1200);
        
      } catch (error) {
        console.error(`❌ فشل إرسال المناقصة: ${error.message}\n`);
        failCount++;
        
        // انتظار أطول في حالة الخطأ
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
✅ اكتمل الإرسال

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

export { sendNewTenders, sendTelegramMessage, getChatId };
