/**
 * خدمة ترجمة النصوص من العربية إلى الإنجليزية
 * تستخدم قاموس محلي فقط - سريع وموثوق
 */

/**
 * قاموس ترجمة شامل
 */
const DICTIONARY = {
  // طبيعة ومناظر
  'طبيعة': 'nature',
  'طبيعي': 'nature',
  'منظر': 'landscape',
  'مناظر': 'landscape',
  'جبال': 'mountains',
  'جبل': 'mountain',
  'غروب': 'sunset',
  'شروق': 'sunrise',
  'بحر': 'ocean sea',
  'محيط': 'ocean',
  'شاطئ': 'beach',
  'غابة': 'forest',
  'غابات': 'forest',
  'صحراء': 'desert',
  'سماء': 'sky',
  'نجوم': 'stars',
  'فضاء': 'space',
  'شلال': 'waterfall',
  'نهر': 'river',
  'بحيرة': 'lake',
  'وادي': 'valley',
  'كهف': 'cave',
  
  // مدن وعمارة
  'مدينة': 'city',
  'مدن': 'cities',
  'ليل': 'night',
  'ليلي': 'night',
  'ليلية': 'night',
  'نهار': 'day',
  'شارع': 'street',
  'شوارع': 'streets',
  'برج': 'tower',
  'ابراج': 'towers',
  'جسر': 'bridge',
  'مبنى': 'building',
  'مباني': 'buildings',
  'قصر': 'palace castle',
  'منزل': 'house',
  'بيت': 'house',
  
  // حيوانات
  'حيوان': 'animal',
  'حيوانات': 'animals',
  'قطة': 'cat',
  'قطط': 'cats',
  'كلب': 'dog',
  'كلاب': 'dogs',
  'طائر': 'bird',
  'طيور': 'birds',
  'حصان': 'horse',
  'خيول': 'horses',
  'سمك': 'fish',
  'اسماك': 'fish',
  'فيل': 'elephant',
  'اسد': 'lion',
  'نمر': 'tiger',
  'دب': 'bear',
  'ذئب': 'wolf',
  
  // ألوان
  'ابيض': 'white',
  'اسود': 'black',
  'احمر': 'red',
  'ازرق': 'blue',
  'اخضر': 'green',
  'اصفر': 'yellow',
  'برتقالي': 'orange',
  'بنفسجي': 'purple',
  'وردي': 'pink',
  'ذهبي': 'golden',
  'فضي': 'silver',
  
  // صفات
  'جميل': 'beautiful',
  'جميلة': 'beautiful',
  'رائع': 'amazing wonderful',
  'رائعة': 'amazing',
  'خيالي': 'fantasy',
  'خيالية': 'fantasy',
  'قديم': 'old ancient',
  'قديمة': 'old',
  'عصري': 'modern',
  'عصرية': 'modern',
  'كلاسيكي': 'classic',
  'كلاسيكية': 'classic',
  'فخم': 'luxury',
  'فخمة': 'luxury',
  'كبير': 'big large',
  'كبيرة': 'big',
  'صغير': 'small',
  'صغيرة': 'small',
  'عالي': 'high tall',
  'عالية': 'high',
  'واسع': 'wide',
  'واسعة': 'wide',
  'ضيق': 'narrow',
  'مظلم': 'dark',
  'مظلمة': 'dark',
  'مضيء': 'bright',
  'ملون': 'colorful',
  'لطيف': 'cute',
  'لطيفة': 'cute',
  'ساحر': 'charming',
  'ساحرة': 'charming',
  
  // أشياء وأدوات
  'سيارة': 'car',
  'سيارات': 'cars',
  'طائرة': 'airplane',
  'قارب': 'boat',
  'دراجة': 'bicycle',
  'زهور': 'flowers',
  'زهرة': 'flower',
  'ورود': 'roses',
  'وردة': 'rose',
  'شجرة': 'tree',
  'اشجار': 'trees',
  'نباتات': 'plants',
  'حديقة': 'garden',
  
  // رياضة وألعاب
  'رياضة': 'sport',
  'رياضي': 'sport',
  'رياضية': 'sport',
  'لعبة': 'game',
  'العاب': 'games',
  'كرة': 'ball',
  'انمي': 'anime',
  'كرتون': 'cartoon',
  
  // فن وتصميم
  'فن': 'art',
  'فني': 'art',
  'فنية': 'art',
  'رسم': 'painting drawing',
  'تصميم': 'design',
  'لوحة': 'painting',
  'صورة': 'picture image',
  
  // أطفال
  'طفل': 'child kid',
  'اطفال': 'kids children',
  'اولاد': 'boys',
  'بنات': 'girls'
};

/**
 * ترجمة نص من العربية إلى الإنجليزية
 * يستخدم القاموس المحلي فقط - فوري ودقيق
 */
export async function translateToEnglish(arabicText) {
  const text = arabicText.trim();
  if (!text) return arabicText;

  // ترجمة الكلمات من القاموس
  const words = text.toLowerCase().split(/\s+/);
  const translatedWords = [];
  
  for (const word of words) {
    // تجاهل حروف الربط
    if (['في', 'و', 'من', 'إلى', 'على', 'مع', 'عن', 'ال'].includes(word)) {
      continue;
    }
    
    // إزالة "ال" التعريف من بداية الكلمة
    let cleanWord = word;
    if (word.startsWith('ال')) {
      cleanWord = word.substring(2);
    }
    
    // البحث في القاموس
    if (DICTIONARY[cleanWord]) {
      translatedWords.push(DICTIONARY[cleanWord]);
    } else if (DICTIONARY[word]) {
      translatedWords.push(DICTIONARY[word]);
    }
  }
  
  // إذا وجدنا ترجمات، استخدمها
  if (translatedWords.length > 0) {
    const result = translatedWords.join(' ');
    console.log(`✅ ترجمة: "${text}" → "${result}"`);
    return result;
  }

  // fallback: استخدام النص الأصلي (Wallhaven يدعم Unicode)
  console.log(`⚠️ لم توجد ترجمة لـ "${text}"، استخدام النص الأصلي`);
  return arabicText;
}

/**
 * اختبار الخدمة
 */
export async function testTranslationService() {
  console.log('🧪 اختبار خدمة الترجمة (قاموس محلي)...\n');
  
  const tests = [
    'غروب',
    'شروق',
    'جبال',
    'جبال في الغروب',
    'بحر',
    'مدينة ليلية',
    'قطة جميلة',
    'سيارة رياضية',
    'قصر فخم قديم',
    'منظر طبيعي ساحر',
    'غابة مظلمة',
    'زهور ملونة'
  ];
  
  for (const text of tests) {
    const translated = await translateToEnglish(text);
    console.log(`📝 "${text}" → "${translated}"\n`);
  }
  
  console.log('✅ الاختبار انتهى!');
}

// اختبار إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testTranslationService();
}
