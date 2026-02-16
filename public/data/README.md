# Eastern Province Tenders - Data Directory

هذا المجلد يحتوي على البيانات المجمعة من منصات المناقصات الحكومية.

## الملفات:

- `tenders.json` - البيانات الخام بصيغة JSON
- يتم تحديث البيانات تلقائياً كل 12 ساعة

## الوصول للبيانات:

```bash
# عبر API
https://almalki90.github.io/eastern-tenders/data/tenders.json

# محلياً
./data/tenders.json
```

## البنية:

```json
[
  {
    "id": "unique-id",
    "title": "عنوان المناقصة",
    "description": "الوصف",
    "location": "الموقع",
    "region": "المنطقة",
    "deadline": "التاريخ",
    "entity": "الجهة",
    "link": "الرابط",
    "source": "المصدر",
    "status": "active",
    "scrapedAt": "ISO 8601 Date"
  }
]
```
