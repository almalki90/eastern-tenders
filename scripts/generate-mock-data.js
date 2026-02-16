import fs from 'fs';
import path from 'path';

console.log('🚀 بدء عملية توليد بيانات تجريبية...\n');

// المناطق المستهدفة
const EASTERN_REGIONS = ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'الجبيل', 'الأحساء', 'حفر الباطن', 'النعيرية', 'رأس الخير', 'الخفجي'];

// توليد بيانات تجريبية
function generateMockTenders() {
  const types = ['صيانة', 'إنشاء', 'توريد', 'تشغيل', 'استشارات', 'تطوير'];
  const entities = [
    'أمانة المنطقة الشرقية',
    'وزارة التعليم',
    'وزارة الصحة',
    'أرامكو السعودية',
    'الهيئة الملكية للجبيل',
    'شركة الكهرباء',
    'وزارة الشؤون البلدية',
    'الهيئة العامة للطرق',
  ];
  
  const mockTenders = [];
  
  for (let i = 0; i < 25; i++) {
    const city = EASTERN_REGIONS[Math.floor(Math.random() * EASTERN_REGIONS.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 60) + 5);
    
    mockTenders.push({
      id: `tender-${Date.now()}-${i}`,
      title: `مناقصة ${type} في ${city}`,
      description: `مناقصة لأعمال ${type} في منطقة ${city} - المنطقة الشرقية. تتضمن الأعمال التصميم والتنفيذ والصيانة حسب المواصفات المطلوبة.`,
      location: city,
      region: city,
      deadline: futureDate.toISOString().split('T')[0],
      entity: entity,
      link: `https://www.monafasat.gov.sa/tender/${100000 + i}`,
      source: 'منصة إعلان',
      status: 'active',
      scrapedAt: new Date().toISOString()
    });
  }
  
  return mockTenders;
}

// حفظ البيانات
const tenders = generateMockTenders();
const dataPath = path.join(process.cwd(), 'data', 'tenders.json');
fs.writeFileSync(dataPath, JSON.stringify(tenders, null, 2), 'utf-8');

console.log(`✅ تم توليد ${tenders.length} مناقصة تجريبية`);
console.log(`💾 تم الحفظ في: data/tenders.json\n`);

// إحصائيات
const stats = {};
tenders.forEach(t => {
  stats[t.region] = (stats[t.region] || 0) + 1;
});

console.log('📊 إحصائيات حسب المنطقة:');
Object.entries(stats).forEach(([region, count]) => {
  console.log(`   ${region}: ${count} مناقصة`);
});

console.log('\n✨ تمت العملية بنجاح!');
