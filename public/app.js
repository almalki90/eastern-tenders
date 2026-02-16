// تحميل البيانات
let allTenders = [];
let filteredTenders = [];

// تحميل المناقصات عند بدء الصفحة
document.addEventListener('DOMContentLoaded', async () => {
    await loadTenders();
    setupEventListeners();
});

// تحميل البيانات من JSON
async function loadTenders() {
    try {
        const response = await fetch('data/tenders.json');
        
        if (!response.ok) {
            throw new Error('فشل في تحميل البيانات');
        }
        
        allTenders = await response.json();
        filteredTenders = [...allTenders];
        
        updateStats();
        populateFilters();
        renderTenders();
        
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('tenders-container').classList.remove('hidden');
        
    } catch (error) {
        console.error('خطأ في تحميل البيانات:', error);
        document.getElementById('loading').innerHTML = `
            <i class="fas fa-exclamation-triangle text-5xl text-red-500"></i>
            <p class="text-gray-600 mt-4">حدث خطأ في تحميل البيانات</p>
            <button onclick="location.reload()" class="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                إعادة المحاولة
            </button>
        `;
    }
}

// تحديث الإحصائيات
function updateStats() {
    const totalCount = allTenders.length;
    const activeCount = allTenders.filter(t => t.status === 'active').length;
    const regionsCount = new Set(allTenders.map(t => t.region)).size;
    
    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('active-count').textContent = activeCount;
    document.getElementById('regions-count').textContent = regionsCount;
    
    // آخر تحديث
    if (allTenders.length > 0 && allTenders[0].scrapedAt) {
        const lastUpdate = new Date(allTenders[0].scrapedAt);
        const hours = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60));
        
        if (hours < 1) {
            document.getElementById('last-update').textContent = 'الآن';
        } else if (hours < 24) {
            document.getElementById('last-update').textContent = `${hours}س`;
        } else {
            const days = Math.floor(hours / 24);
            document.getElementById('last-update').textContent = `${days}ي`;
        }
    }
}

// ملء خيارات الفلاتر
function populateFilters() {
    // المناطق
    const regions = [...new Set(allTenders.map(t => t.region))].sort();
    const regionFilter = document.getElementById('region-filter');
    regions.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionFilter.appendChild(option);
    });
    
    // الجهات
    const entities = [...new Set(allTenders.map(t => t.entity).filter(e => e))].sort();
    const entityFilter = document.getElementById('entity-filter');
    entities.forEach(entity => {
        const option = document.createElement('option');
        option.value = entity;
        option.textContent = entity;
        entityFilter.appendChild(option);
    });
}

// عرض المناقصات
function renderTenders() {
    const container = document.getElementById('tenders-container');
    const noResults = document.getElementById('no-results');
    
    if (filteredTenders.length === 0) {
        container.classList.add('hidden');
        noResults.classList.remove('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    noResults.classList.add('hidden');
    
    container.innerHTML = filteredTenders.map(tender => `
        <div class="tender-card bg-white rounded-xl shadow-md overflow-hidden fade-in">
            <div class="p-6">
                <!-- Header -->
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                            ${tender.title}
                        </h3>
                        <div class="flex flex-wrap gap-2">
                            <span class="badge bg-blue-100 text-blue-800">
                                <i class="fas fa-map-marker-alt ml-1"></i>
                                ${tender.region}
                            </span>
                            ${tender.status === 'active' ? 
                                '<span class="badge bg-green-100 text-green-800"><i class="fas fa-check-circle ml-1"></i>نشط</span>' : 
                                '<span class="badge bg-gray-100 text-gray-800"><i class="fas fa-archive ml-1"></i>مؤرشف</span>'
                            }
                        </div>
                    </div>
                </div>
                
                <!-- Details -->
                <div class="space-y-2 mb-4 text-sm">
                    ${tender.entity ? `
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-building ml-2 w-5"></i>
                            <span class="line-clamp-1">${tender.entity}</span>
                        </div>
                    ` : ''}
                    
                    ${tender.deadline ? `
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-calendar-alt ml-2 w-5"></i>
                            <span>آخر موعد: ${formatDate(tender.deadline)}</span>
                        </div>
                    ` : ''}
                    
                    ${tender.source ? `
                        <div class="flex items-center text-gray-600">
                            <i class="fas fa-link ml-2 w-5"></i>
                            <span class="line-clamp-1">${tender.source}</span>
                        </div>
                    ` : ''}
                </div>
                
                <!-- Description -->
                ${tender.description ? `
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">
                        ${tender.description}
                    </p>
                ` : ''}
                
                <!-- Actions -->
                <div class="flex items-center justify-between pt-4 border-t">
                    <span class="text-xs text-gray-500">
                        <i class="fas fa-clock ml-1"></i>
                        ${formatTimeAgo(tender.scrapedAt)}
                    </span>
                    
                    ${tender.link ? `
                        <a href="${tender.link}" target="_blank" 
                           class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition flex items-center gap-2">
                            <span>التفاصيل</span>
                            <i class="fas fa-external-link-alt"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
    // البحث
    document.getElementById('search-input').addEventListener('input', filterTenders);
    
    // الفلاتر
    document.getElementById('region-filter').addEventListener('change', filterTenders);
    document.getElementById('entity-filter').addEventListener('change', filterTenders);
    document.getElementById('sort-filter').addEventListener('change', filterTenders);
    
    // إعادة التعيين
    document.getElementById('reset-filters').addEventListener('click', () => {
        document.getElementById('search-input').value = '';
        document.getElementById('region-filter').value = '';
        document.getElementById('entity-filter').value = '';
        document.getElementById('sort-filter').value = 'newest';
        filterTenders();
    });
}

// تطبيق الفلاتر
function filterTenders() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const regionFilter = document.getElementById('region-filter').value;
    const entityFilter = document.getElementById('entity-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    // تصفية
    filteredTenders = allTenders.filter(tender => {
        const matchesSearch = !searchTerm || 
            tender.title.toLowerCase().includes(searchTerm) ||
            (tender.description && tender.description.toLowerCase().includes(searchTerm)) ||
            (tender.entity && tender.entity.toLowerCase().includes(searchTerm));
        
        const matchesRegion = !regionFilter || tender.region === regionFilter;
        const matchesEntity = !entityFilter || tender.entity === entityFilter;
        
        return matchesSearch && matchesRegion && matchesEntity;
    });
    
    // ترتيب
    switch (sortFilter) {
        case 'newest':
            filteredTenders.sort((a, b) => 
                new Date(b.scrapedAt || 0) - new Date(a.scrapedAt || 0)
            );
            break;
        case 'deadline':
            filteredTenders.sort((a, b) => 
                new Date(a.deadline || '9999') - new Date(b.deadline || '9999')
            );
            break;
        case 'title':
            filteredTenders.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
            break;
    }
    
    renderTenders();
}

// تنسيق التاريخ
function formatDate(dateStr) {
    if (!dateStr) return 'غير محدد';
    
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (e) {
        return dateStr;
    }
}

// تنسيق الوقت النسبي
function formatTimeAgo(dateStr) {
    if (!dateStr) return 'غير محدد';
    
    try {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffHours < 24) return `منذ ${diffHours} ساعة`;
        if (diffDays < 30) return `منذ ${diffDays} يوم`;
        
        return formatDate(dateStr);
    } catch (e) {
        return 'غير محدد';
    }
}

// Utility: Line clamp for long text
const style = document.createElement('style');
style.textContent = `
    .line-clamp-1 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 1;
        -webkit-box-orient: vertical;
    }
    
    .line-clamp-2 {
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
    }
`;
document.head.appendChild(style);
