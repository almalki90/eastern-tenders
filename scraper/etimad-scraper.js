import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// المناطق المستهدفة في المنطقة الشرقية
const EASTERN_REGIONS = [
  'الدمام', 'Dammam',
  'الخبر', 'Khobar', 'Al Khobar',
  'الظهران', 'Dhahran',
  'أم الساهك',
  'القطيف', 'Qatif',
  'الجبيل', 'Jubail',
  'النعيرية',
  'رأس الخير', 'Ras Al Khair',
  'حفر الباطن', 'Hafr Al Batin',
  'الأحساء', 'Al Ahsa', 'Ahsa',
  'الحفر', 'Al Hofuf',
  'الخفجي', 'Khafji',
  'المنطقة الشرقية', 'Eastern Province', 'Eastern Region'
];

// Helper: التحقق من المنطقة الشرقية
function isEasternProvince(location) {
  if (!location) return false;
  const locationLower = location.toLowerCase();
  return EASTERN_REGIONS.some(region => 
    locationLower.includes(region.toLowerCase())
  );
}

// Helper: تنظيف النصوص
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

// Helper: استخراج المنطقة من النص
function extractRegion(text) {
  if (!text) return 'المنطقة الشرقية';
  
  for (const region of EASTERN_REGIONS) {
    if (text.includes(region)) {
      return region;
    }
  }
  return 'المنطقة الشرقية';
}

// Helper: تحويل التاريخ
function parseDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  
  try {
    // محاولة تحويل التاريخ من النص العربي
    const arabicMonths = {
      'يناير': '01', 'فبراير': '02', 'مارس': '03', 'أبريل': '04',
      'مايو': '05', 'يونيو': '06', 'يوليو': '07', 'أغسطس': '08',
      'سبتمبر': '09', 'أكتوبر': '10', 'نوفمبر': '11', 'ديسمبر': '12'
    };
    
    // البحث عن نمط التاريخ
    for (const [month, num] of Object.entries(arabicMonths)) {
      if (dateStr.includes(month)) {
        const parts = dateStr.match(/(\d+)/g);
        if (parts && parts.length >= 2) {
          const day = parts[0].padStart(2, '0');
          const year = parts[1].length === 2 ? '20' + parts[1] : parts[1];
          return `${year}-${num}-${day}`;
        }
      }
    }
    
    // محاولة التحويل المباشر
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (error) {
    console.error('خطأ في تحويل التاريخ:', error);
  }
  
  return new Date().toISOString().split('T')[0];
}

