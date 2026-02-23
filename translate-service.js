/**
 * خدمة ترجمة النصوص من العربية إلى الإنجليزية
 * تستخدم قاموس محلي أولاً ثم MyMemory API كـ fallback
 */

/**
 * قاموس ترجمة للكلمات الشائعة (أولوية عالية)
 */
const DICTIONARY = {
  // طبيعة
  'جبال': 'mountains',
  'جبل': 'mountain',
  'غروب': 'sunset',
  'شروق': 'sunrise',
  'بحر': 'ocean sea',
  'شاطئ': 'beach',
  'غابة': 'forest',
  'صحراء': 'desert',
  'سماء': 'sky',
  'نجوم': 'stars',
  'فضاء': 'space',
  'شلال': 'waterfall',
  'نهر': 'river',
  'بحيرة': 'lake',
  
  // مدن
  'مدينة': 'city',
  'ليل': 'night',
  'ليلية': 'night',
  'نهار': 'day',
  'شارع': 'street',
  'برج': 'tower',
  
  // حيوانات
  'قطة': 'cat',
  'كلب': 'dog',
  'طائر': 'bird',
  'حصان': 'horse',
  'سمك': 'fish',
  
  // ألوان وصفات
  'ملون': 'colorful',
  'جميل': 'beautiful',
  'رائع': 'amazing',
  'خيالي': 'fantasy',
  'قديم': 'old ancient',
  'عصري': 'modern',
  'كلاسيكي': 'classic',
  
  // أشياء
  'سيارة': 'car',
  'قصر': 'palace castle',
  'منزل': 'house',
  'زهور': 'flowers',
  'شجرة': 'tree'
};

/**
 * ترجمة باستخدام MyMemory API
 */
async function translateWithAPI(text) {
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ar|en`;
    
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return null;
  } catch (error) {
    console.error('❌ MyMemory API error:', error.message);
    return null;
  }
}

/**
 * ترجمة نص من العربية إلى الإنجليزية
 */
export async function translateToEnglish(arabicText) {
  const text = arabicText.trim();
  if (!text) return arabicText;

  // 1️⃣ محاولة الترجمة من القاموس (فوري)
  const words = text.toLowerCase().split(/\s+/);
  const translatedWords = [];
  
  for (const word of words) {
    if (DICTIONARY[word]) {
      translatedWords.push(DICTIONARY[word]);
    }
  }
  
  if (translatedWords.length > 0) {
    const result = translatedWords.join(' ');
    console.log(`✅ قاموس: "${text}" → "${result}"`);
    return result;
  }

  // 2️⃣ محاولة الترجمة عبر API (~500ms)
  console.log(`🔄 API: "${text}"...`);
  const apiResult = await translateWithAPI(text);
  
  if (apiResult) {
    console.log(`✅ API: "${text}" → "${apiResult}"`);
    return apiResult;
  }

  // 3️⃣ fallback: استخدام النص الأصلي
  console.warn(`⚠️ فشل: "${text}" → استخدام النص الأصلي`);
  return arabicText;
}

/**
 * اختبار الخدمة
 */
export async function testTranslationService() {
  console.log('🧪 اختبار خدمة الترجمة...\n');
  
  const tests = [
    'غروب',
    'شروق', 
    'جبال',
    'بحر',
    'مدينة ليلية',
    'قطة جميلة',
    'منظر خيالي رائع'
  ];
  
  for (const text of tests) {
    const translated = await translateToEnglish(text);
    console.log(`\n📝 "${text}" → "${translated}"`);
  }
  
  console.log('\n✅ الاختبار انتهى!');
}

// اختبار إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testTranslationService();
}
