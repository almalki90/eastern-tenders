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

// إرسال رسالة للتليجرام باستخدام fetch
async function sendMessage(text, chatId = CHAT_ID) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      chat_id: parseInt(chatId),
      text: text
    })
  });

  const data = await response.json();
  
  if (!data.ok) {
    throw new Error(`Telegram API Error: ${data.description}`);
  }
  
  return data;
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
      const confirmMessage = `✅ تحديث نظام المناقصات

⏰ الوقت: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}
📊 إجمالي المناقصات: ${tenders.length}
✨ مناقصات جديدة: 0

💡 لا توجد مناقصات جديدة في هذا التحديث.`;

      await sendMessage(confirmMessage, CHAT_ID);
      console.log('✅ تم إرسال رسالة التأكيد');
      
      return;
    }

    // إرسال رسالة البداية
    const headerMessage = `🔔 تحديث المناقصات الجديدة

⏰ الوقت: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}
📊 إجمالي المناقصات: ${tenders.length}
✨ مناقصات جديدة: ${newTenders.length}

━━━━━━━━━━━━━━━━━`;

    await sendMessage(headerMessage, CHAT_ID);
    console.log('✅ تم إرسال رسالة البداية\n');

    await sleep(1000);

    // إرسال كل مناقصة جديدة
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < newTenders.length; i++) {
      const tender = newTenders[i];
      
      try {
        console.log(`📤 إرسال مناقصة ${i + 1}/${newTenders.length}: ${tender.title.substring(0, 50)}...`);
        
        const message = `🔢 مناقصة ${i + 1} من ${newTenders.length}
━━━━━━━━━━━━━━━━━

🏛️ ${tender.title}

📍 المنطقة: ${tender.region || 'غير محدد'}

🏢 الجهة: ${tender.entity || 'غير محدد'}

📅 آخر موعد: ${tender.deadline || 'غير محدد'}

📝 الوصف:
${(tender.description || 'لا يوجد وصف').substring(0, 200)}${tender.description?.length > 200 ? '...' : ''}

📡 المصدر: ${tender.source || 'غير محدد'}

🔗 ${tender.link || 'https://almalki90.github.io/eastern-tenders'}

━━━━━━━━━━━━━━━━━
⏰ ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;

        await sendMessage(message, CHAT_ID);
        
        // إضافة للمرسلة
        sentIds.add(tender.id);
        successCount++;
        
        console.log(`✅ تم الإرسال بنجاح\n`);
        
        // انتظار قصير لتجنب Rate Limiting
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
✅ اكتمل الإرسال

📊 نجح: ${successCount}
❌ فشل: ${failCount}
📈 إجمالي المرسل: ${sentIds.size}

🔗 https://almalki90.github.io/eastern-tenders
📡 https://almalki90.github.io/eastern-tenders/feed.xml`;

    await sendMessage(footerMessage, CHAT_ID);
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
sendNewTenders()
  .then(() => {
    console.log('\n🎉 تمت العملية بنجاح!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 فشلت العملية:', error);
    process.exit(1);
  });
