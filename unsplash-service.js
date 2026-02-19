/**
 * خدمة Unsplash API لجلب صور الديكور
 * مصدر رابع: صور ديكور حقيقية من Unsplash
 */

import dotenv from 'dotenv';

dotenv.config();

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_BASE = 'https://api.unsplash.com';

/**
 * فئات الديكور من Unsplash
 * هذه فئات ديكور حقيقية (ليست أثاث)
 */
export const UNSPLASH_DECOR_CATEGORIES = {
  'شموع': {
    emoji: '🕯️',
    name: 'شموع',
    description: 'شموع ديكورية معطرة',
    queries: ['candles home decor', 'scented candles', 'decorative candles'],
    query: 'candles home decor'
  },
  'إضاءة': {
    emoji: '💡',
    name: 'إضاءة ديكورية',
    description: 'مصابيح وإضاءة منزلية',
    queries: ['table lamps', 'floor lamps', 'pendant lights', 'decorative lighting'],
    query: 'decorative lighting'
  },
  'فازات': {
    emoji: '🏺',
    name: 'فازات وأواني',
    description: 'فازات زهور وأواني ديكورية',
    queries: ['vases', 'decorative pots', 'flower vases'],
    query: 'vases'
  },
  'مرايا': {
    emoji: '🪞',
    name: 'مرايا ديكورية',
    description: 'مرايا حائط وديكور',
    queries: ['decorative mirrors', 'wall mirrors', 'round mirrors'],
    query: 'decorative mirrors'
  },
  'لوحات_فنية': {
    emoji: '🖼️',
    name: 'لوحات فنية',
    description: 'لوحات جدارية وفن تشكيلي',
    queries: ['wall art', 'paintings', 'art prints', 'framed art'],
    query: 'wall art'
  },
  'ديكورات_صغيرة': {
    emoji: '🎨',
    name: 'ديكورات صغيرة',
    description: 'إكسسوارات ديكور صغيرة',
    queries: ['home accessories', 'decorative objects', 'small decor'],
    query: 'home accessories'
  },
  'غرف_نوم': {
    emoji: '🛏️',
    name: 'غرف نوم',
    description: 'تصاميم غرف نوم عصرية',
    queries: ['bedroom interior', 'modern bedroom', 'bedroom design'],
    query: 'bedroom interior design'
  },
  'مطابخ': {
    emoji: '🍳',
    name: 'مطابخ',
    description: 'تصاميم مطابخ عصرية',
    queries: ['kitchen interior', 'modern kitchen', 'kitchen design'],
    query: 'modern kitchen interior'
  },
  'مداخل': {
    emoji: '🚪',
    name: 'مداخل',
    description: 'تصاميم مداخل وممرات',
    queries: ['entryway design', 'foyer interior', 'entrance hall'],
    query: 'entryway interior design'
  },
  'صالات': {
    emoji: '🛋️',
    name: 'صالات',
    description: 'تصاميم صالات وغرف معيشة',
    queries: ['living room interior', 'modern living room', 'lounge design'],
    query: 'living room interior design'
  },
  'أرضيات': {
    emoji: '🟫',
    name: 'أرضيات',
    description: 'أنواع أرضيات وبلاط',
    queries: ['flooring design', 'floor tiles', 'wooden floors', 'marble floors'],
    query: 'modern flooring design'
  },
  'أسقف': {
    emoji: '⬜',
    name: 'أسقف',
    description: 'تصاميم أسقف مستعارة وديكور',
    queries: ['ceiling design', 'false ceiling', 'ceiling decor'],
    query: 'modern ceiling design'
  }
};

/**
 * جلب صورة عشوائية من Unsplash
 */
export async function getRandomUnsplashImage(categoryKey) {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('مفتاح Unsplash API غير متوفر');
  }

  const category = UNSPLASH_DECOR_CATEGORIES[categoryKey];
  if (!category) {
    throw new Error(`تصنيف غير موجود: ${categoryKey}`);
  }

  try {
    // استخدام Random endpoint للحصول على صورة عشوائية
    const url = new URL(`${UNSPLASH_API_BASE}/photos/random`);
    url.searchParams.append('query', category.query);
    url.searchParams.append('orientation', 'landscape');
    url.searchParams.append('content_filter', 'high');
    url.searchParams.append('count', '1');

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Unsplash API Error: ${response.status} - ${errorData.errors?.[0] || 'Unknown error'}`);
    }

    const data = await response.json();
    const photo = Array.isArray(data) ? data[0] : data;

    if (!photo || !photo.urls) {
      throw new Error('لم يتم العثور على صور');
    }

    return {
      url: photo.urls.regular, // جودة متوسطة للسرعة
      downloadUrl: photo.urls.full, // جودة عالية
      author: photo.user.name,
      authorUrl: photo.user.links.html,
      unsplashUrl: photo.links.html,
      description: photo.description || photo.alt_description || category.name,
      categoryName: category.name,
      categoryEmoji: category.emoji,
      categoryDescription: category.description,
      source: 'Unsplash API',
      sourceKey: 'unsplash'
    };

  } catch (error) {
    console.error('❌ خطأ في Unsplash API:', error.message);
    throw error;
  }
}

/**
 * جلب صورة عشوائية من أي فئة ديكور
 */
export async function getRandomDecorImage() {
  const categories = Object.keys(UNSPLASH_DECOR_CATEGORIES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return getRandomUnsplashImage(randomCategory);
}

/**
 * اختبار الخدمة
 */
export async function testUnsplashService() {
  console.log('🧪 اختبار خدمة Unsplash API...\n');

  try {
    console.log('📦 الفئات المتاحة:');
    for (const [key, cat] of Object.entries(UNSPLASH_DECOR_CATEGORIES)) {
      console.log(`${cat.emoji} ${cat.name}`);
    }

    console.log('\n🎲 جلب صورة عشوائية من فئة "شموع"...');
    const image = await getRandomUnsplashImage('شموع');

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
  testUnsplashService();
}