// Main scraping function
async function scrapeEtimad() {
  console.log('🚀 بدء جمع البيانات من منصة اعتماد...');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });
  
  const page = await context.newPage();
  const tenders = [];
  
  try {
    // الصفحة الرئيسية للمناقصات
    const baseUrl = 'https://tenders.etimad.sa/Tender/AllTendersForVisitor';
    console.log('📄 الوصول إلى منصة اعتماد...');
    
    await page.goto(baseUrl, { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    // الانتظار لتحميل المحتوى
    await page.waitForTimeout(3000);
    
    // محاولة قبول ملفات تعريف الارتباط إن وجدت
    try {
      const acceptButton = await page.$('button:has-text("قبول"), button:has-text("Accept")');
      if (acceptButton) {
        await acceptButton.click();
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      // تجاهل إذا لم يكن هناك زر
    }
    
    console.log('🔍 جمع المناقصات...');
    
    // محاولات متعددة للعثور على عناصر المناقصات
    const selectors = [
      '.tender-card',
      '.card-tender',
      '[class*="tender"]',
      '.row.tender',
      'div[data-tender-id]',
      'article',
      '.list-item'
    ];
    
    let tenderElements = null;
    for (const selector of selectors) {
      try {
        tenderElements = await page.$$(selector);
        if (tenderElements && tenderElements.length > 0) {
          console.log(`✅ تم العثور على ${tenderElements.length} عنصر باستخدام: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!tenderElements || tenderElements.length === 0) {
      console.log('⚠️ لم يتم العثور على مناقصات في الصفحة');
      
      // محاولة استخراج البيانات من النص
      const pageContent = await page.content();
      console.log('📝 حجم المحتوى:', pageContent.length, 'حرف');
      
      // البحث عن أنماط معينة
      const patterns = [
        /منافسة عامة/g,
        /مناقصة/g,
        /الدمام|الخبر|الظهران|القطيف|الجبيل/g
      ];
      
      for (const pattern of patterns) {
        const matches = pageContent.match(pattern);
        if (matches) {
          console.log(`🔍 وجدنا ${matches.length} تطابق لـ: ${pattern}`);
        }
      }
    } else {
      // معالجة كل عنصر
      for (let i = 0; i < Math.min(tenderElements.length, 50); i++) {
        try {
          const element = tenderElements[i];
          
          // استخراج البيانات
          const titleEl = await element.$('h3, h4, h5, .title, [class*="title"]');
          const title = titleEl ? cleanText(await titleEl.textContent()) : '';
          
          const descEl = await element.$('p, .description, [class*="desc"]');
          const description = descEl ? cleanText(await descEl.textContent()) : '';
          
          const locationEl = await element.$('.location, [class*="location"], [class*="city"]');
          const location = locationEl ? cleanText(await locationEl.textContent()) : '';
          
          const dateEl = await element.$('.date, [class*="date"], [class*="deadline"]');
          const deadline = dateEl ? cleanText(await dateEl.textContent()) : '';
          
          const entityEl = await element.$('.entity, [class*="entity"], [class*="agency"]');
          const entity = entityEl ? cleanText(await entityEl.textContent()) : '';
          
          const linkEl = await element.$('a');
          const link = linkEl ? await linkEl.getAttribute('href') : '';
          
          // التحقق من المنطقة الشرقية
          const fullText = `${title} ${description} ${location} ${entity}`.toLowerCase();
          if (isEasternProvince(fullText)) {
            tenders.push({
              id: `tender-etimad-${Date.now()}-${i}`,
              type: 'tender',
              title: title || 'مناقصة من منصة اعتماد',
              description: description || 'تفاصيل المناقصة متوفرة في الرابط',
              location: location || 'المنطقة الشرقية',
              region: extractRegion(fullText),
              deadline: parseDate(deadline),
              entity: entity || 'منصة اعتماد',
              link: link ? (link.startsWith('http') ? link : `https://tenders.etimad.sa${link}`) : 'https://tenders.etimad.sa',
              source: 'منصة اعتماد',
              scrapedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(`خطأ في معالجة العنصر ${i}:`, error.message);
        }
      }
    }
    
    // إذا لم نجد أي مناقصات، نجرب طريقة بديلة
    if (tenders.length === 0) {
      console.log('🔄 محاولة طريقة بديلة...');
      
      // البحث مباشرة في المنطقة الشرقية
      const searchUrl = 'https://tenders.etimad.sa/Tender/AllTendersForVisitor?PublishDateId=1&PageNumber=1';
      await page.goto(searchUrl, { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      await page.waitForTimeout(3000);
      
      // محاولة البحث عن جدول البيانات
      const tableRows = await page.$$('table tbody tr, .table-row');
      console.log(`📊 وجدنا ${tableRows.length} صف في الجدول`);
      
      for (let i = 0; i < Math.min(tableRows.length, 30); i++) {
        try {
          const row = tableRows[i];
          const cells = await row.$$('td, .cell');
          
          if (cells.length >= 3) {
            const title = cleanText(await cells[0].textContent());
            const entity = cells.length > 1 ? cleanText(await cells[1].textContent()) : '';
            const deadline = cells.length > 2 ? cleanText(await cells[2].textContent()) : '';
            
            const fullText = `${title} ${entity}`.toLowerCase();
            if (isEasternProvince(fullText)) {
              tenders.push({
                id: `tender-etimad-table-${Date.now()}-${i}`,
                type: 'tender',
                title: title || 'مناقصة من منصة اعتماد',
                description: `مناقصة من ${entity}`,
                location: 'المنطقة الشرقية',
                region: extractRegion(fullText),
                deadline: parseDate(deadline),
                entity: entity || 'منصة اعتماد',
                link: 'https://tenders.etimad.sa',
                source: 'منصة اعتماد',
                scrapedAt: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error(`خطأ في معالجة الصف ${i}:`, error.message);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الوصول إلى منصة اعتماد:', error.message);
  } finally {
    await browser.close();
  }
  
  console.log(`✅ تم جمع ${tenders.length} مناقصة من منصة اعتماد`);
  return tenders;
}

// Export
export { scrapeEtimad };

// Run directly if executed
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeEtimad().then(tenders => {
    console.log('📊 النتائج:', JSON.stringify(tenders, null, 2));
  }).catch(error => {
    console.error('❌ خطأ:', error);
    process.exit(1);
  });
}
