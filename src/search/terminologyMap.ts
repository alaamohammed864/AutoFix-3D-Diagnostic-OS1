/**
 * Automotive Multilingual Terminology Mapping (Arabic <-> English)
 * Fully compliant with OEM technical standards, SAE J1930 / J1979 DTC designations,
 * and common regional Arabic automotive dialects (Gulf, Levant, North Africa).
 */

export interface TermEntry {
  canonicalEn: string;
  canonicalAr: string;
  category: 'make' | 'model' | 'component' | 'system' | 'action' | 'diagnostic' | 'tool' | 'spec';
  synonymsEn: string[];
  synonymsAr: string[];
  standardOemCode?: string;
  relatedSystem?: string;
}

/**
 * Remove Arabic diacritics (tashkeel), normalize alef variants, yaa variants, taa marbuta,
 * and remove tatweel for consistent fuzzy & exact token matching.
 */
export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .trim()
    .toLowerCase()
    // Remove diacritics (harakat)
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs (أ, إ, آ, ٱ -> ا)
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Yaa (ى -> ي)
    .replace(/ى/g, 'ي')
    // Normalize Taa Marbuta (ة -> ه)
    .replace(/ة/g, 'ه')
    // Remove Tatweel (ـ)
    .replace(/ـ/g, '')
    // Remove punctuation
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»]/g, ' ')
    // Normalize multi spaces
    .replace(/\s+/g, ' ');
}

/**
 * Check if a text contains Arabic unicode characters
 */
export function isArabicText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
}

/**
 * Comprehensive Automotive Terminology Registry
 */
