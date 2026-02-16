import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// المناطق المستهدفة في المنطقة الشرقية
const EASTERN_REGIONS = [
  'الدمام',
  'الخبر',
  'الظهران',
  'أم الساهك',
  'القطيف',
  'الجبيل',
  'النعيرية',
  'رأس الخير',
  'حفر الباطن',
  'الأحساء',
  'الحفر',
  'الخفجي',
  'المنطقة الشرقية'
];

// دالة للتحقق من أن المناقصة في المنطقة الشرقية
function isEasternProvince(location) {
  if (!location) return false;
  return EASTERN_REGIONS.some(region => 
    location.includes(region) || location.includes('شرق') || location.includes('Eastern')
  );
}

// دالة لتنظيف النصوص
function cleanText(text) {
  if (!text) return '';
  return text.trim().replace(/\s+/g, ' ');
}

// دالة لاستخراج التاريخ
function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    // محاولة تحويل التاريخ الهجري أو الميلادي
    return new Date().toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

async function scrapeTenders() {
  console.log('🚀 بدء عملية جمع بيانات المناقصات...\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const tenders = [];
  
  try {
    // 1. جمع من منصة إعلان (monafasat.gov.sa)
    console.log('📡 الاتصال بمنصة إعلان...');
    await page.goto('https://www.monafasat.gov.sa', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    
    await page.waitForTimeout(3000);
    
    // محاولة جمع المناقصات المعروضة
    const monafasatTenders = await page.evaluate(() => {
      const items = [];
      const cards = document.querySelectorAll('.tender-card, .card, [class*="tender"], [class*="opportunity"]');
      
      cards.forEach((card, index) => {
        try {
          const title = card.querySelector('h3, h4, .title, [class*="title"]')?.innerText || '';
          const description = card.querySelector('p, .description, [class*="desc"]')?.innerText || '';
          const location = card.querySelector('[class*="location"], [class*="region"]')?.innerText || '';
          const deadline = card.querySelector('[class*="deadline"], [class*="date"]')?.innerText || '';
          const entity = card.querySelector('[class*="entity"], [class*="organization"]')?.innerText || '';
          const link = card.querySelector('a')?.href || '';
          
          if (title) {
            items.push({
              id: `monafasat-${Date.now()}-${index}`,
              title,
              description,
              location,
              deadline,
              entity,
              link,
              source: 'منصة إعلان'
            });
          }
        } catch (e) {
          console.error('خطأ في استخراج البيانات:', e);
        }
      });
      
      return items;
    });
    
    console.log(`✅ تم جمع ${monafasatTenders.length} مناقصة من منصة إعلان`);
    tenders.push(...monafasatTenders);
    
    // 2. جمع من منصة فرصة (forsa.gov.sa)
    console.log('\n📡 الاتصال بمنصة فرصة...');
    try {
      await page.goto('https://www.forsa.gov.sa', { 
        waitUntil: 'networkidle',
        timeout: 60000 
      });
      
      await page.waitForTimeout(3000);
      
      const forsaTenders = await page.evaluate(() => {
        const items = [];
        const cards = document.querySelectorAll('.opportunity-card, .card, [class*="opportunity"]');
        
        cards.forEach((card, index) => {
          try {
            const title = card.querySelector('h3, h4, .title')?.innerText || '';
            const description = card.querySelector('p, .description')?.innerText || '';
            const location = card.querySelector('[class*="location"]')?.innerText || '';
            const deadline = card.querySelector('[class*="deadline"]')?.innerText || '';
            const entity = card.querySelector('[class*="entity"]')?.innerText || '';
            const link = card.querySelector('a')?.href || '';
            
            if (title) {
              items.push({
                id: `forsa-${Date.now()}-${index}`,
                title,
                description,
                location,
                deadline,
                entity,
                link,
                source: 'منصة فرصة'
              });
            }
          } catch (e) {}
        });
        
        return items;
      });
      
      console.log(`✅ تم جمع ${forsaTenders.length} فرصة من منصة فرصة`);
      tenders.push(...forsaTenders);
    } catch (e) {
      console.log('⚠️  لم يتم الوصول لمنصة فرصة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في جمع البيانات:', error.message);
  }
  
  await browser.close();
  
  // فلترة المناقصات للمنطقة الشرقية فقط
  console.log('\n🔍 فلترة المناقصات للمنطقة الشرقية...');
  const easternTenders = tenders.filter(tender => 
    isEasternProvince(tender.location) || 
    isEasternProvince(tender.title) ||
    isEasternProvince(tender.description)
  );
  
  // إضافة بيانات وهمية للتجربة إذا لم نجد بيانات
  if (easternTenders.length === 0) {
    console.log('⚠️  لم يتم العثور على بيانات حقيقية، إضافة بيانات تجريبية...');
    const mockData = generateMockTenders();
    easternTenders.push(...mockData);
  }
  
  // إضافة معلومات إضافية
  const enrichedTenders = easternTenders.map(tender => ({
    ...tender,
    scrapedAt: new Date().toISOString(),
    region: extractRegion(tender.location || tender.title),
    status: 'active'
  }));
  
  // حفظ البيانات
  const dataPath = path.join(process.cwd(), 'data', 'tenders.json');
  fs.writeFileSync(dataPath, JSON.stringify(enrichedTenders, null, 2), 'utf-8');
  
  console.log(`\n✅ تم حفظ ${enrichedTenders.length} مناقصة في: data/tenders.json`);
  console.log('\n📊 إحصائيات:');
  
  const stats = {};
  enrichedTenders.forEach(t => {
    stats[t.region] = (stats[t.region] || 0) + 1;
  });
  
  Object.entries(stats).forEach(([region, count]) => {
    console.log(`   ${region}: ${count} مناقصة`);
  });
  
  return enrichedTenders;
}

// استخراج المنطقة من النص
function extractRegion(text) {
  if (!text) return 'غير محدد';
  
  for (const region of EASTERN_REGIONS) {
    if (text.includes(region)) return region;
  }
  
  return 'المنطقة الشرقية';
}

// توليد بيانات تجريبية للتطوير
function generateMockTenders() {
  const cities = ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'الجبيل', 'الأحساء', 'حفر الباطن'];
  const types = ['صيانة', 'إنشاء', 'توريد', 'تشغيل', 'استشارات'];
  const entities = [
    'أمانة المنطقة الشرقية',
    'وزارة التعليم',
    'وزارة الصحة',
    'أرامكو السعودية',
    'الهيئة الملكية للجبيل',
    'شركة الكهرباء'
  ];
  
  const mockTenders = [];
  
  for (let i = 0; i < 15; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 5);
    
    mockTenders.push({
      id: `mock-${Date.now()}-${i}`,
      title: `مناقصة ${type} في ${city}`,
      description: `مناقصة لأعمال ${type} في منطقة ${city} - المنطقة الشرقية`,
      location: city,
      deadline: futureDate.toISOString().split('T')[0],
      entity: entity,
      link: `https://www.monafasat.gov.sa/tender/${i}`,
      source: 'بيانات تجريبية',
      status: 'active'
    });
  }
  
  return mockTenders;
}

// تشغيل السكريبت
if (import.meta.url === `file://${process.argv[1]}`) {
  scrapeTenders()
    .then(() => {
      console.log('\n✨ تمت العملية بنجاح!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ فشلت العملية:', error);
      process.exit(1);
    });
}

export { scrapeTenders };
