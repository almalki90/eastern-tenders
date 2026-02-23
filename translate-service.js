/**
 * خدمة ترجمة النصوص من العربية إلى الإنجليزية
 * تستخدم قاموس محلي فقط - سريع وموثوق
 */

/**
 * قاموس ترجمة موسّع - مُحسّن لورق الجدران
 * أكثر من 300 كلمة شائعة في البحث عن خلفيات
 */
const DICTIONARY = {
  // ══════════════════════════════════════
  // 🌍 طبيعة ومناظر (الأكثر شيوعاً)
  // ══════════════════════════════════════
  'طبيعة': 'nature',
  'طبيعي': 'nature',
  'طبيعية': 'nature',
  'منظر': 'landscape',
  'مناظر': 'landscape',
  'خلفية': 'wallpaper background',
  'خلفيات': 'wallpaper background',
  
  // جبال وتضاريس
  'جبال': 'mountains',
  'جبل': 'mountain',
  'قمة': 'peak summit',
  'قمم': 'peaks',
  'تل': 'hill',
  'تلال': 'hills',
  'وادي': 'valley',
  'اودية': 'valleys',
  'كهف': 'cave',
  'كهوف': 'caves',
  'صخور': 'rocks',
  'صخرة': 'rock',
  'منحدر': 'cliff',
  
  // بحار ومياه
  'بحر': 'ocean sea',
  'بحار': 'ocean sea',
  'محيط': 'ocean',
  'شاطئ': 'beach',
  'شواطئ': 'beaches',
  'موج': 'waves',
  'امواج': 'waves',
  'مياه': 'water',
  'ماء': 'water',
  'نهر': 'river',
  'انهار': 'rivers',
  'بحيرة': 'lake',
  'بحيرات': 'lakes',
  'شلال': 'waterfall',
  'شلالات': 'waterfalls',
  'نافورة': 'fountain',
  'نوافير': 'fountains',
  'جزيرة': 'island',
  'جزر': 'islands',
  
  // سماء وأجرام
  'سماء': 'sky',
  'سحاب': 'clouds',
  'سحابة': 'cloud',
  'سحب': 'clouds',
  'غيوم': 'clouds',
  'غيمة': 'cloud',
  'نجوم': 'stars',
  'نجمة': 'star',
  'نجم': 'star',
  'قمر': 'moon',
  'اقمار': 'moons',
  'بدر': 'full moon',
  'هلال': 'crescent',
  'شمس': 'sun',
  'كواكب': 'planets',
  'كوكب': 'planet',
  'فضاء': 'space',
  'مجرة': 'galaxy',
  'مجرات': 'galaxies',
  'درب': 'milky way',
  'شهاب': 'meteor',
  'شهب': 'meteors',
  'كسوف': 'eclipse',
  
  // أوقات وطقس
  'غروب': 'sunset',
  'شروق': 'sunrise',
  'فجر': 'dawn',
  'ظهيرة': 'noon',
  'عصر': 'afternoon',
  'مساء': 'evening',
  'ليل': 'night',
  'ليلة': 'night',
  'ليلي': 'night',
  'ليلية': 'night',
  'نهار': 'day',
  'صباح': 'morning',
  'ضباب': 'fog mist',
  'ضبابي': 'foggy',
  'مطر': 'rain',
  'امطار': 'rain',
  'ممطر': 'rainy',
  'عاصفة': 'storm',
  'عواصف': 'storms',
  'برق': 'lightning',
  'رعد': 'thunder',
  'ثلج': 'snow',
  'ثلوج': 'snow',
  'ثلجي': 'snowy',
  'جليد': 'ice',
  'جليدي': 'icy',
  'قوس': 'rainbow',
  'قزح': 'rainbow',
  'رياح': 'wind',
  'ريح': 'wind',
  
  // غابات ونباتات
  'غابة': 'forest',
  'غابات': 'forests',
  'اشجار': 'trees',
  'شجرة': 'tree',
  'شجر': 'trees',
  'غصن': 'branch',
  'اغصان': 'branches',
  'ورقة': 'leaf',
  'اوراق': 'leaves',
  'جذع': 'trunk',
  'جذور': 'roots',
  'خشب': 'wood',
  'خيزران': 'bamboo',
  
  // صحاري ومناطق
  'صحراء': 'desert',
  'صحاري': 'deserts',
  'رمال': 'sand',
  'رمل': 'sand',
  'كثبان': 'dunes',
  'واحة': 'oasis',
  'واحات': 'oasis',
  'براري': 'wilderness',
  'سهول': 'plains',
  'سهل': 'plain',
  'مرج': 'meadow',
  'مروج': 'meadows',
  'حقول': 'fields',
  'حقل': 'field',
  
  // ══════════════════════════════════════
  // 🌸 أزهار ونباتات
  // ══════════════════════════════════════
  'زهور': 'flowers',
  'زهرة': 'flower',
  'زهر': 'blossom',
  'ورود': 'roses',
  'وردة': 'rose',
  'ورد': 'roses',
  'ياسمين': 'jasmine',
  'نرجس': 'narcissus',
  'بنفسج': 'violet',
  'زنبق': 'lily',
  'عباد': 'sunflower',
  'شمس': 'sunflower',
  'اقحوان': 'daisy',
  'خزامى': 'lavender',
  'نباتات': 'plants',
  'نبات': 'plant',
  'نبتة': 'plant',
  'حديقة': 'garden',
  'حدائق': 'gardens',
  'بستان': 'orchard',
  'بساتين': 'orchards',
  'عشب': 'grass',
  'اعشاب': 'grass',
  'طحلب': 'moss',
  'سرخس': 'fern',
  
  // ══════════════════════════════════════
  // 🏙️ مدن وعمارة
  // ══════════════════════════════════════
  'مدينة': 'city',
  'مدن': 'cities',
  'عاصمة': 'capital',
  'قرية': 'village',
  'قرى': 'villages',
  'شارع': 'street',
  'شوارع': 'streets',
  'طريق': 'road',
  'طرق': 'roads',
  'زقاق': 'alley',
  'ممر': 'passage',
  'ساحة': 'square',
  'ساحات': 'squares',
  
  // مباني
  'برج': 'tower',
  'ابراج': 'towers',
  'ناطحة': 'skyscraper',
  'مبنى': 'building',
  'مباني': 'buildings',
  'عمارة': 'building architecture',
  'قصر': 'palace castle',
  'قصور': 'palaces',
  'منزل': 'house',
  'منازل': 'houses',
  'بيت': 'house',
  'بيوت': 'houses',
  'كوخ': 'cottage cabin',
  'فيلا': 'villa',
  'قلعة': 'castle',
  'قلاع': 'castles',
  'حصن': 'fortress',
  'معبد': 'temple',
  'معابد': 'temples',
  'كنيسة': 'church',
  'مسجد': 'mosque',
  'جسر': 'bridge',
  'جسور': 'bridges',
  'نفق': 'tunnel',
  'سد': 'dam',
  'منارة': 'lighthouse',
  'طاحونة': 'windmill',
  
  // ══════════════════════════════════════
  // 🦁 حيوانات وطيور
  // ══════════════════════════════════════
  'حيوان': 'animal',
  'حيوانات': 'animals',
  'حيوان': 'wildlife',
  
  // حيوانات أليفة
  'قطة': 'cat',
  'قطط': 'cats',
  'قط': 'cat',
  'كلب': 'dog',
  'كلاب': 'dogs',
  
  // طيور
  'طائر': 'bird',
  'طيور': 'birds',
  'عصفور': 'sparrow',
  'عصافير': 'sparrows',
  'نسر': 'eagle',
  'نسور': 'eagles',
  'صقر': 'falcon hawk',
  'صقور': 'falcons',
  'بومة': 'owl',
  'غراب': 'crow raven',
  'حمام': 'pigeon dove',
  'حمامة': 'dove',
  'بطريق': 'penguin',
  'بط': 'duck',
  'بجع': 'swan',
  'ببغاء': 'parrot',
  'طاووس': 'peacock',
  'نورس': 'seagull',
  
  // حيوانات برية
  'اسد': 'lion',
  'اسود': 'lions',
  'نمر': 'tiger',
  'نمور': 'tigers',
  'فهد': 'cheetah leopard',
  'ذئب': 'wolf',
  'ذئاب': 'wolves',
  'ثعلب': 'fox',
  'دب': 'bear',
  'دببة': 'bears',
  'فيل': 'elephant',
  'فيلة': 'elephants',
  'زرافة': 'giraffe',
  'حمار': 'zebra',
  'وحشي': 'zebra',
  'غزال': 'deer gazelle',
  'غزلان': 'deer',
  'ايل': 'deer',
  'ارنب': 'rabbit',
  'ارانب': 'rabbits',
  'سنجاب': 'squirrel',
  
  // حيوانات المزرعة
  'حصان': 'horse',
  'خيول': 'horses',
  'خيل': 'horses',
  'جمل': 'camel',
  'جمال': 'camels',
  'بقرة': 'cow',
  'بقر': 'cows',
  'خروف': 'sheep',
  'خراف': 'sheep',
  'ماعز': 'goat',
  
  // حيوانات مائية
  'سمك': 'fish',
  'سمكة': 'fish',
  'اسماك': 'fish',
  'حوت': 'whale',
  'حيتان': 'whales',
  'دلفين': 'dolphin',
  'دلافين': 'dolphins',
  'قرش': 'shark',
  'قروش': 'sharks',
  'سلحفاة': 'turtle',
  'اخطبوط': 'octopus',
  'قنديل': 'jellyfish',
  'مرجان': 'coral',
  
  // حشرات وزواحف
  'فراشة': 'butterfly',
  'فراشات': 'butterflies',
  'نحلة': 'bee',
  'نحل': 'bees',
  'يعسوب': 'dragonfly',
  'خنفساء': 'beetle',
  'عنكبوت': 'spider',
  'ثعبان': 'snake',
  'ثعابين': 'snakes',
  'تمساح': 'crocodile',
  'سحلية': 'lizard',
  'ضفدع': 'frog',
  
  // ══════════════════════════════════════
  // 🎨 ألوان
  // ══════════════════════════════════════
  'لون': 'color',
  'الوان': 'colors',
  'ابيض': 'white',
  'بيضاء': 'white',
  'اسود': 'black',
  'سوداء': 'black',
  'احمر': 'red',
  'حمراء': 'red',
  'ازرق': 'blue',
  'زرقاء': 'blue',
  'اخضر': 'green',
  'خضراء': 'green',
  'اصفر': 'yellow',
  'صفراء': 'yellow',
  'برتقالي': 'orange',
  'برتقالية': 'orange',
  'بنفسجي': 'purple violet',
  'بنفسجية': 'purple',
  'وردي': 'pink',
  'وردية': 'pink',
  'بني': 'brown',
  'بنية': 'brown',
  'رمادي': 'gray',
  'رمادية': 'gray',
  'ذهبي': 'golden gold',
  'ذهبية': 'golden',
  'فضي': 'silver',
  'فضية': 'silver',
  'نحاسي': 'copper bronze',
  'فيروزي': 'turquoise',
  'زيتي': 'olive',
  'قرمزي': 'crimson',
  'عنابي': 'burgundy',
  
  // ══════════════════════════════════════
  // ✨ صفات شائعة
  // ══════════════════════════════════════
  'جميل': 'beautiful',
  'جميلة': 'beautiful',
  'جمال': 'beauty',
  'رائع': 'amazing wonderful',
  'رائعة': 'amazing',
  'روعة': 'wonderful',
  'خيالي': 'fantasy',
  'خيالية': 'fantasy',
  'ساحر': 'charming magical',
  'ساحرة': 'charming',
  'سحري': 'magical',
  'مذهل': 'stunning',
  'مذهلة': 'stunning',
  'بديع': 'magnificent',
  'رومانسي': 'romantic',
  'رومانسية': 'romantic',
  'هادئ': 'calm peaceful',
  'هادئة': 'calm',
  'هدوء': 'peace',
  'سلام': 'peace',
  'مريح': 'relaxing',
  'منعش': 'refreshing',
  
  // أحجام وقياسات
  'كبير': 'big large',
  'كبيرة': 'big',
  'صغير': 'small',
  'صغيرة': 'small',
  'ضخم': 'huge giant',
  'ضخمة': 'huge',
  'عملاق': 'giant',
  'عملاقة': 'giant',
  'صغير': 'tiny',
  'دقيق': 'tiny',
  'عالي': 'high tall',
  'عالية': 'high',
  'منخفض': 'low',
  'طويل': 'long tall',
  'طويلة': 'long',
  'قصير': 'short',
  'واسع': 'wide',
  'واسعة': 'wide',
  'ضيق': 'narrow',
  
  // إضاءة وظلام
  'مضيء': 'bright light',
  'مضيئة': 'bright',
  'ساطع': 'bright shiny',
  'لامع': 'shiny glowing',
  'متوهج': 'glowing',
  'مظلم': 'dark',
  'مظلمة': 'dark',
  'ظلام': 'darkness',
  'معتم': 'dim',
  'ظل': 'shadow',
  'ظلال': 'shadows',
  'شعاع': 'ray beam',
  'اشعة': 'rays',
  'ضوء': 'light',
  'انوار': 'lights',
  
  // حالات
  'قديم': 'old ancient',
  'قديمة': 'old',
  'عتيق': 'vintage antique',
  'اثري': 'ancient',
  'تراثي': 'heritage',
  'عصري': 'modern',
  'عصرية': 'modern',
  'حديث': 'modern contemporary',
  'معاصر': 'contemporary',
  'مستقبلي': 'futuristic',
  'كلاسيكي': 'classic',
  'كلاسيكية': 'classic',
  'فخم': 'luxury luxurious',
  'فخمة': 'luxury',
  'فاخر': 'luxury',
  'راقي': 'elegant',
  'انيق': 'elegant stylish',
  'بسيط': 'simple minimalist',
  'بسيطة': 'simple',
  'نظيف': 'clean',
  'ملون': 'colorful',
  'ملونة': 'colorful',
  'احادي': 'monochrome',
  'شفاف': 'transparent',
  'ضبابي': 'blurry foggy',
  'واضح': 'clear',
  
  // مشاعر
  'سعيد': 'happy',
  'سعيدة': 'happy',
  'سعادة': 'happiness',
  'فرح': 'joy',
  'حزين': 'sad',
  'حزينة': 'sad',
  'حزن': 'sadness',
  'غاضب': 'angry',
  'خائف': 'scary',
  'مخيف': 'scary horror',
  'رعب': 'horror',
  'لطيف': 'cute lovely',
  'لطيفة': 'cute',
  'محبوب': 'lovely',
  
  // ══════════════════════════════════════
  // 🚗 مركبات ومواصلات
  // ══════════════════════════════════════
  'سيارة': 'car',
  'سيارات': 'cars',
  'عربة': 'car vehicle',
  'شاحنة': 'truck',
  'حافلة': 'bus',
  'دراجة': 'bicycle motorcycle',
  'دراجات': 'bikes',
  'موتوسيكل': 'motorcycle',
  'طائرة': 'airplane aircraft',
  'طائرات': 'airplanes',
  'هليكوبتر': 'helicopter',
  'قارب': 'boat',
  'قوارب': 'boats',
  'يخت': 'yacht',
  'سفينة': 'ship',
  'سفن': 'ships',
  'قطار': 'train',
  'قطارات': 'trains',
  'صاروخ': 'rocket',
  'صواريخ': 'rockets',
  'مركبة': 'spacecraft vehicle',
  'فضائية': 'space',
  
  // ══════════════════════════════════════
  // 🎮 تقنية وألعاب
  // ══════════════════════════════════════
  'تقنية': 'technology tech',
  'تكنولوجيا': 'technology',
  'رقمي': 'digital',
  'رقمية': 'digital',
  'كمبيوتر': 'computer',
  'حاسوب': 'computer',
  'لابتوب': 'laptop',
  'هاتف': 'phone',
  'موبايل': 'mobile',
  'روبوت': 'robot',
  'الي': 'robot',
  'ذكاء': 'artificial intelligence',
  'اصطناعي': 'artificial',
  'واقع': 'virtual reality',
  'افتراضي': 'virtual',
  'لعبة': 'game',
  'العاب': 'games',
  'لاعب': 'gamer player',
  'كرة': 'ball',
  'رياضة': 'sport',
  'رياضي': 'sport',
  'رياضية': 'sport',
  'رياضات': 'sports',
  'انمي': 'anime',
  'كرتون': 'cartoon',
  'مانجا': 'manga',
  'شخصية': 'character',
  'شخصيات': 'characters',
  'بطل': 'hero',
  'ابطال': 'heroes',
  
  // ══════════════════════════════════════
  // 🎨 فن وتصميم
  // ══════════════════════════════════════
  'فن': 'art',
  'فني': 'artistic',
  'فنية': 'artistic',
  'فنان': 'artist',
  'رسم': 'painting drawing',
  'رسمة': 'drawing',
  'رسومات': 'drawings',
  'لوحة': 'painting',
  'لوحات': 'paintings',
  'تصميم': 'design',
  'تصاميم': 'designs',
  'صورة': 'picture image photo',
  'صور': 'pictures photos',
  'تصوير': 'photography',
  'مصور': 'photographer',
  'ابداع': 'creative',
  'ابداعي': 'creative',
  'تجريدي': 'abstract',
  'واقعي': 'realistic',
  'سريالي': 'surreal',
  'نحت': 'sculpture',
  'منحوتة': 'sculpture',
  'فسيفساء': 'mosaic',
  'زخرفة': 'decoration',
  'زخارف': 'decorations',
  'نقش': 'pattern engraving',
  'نقوش': 'patterns',
  'خط': 'calligraphy line',
  'خطوط': 'lines',
  
  // ══════════════════════════════════════
  // 🎬 ترفيه وثقافة
  // ══════════════════════════════════════
  'سينما': 'cinema',
  'فيلم': 'movie film',
  'افلام': 'movies',
  'مسرح': 'theater',
  'موسيقى': 'music',
  'اغنية': 'song',
  'مغني': 'singer',
  'راقص': 'dancer',
  'رقص': 'dance',
  'حفلة': 'party concert',
  'مهرجان': 'festival',
  'احتفال': 'celebration',
  'كتاب': 'book',
  'كتب': 'books',
  'مكتبة': 'library',
  'قراءة': 'reading',
  'كاتب': 'writer',
  'شاعر': 'poet',
  'شعر': 'poetry',
  'قصة': 'story',
  'قصص': 'stories',
  'رواية': 'novel',
  
  // ══════════════════════════════════════
  // 🍔 طعام وشراب
  // ══════════════════════════════════════
  'طعام': 'food',
  'اكل': 'food',
  'وجبة': 'meal',
  'فاكهة': 'fruit',
  'فواكه': 'fruits',
  'خضار': 'vegetables',
  'خضروات': 'vegetables',
  'حلوى': 'candy sweets',
  'حلويات': 'desserts',
  'كيك': 'cake',
  'شوكولاتة': 'chocolate',
  'قهوة': 'coffee',
  'شاي': 'tea',
  'عصير': 'juice',
  'ماء': 'water',
  'مشروب': 'drink beverage',
  
  // ══════════════════════════════════════
  // 👶 أشخاص وعائلة
  // ══════════════════════════════════════
  'شخص': 'person',
  'اشخاص': 'people',
  'ناس': 'people',
  'رجل': 'man',
  'رجال': 'men',
  'امرأة': 'woman',
  'نساء': 'women',
  'طفل': 'child kid',
  'اطفال': 'children kids',
  'طفلة': 'girl kid',
  'ولد': 'boy',
  'اولاد': 'boys',
  'بنت': 'girl',
  'بنات': 'girls',
  'عائلة': 'family',
  'اسرة': 'family',
  'صديق': 'friend',
  'اصدقاء': 'friends',
  'حبيب': 'lover',
  'حب': 'love',
  'عشق': 'love passion',
  
  // ══════════════════════════════════════
  // 🏖️ أماكن وسياحة
  // ══════════════════════════════════════
  'مكان': 'place',
  'اماكن': 'places',
  'موقع': 'location site',
  'منطقة': 'area region',
  'دولة': 'country',
  'دول': 'countries',
  'قارة': 'continent',
  'عالم': 'world',
  'كوكب': 'planet',
  'ارض': 'earth',
  'سياحة': 'tourism travel',
  'سفر': 'travel',
  'رحلة': 'trip journey',
  'مغامرة': 'adventure',
  'استكشاف': 'exploration',
  'خريطة': 'map',
  'بوصلة': 'compass',
  
  // ══════════════════════════════════════
  // ⚽ رياضات محددة
  // ══════════════════════════════════════
  'كرة': 'football soccer ball',
  'قدم': 'football soccer',
  'سلة': 'basketball',
  'طائرة': 'volleyball',
  'تنس': 'tennis',
  'سباحة': 'swimming',
  'غوص': 'diving',
  'تزلج': 'skiing skating',
  'جري': 'running',
  'ركض': 'running',
  'قفز': 'jumping',
  'تسلق': 'climbing',
  'يوغا': 'yoga',
  'جمباز': 'gymnastics',
  'ملاكمة': 'boxing',
  'كاراتيه': 'karate',
  
  // ══════════════════════════════════════
  // 🎄 مناسبات ومواسم
  // ══════════════════════════════════════
  'ربيع': 'spring',
  'صيف': 'summer',
  'خريف': 'autumn fall',
  'شتاء': 'winter',
  'موسم': 'season',
  'مواسم': 'seasons',
  'عيد': 'holiday celebration',
  'اعياد': 'holidays',
  'كريسماس': 'christmas',
  'هالوين': 'halloween',
  'راس': 'new year',
  'سنة': 'new year',
  'عام': 'new year',
  'ميلاد': 'birthday christmas',
  'زفاف': 'wedding',
  'حفل': 'ceremony party'
};