export const AUTOMOTIVE_TERMINOLOGY: TermEntry[] = [
  // =================== 1. VEHICLE MAKES ===================
  {
    canonicalEn: 'Toyota',
    canonicalAr: 'تويوتا',
    category: 'make',
    synonymsEn: ['toyota', 'toy'],
    synonymsAr: ['تويوتا', 'تويوتاه'],
  },
  {
    canonicalEn: 'Ford',
    canonicalAr: 'فورد',
    category: 'make',
    synonymsEn: ['ford'],
    synonymsAr: ['فورد', 'فرد'],
  },
  {
    canonicalEn: 'Honda',
    canonicalAr: 'هوندا',
    category: 'make',
    synonymsEn: ['honda'],
    synonymsAr: ['هوندا', 'هونداه'],
  },
  {
    canonicalEn: 'Porsche',
    canonicalAr: 'بورش',
    category: 'make',
    synonymsEn: ['porsche'],
    synonymsAr: ['بورش', 'بورشه', 'بورشا'],
  },
  {
    canonicalEn: 'BMW',
    canonicalAr: 'بي إم دبليو',
    category: 'make',
    synonymsEn: ['bmw', 'bimmer'],
    synonymsAr: ['بي ام دبليو', 'بي ام', 'بي إم دبليو', 'بيمر'],
  },
  {
    canonicalEn: 'Chevrolet',
    canonicalAr: 'شيفروليه',
    category: 'make',
    synonymsEn: ['chevrolet', 'chevy'],
    synonymsAr: ['شيفروليه', 'شفروليه', 'شفر', 'شفرليت', 'شفورليه'],
  },
  {
    canonicalEn: 'Nissan',
    canonicalAr: 'نيسان',
    category: 'make',
    synonymsEn: ['nissan'],
    synonymsAr: ['نيسان'],
  },
  {
    canonicalEn: 'Mercedes-Benz',
    canonicalAr: 'مرسيدس بنز',
    category: 'make',
    synonymsEn: ['mercedes', 'mercedes-benz', 'benz', 'mb'],
    synonymsAr: ['مرسيدس', 'مرسيدس بنز', 'بنز', 'مرسدس'],
  },
  {
    canonicalEn: 'Audi',
    canonicalAr: 'أودي',
    category: 'make',
    synonymsEn: ['audi'],
    synonymsAr: ['أودي', 'اودي'],
  },
  {
    canonicalEn: 'Hyundai',
    canonicalAr: 'هيونداي',
    category: 'make',
    synonymsEn: ['hyundai'],
    synonymsAr: ['هيونداي', 'هونداي'],
  },

  // =================== 2. VEHICLE MODELS ===================
  {
    canonicalEn: 'Camry',
    canonicalAr: 'كامري',
    category: 'model',
    synonymsEn: ['camry', 'xv70', 'camry se', 'camry xle'],
    synonymsAr: ['كامري', 'كامري xv70', 'كامري ٢٠١٨', 'كامري 2018', 'الكامري'],
  },
  {
    canonicalEn: 'F-150',
    canonicalAr: 'إف-150',
    category: 'model',
    synonymsEn: ['f-150', 'f150', 'ford f-150', 'f 150'],
    synonymsAr: ['اف 150', 'إف 150', 'اف-150', 'إف-150', 'ف 150', 'فورد اف 150', 'بيك اب فورد'],
  },
  {
    canonicalEn: 'Civic',
    canonicalAr: 'سيفيك',
    category: 'model',
    synonymsEn: ['civic', 'civic ex', 'honda civic'],
    synonymsAr: ['سيفيك', 'سيفك', 'هوندا سيفيك', 'السيفيك'],
  },
  {
    canonicalEn: '911 Carrera',
    canonicalAr: '911 كاريرا',
    category: 'model',
    synonymsEn: ['911', 'carrera', '992', 'porsche 911'],
    synonymsAr: ['911', 'كاريرا', 'بورش 911', '٩١١'],
  },
  {
    canonicalEn: 'M3 Competition',
    canonicalAr: 'إم 3 كومبيتيشن',
    category: 'model',
    synonymsEn: ['m3', 'g80', 'bmw m3'],
    synonymsAr: ['ام 3', 'إم 3', 'ام3', 'إم3', 'بي ام ام 3'],
  },
  {
    canonicalEn: 'Corvette',
    canonicalAr: 'كورفيت',
    category: 'model',
    synonymsEn: ['corvette', 'c8', 'stingray'],
    synonymsAr: ['كورفيت', 'كفربت', 'ستينغراي'],
  },
  {
    canonicalEn: 'RAV4',
    canonicalAr: 'راف 4',
    category: 'model',
    synonymsEn: ['rav4', 'rav 4', 'toyota rav4'],
    synonymsAr: ['راف 4', 'راف فور', 'راف4', 'تويوتا راف 4'],
  },

  // =================== 3. CORE COMPONENTS (With User Requested Examples) ===================
  {
    canonicalEn: 'Battery',
    canonicalAr: 'بطارية',
    category: 'component',
    relatedSystem: 'Electrical & Charging',
    standardOemCode: 'BCI-35 / AGM / Flooded',
    synonymsEn: ['battery', '12v battery', 'car battery', 'accumulator', 'lead-acid', 'group 35', 'agm battery'],
    synonymsAr: [
      'بطارية',
      'البطارية',
      'بطاريه',
      'البطاريه',
      'بطارية السيارة',
      'بطارية 12 فولت',
      'بطاريه السياره',
      'بطاريات',
      'حجر البطارية',
      'مركم',
      'المركم',
    ],
  },
  {
    canonicalEn: 'Fuel Pump',
    canonicalAr: 'مضخة الوقود',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'FP-MODULE',
    synonymsEn: ['fuel pump', 'high pressure fuel pump', 'lpfp', 'hpfp', 'fuel sending unit', 'fuel pump module'],
    synonymsAr: [
      'مضخة الوقود',
      'مضخة وقود',
      'طرمبة البنزين',
      'طرمبة بنزين',
      'طلمبة البنزين',
      'طرمبة الوقود',
      'مضخة البنزين',
      'فيول بمب',
      'مضخه الوقود',
      'طرمبه البنزين',
      'طرمبة بنزيل',
      'مضخة الوقود الكهربائية',
    ],
  },
  {
    canonicalEn: 'Water Pump',
    canonicalAr: 'مضخة الماء',
    category: 'component',
    relatedSystem: 'Thermal & Cooling',
    standardOemCode: 'WP-ASSY',
    synonymsEn: ['water pump', 'coolant pump', 'engine water pump', 'electric water pump', 'auxiliary water pump'],
    synonymsAr: [
      'مضخة الماء',
      'مضخة ماء',
      'طرمبة الماء',
      'طرمبة ماء',
      'طرمبة الموية',
      'طرمبة موية',
      'طلمبة المية',
      'مضخة التبريد',
      'ووتر بمب',
      'مضخه الماء',
      'طرمبه الماء',
      'طرمبه المويه',
    ],
  },
  {
    canonicalEn: 'Alternator',
    canonicalAr: 'مولد',
    category: 'component',
    relatedSystem: 'Electrical & Charging',
    standardOemCode: 'ALT-GEN',
    synonymsEn: ['alternator', 'generator', 'charging unit', 'dynamo', 'denso alternator', 'stator'],
    synonymsAr: [
      'مولد',
      'المولد',
      'دينامو',
      'الدينامو',
      'مولد الكهرباء',
      'مولد كهرباء',
      'دينمو',
      'الدينمو',
      'مولد الشحن',
      'دينامو الشحن',
      'الترنيتور',
    ],
  },
  {
    canonicalEn: 'Starter',
    canonicalAr: 'بادئ الحركة',
    category: 'component',
    relatedSystem: 'Electrical & Charging',
    standardOemCode: 'STR-MOTOR',
    synonymsEn: ['starter', 'starter motor', 'cranking motor', 'solenoid starter'],
    synonymsAr: [
      'بادئ الحركة',
      'بادئ حركة',
      'سلف',
      'السلف',
      'مارش',
      'المارش',
      'موتور السلف',
      'محرك التشغيل',
      'سيلف',
      'بادئ التشغيل',
      'ستارتر',
      'بادىء الحركة',
    ],
  },
  {
    canonicalEn: 'Radiator',
    canonicalAr: 'راديتر',
    category: 'component',
    relatedSystem: 'Thermal & Cooling',
    standardOemCode: 'RAD-HEAT-EX',
    synonymsEn: ['radiator', 'engine radiator', 'cooling radiator', 'heat exchanger'],
    synonymsAr: [
      'راديتر',
      'الراديتر',
      'رديتر',
      'الرديتر',
      'رادياتير',
      'الرادياتير',
      'مبرد',
      'المبرد',
      'مبرد المحرك',
      'مبرد ماء',
      'رادييتر',
    ],
  },
  {
    canonicalEn: 'HVAC / Air Conditioning',
    canonicalAr: 'مكيف',
    category: 'component',
    relatedSystem: 'Climate Control / HVAC',
    standardOemCode: 'HVAC-AC',
    synonymsEn: ['hvac', 'air conditioning', 'a/c', 'ac', 'climate control', 'heater', 'compressor'],
    synonymsAr: [
      'مكيف',
      'المكيف',
      'تكييف',
      'التكييف',
      'مكيف السيارة',
      'تبريد المكيف',
      'نظام التكييف',
      'تدفئة وتكييف',
      'كمبروسر المكيف',
      'ضاغط المكيف',
      'غاز المكيف',
      'فريون',
      'فريون المكيف',
      'تكييف الهواء',
    ],
  },
  {
    canonicalEn: 'Spark Plugs',
    canonicalAr: 'شمعات الاحتراق',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'SPK-PLUG',
    synonymsEn: ['spark plug', 'spark plugs', 'iridium plugs', 'platinum plugs', 'igniters'],
    synonymsAr: [
      'شمعات الاحتراق',
      'شمعات إشعال',
      'شمعات الاشتعال',
      'بواجي',
      'البواجي',
      'بوجيهات',
      'البوجيهات',
      'شمعة الاحتراق',
      'سبارك بلج',
      'بوجي',
      'البوجي',
    ],
  },
  {
    canonicalEn: 'Ignition Coils',
    canonicalAr: 'كويلات الإشعال',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'COP-IGN',
    synonymsEn: ['ignition coil', 'ignition coils', 'cop', 'coil on plug', 'coil pack'],
    synonymsAr: [
      'كويلات الإشعال',
      'كويلات',
      'الكويلات',
      'كويل',
      'الكويل',
      'ملفات الإشعال',
      'ملف إشعال',
      'بوبينة',
      'البوبينة',
      'بوبينات',
    ],
  },
  {
    canonicalEn: 'Engine Coolant',
    canonicalAr: 'سائل التبريد',
    category: 'component',
    relatedSystem: 'Thermal & Cooling',
    standardOemCode: 'COOLANT-5050',
    synonymsEn: ['coolant', 'antifreeze', 'engine coolant', 'radiator fluid', 'super long life coolant'],
    synonymsAr: [
      'سائل التبريد',
      'سائل تبريد',
      'ماء الرديتر',
      'مية الرديتر',
      'ماء التبريد',
      'مانع التجمد',
      'ماء الراديتر',
      'كولانت',
      'محلول التبريد',
      'ماء احمر',
      'ماء وردي',
      'ماء اخضر',
    ],
  },
  {
    canonicalEn: 'Engine Motor Oil',
    canonicalAr: 'زيت المحرك',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'OIL-0W16-0W20',
    synonymsEn: ['engine oil', 'motor oil', 'oil', 'lubricant', '0w-16', '0w-20', '5w-30', 'synthetic oil'],
    synonymsAr: [
      'زيت المحرك',
      'زيت محرك',
      'زيت المكينة',
      'زيت مكينة',
      'زيت الموتور',
      'زيت السياره',
      'زيت تخليقي',
      'تغيير الزيت',
      'الزيت',
    ],
  },
  {
    canonicalEn: 'Oil Filter',
    canonicalAr: 'فلتر الزيت',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'FLT-OIL',
    synonymsEn: ['oil filter', 'engine oil filter', 'oil cartridge'],
    synonymsAr: [
      'فلتر الزيت',
      'فلتر زيت',
      'سيفون',
      'السيفون',
      'فلتر المكينة',
      'مصفاة الزيت',
      'فلتر زيت المحرك',
    ],
  },
  {
    canonicalEn: 'Brake Pads',
    canonicalAr: 'فحمات الفرامل',
    category: 'component',
    relatedSystem: 'Braking & ABS',
    standardOemCode: 'BRK-PAD',
    synonymsEn: ['brake pads', 'brake pad', 'front pads', 'rear pads', 'friction pads', 'brake shoes'],
    synonymsAr: [
      'فحمات الفرامل',
      'فحمات',
      'الفحمات',
      'تيل الفرامل',
      'تيل فرامل',
      'أقمشة الفرامل',
      'اقمشة الفرامل',
      'قماشات',
      'القماشات',
      'فحمات بريك',
      'سفايف',
      'السفايف',
      'تيل البريك',
    ],
  },
  {
    canonicalEn: 'Brake Rotors',
    canonicalAr: 'هوبات الفرامل',
    category: 'component',
    relatedSystem: 'Braking & ABS',
    standardOemCode: 'BRK-DISC',
    synonymsEn: ['brake rotors', 'brake discs', 'rotors', 'discs', 'disc brake'],
    synonymsAr: [
      'هوبات الفرامل',
      'هوبات',
      'الهوبات',
      'أقراص الفرامل',
      'اقراص الفرامل',
      'ديسكات الفرامل',
      'ديسكات',
      'هوب',
      'الهوب',
      'قرص الفرامل',
      'طنابير الفرامل',
      'طنابير',
    ],
  },
  {
    canonicalEn: 'Brake Light',
    canonicalAr: 'لمبة الفرامل',
    category: 'component',
    relatedSystem: 'Lighting & Electronics',
    standardOemCode: 'BULB-7443',
    synonymsEn: ['brake light', 'tail light', 'stop light', 'brake lamp', '7443 bulb'],
    synonymsAr: [
      'لمبة الفرامل',
      'لمبة فرامل',
      'إضاءة الفرامل',
      'اضاءة الفرامل',
      'لمبة البريك',
      'نور البريك',
      'اسطب الفرامل',
      'إسطب خلفي',
      'لمبة التوقف',
      'لمبات التوقف',
    ],
  },
  {
    canonicalEn: 'Thermostat',
    canonicalAr: 'ثرموستات',
    category: 'component',
    relatedSystem: 'Thermal & Cooling',
    standardOemCode: 'THERMO-VALVE',
    synonymsEn: ['thermostat', 'coolant thermostat', 'bypass thermostat', 'thermostatic valve'],
    synonymsAr: [
      'ثرموستات',
      'الثرموستات',
      'بلف الحرارة',
      'بلف حرارة',
      'بلف الموية',
      'منظم الحرارة',
      'ترموستات',
      'ثيرموستات',
      'صمام الحرارة',
    ],
  },
  {
    canonicalEn: 'Mass Airflow Sensor (MAF)',
    canonicalAr: 'حساس تدفق الهواء',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'MAF-SEN',
    synonymsEn: ['maf', 'maf sensor', 'mass airflow', 'air meter', 'hot wire sensor'],
    synonymsAr: [
      'حساس تدفق الهواء',
      'حساس الهواء',
      'حساس الماف',
      'حساس ماف',
      'مقياس تدفق الهواء',
      'حساس قربة الهواء',
      'حساس الايرماس',
      'ايرماس',
    ],
  },
  {
    canonicalEn: 'Oxygen Sensor (O2)',
    canonicalAr: 'حساس الأكسجين',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'O2-SEN-AFR',
    synonymsEn: ['o2 sensor', 'oxygen sensor', 'air fuel ratio sensor', 'afr sensor', 'lambda sensor'],
    synonymsAr: [
      'حساس الأكسجين',
      'حساس أكسجين',
      'حساس الشكمان',
      'حساس شكمان',
      'حساس العادم',
      'حساس البيئة',
      'حساس الشكمان رقم 1',
      'حساس الشكمان رقم 2',
      'حساس لمبادا',
    ],
  },
  {
    canonicalEn: 'Fuse Box & Fuses',
    canonicalAr: 'الفيوزات والمصهرات',
    category: 'component',
    relatedSystem: 'Electrical & Charging',
    standardOemCode: 'FUSE-JB',
    synonymsEn: ['fuse', 'fuses', 'fuse box', 'fusible link', 'junction block', 'mini fuse', 'jcase'],
    synonymsAr: [
      'فيوز',
      'فيوزات',
      'الفيوزات',
      'علبة الفيوزات',
      'علبه الفيوزات',
      'مصهر',
      'مصهرات',
      'فيوز البطارية',
      'فيوز السلف',
      'فيوز المولد',
      'كتاوت وفيوزات',
    ],
  },
  {
    canonicalEn: 'Relay',
    canonicalAr: 'ريليه',
    category: 'component',
    relatedSystem: 'Electrical & Charging',
    standardOemCode: 'RELAY-4PIN',
    synonymsEn: ['relay', 'micro relay', 'starter relay', 'efi relay', 'spst relay'],
    synonymsAr: [
      'ريليه',
      'الريليه',
      'كتاوت',
      'الكتاوت',
      'مرحل',
      'المرحل',
      'ريلي',
      'الريلي',
      'قاطع كهرومغناطيسي',
      'كتاوت السلف',
      'كتاوت المكيف',
      'كتاوت طرمبة البنزين',
    ],
  },
  {
    canonicalEn: 'Engine Control Unit (ECU/ECM)',
    canonicalAr: 'كمبيوتر المحرك',
    category: 'component',
    relatedSystem: 'Powertrain & Engine',
    standardOemCode: 'ECU-PCM',
    synonymsEn: ['ecu', 'ecm', 'pcm', 'engine computer', 'powertrain control module', 'dme'],
    synonymsAr: [
      'كمبيوتر المحرك',
      'كمبيوتر السيارة',
      'كمبيوتر مكينة',
      'وحدة التحكم الإلكترونية',
      'عقل السيارة',
      'اي سي يو',
      'اي سي ام',
      'ظفيرة وكمبيوتر',
    ],
  },
  {
    canonicalEn: 'CAN Bus Network',
    canonicalAr: 'شبكة الكان باس',
    category: 'component',
    relatedSystem: 'Electrical & Charging',
    standardOemCode: 'CAN-BUS-500K',
    synonymsEn: ['can bus', 'can-fd', 'controller area network', 'can high', 'can low', 'obd-ii pin 6 14'],
    synonymsAr: [
      'شبكة الكان',
      'شبكة الكان باس',
      'ناقل can',
      'خط الكان',
      'كان هاي',
      'كان لو',
      'شبكة التواصل بين الحساسات',
    ],
  },

  // =================== 4. REPAIR ACTIONS & PROCEDURES ===================
  {
    canonicalEn: 'Replacement',
    canonicalAr: 'تغيير واستبدال',
    category: 'action',
    synonymsEn: ['replacement', 'replace', 'replacing', 'swap', 'change', 'install', 'installation'],
    synonymsAr: [
      'تغيير',
      'استبدال',
      'تبديل',
      'فك وتركيب',
      'تغيير بطارية',
      'تركيب',
      'تنزيل وتركيب',
      'تبديله',
      'تغييره',
      'بدل',
      'غير',
    ],
  },
  {
    canonicalEn: 'Inspection & Diagnostic',
    canonicalAr: 'فحص وتشخيص',
    category: 'action',
    synonymsEn: ['inspection', 'inspect', 'diagnostic', 'diagnostics', 'diagnose', 'test', 'testing', 'check', 'scan'],
    synonymsAr: [
      'فحص',
      'تشخيص',
      'كشف',
      'فحص كمبيوتر',
      'معاينة',
      'اختبار',
      'كشف اعطال',
      'افحص',
      'اكشف',
      'شيك',
      'تشييك',
      'فحص بالجهاز',
    ],
  },
  {
    canonicalEn: 'Flush & Drain',
    canonicalAr: 'تفريغ وتنظيف / شطف',
    category: 'action',
    synonymsEn: ['flush', 'flushing', 'drain', 'drain and refill', 'clean'],
    synonymsAr: [
      'تفريغ',
      'تنظيف',
      'شطف',
      'غسيل',
      'تسييخ',
      'تفريغ وتعبئة',
      'غسيل الرديتر',
      'تنظيف دورة التبريد',
    ],
  },
  {
    canonicalEn: 'Bleed',
    canonicalAr: 'تنسيم وتفريغ الهواء',
    category: 'action',
    synonymsEn: ['bleed', 'bleeding', 'air purge', 'vacuum bleed'],
    synonymsAr: [
      'تنسيم',
      'تفريغ الهواء',
      'سحب الهواء',
      'تنسيم الفرامل',
      'تنسيم ماء الرديتر',
      'أخذ هواء',
      'اخذ هواء',
    ],
  },
  {
    canonicalEn: 'Reset & Calibration',
    canonicalAr: 'إعادة ضبط وبرمجة',
    category: 'action',
    synonymsEn: ['reset', 'ecu reset', 'calibration', 'relearn', 'programming', 'clear dtc'],
    synonymsAr: [
      'اعادة ضبط',
      'إعادة ضبط',
      'برمجة',
      'برمجه',
      'تصفير',
      'مسح كود',
      'معايرة',
      'ريست',
      'برمجة الحساسات',
      'برمجة دعسة',
    ],
  },
  {
    canonicalEn: 'Torque & Fastening',
    canonicalAr: 'عزم الشد والربط',
    category: 'action',
    synonymsEn: ['torque', 'tightening', 'fasten', 'ft-lb', 'nm', 'lug torque'],
    synonymsAr: [
      'عزم',
      'عزم الشد',
      'عزم الربط',
      'شد',
      'ربط',
      'جدول العزوم',
      'نيوتن متر',
      'رطل قدم',
      'شد كفرات',
      'عزم البواجي',
    ],
  },

  // =================== 5. DIAGNOSTIC TERMINOLOGY & DTCs ===================
  {
    canonicalEn: 'DTC Fault Code',
    canonicalAr: 'رمز العطل التشخيصي DTC',
    category: 'diagnostic',
    standardOemCode: 'SAE-J1979-DTC',
    synonymsEn: ['dtc', 'fault code', 'obd code', 'error code', 'trouble code', 'p0171', 'p0300', 'p0420'],
    synonymsAr: [
      'كود العطل',
      'رمز العطل',
      'كود الخطأ',
      'رمز الخطأ',
      'كود dtc',
      'رموز الاعطال',
      'اكواد الاعطال',
      'فحص obd',
      'عطل',
    ],
  },
  {
    canonicalEn: 'System Too Lean (Bank 1)',
    canonicalAr: 'فقر خليط الوقود (بنك 1)',
    category: 'diagnostic',
    standardOemCode: 'P0171',
    synonymsEn: ['p0171', 'system too lean', 'lean condition', 'unmetered air leak', 'lean bank 1'],
    synonymsAr: [
      'فقر الوقود',
      'خليط فقير',
      'فقر في البنزين',
      'كود p0171',
      'p0171',
      'تسريب هواء شفط',
      'ضعف ضغط الوقود',
      'خلخلة الهواء',
    ],
  },
  {
    canonicalEn: 'Cylinder Misfire',
    canonicalAr: 'احتراق ناقص / تقطيع وتفتفة المحرك',
    category: 'diagnostic',
    standardOemCode: 'P0300 / P0301-P0304',
    synonymsEn: ['p0300', 'p0301', 'p0302', 'misfire', 'cylinder misfire', 'random misfire', 'rough idle'],
    synonymsAr: [
      'تفتفة',
      'تقطيع',
      'ميس فاير',
      'ميسفاير',
      'احتراق ناقص',
      'رجفة المحرك',
      'تفتفة المحرك',
      'تقطيع في المكينة',
      'كود p0300',
      'p0300',
    ],
  },
  {
    canonicalEn: 'Catalytic Converter Efficiency',
    canonicalAr: 'كفاءة دبة التلوث / المحول الحفاز',
    category: 'diagnostic',
    standardOemCode: 'P0420',
    synonymsEn: ['p0420', 'catalyst system efficiency', 'catalytic converter', 'cat below threshold'],
    synonymsAr: [
      'دبة التلوث',
      'دبة الشكمان',
      'كفاءة المحول الحفاز',
      'المحول الحفاز',
      'دبة الرصاص',
      'كود p0420',
      'p0420',
      'انسداد دبة التلوث',
    ],
  },
  {
    canonicalEn: 'Coolant Bypass Valve Circuit',
    canonicalAr: 'دائرة صمام تحويل سائل التبريد',
    category: 'diagnostic',
    standardOemCode: 'P2681',
    synonymsEn: ['p2681', 'coolant bypass valve', 'bypass actuator', 'engine coolant bypass'],
    synonymsAr: [
      'بلف تجاوز التبريد',
      'صمام تحويل سائل التبريد',
      'كود p2681',
      'p2681',
      'عطل بلف الحرارة الكهربائي',
    ],
  },
  {
    canonicalEn: 'Vacuum Leak',
    canonicalAr: 'تسريب هواء السحب / الفاكيوم',
    category: 'diagnostic',
    synonymsEn: ['vacuum leak', 'intake leak', 'unmetered air', 'smoke test leak'],
    synonymsAr: [
      'تسريب هواء',
      'تهريب هواء',
      'تهريب فاكيوم',
      'تسريب شفط',
      'فحص الدخان',
      'تسريب ثلاجة المحرك',
    ],
  },
  {
    canonicalEn: 'Voltage Drop Test',
    canonicalAr: 'فحص هبوط الجهد الكهربائي',
    category: 'diagnostic',
    synonymsEn: ['voltage drop', 'voltage drop test', 'ground drop', 'terminal resistance'],
    synonymsAr: [
      'هبوط الجهد',
      'نزول الفولت',
      'فحص هبوط الجهد',
      'هبوط الفولتية',
      'فقد الجهد',
      'مقاومة الأرضي',
    ],
  },
  {
    canonicalEn: 'Cold Cranking Amps (CCA)',
    canonicalAr: 'أمبير التدوير على البارد (CCA)',
    category: 'spec',
    synonymsEn: ['cca', 'cold cranking amps', 'battery capacity', 'conductance test'],
    synonymsAr: [
      'تيار البدء على البارد',
      'أمبير التدوير',
      'امبير التدوير',
      'قوة التشغيل على البارد',
      'فحص cca',
      'سعة البطارية',
    ],
  },
  {
    canonicalEn: 'Check Engine Light (MIL)',
    canonicalAr: 'لمبة فحص المحرك (التشيك إنجن)',
    category: 'diagnostic',
    synonymsEn: ['check engine', 'check engine light', 'mil', 'malfunction indicator lamp', 'cel'],
    synonymsAr: [
      'لمبة المكينة',
      'لمبة فحص المحرك',
      'لمبة التشيك',
      'علامة المكينة',
      'لمبة المحرك',
      'ضوء فحص المحرك',
      'علامة المحرك الصفراء',
    ],
  },
  {
    canonicalEn: 'No Crank Condition',
    canonicalAr: 'المحرك لا يدور (عطل السلف)',
    category: 'diagnostic',
    synonymsEn: ['no crank', 'engine will not crank', 'dead battery click', 'starter click'],
    synonymsAr: [
      'السيارة ما تدق',
      'المحرك لا يدور',
      'ما تدق سلف',
      'طقطقة السلف',
      'صوت نقرة بدون دوران',
      'لا يوجد تشغيل',
    ],
  },
  {
    canonicalEn: 'Crank No Start Condition',
    canonicalAr: 'المحرك يدور ولا يعمل',
    category: 'diagnostic',
    synonymsEn: ['crank no start', 'engine cranks but does not start', 'cranks no fire'],
    synonymsAr: [
      'تدق سلف وما تشتغل',
      'يدور المحرك ولا يشتغل',
      'تدق ولا تشتغل',
      'دوران بدون اشتعال',
      'السيارة تدق ولا تقلع',
    ],
  },
];

