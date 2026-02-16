import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// جمع المناقصات من TendersAlerts
async function scrapeTendersAlerts() {
  console.log('🚀 بدء جمع البيانات من TendersAlerts...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const tenders = [];
  
  try {
    // الذهاب لصفحة المنطقة الشرقية
    console.log('📡 الاتصال بـ TendersAlerts - المنطقة الشرقية...');
    await page.goto('https://tendersalerts.com/en/c/city-tenders/eastern-province', {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    
    await page.waitForTimeout(3000);
    
    // استخراج المناقصات
    const scrapedTenders = await page.evaluate(() => {
      const items = [];
      
      // البحث عن بطاقات المناقصات
      const cards = document.querySelectorAll('.tender-card, .card, [class*="tender"], article, .item');
      
      cards.forEach((card, index) => {
        try {
          // استخراج البيانات
          const titleEl = card.querySelector('h1, h2, h3, h4, .title, [class*="title"]');
          const descEl = card.querySelector('p, .description, [class*="desc"]');
          const entityEl = card.querySelector('.entity, .agency, [class*="entity"], [class*="agency"]');
          const dateEl = card.querySelector('.date, .deadline, [class*="date"], [class*="deadline"]');
          const linkEl = card.querySelector('a[href*="tender"], a[href*="announcement"]');
          
          const title = titleEl?.innerText?.trim() || '';
          const description = descEl?.innerText?.trim() || '';
          const entity = entityEl?.innerText?.trim() || '';
          const deadline = dateEl?.innerText?.trim() || '';
          const link = linkEl?.href || '';
          
          // فقط إذا كان هناك عنوان
          if (title && title.length > 10) {
            items.push({
              id: `tendersalerts-${Date.now()}-${index}`,
              title,
              description: description.substring(0, 500),
              entity,
              deadline,
              link: link || 'https://tendersalerts.com/en/c/city-tenders/eastern-province',
              source: 'TendersAlerts - Eastern Province',
              region: 'المنطقة الشرقية',
              scrapedAt: new Date().toISOString()
            });
          }
        } catch (e) {
          console.error('خطأ في معالجة بطاقة:', e.message);
        }
      });
      
      return items;
    });
    
    console.log(`✅ تم جمع ${scrapedTenders.length} مناقصة من TendersAlerts`);
    tenders.push(...scrapedTenders);
    
  } catch (error) {
    console.error('❌ خطأ في جمع البيانات:', error.message);
  }
  
  await browser.close();
  
  // إضافة نوع (مناقصة أو ترسية) بناءً على العنوان
  const enrichedTenders = tenders.map(tender => {
    const titleLower = tender.title.toLowerCase();
    const isAward = titleLower.includes('award') || 
                    titleLower.includes('ترسية') || 
                    titleLower.includes('awarded');
    
    return {
      ...tender,
      type: isAward ? 'award' : 'tender',
      status: 'active'
    };
  });
  
  // حفظ البيانات
  const dataPath = path.join(process.cwd(), 'data', 'tenders.json');
  fs.writeFileSync(dataPath, JSON.stringify(enrichedTenders, null, 2), 'utf-8');
  
  console.log(`\n✅ تم حفظ ${enrichedTenders.length} مناقصة في: data/tenders.json`);
  
  // إحصائيات
  const tenderCount = enrichedTenders.filter(t => t.type === 'tender').length;
  const awardCount = enrichedTenders.filter(t => t.type === 'award').length;
  
  console.log('\n📊 إحصائيات:');
  console.log(`   📋 مناقصات: ${tenderCount}`);
  console.log(`   🏆 ترسيات: ${awardCount}`);
  console.log(`   📈 المجموع: ${enrichedTenders.length}`);
  
  return enrichedTenders;
}

// تشغيل السكريبت
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeTendersAlerts()
    .then(() => {
      console.log('\n✨ تمت العملية بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ فشلت العملية:', error);
      process.exit(1);
    });
}

export { scrapeTendersAlerts };
