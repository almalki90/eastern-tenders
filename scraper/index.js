import { scrapeTendersAlerts } from './tendersalerts-scraper.js';

async function scrapeTenders() {
  console.log('🚀 بدء عملية جمع بيانات المناقصات...\n');
  
  // استخدام TendersAlerts مباشرة
  console.log('📡 جمع البيانات من TendersAlerts - المنطقة الشرقية...');
  const tenders = await scrapeTendersAlerts();
  
  console.log(`\n✅ تم جمع ${tenders.length} مناقصة بنجاح`);
  
  return tenders;
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
