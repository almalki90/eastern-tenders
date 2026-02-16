/**
 * خدمة Pexels API لجلب صور الديكور
 * مصدر إضافي للديكورات بجانب Unsplash
 */

import dotenv from 'dotenv';

dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_BASE = 'https://api.pexels.com/v1';

/**
 * فئات الديكور من Pexels (نفس فئات Unsplash)
 */
export const PEXELS_DECOR_CATEGORIES = {
  'شموع': {
    emoji: '🕯️',
    name: 'شموع',
    description: 'شموع ديكورية معطرة',
    query: 'candles home decor'
  },
  'إضاءة': {
    emoji: '💡',
    name: 'إضاءة ديكورية',
    description: 'مصابيح وإضاءة منزلية',
    query: 'decorative lighting lamps'
  },
  'فازات': {
    emoji: '🏺',
    name: 'فازات وأواني',
    description: 'فازات زهور وأواني ديكورية',
    query: 'vases home decor'
  },
  'مرايا': {
    emoji: '🪞',
    name: 'مرايا ديكورية',
    description: 'مرايا حائط وديكور',
    query: 'decorative mirrors'
  },
  'لوحات_فنية': {
    emoji: '🖼️',
    name: 'لوحات فنية',
    description: 'لوحات جدارية وفن تشكيلي',
    query: 'wall art paintings'
  },
  'ديكورات_صغيرة': {
    emoji: '🎨',
    name: 'ديكورات صغيرة',
    description: 'إكسسوارات ديكور صغيرة',
    query: 'home accessories decor'
  }
};

/**
 * جلب صورة عشوائية من Pexels
 */
export async function getRandomPexelsImage(categoryKey) {
  if (!PEXELS_API_KEY) {
    throw new Error('مفتاح Pexels API غير متوفر');
  }

  const category = PEXELS_DECOR_CATEGORIES[categoryKey];
  if (!category) {
    throw new Error(`تصنيف غير موجود: ${categoryKey}`);
  }

  try {
    // استخدام Search endpoint مع صفحة عشوائية
    const randomPage = Math.floor(Math.random() * 10) + 1; // صفحات 1-10
    const url = new URL(`${PEXELS_API_BASE}/search`);
    url.searchParams.append('query', category.query);
    url.searchParams.append('per_page', '15'); // 15 صورة لكل صفحة
    url.searchParams.append('page', randomPage);
    url.searchParams.append('orientation', 'landscape');

    const response = await fetch(url, {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Pexels API Error: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (!data.photos || data.photos.length === 0) {
      throw new Error('لم يتم العثور على صور');
    }

    // اختيار صورة عشوائية من النتائج
    const randomIndex = Math.floor(Math.random() * data.photos.length);
    const photo = data.photos[randomIndex];

    return {
      url: photo.src.large, // جودة كبيرة
      downloadUrl: photo.src.original, // جودة أصلية
      author: photo.photographer,
      authorUrl: photo.photographer_url,
      pexelsUrl: photo.url,
      description: photo.alt || category.name,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      categoryDescription: category.description,
      source: 'Pexels API',
      sourceKey: 'pexels'
    };

  } catch (error) {
    console.error('❌ خطأ في Pexels API:', error.message);
    throw error;
  }
}

/**
 * جلب صورة عشوائية من أي فئة ديكور
 */
export async function getRandomPexelsDecorImage() {
  const categories = Object.keys(PEXELS_DECOR_CATEGORIES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return getRandomPexelsImage(randomCategory);
}

/**
 * اختبار الخدمة
 */
export async function testPexelsService() {
  console.log('🧪 اختبار خدمة Pexels API...\n');

  try {
    console.log('📦 الفئات المتاحة:');
    for (const [key, cat] of Object.entries(PEXELS_DECOR_CATEGORIES)) {
      console.log(`${cat.emoji} ${cat.name}`);
    }

    console.log('\n🎲 جلب صورة عشوائية من فئة "شموع"...');
    const image = await getRandomPexelsImage('شموع');

    console.log(`✅ تم جلب الصورة بنجاح!`);
    console.log(`📸 العنوان: ${image.description}`);
    console.log(`👤 المصور: ${image.author}`);
    console.log(`🔗 الرابط: ${image.url}`);
    console.log(`📦 المصدر: ${image.source}`);

    console.log('\n✅ الاختبار نجح!');
  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
  }
}

// تشغيل الاختبار إذا تم تنفيذ الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testPexelsService();
}
