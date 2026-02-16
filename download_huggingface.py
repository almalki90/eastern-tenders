"""
تحميل Interior Rooms Dataset من Hugging Face
"""

from datasets import load_dataset
from PIL import Image
import os
from collections import defaultdict

print('🚀 بدء تحميل Interior Rooms Dataset من Hugging Face...\n')

# إنشاء المجلدات
base_path = 'huggingface-dataset/images'
categories = {
    'bedroom': 'غرف_نوم',
    'bathroom': 'حمامات', 
    'kitchen': 'مطابخ',
    'living': 'غرف_معيشة',
    'dining': 'طاولات_طعام'
}

for cat in categories.keys():
    os.makedirs(f'{base_path}/{cat}', exist_ok=True)

# تحميل Dataset
print('📥 جاري تحميل البيانات من Hugging Face...')
dataset = load_dataset('MohamedAli77/interior-rooms', split='train', streaming=True)

# تحليل وحفظ الصور
stats = defaultdict(int)
total_saved = 0
max_per_category = 500  # حد أقصى لكل فئة

print('💾 جاري حفظ الصور...\n')

for idx, item in enumerate(dataset):
    try:
        # الحصول على الصورة والوصف
        image = item.get('full_room')
        caption = item.get('caption', '').lower()
        
        if image is None:
            continue
        
        # تحديد الفئة من الوصف
        category = None
        for key in categories.keys():
            if key in caption:
                category = key
                break
        
        # إذا لم نجد فئة محددة، نستخدم فئة عامة
        if category is None:
            if 'room' in caption or 'interior' in caption:
                category = 'living'  # نفترض غرفة معيشة
            else:
                continue
        
        # التحقق من الحد الأقصى
        if stats[category] >= max_per_category:
            continue
        
        # حفظ الصورة
        filename = f'{base_path}/{category}/{category}_{stats[category]:04d}.jpg'
        image.save(filename, 'JPEG', quality=95)
        
        stats[category] += 1
        total_saved += 1
        
        # عرض التقدم
        if total_saved % 50 == 0:
            print(f'✅ تم حفظ {total_saved} صورة')
            for cat, count in stats.items():
                print(f'   • {categories[cat]}: {count}')
            print()
        
        # التوقف عند الوصول للحد الأقصى
        if total_saved >= 2000:
            print('🎯 تم الوصول للحد الأقصى (2000 صورة)')
            break
            
    except Exception as e:
        print(f'⚠️ خطأ في معالجة صورة {idx}: {e}')
        continue

print('\n' + '='*50)
print('✅ اكتمل التحميل!')
print('='*50)
print(f'\n📊 الإحصائيات النهائية:')
print(f'📦 إجمالي الصور: {total_saved}\n')

for cat, count in sorted(stats.items()):
    print(f'{categories[cat]}: {count} صورة')

print(f'\n📁 المسار: {base_path}/')
