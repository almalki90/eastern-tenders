/**
 * خدمة IKEA Dataset - جلب صور الديكور من مجموعة IKEA
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IKEA_PATH = path.join(__dirname, 'ikea-dataset', 'images');

/**
 * التصنيفات المتوفرة مع الترجمة العربية
 */
export const CATEGORIES = {
  'غرف_نوم': {
    folder: 'bed',
    emoji: '🛏️',
    name: 'غرف نوم',
    description: 'أسرة وغرف نوم مريحة'
  },
  'كراسي': {
    folder: 'chair',
    emoji: '🪑',
    name: 'كراسي',
    description: 'كراسي بتصاميم متنوعة'
  },
  'ساعات': {
    folder: 'clock',
    emoji: '🕐',
    name: 'ساعات حائط',
    description: 'ساعات حائط ديكورية'
  },
  'أرائك': {
    folder: 'couch',
    emoji: '🛋️',
    name: 'أرائك',
    description: 'كنب وأرائك مريحة'
  },
  'طاولات_طعام': {
    folder: 'dining table',
    emoji: '🍽️',
    name: 'طاولات طعام',
    description: 'طاولات طعام وسفرة'
  },
  'نباتات': {
    folder: 'plant_pot',
    emoji: '🪴',
    name: 'نباتات منزلية',
    description: 'أصص نباتات داخلية'
  },
  'غرف_متكاملة': {
    folder: 'room_scenes',
    emoji: '🏠',
    name: 'غرف متكاملة',
    description: 'تصاميم غرف كاملة'
  },
  'قطع_ديكور': {
    folder: 'objects',
    emoji: '🎨',
    name: 'قطع ديكور',
    description: 'إكسسوارات ومكملات ديكور'
  }
};

/**
 * الحصول على جميع الصور في تصنيف معين
 */
function getImagesInCategory(categoryKey) {
  const category = CATEGORIES[categoryKey];
  if (!category) {
    throw new Error(`تصنيف غير موجود: ${categoryKey}`);
  }

  const folderPath = path.join(IKEA_PATH, category.folder);
  
  if (!fs.existsSync(folderPath)) {
    throw new Error(`المجلد غير موجود: ${folderPath}`);
  }

  const files = fs.readdirSync(folderPath)
    .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
    .map(file => path.join(folderPath, file));

  return files;
}

/**
 * الحصول على صورة عشوائية من تصنيف معين
 */
export function getRandomImage(categoryKey) {
  const images = getImagesInCategory(categoryKey);
  
  if (images.length === 0) {
    throw new Error(`لا توجد صور في التصنيف: ${categoryKey}`);
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  const imagePath = images[randomIndex];
  const fileName = path.basename(imagePath);
  
  return {
    path: imagePath,
    fileName: fileName,
    category: categoryKey,
    categoryName: CATEGORIES[categoryKey].name,
    description: CATEGORIES[categoryKey].description
  };
}

/**
 * الحصول على صورة عشوائية من أي تصنيف
 */
export function getRandomImageFromAll() {
  const categories = Object.keys(CATEGORIES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return getRandomImage(randomCategory);
}

/**
 * إحصائيات التصنيفات
 */
export function getCategoryStats() {
  const stats = {};
  let total = 0;

  for (const [key, category] of Object.entries(CATEGORIES)) {
    try {
      const images = getImagesInCategory(key);
      stats[key] = {
        name: category.name,
        count: images.length,
        emoji: category.emoji
      };
      total += images.length;
    } catch (error) {
      stats[key] = {
        name: category.name,
        count: 0,
        emoji: category.emoji,
        error: error.message
      };
    }
  }

  return { categories: stats, total };
}

/**
 * اختبار الخدمة
 */
export async function testIkeaService() {
  console.log('🧪 اختبار IKEA Dataset Service...\n');
  
  // عرض الإحصائيات
  const stats = getCategoryStats();
  console.log('📊 إحصائيات التصنيفات:');
  console.log(`📦 إجمالي الصور: ${stats.total}\n`);
  
  for (const [key, stat] of Object.entries(stats.categories)) {
    console.log(`${stat.emoji} ${stat.name}: ${stat.count} صورة`);
  }
  
  // اختبار جلب صورة عشوائية
  console.log('\n🎲 اختبار جلب صورة عشوائية...');
  const randomImage = getRandomImageFromAll();
  console.log(`✅ تم جلب صورة من: ${randomImage.categoryName}`);
  console.log(`📄 اسم الملف: ${randomImage.fileName}`);
  console.log(`📂 المسار: ${randomImage.path}`);
  
  console.log('\n✅ الاختبار نجح!');
}

// تشغيل الاختبار إذا تم تنفيذ الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testIkeaService();
}
