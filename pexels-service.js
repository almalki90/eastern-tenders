/**
 * Pexels API Service - خدمة صور الديكور
 * جلب صور احترافية للديكور المنزلي من Pexels
 */

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// التصنيفات المتاحة
export const CATEGORIES = {
  'غرف_نوم': ['bedroom interior', 'bedroom design', 'modern bedroom'],
  'غرف_معيشة': ['living room', 'modern living room', 'cozy living room'],
  'مطابخ': ['kitchen interior', 'modern kitchen', 'kitchen design'],
  'حمامات': ['bathroom interior', 'modern bathroom', 'luxury bathroom'],
  'مداخل': ['entrance design', 'hallway interior', 'foyer design'],
  'حدائق': ['garden design', 'outdoor patio', 'backyard design'],
  'إضاءة': ['interior lighting', 'modern lighting', 'home lighting'],
  'ألوان': ['colorful interior', 'home colors', 'interior paint'],
  'ديكور_عام': ['home decor', 'interior design', 'home interior']
};

/**
 * جلب صورة عشوائية من تصنيف محدد
 */
export async function getRandomDecorImage(category = 'ديكور_عام') {
  try {
    const queries = CATEGORIES[category] || CATEGORIES['ديكور_عام'];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    const response = await axios.get(`${PEXELS_BASE_URL}/search`, {
      params: {
        query: randomQuery,
        per_page: 20,
        page: Math.floor(Math.random() * 5) + 1 // صفحات عشوائية
      },
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    });
    
    if (!response.data.photos || response.data.photos.length === 0) {
      throw new Error('لم يتم العثور على صور');
    }
    
    // اختيار صورة عشوائية
    const photos = response.data.photos;
    const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
    
    return {
      url: randomPhoto.src.large2x, // جودة عالية
      photographer: randomPhoto.photographer,
      photographerUrl: randomPhoto.photographer_url,
      description: randomPhoto.alt || randomQuery,
      category: category,
      query: randomQuery
    };
    
  } catch (error) {
    console.error('❌ خطأ في جلب الصورة:', error.message);
    throw error;
  }
}

/**
 * جلب صور متعددة
 */
export async function getMultipleDecorImages(count = 5) {
  const categories = Object.keys(CATEGORIES);
  const images = [];
  
  for (let i = 0; i < count; i++) {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    try {
      const image = await getRandomDecorImage(randomCategory);
      images.push(image);
      // تأخير بسيط لتجنب Rate Limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`فشل جلب صورة ${i + 1}`);
    }
  }
  
  return images;
}

/**
 * اختبار الـ API
 */
export async function testPexelsAPI() {
  console.log('🔍 اختبار Pexels API...\n');
  
  try {
    const image = await getRandomDecorImage('غرف_نوم');
    
    console.log('✅ نجح الاتصال!');
    console.log('📸 الصورة:', image.url);
    console.log('👤 المصور:', image.photographer);
    console.log('📂 التصنيف:', image.category);
    console.log('🔍 البحث:', image.query);
    
    return image;
  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
    throw error;
  }
}
