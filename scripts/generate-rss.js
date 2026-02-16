import fs from 'fs';
import path from 'path';

function generateRSS() {
  console.log('📡 بدء توليد RSS Feed...\n');
  
  // قراءة البيانات
  const dataPath = path.join(process.cwd(), 'data', 'tenders.json');
  
  if (!fs.existsSync(dataPath)) {
    console.error('❌ لم يتم العثور على ملف البيانات!');
    process.exit(1);
  }
  
  const tenders = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  
  const now = new Date().toUTCString();
  const baseUrl = 'https://almalki90.github.io/eastern-tenders';
  
  // إنشاء RSS Feed
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>مناقصات المنطقة الشرقية</title>
    <link>${baseUrl}</link>
    <description>آخر المناقصات والترسيات في المنطقة الشرقية - الدمام، الخبر، الظهران، القطيف، الجبيل، الأحساء</description>
    <language>ar</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>Eastern Province Tenders System</generator>
    <ttl>720</ttl>
`;

  // إضافة المناقصات كعناصر
  tenders.slice(0, 50).forEach(tender => {
    const pubDate = tender.scrapedAt ? new Date(tender.scrapedAt).toUTCString() : now;
    
    rss += `
    <item>
      <title><![CDATA[${tender.title}]]></title>
      <link>${tender.link || baseUrl}</link>
      <guid isPermaLink="false">${tender.id}</guid>
      <description><![CDATA[
        <p><strong>الموقع:</strong> ${tender.location || 'غير محدد'}</p>
        <p><strong>الجهة:</strong> ${tender.entity || 'غير محدد'}</p>
        <p><strong>آخر موعد:</strong> ${tender.deadline || 'غير محدد'}</p>
        <p><strong>الوصف:</strong> ${tender.description || 'لا يوجد وصف'}</p>
        <p><strong>المصدر:</strong> ${tender.source || 'غير محدد'}</p>
      ]]></description>
      <pubDate>${pubDate}</pubDate>
      <category>${tender.region || 'المنطقة الشرقية'}</category>
      <source url="${tender.link || baseUrl}">${tender.source || 'مناقصات المنطقة الشرقية'}</source>
    </item>`;
  });

  rss += `
  </channel>
</rss>`;

  // حفظ RSS Feed
  const rssPath = path.join(process.cwd(), 'public', 'feed.xml');
  fs.writeFileSync(rssPath, rss, 'utf-8');
  
  console.log(`✅ تم توليد RSS Feed بنجاح: public/feed.xml`);
  console.log(`📊 عدد العناصر: ${Math.min(tenders.length, 50)}`);
  console.log(`🔗 رابط RSS: ${baseUrl}/feed.xml\n`);
  
  // إنشاء Atom Feed أيضاً
  generateAtomFeed(tenders, baseUrl);
}

function generateAtomFeed(tenders, baseUrl) {
  const now = new Date().toISOString();
  
  let atom = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>مناقصات المنطقة الشرقية</title>
  <link href="${baseUrl}"/>
  <link href="${baseUrl}/atom.xml" rel="self"/>
  <id>${baseUrl}</id>
  <updated>${now}</updated>
  <subtitle>آخر المناقصات والترسيات في المنطقة الشرقية</subtitle>
  <generator>Eastern Province Tenders System</generator>
`;

  tenders.slice(0, 50).forEach(tender => {
    const updated = tender.scrapedAt || now;
    
    atom += `
  <entry>
    <title>${escapeXml(tender.title)}</title>
    <link href="${tender.link || baseUrl}"/>
    <id>${tender.id}</id>
    <updated>${updated}</updated>
    <summary type="html"><![CDATA[
      الموقع: ${tender.location || 'غير محدد'} | 
      الجهة: ${tender.entity || 'غير محدد'} | 
      آخر موعد: ${tender.deadline || 'غير محدد'}
    ]]></summary>
    <category term="${tender.region || 'المنطقة الشرقية'}"/>
  </entry>`;
  });

  atom += `
</feed>`;

  const atomPath = path.join(process.cwd(), 'public', 'atom.xml');
  fs.writeFileSync(atomPath, atom, 'utf-8');
  
  console.log(`✅ تم توليد Atom Feed بنجاح: public/atom.xml\n`);
}

function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// تشغيل السكريبت
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRSS();
}

export { generateRSS };