/**
 * ترجمة نص من العربية إلى الإنجليزية
 * يستخدم القاموس المحلي فقط - فوري ودقيق
 * @returns {Promise<string|null>} - النص المترجم أو null إذا لم توجد ترجمة
 */
export async function translateToEnglish(arabicText) {
  const text = arabicText.trim();
  if (!text) return arabicText;

  // ترجمة الكلمات من القاموس
  const words = text.toLowerCase().split(/\s+/);
  const translatedWords = [];
  
  for (const word of words) {
    // تجاهل حروف الربط
    if (['في', 'و', 'من', 'إلى', 'على', 'مع', 'عن', 'ال'].includes(word)) {
      continue;
    }
    
    // إزالة "ال" التعريف من بداية الكلمة
    let cleanWord = word;
    if (word.startsWith('ال')) {
      cleanWord = word.substring(2);
    }
    
    // البحث في القاموس
    if (DICTIONARY[cleanWord]) {
      translatedWords.push(DICTIONARY[cleanWord]);
    } else if (DICTIONARY[word]) {
      translatedWords.push(DICTIONARY[word]);
    }
  }
  
  // إذا وجدنا ترجمات، استخدمها
  if (translatedWords.length > 0) {
    const result = translatedWords.join(' ');
    console.log(`✅ ترجمة: "${text}" → "${result}"`);
    return result;
  }

  // لم توجد أي ترجمة
  console.log(`⚠️ لم توجد ترجمة لـ "${text}"`);
  return null;
}

/**
 * اختبار الخدمة
 */
export async function testTranslationService() {
  console.log('🧪 اختبار خدمة الترجمة (قاموس محلي)...\n');
  
  const tests = [
    // طبيعة
    'ثلج',
    'قمر',
    'سحب',
    'نجوم',
    'بحيرة',
    'شلال',
    'غروب الشمس',
    'شروق',
    // زهور
    'زهرة',
    'زهور',
    'ورود',
    'ياسمين',
    // حيوانات
    'قطة لطيفة',
    'ذئب',
    'نسر',
    'فراشة',
    // ألوان وصفات
    'سماء زرقاء',
    'جبال ثلجية',
    'غابة مظلمة',
    'بحر هادئ',
    // فضاء
    'فضاء',
    'مجرة',
    'كواكب',
    'صاروخ'
  ];
  
  for (const text of tests) {
    const translated = await translateToEnglish(text);
    console.log(`📝 "${text}" → "${translated}"\n`);
  }
  
  console.log('✅ الاختبار انتهى!');
}

// اختبار إذا تم تشغيل الملف مباشرة
if (import.meta.url === `file://${process.argv[1]}`) {
  testTranslationService();
}
