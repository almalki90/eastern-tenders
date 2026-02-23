/**
 * خدمة ترجمة النصوص من العربية إلى الإنجليزية
 * تستخدم Google Translate API (مجاني)
 */

/**
 * قاموس ترجمة سريع للكلمات الشائعة
 */
const QUICK_TRANSLATIONS = {
  // مناظر طبيعية
  'مناظر': 'landscape',
  'طبيعية': 'nature',
  'طبيعه': 'nature',
  'جبال': 'mountains',
  'جبل': 'mountain',
  'بحر': 'sea',
  'بحيرة': 'lake',
  'غابة': 'forest',
  'غابات': 'forest',
  'صحراء': 'desert',
  'غروب': 'sunset',
  'شروق': 'sunrise',
  'سماء': 'sky',
  'نجوم': 'stars',
  'فضاء': 'space',
  'شلال': 'waterfall',
  'نهر': 'river',
  'وادي': 'valley',
  'كهف': 'cave',
  
  // مدن وعمارة
  'مدينة': 'city',
  'مدن': 'cities',
  'شوارع': 'streets',
  'شارع': 'street',
  'ابنية': 'buildings',
  'مباني': 'buildings',
  'برج': 'tower',
  'جسر': 'bridge',
  'ليل': 'night',
  'نهار': 'day',
  
  // حيوانات
  'حيوانات': 'animals',
  'حيوان': 'animal',
  'قطط': 'cats',
  'قطة': 'cat',
  'كلاب': 'dogs',
  'كلب': 'dog',
  'طيور': 'birds',
  'طائر': 'bird',
  'اسماك': 'fish',
  'سمك': 'fish',
  'خيول': 'horses',
  'حصان': 'horse',
  
  // فن وتصميم
  'فن': 'art',
  'فني': 'artistic',
  'رسم': 'painting',
  'رسومات': 'drawings',
  'تصميم': 'design',
  'الوان': 'colors',
  'ابيض واسود': 'black and white',
  'كلاسيكي': 'classic',
  'عصري': 'modern',
  'معاصر': 'contemporary',
  
  // سيارات وتقنية
  'سيارات': 'cars',
  'سيارة': 'car',
  'رياضية': 'sports',
  'عتيقة': 'vintage',
  'تقنية': 'technology',
  'كمبيوتر': 'computer',
  
  // ألعاب وأنمي
  'العاب': 'games',
  'لعبة': 'game',
  'انمي': 'anime',
  'كرتون': 'cartoon',
  'شخصيات': 'characters',
  
  // زهور ونباتات
  'زهور': 'flowers',
  'زهرة': 'flower',
  'ورود': 'roses',
  'وردة': 'rose',
  'نباتات': 'plants',
  'نبات': 'plant',
  'حديقة': 'garden',
  
  // بحار ومحيطات
  'بحر': 'ocean',
  'محيط': 'ocean',
  'شاطئ': 'beach',
  'امواج': 'waves',
  'موج': 'wave',
  
  // أطفال
  'اطفال': 'kids',
  'طفل': 'child',
  'لطيف': 'cute',
  'ملون': 'colorful',
  
  // ديكورات
  'غرفة': 'room',
  'مطبخ': 'kitchen',
  'حمام': 'bathroom',
  'صالة': 'living room',
  'نوم': 'bedroom',
  'جدران': 'walls',
  'جدار': 'wall',
  'سقف': 'ceiling',
  'ارضية': 'floor',
  'اثاث': 'furniture'
};

/**
 * ترجمة نص من العربية إلى الإنجليزية باستخدام MyMemory Translation API
 * مجاني 100%، بدون API key، سريع
 */
async function translateWithMyMemory(arabicText) {
  try {
    const encodedText = encodeURIComponent(arabicText);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ar|en`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('No translation found');
  } catch (error) {
    console.error('❌ خطأ في MyMemory API:', error.message);
    // fallback: استخدام النص الأصلي
    return arabicText;
  }
}

/**
 * ترجمة نص من العربية إلى الإنجليزية
 * 1️⃣ يستخدم القاموس المحلي أولاً (سريع - فوري)
 * 2️⃣ إذا فشل، يستخدم MyMemory API (مجاني - ~500ms)
 */
export async function translateToEnglish(arabicText) {
  // تنظيف النص
  const text = arabicText.trim().toLowerCase();
  
  // البحث في القاموس السريع
  if (QUICK_TRANSLATIONS[text]) {
    return QUICK_TRANSLATIONS[text];
  }
  
  // ترجمة متعددة الكلمات
  const words = text.split(/\s+/);
  const translatedWords = [];
  
  for (const word of words) {
    // تجاهل حروف الربط
    if (['في', 'و', 'من', 'إلى', 'على', 'مع', 'عن'].includes(word)) {
      continue;
    }
    
    // إزالة علامات الترقيم
    const cleanWord = word.replace(/[،؛:.!؟]/g, '');
    
    // ترجمة الكلمة
    const translated = QUICK_TRANSLATIONS[cleanWord];
    if (translated) {
      translatedWords.push(translated);
    }
  }
  
  // إذا تمت ترجمة بعض الكلمات، استخدمها
  if (translatedWords.length > 0) {
    return translatedWords.join(' ');
  }
  
  // fallback: استخدام MyMemory API للكلمات غير الموجودة
  console.log(`🔄 استخدام MyMemory API لترجمة: "${arabicText}"`);
  return await translateWithMyMemory(arabicText);
}

/**
 * اختبار الخدمة
 */
export async function testTranslationService() {
  console.log('🧪 اختبار خدمة الترجمة...\n');
  
  const tests = [
    'جبال في الغروب',
    'مدينة ليلية',
    'قطة لطيفة',
    'سيارة رياضية',
    'زهور ملونة',
    'بحر وشاطئ',
    'فضاء ونجوم',
    'منظر خيالي رائع', // اختبار كلمات جديدة (LibreTranslate)
    'غابة كثيفة مظلمة'  // اختبار كلمات جديدة (LibreTranslate)
  ];
  
  for (const text of tests) {
    const translated = await translateToEnglish(text);
    console.log(`"${text}" → "${translated}"`);
  }
  
  console.log('\n✅ الاختبار انتهى!');
}

// اختبار إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testTranslationService();
}
