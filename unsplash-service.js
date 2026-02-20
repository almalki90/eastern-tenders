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
 * تصاميم كاملة للأماكن (وليست قطع ديكور منفردة)
 */
export const UNSPLASH_DECOR_CATEGORIES = {
  'مطابخ': {
    emoji: '🍳',
    name: 'مطابخ',
    description: 'تصاميم مطابخ عصرية',
    queries: ['kitchen interior design', 'modern kitchen', 'kitchen architecture'],
    query: 'kitchen interior design'
  },
  'غرف_نوم': {
    emoji: '🛏️',
    name: 'غرف نوم',
    description: 'تصاميم غرف نوم كاملة',
    queries: ['bedroom interior design', 'modern bedroom', 'bedroom architecture'],
    query: 'bedroom interior design'
  },
  'صالات': {
    emoji: '🛋️',
    name: 'صالات',
    description: 'تصاميم صالات وغرف معيشة',
    queries: ['living room interior', 'modern lounge', 'sitting room design'],
    query: 'living room interior design'
  },
  'مداخل': {
    emoji: '🚪',
    name: 'مداخل',
    description: 'تصاميم مداخل وممرات',
    queries: ['entryway interior', 'foyer design', 'entrance hall'],
    query: 'home entryway interior'
  },
  'أسقف': {
    emoji: '⬜',
    name: 'أسقف',
    description: 'تصاميم أسقف مستعارة',
    queries: ['false ceiling design', 'ceiling interior', 'dropped ceiling'],
    query: 'false ceiling interior'
  },
  'أرضيات': {
    emoji: '🟫',
    name: 'أرضيات',
    description: 'تصاميم أرضيات وبلاط',
    queries: ['interior flooring', 'floor tiles design', 'hardwood floor'],
    query: 'modern interior flooring'
  },
  'جدران': {
    emoji: '🧱',
    name: 'جدران',
    description: 'تصاميم جدران وديكورات حائط',
    queries: ['wall design interior', 'accent wall', 'textured wall'],
    query: 'interior wall design'
  },
  'حمامات': {
    emoji: '🚿',
    name: 'حمامات',
    description: 'تصاميم حمامات عصرية',
    queries: ['bathroom interior', 'modern bathroom', 'bathroom design'],
    query: 'modern bathroom interior'
  },
  'أسطح': {
    emoji: '🏠',
    name: 'أسطح',
    description: 'تصاميم أسطح وروف',
    queries: ['rooftop design', 'terrace interior', 'roof deck'],
    query: 'rooftop terrace design'
  },
  'حدائق_خلفية': {
    emoji: '🌳',
    name: 'حدائق خلفية',
    description: 'تصاميم حدائق منزلية',
    queries: ['backyard design', 'garden landscape', 'outdoor living'],
    query: 'backyard landscape design'
  },
  'صالات_جلوس': {
    emoji: '🪑',
    name: 'صالات جلوس',
    description: 'تصاميم صالات استقبال وجلوس',
    queries: ['sitting room design', 'lounge interior', 'reception room'],
    query: 'sitting room interior design'
  },
  'ديكور_تلفزيون': {
    emoji: '📺',
    name: 'ديكور التلفزيون',
    description: 'تصاميم جدار التلفزيون وديكوره',
    queries: ['tv wall design', 'television unit interior', 'media wall'],
    query: 'living room tv wall'
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
