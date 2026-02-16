# 🚀 دليل الاستخدام السريع

## 📖 للمستخدمين

### 🌐 الوصول للموقع
زر الموقع على: **https://almalki90.github.io/eastern-tenders**

### 📡 الاشتراك في RSS Feed
أضف هذا الرابط لقارئ RSS المفضل لديك:
```
https://almalki90.github.io/eastern-tenders/feed.xml
```

### 🤖 الربط مع بوت تليجرام

#### الطريقة 1: استخدام Bot جاهز
1. افتح [@TheFeedReaderBot](https://t.me/TheFeedReaderBot)
2. أرسل الأمر: `/add https://almalki90.github.io/eastern-tenders/feed.xml`
3. ستصلك إشعارات عند كل مناقصة جديدة!

#### الطريقة 2: استخدام JSON API
```python
import requests
import telegram

# قراءة البيانات
response = requests.get('https://almalki90.github.io/eastern-tenders/data/tenders.json')
tenders = response.json()

# إرسال للتليجرام
bot = telegram.Bot(token='YOUR_BOT_TOKEN')
for tender in tenders[:5]:
    message = f"""
🏛️ *{tender['title']}*

📍 المنطقة: {tender['region']}
🏢 الجهة: {tender['entity']}
📅 آخر موعد: {tender['deadline']}

🔗 [التفاصيل]({tender['link']})
    """
    bot.send_message(chat_id='YOUR_CHAT_ID', text=message, parse_mode='Markdown')
```

---

## 💻 للمطورين

### 🛠️ التثبيت المحلي
```bash
# استنساخ المشروع
git clone https://github.com/almalki90/eastern-tenders.git
cd eastern-tenders

# تثبيت المكتبات
npm install

# توليد بيانات تجريبية
npm run mock

# توليد RSS Feed
npm run generate-rss

# تشغيل الموقع محلياً
npm run dev
# افتح: http://localhost:8000
```

### 🕷️ تشغيل Scraper الحقيقي
```bash
# تثبيت Playwright browsers
npx playwright install chromium
npx playwright install-deps

# جمع البيانات الحقيقية
npm run scrape

# Build كامل
npm run build:real
```

### 📊 API Endpoints

#### الحصول على جميع المناقصات
```bash
GET https://almalki90.github.io/eastern-tenders/data/tenders.json
```

**Response:**
```json
[
  {
    "id": "unique-id",
    "title": "مناقصة إنشاء في الدمام",
    "description": "وصف المناقصة...",
    "location": "الدمام",
    "region": "الدمام",
    "deadline": "2024-12-31",
    "entity": "أمانة المنطقة الشرقية",
    "link": "https://...",
    "source": "منصة إعلان",
    "status": "active",
    "scrapedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### RSS Feed
```bash
GET https://almalki90.github.io/eastern-tenders/feed.xml
GET https://almalki90.github.io/eastern-tenders/atom.xml
```

---

## ⏰ التحديثات التلقائية

يتم تحديث البيانات **تلقائياً كل 12 ساعة** عبر GitHub Actions:
- 🕐 12:00 AM (منتصف الليل)
- 🕐 12:00 PM (منتصف النهار)

---

## 🎨 تخصيص الموقع

### تعديل الألوان
عدّل ملف `public/index.html` - القسم `<style>`:
```css
.bg-gradient-to-br {
    background: linear-gradient(to bottom right, #your-color-1, #your-color-2);
}
```

### إضافة مناطق جديدة
عدّل ملف `scraper/index.js`:
```javascript
const EASTERN_REGIONS = [
  'الدمام',
  'الخبر',
  // أضف مناطق جديدة هنا
  'منطقتك الجديدة'
];
```

---

## 🐛 حل المشاكل

### المشكلة: لا تظهر بيانات
**الحل:**
```bash
# تأكد من وجود البيانات
cat data/tenders.json

# إذا كانت فارغة، ولّد بيانات تجريبية
npm run mock && npm run generate-rss
```

### المشكلة: RSS Feed لا يعمل
**الحل:**
تأكد من وجود الملفات:
- `public/feed.xml`
- `public/atom.xml`

```bash
# أعد توليد RSS
npm run generate-rss
```

### المشكلة: GitHub Actions فشل
**الحل:**
1. افتح: https://github.com/almalki90/eastern-tenders/actions
2. اضغط على آخر workflow فاشل
3. اقرأ الـ logs لمعرفة السبب
4. غالباً يكون السبب: Playwright browsers غير مثبتة

---

## 📞 الدعم

هل واجهت مشكلة؟
- 📧 افتح [GitHub Issue](https://github.com/almalki90/eastern-tenders/issues)
- 💬 أو أرسل Pull Request!

---

## 🎯 الميزات القادمة

- [ ] إضافة المزيد من المصادر
- [ ] دعم إشعارات البريد الإلكتروني
- [ ] فلترة متقدمة حسب الفئات
- [ ] تطبيق موبايل
- [ ] Dashboard للإحصائيات

---

**صُنع بـ ❤️ للمنطقة الشرقية**
