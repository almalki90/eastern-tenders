/**
 * Wallhaven API Service
 * خدمة جلب ورق الجدران عالي الجودة من Wallhaven
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WALLHAVEN_API_KEY = process.env.WALLHAVEN_API_KEY;
const BASE_URL = 'https://wallhaven.cc/api/v1';

/**
 * فئات ورق الجدران
 */
export const WALLHAVEN_CATEGORIES = {
  nature: {
    emoji: '🌄',
    name: 'مناظر طبيعية',
    description: 'جبال، شواطئ، غابات، صحراء',
    query: 'nature landscape mountains beach forest'
  },
  city: {
    emoji: '🏙️',
    name: 'مدن وعمارة',
    description: 'ناطحات سحاب، شوارع ليلية، معالم',
    query: 'city architecture skyline urban'
  },
  space: {
    emoji: '🌌',
    name: 'فضاء ونجوم',
    description: 'مجرات، كواكب، سماء ليلية',
    query: 'space galaxy stars planets nebula'
  },
  art: {
    emoji: '🎨',
    name: 'فن وتجريدي',
    description: 'لوحات فنية، تجريدي، ألوان',
    query: 'art abstract digital painting'
  },
  animals: {
    emoji: '🐾',
    name: 'حيوانات',
    description: 'حيوانات برية، طيور، أسماك',
    query: 'animals wildlife birds'
  },
  cars: {
    emoji: '🚗',
    name: 'سيارات',
    description: 'سيارات رياضية، كلاسيكية',
    query: 'cars sports classic vehicle'
  },
  gaming: {
    emoji: '🎮',
    name: 'ألعاب وأنمي',
    description: 'ألعاب فيديو، أنمي، شخصيات',
    query: 'gaming anime video games'
  },
  flowers: {
    emoji: '🌸',
    name: 'زهور ونباتات',
    description: 'زهور، نباتات، حدائق',
    query: 'flowers plants garden botanical'
  },
  ocean: {
    emoji: '🌊',
    name: 'بحر ومحيطات',
    description: 'بحار، محيطات، شواطئ',
    query: 'ocean sea underwater marine'
  },
  kids: {
    emoji: '👶',
    name: 'أطفال وكرتون',
    description: 'كرتون، Disney، شخصيات لطيفة',
    query: 'cartoon cute kids disney pixar'
  }
};

/**
 * جلب صورة عشوائية من Wallhaven
 */
export async function getRandomWallhavenImage(categoryKey) {
  try {
    if (!WALLHAVEN_API_KEY) {
      throw new Error('WALLHAVEN_API_KEY غير موجود في .env');
    }

    const category = WALLHAVEN_CATEGORIES[categoryKey];
    if (!category) {
      throw new Error(`الفئة ${categoryKey} غير موجودة`);
    }

    // بناء URL البحث
    const params = {
      apikey: WALLHAVEN_API_KEY,
      q: category.query,
      categories: '100', // General فقط (لا anime/people)
      purity: '100', // SFW فقط
      sorting: 'random',
      atleast: '1920x1080', // دقة عالية على الأقل
      page: 1
    };

    const response = await axios.get(`${BASE_URL}/search`, { params });

    if (!response.data || !response.data.data || response.data.data.length === 0) {
      throw new Error('لم يتم العثور على صور');
    }

    // اختيار صورة عشوائية من النتائج
    const wallpapers = response.data.data;
    const randomWallpaper = wallpapers[Math.floor(Math.random() * wallpapers.length)];

    return {
      url: randomWallpaper.path, // الصورة الأصلية بدقة كاملة
      thumb: randomWallpaper.thumbs.large,
      resolution: randomWallpaper.resolution,
      views: randomWallpaper.views,
      favorites: randomWallpaper.favorites,
      colors: randomWallpaper.colors,
      categoryEmoji: category.emoji,
      categoryName: category.name,
      categoryDescription: category.description,
      isWallhaven: true,
      source: 'Wallhaven',
      fileSize: randomWallpaper.file_size,
      fileType: randomWallpaper.file_type
    };
  } catch (error) {
    console.error('❌ خطأ في جلب الصورة من Wallhaven:', error.message);
    throw error;
  }
}

/**
 * اختبار خدمة Wallhaven
 */
export async function testWallhavenService() {
  console.log('\n🧪 اختبار خدمة Wallhaven...\n');
  
  console.log('📂 الفئات المتاحة:');
  for (const [key, cat] of Object.entries(WALLHAVEN_CATEGORIES)) {
    console.log(`   ${cat.emoji} ${cat.name} - ${cat.description}`);
  }
  
  console.log('\n🔍 جلب صورة تجريبية من فئة "مناظر طبيعية"...');
  
  try {
    const image = await getRandomWallhavenImage('nature');
    console.log('\n✅ تم جلب الصورة بنجاح:');
    console.log(`   📐 الدقة: ${image.resolution}`);
    console.log(`   👀 المشاهدات: ${image.views}`);
    console.log(`   ❤️ الإعجابات: ${image.favorites}`);
    console.log(`   🎨 الألوان: ${image.colors.join(', ')}`);
    console.log(`   🔗 الرابط: ${image.url}`);
  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
  }
}

// تشغيل الاختبار إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testWallhavenService();
}
