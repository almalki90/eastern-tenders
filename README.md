# 🏛️ مناقصات المنطقة الشرقية | Eastern Province Tenders

<div align="center">

![Banner](https://img.shields.io/badge/المناقصات-المنطقة_الشرقية-0066cc?style=for-the-badge)
![Status](https://img.shields.io/badge/الحالة-نشط-success?style=for-the-badge)
![Auto Update](https://img.shields.io/badge/تحديث-كل_12_ساعة-orange?style=for-the-badge)

**نظام ذكي لجمع وعرض المناقصات والترسيات في المنطقة الشرقية**

[🌐 عرض الموقع](https://almalki90.github.io/eastern-tenders/) | [📡 RSS Feed](https://almalki90.github.io/eastern-tenders/feed.xml) | [💾 JSON API](https://almalki90.github.io/eastern-tenders/data/tenders.json)

</div>

---

## 📋 نظرة عامة

نظام تلقائي متكامل لجمع وعرض المناقصات والترسيات من المنصات الحكومية السعودية، مع تركيز خاص على مناطق المنطقة الشرقية:

- 🏙️ **الدمام** - Dammam
- 🌊 **الخبر** - Khobar
- 🏢 **الظهران** - Dhahran
- 🏖️ **أم الساهك** - Um Al-Sahek
- 🌴 **القطيف** - Qatif
- 🏭 **الجبيل** - Jubail
- 🌵 **النعيرية** - Nairyah
- ⚓ **رأس الخير** - Ras Al Khair
- 🏜️ **حفر الباطن** - Hafar Al-Batin
- 🌾 **الأحساء** - Al-Ahsa
- 🏞️ **الحفر** - Al-Hofuf
- ⚡ **الخفجي** - Khafji

---

## ✨ المميزات

### 🤖 جمع تلقائي للبيانات
- ✅ تحديث تلقائي كل **12 ساعة** عبر GitHub Actions
- ✅ جمع من منصة **إعلان** (monafasat.gov.sa)
- ✅ جمع من منصة **فرصة** (forsa.gov.sa)
- ✅ فلترة ذكية للمنطقة الشرقية فقط

### 📡 خدمات RSS
- 🔔 **RSS 2.0 Feed** - للاشتراك في التحديثات
- 🔔 **Atom Feed** - خيار بديل للـ RSS
- 🤖 **قابل للربط** مع بوتات تليجرام
- 🤖 **بوت تليجرام متكامل** - إرسال تلقائي للمناقصات الجديدة كل 12 ساعة

### 🌐 واجهة احترافية
- 🎨 تصميم عصري وجميل باستخدام Tailwind CSS
- 🔍 بحث متقدم في المناقصات
- 🗂️ فلترة حسب المنطقة والجهة
- 📊 إحصائيات مباشرة
- 📱 متجاوب مع جميع الأجهزة

### 💾 API مجاني
- 📥 JSON API متاح للجميع
- 🔓 بدون قيود أو authentication
- ⚡ سريع ومستضاف على GitHub Pages

---

## 🚀 التقنيات المستخدمة

```
Frontend:
  ├── HTML5 + CSS3 + JavaScript
  ├── Tailwind CSS
  ├── Font Awesome Icons
  └── Google Fonts (Cairo)

Backend:
  ├── Node.js
  ├── Playwright (Web Scraping)
  ├── Cheerio (HTML Parsing)
  └── Axios (HTTP Client)

DevOps:
  ├── GitHub Actions (CI/CD)
  ├── GitHub Pages (Hosting)
  └── Cron Jobs (Scheduling)
```

---

## 📊 البيانات المتاحة

### JSON Structure
```json
{
  "id": "unique-id",
  "title": "عنوان المناقصة",
  "description": "وصف المناقصة",
  "location": "الموقع",
  "region": "المنطقة",
  "deadline": "2024-12-31",
  "entity": "الجهة الحكومية",
  "link": "https://...",
  "source": "منصة إعلان",
  "status": "active",
  "scrapedAt": "2024-01-15T10:30:00Z"
}
```

---

## 🔗 الروابط المتاحة

| الخدمة | الرابط | الوصف |
|--------|--------|-------|
| 🌐 **الموقع** | [eastern-tenders](https://almalki90.github.io/eastern-tenders/) | الواجهة الرئيسية |
| 📡 **RSS Feed** | [feed.xml](https://almalki90.github.io/eastern-tenders/feed.xml) | للاشتراك في RSS |
| 🔔 **Atom Feed** | [atom.xml](https://almalki90.github.io/eastern-tenders/atom.xml) | بديل للـ RSS |
| 💾 **JSON API** | [tenders.json](https://almalki90.github.io/eastern-tenders/data/tenders.json) | البيانات الخام |

---

## 🤖 الربط مع بوت تليجرام

### ✨ **نظام البوت المتكامل (مدمج)**
النظام يرسل تلقائياً للتليجرام كل 12 ساعة:
- ✅ إرسال المناقصات الجديدة فقط (بدون تكرار)
- ✅ تنسيق احترافي مع جميع التفاصيل
- ✅ إحصائيات ومتابعة شاملة
- ✅ رسائل مفصلة لكل مناقصة

**للإعداد:** راجع [TELEGRAM-SETUP.md](TELEGRAM-SETUP.md)

---

### الطريقة الأولى: RSS to Telegram Bot
استخدم بوتات جاهزة مثل:
- [@TheFeedReaderBot](https://t.me/TheFeedReaderBot)
- [@RobotRSS_Bot](https://t.me/RobotRSS_Bot)

أضف الرابط:
```
https://almalki90.github.io/eastern-tenders/feed.xml
```

### الطريقة الثانية: Custom Bot
```python
import requests

# قراءة البيانات من JSON API
response = requests.get('https://almalki90.github.io/eastern-tenders/data/tenders.json')
tenders = response.json()

# إرسال إلى تليجرام
for tender in tenders[:5]:  # آخر 5 مناقصات
    message = f"""
🏛️ {tender['title']}
📍 {tender['region']}
🏢 {tender['entity']}
📅 آخر موعد: {tender['deadline']}
🔗 {tender['link']}
    """
    # أرسل الرسالة للبوت
```

---

## ⚙️ التثبيت المحلي

```bash
# استنساخ المشروع
git clone https://github.com/almalki90/eastern-tenders.git
cd eastern-tenders

# تثبيت المكتبات
npm install

# تثبيت Playwright browsers
npx playwright install chromium

# جمع البيانات
npm run scrape

# توليد RSS Feed
npm run generate-rss

# تشغيل الموقع محلياً
npm run dev
# افتح: http://localhost:8000
```

---

## 📅 جدولة التحديثات

يتم تحديث البيانات **تلقائياً كل 12 ساعة** عبر GitHub Actions:

```yaml
schedule:
  - cron: '0 */12 * * *'  # كل 12 ساعة
```

**أوقات التحديث:**
- 🕐 **12:00 AM** (منتصف الليل)
- 🕐 **12:00 PM** (منتصف النهار)

---

## 📈 الإحصائيات

<div align="center">

![GitHub Stars](https://img.shields.io/github/stars/almalki90/eastern-tenders?style=social)
![GitHub Forks](https://img.shields.io/github/forks/almalki90/eastern-tenders?style=social)
![GitHub Watchers](https://img.shields.io/github/watchers/almalki90/eastern-tenders?style=social)

</div>

---

## 🤝 المساهمة

المشروع مفتوح المصدر! يمكنك المساهمة عبر:

1. 🍴 Fork المشروع
2. 🔨 أنشئ branch جديد (`git checkout -b feature/amazing-feature`)
3. 💾 Commit تغييراتك (`git commit -m 'إضافة ميزة رائعة'`)
4. 📤 Push للـ branch (`git push origin feature/amazing-feature`)
5. 🎉 افتح Pull Request

---

## 📜 الترخيص

MIT License - مفتوح المصدر للجميع

---

## 📞 التواصل

لأي استفسارات أو اقتراحات:
- 📧 عبر GitHub Issues
- 💬 عبر Pull Requests

---

## 🎯 خارطة الطريق

- [x] جمع تلقائي من منصة إعلان
- [x] جمع من منصة فرصة
- [x] RSS Feed
- [x] واجهة احترافية
- [x] GitHub Pages deployment
- [ ] إضافة المزيد من المصادر
- [ ] نظام إشعارات متقدم
- [ ] تحليلات وإحصائيات متقدمة
- [ ] دعم لغات إضافية

---

<div align="center">

**صُنع بـ ❤️ في المنطقة الشرقية**

⭐ إذا أعجبك المشروع، لا تنسَ وضع نجمة!

</div>
