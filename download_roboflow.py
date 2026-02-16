"""
تحميل datasets من Roboflow Universe
"""

from roboflow import Roboflow
import os
import shutil

print('🚀 بدء تحميل من Roboflow Universe...\n')

# Roboflow public API (لا يحتاج token للـ public datasets)
rf = Roboflow(api_key="public")

# قائمة datasets عامة معروفة
datasets_info = [
    {
        'workspace': 'td-bryant',
        'project': 'rooms-4k85e',
        'version': 1,
        'name': 'Rooms Classification'
    }
]

total_downloaded = 0

for ds_info in datasets_info:
    try:
        print(f"📥 تحميل: {ds_info['name']}...")
        
        project = rf.workspace(ds_info['workspace']).project(ds_info['project'])
        dataset = project.version(ds_info['version']).download("folder")
        
        print(f"✅ تم التحميل: {ds_info['name']}")
        
        # عد الصور
        if os.path.exists(dataset.location):
            for root, dirs, files in os.walk(dataset.location):
                images = [f for f in files if f.endswith(('.jpg', '.png', '.jpeg'))]
                if images:
                    total_downloaded += len(images)
                    print(f"   📁 {os.path.basename(root)}: {len(images)} صورة")
        
    except Exception as e:
        print(f"⚠️ فشل تحميل {ds_info['name']}: {e}")

print(f'\n📊 إجمالي الصور المحملة: {total_downloaded}')
