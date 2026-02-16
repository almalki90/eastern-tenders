import fs from 'fs';
import path from 'path';

console.log('🚀 بدء عملية توليد بيانات (مناقصات + ترسيات)...\n');

const EASTERN_REGIONS = ['الدمام', 'الخبر', 'الظهران', 'القطيف', 'الجبيل', 'الأحساء', 'حفر الباطن', 'النعيرية', 'رأس الخير', 'الخفجي'];

function generateMockTenders() {
  const types = ['صيانة', 'إنشاء', 'توريد', 'تشغيل', 'استشارات', 'تطوير'];
  const entities = ['أمانة المنطقة الشرقية', 'وزارة التعليم', 'وزارة الصحة', 'أرامكو السعودية', 'الهيئة الملكية للجبيل', 'شركة الكهرباء'];
  
  const mockTenders = [];
  for (let i = 0; i < 12; i++) {
    const city = EASTERN_REGIONS[Math.floor(Math.random() * EASTERN_REGIONS.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 60) + 5);
    
    mockTenders.push({
      id: `tender-${Date.now()}-${i}`,
      type: 'tender',
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

function generateMockAwards() {
  const types = ['صيانة', 'إنشاء', 'توريد', 'تشغيل', 'استشارات', 'تطوير'];
  const entities = ['أمانة المنطقة الشرقية', 'وزارة التعليم', 'وزارة الصحة', 'أرامكو السعودية', 'الهيئة الملكية للجبيل', 'شركة الكهرباء'];
  const companies = ['شركة البناء المتطور', 'مؤسسة الإنشاءات الحديثة', 'شركة التقنية المتقدمة', 'مجموعة الخليج للمقاولات', 'شركة الشرق للتطوير'];
  
  const mockAwards = [];
  for (let i = 0; i < 8; i++) {
    const city = EASTERN_REGIONS[Math.floor(Math.random() * EASTERN_REGIONS.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const awardDate = new Date();
    awardDate.setDate(awardDate.getDate() - Math.floor(Math.random() * 30));
    const amount = (Math.floor(Math.random() * 50) + 10) * 100000;
    
    mockAwards.push({
      id: `award-${Date.now()}-${i}`,
      type: 'award',
      title: `ترسية مشروع ${type} في ${city}`,
      description: `تم ترسية مشروع ${type} في منطقة ${city} على ${company}. قيمة العقد: ${amount.toLocaleString('ar-SA')} ريال.`,
      location: city,
      region: city,
      awardDate: awardDate.toISOString().split('T')[0],
      entity: entity,
      winner: company,
      amount: amount,
      link: `https://www.monafasat.gov.sa/award/${200000 + i}`,
      source: 'منصة إعلان',
      status: 'awarded',
      scrapedAt: new Date().toISOString()
    });
  }
  return mockAwards;
}

const tenders = generateMockTenders();
const awards = generateMockAwards();
const allData = [...tenders, ...awards];

const dataPath = path.join(process.cwd(), 'data', 'tenders.json');
fs.writeFileSync(dataPath, JSON.stringify(allData, null, 2), 'utf-8');

console.log(`✅ تم توليد ${tenders.length} مناقصة`);
console.log(`✅ تم توليد ${awards.length} ترسية`);
console.log(`💾 إجمالي: ${allData.length} عنصر\n`);
console.log('✨ تمت العملية بنجاح!');
