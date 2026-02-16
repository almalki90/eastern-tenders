import { chromium } from 'playwright';

// KFUPM Scraper - جامعة الملك فهد للبترول والمعادن
async function scrapeKFUPM() {
  console.log('🎓 بدء جمع البيانات من جامعة الملك فهد...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });
  
  const page = await context.newPage();
  const tenders = [];
  
  try {
    const url = 'https://bids.kfupm.edu.sa/';
    console.log('📄 الوصول إلى موقع جامعة الملك فهد...');
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    // البحث عن جدول المناقصات
    const tableRows = await page.$$('table tbody tr');
    console.log(`📊 وجدنا ${tableRows.length} صف في جدول المناقصات`);
    
    for (let i = 0; i < tableRows.length; i++) {
      try {
        const row = tableRows[i];
        const cells = await row.$$('td');
        
        if (cells.length >= 5) {
          const bidNo = await cells[0].textContent();
          const bidName = await cells[1].textContent();
          const status = await cells[2].textContent();
          const docValue = await cells[3].textContent();
          const deadline = await cells[4].textContent();
          
          // استخراج الرابط
          const linkEl = await row.$('a');
          const link = linkEl ? await linkEl.getAttribute('href') : '';
          
          tenders.push({
            id: `tender-kfupm-${Date.now()}-${i}`,
            type: 'tender',
            title: bidName.trim() || `مناقصة رقم ${bidNo.trim()}`,
            description: `مناقصة من جامعة الملك فهد للبترول والمعادن - ${status.trim()}`,
            location: 'الظهران',
            region: 'الظهران',
            deadline: deadline.trim() || new Date().toISOString().split('T')[0],
            entity: 'جامعة الملك فهد للبترول والمعادن',
            link: link ? (link.startsWith('http') ? link : `https://bids.kfupm.edu.sa${link}`) : 'https://bids.kfupm.edu.sa',
            source: 'جامعة الملك فهد',
            status: status.trim(),
            bidNumber: bidNo.trim(),
            documentValue: docValue.trim(),
            scrapedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`خطأ في معالجة الصف ${i}:`, error.message);
      }
    }
    
    // إذا لم نجد مناقصات، نبحث بطريقة أخرى
    if (tenders.length === 0) {
      console.log('⚠️ لم يتم العثور على مناقصات نشطة في جامعة الملك فهد');
      
      // التحقق من وجود رسالة "لا توجد مناقصات"
      const noDataMsg = await page.$('text="لا يوجد سجلات", text="No records", text="0"');
      if (noDataMsg) {
        console.log('ℹ️ تأكيد: لا توجد مناقصات نشطة حالياً');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الوصول إلى موقع جامعة الملك فهد:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log(`✅ تم جمع ${tenders.length} مناقصة من جامعة الملك فهد`);
  return tenders;
}

// Export
export { scrapeKFUPM };

// Run directly if executed
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeKFUPM().then(tenders => {
    console.log('📊 النتائج:', JSON.stringify(tenders, null, 2));
  }).catch(error => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
}
