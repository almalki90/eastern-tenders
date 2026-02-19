/**
 * نظام إدارة مصادر الديكور المتعددة
 * يدمج جميع مصادر الصور من GitHub
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getRandomUnsplashImage, UNSPLASH_DECOR_CATEGORIES } from './unsplash-service.js';
import { getRandomPexelsImage, PEXELS_DECOR_CATEGORIES } from './pexels-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * تعريف جميع مصادر البيانات
 */
const SOURCES = {
  ikea1: {
    name: 'IKEA Original Dataset',
    path: path.join(__dirname, 'ikea-dataset', 'images'),
    enabled: true
  },
  ikea2: {
    name: 'IKEA Extended Dataset',
    path: path.join(__dirname, 'ikea-dataset2'),
    enabled: true
  },
  huggingface: {
    name: 'HuggingFace Interior Collection',
    path: path.join(__dirname, 'huggingface-dataset', 'images'),
    enabled: true
  }
};

/**
 * مصفوفة التصنيفات الموحدة مع تعيين المجلدات من كل مصدر
 */
export const CATEGORIES = {
  'غرف_نوم': {
    emoji: '🛏️',
    name: 'غرف نوم',
    description: 'أسرة وغرف نوم مريحة',
    sources: {
      ikea1: ['bed'],
      ikea2: ['Bedroom'],
      huggingface: ['bedroom', '.']  // المجلد + الصور في الجذر
    }
  },
  'حمامات': {
    emoji: '🚿',
    name: 'حمامات',
    description: 'حمامات عصرية وأنيقة',
    sources: {
      ikea1: [],
      ikea2: ['Bathroom'],
      huggingface: ['bathroom', '.']
    }
  },
  'مطابخ': {
    emoji: '🍳',
    name: 'مطابخ',
    description: 'مطابخ عملية وجميلة',
    sources: {
      ikea1: [],
      ikea2: ['Kitchen 1'],
      huggingface: ['kitchen', '.']
    }
  },
  'غرف_معيشة': {
    emoji: '🛋️',
    name: 'غرف معيشة',
    description: 'صالات وغرف جلوس مريحة',
    sources: {
      ikea1: ['couch', 'room_scenes'],
      ikea2: ['Living Room 1'],
      huggingface: ['living', '.']
    }
  },
  'طاولات_طعام': {
    emoji: '🍽️',
    name: 'طاولات طعام',
    description: 'طاولات طعام وسفرة',
    sources: {
      ikea1: ['dining table'],
      ikea2: ['Dining Room'],
      huggingface: ['dining', '.']
    }
  },
  'مداخل': {
    emoji: '🚪',
    name: 'مداخل وممرات',
    description: 'تصاميم مداخل وممرات مميزة',
    sources: {
      ikea1: [],
      ikea2: ['Hallway'],
      huggingface: ['.']
    }
  },
  'كراسي': {
    emoji: '🪑',
    name: 'كراسي',
    description: 'كراسي بتصاميم متنوعة',
    sources: {
      ikea1: ['chair'],
      ikea2: [],
      huggingface: ['.']
    }
  },
  'ساعات': {
    emoji: '🕐',
    name: 'ساعات حائط',
    description: 'ساعات حائط ديكورية',
    sources: {
      ikea1: ['clock'],
      ikea2: [],
      huggingface: []
    }
  },
  'نباتات': {
    emoji: '🪴',
    name: 'نباتات منزلية',
    description: 'أصص نباتات داخلية',
    sources: {
      ikea1: ['plant_pot'],
      ikea2: [],
      huggingface: []
    }
  },
  'قطع_ديكور': {
    emoji: '🎨',
    name: 'قطع ديكور',
    description: 'إكسسوارات ومكملات ديكور',
    sources: {
      ikea1: ['objects'],
      ikea2: [],
      huggingface: ['.']
    }
  },
  // فئات الديكور من Unsplash و Pexels API
  'شموع': {
    emoji: '🕯️',
    name: 'شموع',
    description: 'شموع ديكورية معطرة',
    sources: {
      unsplash: true, // يستخدم Unsplash API
      pexels: true    // يستخدم Pexels API
    }
  },
  'إضاءة': {
    emoji: '💡',
    name: 'إضاءة ديكورية',
    description: 'مصابيح وإضاءة منزلية',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'فازات': {
    emoji: '🏺',
    name: 'فازات وأواني',
    description: 'فازات زهور وأواني ديكورية',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'مرايا': {
    emoji: '🪞',
    name: 'مرايا ديكورية',
    description: 'مرايا حائط وديكور',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'لوحات_فنية': {
    emoji: '🖼️',
    name: 'لوحات فنية',
    description: 'لوحات جدارية وفن تشكيلي',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'ديكورات_صغيرة': {
    emoji: '🎨',
    name: 'ديكورات صغيرة',
    description: 'إكسسوارات ديكور صغيرة',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'صالات': {
    emoji: '🛋️',
    name: 'صالات',
    description: 'تصاميم صالات وغرف معيشة',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'أرضيات': {
    emoji: '🟫',
    name: 'أرضيات',
    description: 'أنواع أرضيات وبلاط',
    sources: {
      unsplash: true,
      pexels: true
    }
  },
  'أسقف': {
    emoji: '⬜',
    name: 'أسقف',
    description: 'تصاميم أسقف مستعارة وديكور',
    sources: {
      unsplash: true,
      pexels: true
    }
  }
};

/**
 * جمع جميع الصور من مصدر وتصنيف معين
 */
function getImagesFromSource(sourceName, folders) {
  const source = SOURCES[sourceName];
  if (!source || !source.enabled || !fs.existsSync(source.path)) {
    return [];
  }

  let allImages = [];

  for (const folder of folders) {
    // إذا كان المجلد "." نبحث في الجذر فقط (بدون recursive)
    const isRoot = folder === '.';
    const folderPath = isRoot ? source.path : path.join(source.path, folder);
    
    if (!fs.existsSync(folderPath)) {
      continue;
    }

    try {
      const files = fs.readdirSync(folderPath, { recursive: !isRoot })
        .filter(file => {
          const ext = path.extname(file).toLowerCase();
          const isImage = ext === '.jpg' || ext === '.png' || ext === '.jpeg';
          // إذا كان جذر، نتأكد أنه ملف وليس مجلد
          if (isRoot && isImage) {
            const fullPath = path.join(folderPath, file);
            return fs.statSync(fullPath).isFile();
          }
          return isImage;
        })
        .map(file => ({
          path: path.join(folderPath, file),
          source: source.name,
          sourceKey: sourceName
        }));

      allImages = allImages.concat(files);
    } catch (error) {
      console.warn(`⚠️ خطأ في قراءة ${folderPath}:`, error.message);
    }
  }

  return allImages;
}

/**
 * جمع جميع الصور من تصنيف معين من جميع المصادر
 */
function getAllImagesForCategory(categoryKey) {
  const category = CATEGORIES[categoryKey];
  if (!category) {
    throw new Error(`تصنيف غير موجود: ${categoryKey}`);
  }

  let allImages = [];

  // جمع الصور من كل مصدر
  for (const [sourceName, folders] of Object.entries(category.sources)) {
    if (folders.length > 0) {
      const images = getImagesFromSource(sourceName, folders);
      allImages = allImages.concat(images);
    }
  }

  return allImages;
}

/**
 * الحصول على صورة عشوائية من تصنيف معين
 */
export async function getRandomImage(categoryKey) {
  const category = CATEGORIES[categoryKey];
  
  // التحقق من وجود التصنيف في APIs (Unsplash أو Pexels)
  if (category.sources.unsplash === true) {
    // اختيار عشوائي بين Unsplash و Pexels (50/50)
    const useUnsplash = Math.random() < 0.5;
    
    if (useUnsplash) {
      // جلب من Unsplash API
      const unsplashImage = await getRandomUnsplashImage(categoryKey);
      return {
        ...unsplashImage,
        isUnsplash: true,
        isPexels: false,
        category: categoryKey
      };
    } else {
      // جلب من Pexels API
      const pexelsImage = await getRandomPexelsImage(categoryKey);
      return {
        ...pexelsImage,
        isUnsplash: false,
        isPexels: true,
        category: categoryKey
      };
    }
  }
  
  // جلب من الملفات المحلية (الأثاث)
  const images = getAllImagesForCategory(categoryKey);
  
  if (images.length === 0) {
    throw new Error(`لا توجد صور في التصنيف: ${categoryKey}`);
  }

  const randomIndex = Math.floor(Math.random() * images.length);
  const selectedImage = images[randomIndex];
  
  return {
    path: selectedImage.path,
    fileName: path.basename(selectedImage.path),
    source: selectedImage.source,
    sourceKey: selectedImage.sourceKey,
    category: categoryKey,
    categoryName: category.name,
    categoryEmoji: category.emoji,
    description: category.description,
    totalInCategory: images.length,
    isUnsplash: false,
    isPexels: false
  };
}

/**
 * الحصول على صورة عشوائية من أي تصنيف
 */
export async function getRandomImageFromAll() {
  const categories = Object.keys(CATEGORIES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  return await getRandomImage(randomCategory);
}

/**
 * إحصائيات شاملة لجميع المصادر والتصنيفات
 */
export function getDetailedStats() {
  const stats = {
    categories: {},
    sources: {},
    total: 0
  };

  // إحصائيات حسب التصنيف
  for (const [key, category] of Object.entries(CATEGORIES)) {
    try {
      const images = getAllImagesForCategory(key);
      const sourceBreakdown = {};
      
      // تفصيل حسب المصدر
      for (const img of images) {
        sourceBreakdown[img.sourceKey] = (sourceBreakdown[img.sourceKey] || 0) + 1;
      }

      stats.categories[key] = {
        name: category.name,
        emoji: category.emoji,
        count: images.length,
        sources: sourceBreakdown
      };
      
      stats.total += images.length;
    } catch (error) {
      stats.categories[key] = {
        name: category.name,
        emoji: category.emoji,
        count: 0,
        error: error.message
      };
    }
  }

  // إحصائيات حسب المصدر
  for (const [sourceName, source] of Object.entries(SOURCES)) {
    if (source.enabled && fs.existsSync(source.path)) {
      let count = 0;
      for (const catStats of Object.values(stats.categories)) {
        count += catStats.sources?.[sourceName] || 0;
      }
      stats.sources[sourceName] = {
        name: source.name,
        count: count
      };
    }
  }

  return stats;
}

/**
 * اختبار النظام
 */
export async function testMultiSourceSystem() {
  console.log('🧪 اختبار نظام المصادر المتعددة...\n');
  
  const stats = getDetailedStats();
  
  console.log('📊 إحصائيات شاملة:');
  console.log(`📦 إجمالي الصور: ${stats.total.toLocaleString('ar-EG')}\n`);
  
  console.log('🗂️ حسب المصدر:');
  for (const [key, source] of Object.entries(stats.sources)) {
    console.log(`  • ${source.name}: ${source.count.toLocaleString('ar-EG')} صورة`);
  }
  
  console.log('\n📂 حسب التصنيف:');
  for (const [key, cat] of Object.entries(stats.categories)) {
    console.log(`${cat.emoji} ${cat.name}: ${cat.count.toLocaleString('ar-EG')} صورة`);
    if (cat.sources) {
      for (const [srcKey, count] of Object.entries(cat.sources)) {
        console.log(`    └─ ${SOURCES[srcKey].name}: ${count}`);
      }
    }
  }
  
  console.log('\n🎲 اختبار جلب صورة عشوائية...');
  const image = await getRandomImageFromAll();
  console.log(`✅ تم جلب صورة من: ${image.categoryName}`);
  console.log(`📦 المصدر: ${image.source}`);
  if (image.isUnsplash) {
    console.log(`🔗 رابط Unsplash: ${image.url}`);
  } else {
    console.log(`📄 اسم الملف: ${image.fileName}`);
    console.log(`📊 إجمالي الصور في هذا التصنيف: ${image.totalInCategory}`);
  }
  
  console.log('\n✅ الاختبار نجح!');
}

// تشغيل الاختبار إذا تم تنفيذ الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testMultiSourceSystem();
}
