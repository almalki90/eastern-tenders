/**
 * خدمة ترجمة النصوص من العربية إلى الإنجليزية
 * تستخدم MyMemory Translation API (مجاني 100%)
 */

/**
 * ترجمة نص من العربية إلى الإنجليزية باستخدام MyMemory API
 * ترجمة شاملة لأي نص عربي - مجاني 100%
 */
export async function translateToEnglish(arabicText) {
  // تنظيف النص
  const text = arabicText.trim();
  
  if (!text) {
    return arabicText;
  }
  
  try {
    const encodedText = encodeURIComponent(text);
    const url = `https://api.mymemory.translated.net/get?q=${encodedText}&langpair=ar|en`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`MyMemory API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      console.log(`🔄 ترجمة: "${text}" → "${translated}"`);
      return translated;
    }
    
    throw new Error('No translation found');
  } catch (error) {
    console.error('❌ خطأ في الترجمة:', error.message);
    // fallback: استخدام النص الأصلي
    return arabicText;
  }
}

/**
 * اختبار الخدمة
 */
export async function testTranslationService() {
  console.log('🧪 اختبار خدمة الترجمة...\n');
  
  const tests = [
    'غروب',
    'جبال في الغروب',
    'مدينة ليلية',
    'قطة لطيفة',
    'سيارة رياضية',
    'زهور ملونة',
    'بحر وشاطئ',
    'فضاء ونجوم',
    'منظر خيالي رائع',
    'قصر فخم قديم'
  ];
  
  for (const text of tests) {
    const translated = await translateToEnglish(text);
    console.log(`✅ "${text}" → "${translated}"`);
  }
  
  console.log('\n✅ الاختبار انتهى!');
}

// اختبار إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testTranslationService();
}