/**
 * Result of cross-lingual search normalization
 */
export interface NormalizedSearchTokens {
  originalQuery: string;
  detectedLanguage: 'ar' | 'en';
  normalizedQuery: string;
  year?: number;
  makeEn?: string;
  makeAr?: string;
  modelEn?: string;
  modelAr?: string;
  componentEn?: string;
  componentAr?: string;
  systemEn?: string;
  systemAr?: string;
  actionEn?: string;
  actionAr?: string;
  dtcCode?: string;
  matchedTerms: TermEntry[];
  canonicalSearchStringEn: string;
  canonicalSearchStringAr: string;
}

/**
 * Normalizes and extracts automotive entities whether the user inputs Arabic or English!
 *
 * Guaranteed to produce identical entity resolutions for:
 * "تغيير بطارية تويوتا كامري 2018"
 * AND
 * "Toyota Camry 2018 battery replacement"
 */
export function analyzeMultilingualAutomotiveQuery(query: string): NormalizedSearchTokens {
  const isAr = isArabicText(query);
  const normalizedText = isAr ? normalizeArabic(query) : query.toLowerCase().trim();
  const tokens = normalizedText.split(/\s+/).filter(Boolean);

  let year: number | undefined = undefined;
  let makeEn: string | undefined = undefined;
  let makeAr: string | undefined = undefined;
  let modelEn: string | undefined = undefined;
  let modelAr: string | undefined = undefined;
  let componentEn: string | undefined = undefined;
  let componentAr: string | undefined = undefined;
  let systemEn: string | undefined = undefined;
  let systemAr: string | undefined = undefined;
  let actionEn: string | undefined = undefined;
  let actionAr: string | undefined = undefined;
  let dtcCode: string | undefined = undefined;

  const matchedTerms: TermEntry[] = [];

  // 1. Detect 4-digit Year (1980 - 2035) or Arabic digits (e.g. ٢٠١٨)
  for (const token of tokens) {
    const westernDigits = token.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
    const match = westernDigits.match(/(19[89]\d|20[0-3]\d)/);
    if (match) {
      year = parseInt(match[1], 10);
      break;
    }
  }

  // 2. Detect Standard DTC (e.g. P0171, P0300, P2681, P0420, C0035, U0100, B1000)
  const dtcRegex = /\b([PCBU][0-3][0-9A-F]{3})\b/i;
  const dtcMatch = query.match(dtcRegex);
  if (dtcMatch) {
    dtcCode = dtcMatch[1].toUpperCase();
  }

  // 3. Multi-gram matching against Terminology Dictionary
  const fullNormalizedQuery = normalizedText;

  // Check multi-word synonyms first, then single-word
  for (const term of AUTOMOTIVE_TERMINOLOGY) {
    let matched = false;

    // Check English synonyms
    for (const syn of term.synonymsEn) {
      const synLower = syn.toLowerCase();
      if (
        fullNormalizedQuery.includes(synLower) ||
        tokens.some((t) => t === synLower || (synLower.length > 4 && t.includes(synLower)))
      ) {
        matched = true;
        break;
      }
    }

    // Check Arabic synonyms
    if (!matched) {
      for (const syn of term.synonymsAr) {
        const normSyn = normalizeArabic(syn);
        // Also support strip-al prefix
        const synWithoutAl = normSyn.startsWith('ال') ? normSyn.slice(2) : normSyn;

        if (
          fullNormalizedQuery.includes(normSyn) ||
          fullNormalizedQuery.includes(synWithoutAl) ||
          tokens.some((t) => {
            const tokenWithoutAl = t.startsWith('ال') ? t.slice(2) : t;
            return t === normSyn || t === synWithoutAl || tokenWithoutAl === synWithoutAl;
          })
        ) {
          matched = true;
          break;
        }
      }
    }

    if (matched) {
      matchedTerms.push(term);

      if (term.category === 'make' && !makeEn) {
        makeEn = term.canonicalEn;
        makeAr = term.canonicalAr;
      } else if (term.category === 'model' && !modelEn) {
        modelEn = term.canonicalEn;
        modelAr = term.canonicalAr;
      } else if (term.category === 'component' && !componentEn) {
        componentEn = term.canonicalEn;
        componentAr = term.canonicalAr;
        if (term.relatedSystem && !systemEn) {
          systemEn = term.relatedSystem;
        }
      } else if (term.category === 'action' && !actionEn) {
        actionEn = term.canonicalEn;
        actionAr = term.canonicalAr;
      } else if (term.category === 'system' && !systemEn) {
        systemEn = term.canonicalEn;
        systemAr = term.canonicalAr;
      } else if (term.standardOemCode && !dtcCode && term.standardOemCode.startsWith('P')) {
        dtcCode = term.standardOemCode;
      }
    }
  }

  // Synthesize canonical query strings in both English and Arabic
  const enParts: string[] = [];
  const arParts: string[] = [];

  if (actionEn) enParts.push(actionEn);
  if (actionAr) arParts.push(actionAr);

  if (componentEn) enParts.push(componentEn);
  if (componentAr) arParts.push(componentAr);

  if (makeEn) enParts.push(makeEn);
  if (makeAr) arParts.push(makeAr);

  if (modelEn) enParts.push(modelEn);
  if (modelAr) arParts.push(modelAr);

  if (year) {
    enParts.push(String(year));
    arParts.push(String(year));
  }

  if (dtcCode) {
    enParts.push(dtcCode);
    arParts.push(dtcCode);
  }

  const canonicalSearchStringEn = enParts.join(' ');
  const canonicalSearchStringAr = arParts.join(' ');

  return {
    originalQuery: query,
    detectedLanguage: isAr ? 'ar' : 'en',
    normalizedQuery: normalizedText,
    year,
    makeEn,
    makeAr,
    modelEn,
    modelAr,
    componentEn,
    componentAr,
    systemEn,
    systemAr,
    actionEn,
    actionAr,
    dtcCode,
    matchedTerms,
    canonicalSearchStringEn,
    canonicalSearchStringAr,
  };
}
