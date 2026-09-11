import { VEHICLE_PROFILES } from './vehicleDatabase';
import {
  NaturalSearchParsedResult,
  VehicleProfileData,
  KnownMaintenanceTask,
  FluidSpec,
  BatterySpec,
} from './vehicleTypes';
import {
  analyzeMultilingualAutomotiveQuery,
  normalizeArabic,
  isArabicText,
  AUTOMOTIVE_TERMINOLOGY,
} from '../search/terminologyMap';

// Levenshtein Distance for typo tolerance (Latin & normalized Arabic)
export function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

// Fuzzy string similarity ratio 0.0 - 1.0
export function fuzzySimilarity(term: string, target: string): number {
  const t1 = term.toLowerCase().trim();
  const t2 = target.toLowerCase().trim();
  if (t1 === t2) return 1.0;
  if (t2.includes(t1)) return 0.9;
  if (t1.includes(t2)) return 0.85;
  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(t1, t2);
  return Math.max(0, 1 - dist / maxLen);
}

// Global Command Item Definition for Search & CTRL + K
export interface GlobalSearchResultItem {
  id: string;
  category: 'vehicles' | 'repairs' | 'parts' | 'systems' | 'diagnostics' | 'maintenance' | 'DTC codes' | 'tools';
  title: string;
  subtitle: string;
  badge?: string;
  score: number;
  metadata?: Record<string, any>;
  titleAr?: string;
  subtitleAr?: string;
  badgeAr?: string;
}

/**
 * Advanced Natural Language Search Parser:
 * Supports English AND Arabic with bilingual entity extraction and terminology normalization.
 *
 * Example:
 * "تغيير بطارية تويوتا كامري 2018"
 * and
 * "Toyota Camry 2018 battery replacement"
 * Produce the exact same canonical vehicle, task, battery spec, and diagnostic result.
 */
export function parseAndExecuteNaturalSearch(query: string): NaturalSearchParsedResult {
  const analysis = analyzeMultilingualAutomotiveQuery(query);
  const isAr = analysis.detectedLanguage === 'ar';

  const detected: NaturalSearchParsedResult['detected'] = {
    make: analysis.makeEn,
    model: analysis.modelEn,
    year: analysis.year,
    system: analysis.systemEn,
    component: analysis.componentEn,
    repairAction: analysis.actionEn,
  };

  const detectedAr: NaturalSearchParsedResult['detectedAr'] = {
    make: analysis.makeAr,
    model: analysis.modelAr,
    year: analysis.year,
    system: analysis.systemAr,
    component: analysis.componentAr,
    repairAction: analysis.actionAr,
  };

  // 1. Find candidate vehicle from detected Make, Model, Year
  let matchedVehicle: VehicleProfileData | undefined = undefined;

  for (const vehicle of VEHICLE_PROFILES) {
    let score = 0;
    if (detected.make && vehicle.make.toLowerCase() === detected.make.toLowerCase()) score += 3;
    if (detected.model && vehicle.model.toLowerCase().includes(detected.model.toLowerCase())) score += 4;
    if (detected.year && vehicle.year === detected.year) score += 3;

    if (score >= 4) {
      matchedVehicle = vehicle;
      break;
    }
  }

  // Fallback fuzzy search if exact canonical make/model wasn't matched
  if (!matchedVehicle) {
    let bestScore = 0;
    const cleanQuery = analysis.normalizedQuery;
    for (const vehicle of VEHICLE_PROFILES) {
      const vStrEn = `${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase();
      const simEn = fuzzySimilarity(cleanQuery, vStrEn);
      if (simEn > bestScore && simEn > 0.35) {
        bestScore = simEn;
        matchedVehicle = vehicle;
      }
    }
  }

  // 2. Collect matching maintenance tasks
  const matchedTasks: KnownMaintenanceTask[] = [];
  const matchedFluids: { vehicle: VehicleProfileData; fluid: FluidSpec }[] = [];
  let matchedBattery: { vehicle: VehicleProfileData; battery: BatterySpec } | undefined = undefined;

  const targetVehicles = matchedVehicle ? [matchedVehicle] : VEHICLE_PROFILES;

  for (const v of targetVehicles) {
    // Check known tasks
    for (const task of v.knownMaintenanceTasks) {
      const taskText = `${task.title} ${task.component} ${task.system} ${v.make} ${v.model}`.toLowerCase();
      let match = false;

      if (detected.component) {
        const compLower = detected.component.toLowerCase();
        if (
          taskText.includes(compLower) ||
          compLower.split(' ').some((word) => word.length > 3 && taskText.includes(word))
        ) {
          match = true;
        }
      }

      if (detected.repairAction && taskText.includes(detected.repairAction.toLowerCase())) {
        if (!detected.component || match) {
          match = true;
        }
      }

      // Token match against English task text or canonical search string
      const tokensEn = analysis.canonicalSearchStringEn.toLowerCase().split(' ').filter(Boolean);
      for (const t of tokensEn) {
        if (t.length > 3 && taskText.includes(t)) {
          match = true;
          break;
        }
      }

      if (match && !matchedTasks.some((mt) => mt.id === task.id)) {
        matchedTasks.push(task);
      }
    }

    // Check fluids
    for (const fluid of v.fluids) {
      const fText = `${fluid.name} ${fluid.spec} ${fluid.notes || ''}`.toLowerCase();
      if (
        (detected.component && detected.component.toLowerCase().includes('coolant') && fText.includes('coolant')) ||
        (detected.component && detected.component.toLowerCase().includes('oil') && fText.includes('oil')) ||
        (detected.component && detected.component.toLowerCase().includes('brake') && fText.includes('brake'))
      ) {
        matchedFluids.push({ vehicle: v, fluid });
      }
    }

    // Check battery
    if (
      (detected.component && detected.component.toLowerCase().includes('battery')) ||
      analysis.canonicalSearchStringEn.toLowerCase().includes('battery') ||
      analysis.canonicalSearchStringAr.includes('بطارية')
    ) {
      matchedBattery = { vehicle: v, battery: v.battery };
    }
  }

  const confidence = matchedVehicle && (detected.component || matchedTasks.length > 0) ? 0.98 : matchedVehicle ? 0.85 : 0.6;

  return {
    rawQuery: query,
    detectedLanguage: isAr ? 'ar' : 'en',
    detected,
    detectedAr,
    matchedVehicle,
    matchedTasks,
    matchedFluids,
    matchedBattery,
    confidence,
  };
}

/**
 * Curated Global Default Suggestions (bilingual)
 */
const DEFAULT_GLOBAL_ITEMS: GlobalSearchResultItem[] = [
  {
    id: 'def-veh-1',
    category: 'vehicles',
    title: 'Toyota Camry 2018 (XV70) - 2.5L I4',
    titleAr: 'تويوتا كامري 2018 (XV70) - محرك 2.5L I4',
    subtitle: '8-speed Automatic • Dynamic Force 203 HP • FWD',
    subtitleAr: 'قير أوتوماتيك 8 سرعات • محرك ديناميك فورس 203 حصان',
    badge: 'Vehicle Profile',
    badgeAr: 'ملف المركبة',
    score: 1.0,
    metadata: { vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto' },
  },
  {
    id: 'def-rep-1',
    category: 'repairs',
    title: 'Camry 12V Battery Replacement & ECU Reset',
    titleAr: 'تغيير بطارية كامري 12 فولت وإعادة ضبط الكمبيوتر',
    subtitle: 'BCI Group 35 AGM / Flooded procedure & torque specs',
    subtitleAr: 'إجراء استبدال بطارية حجم 35 وإعادة برمجة ECU',
    badge: 'Factory Guide',
    badgeAr: 'دليل المصنع',
    score: 0.98,
    metadata: { vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto' },
  },
  {
    id: 'def-comp-alt',
    category: 'systems',
    title: 'Alternator & Charging System (Denso 150A SC6)',
    titleAr: 'المولد ودينامو الشحن (دنسو 150 أمبير)',
    subtitle: 'LIN-Bus voltage regulation & 150A primary fusible link',
    subtitleAr: 'تنظيم الجهد عبر شبكة LIN وفيوز رئيسي 150 أمبير',
    badge: 'Electrical System',
    badgeAr: 'نظام الكهرباء',
    score: 0.95,
  },
  {
    id: 'def-dtc-1',
    category: 'DTC codes',
    title: 'DTC P0171 - System Too Lean (Bank 1)',
    titleAr: 'كود DTC P0171 - فقر خليط الوقود (بنك 1)',
    subtitle: 'Intake vacuum leak, fuel pressure & O2 sensor diagnostic tree',
    subtitleAr: 'تسريب هواء السحب، فحص ضغط الوقود وحساس الأكسجين',
    badge: 'Active Fault',
    badgeAr: 'كود عطل نشط',
    score: 0.94,
  },
  {
    id: 'def-maint-1',
    category: 'maintenance',
    title: 'Ford F-150 Motorcraft Yellow Coolant Flush',
    titleAr: 'تفريغ وتنظيف سائل تبريد فورد F-150 (أصفر)',
    subtitle: 'WSS-M97B57-A2 vacuum bleed procedure & thermostat test',
    subtitleAr: 'إجراء تفريغ الهواء بالفاكيوم وفحص بلف الحرارة',
    badge: '100,000 mi Interval',
    badgeAr: 'صيانة 100,000 ميل',
    score: 0.92,
  },
  {
    id: 'def-part-1',
    category: 'parts',
    title: 'Denso Direct Ignition Coil (COP 4-Pin)',
    titleAr: 'كويل إشعال دنسو المباشر (4 أطراف IGT/IGF)',
    subtitle: 'OEM # 90919-02260 • Ionization feedback confirmation',
    subtitleAr: 'رقم القطعة OEM: 90919-02260 مع إشارة تأكيد IGF',
    badge: 'OEM Part',
    badgeAr: 'قطعة غيار أصلية',
    score: 0.9,
  },
  {
    id: 'def-tool-1',
    category: 'tools',
    title: 'Calibrated Digital Torque Wrench (10 - 210 Nm)',
    titleAr: 'مفتاح عزم رقمي معاير (10 - 210 نيوتن متر)',
    subtitle: 'Wheel lug torque (103 Nm), spark plug (18 Nm), oil plug (40 Nm)',
    subtitleAr: 'عزم صواميل العجلات (103 نيوتن متر) والبواجي (18 نيوتن متر)',
    badge: 'Workshop Tool',
    badgeAr: 'أداة ورشة',
    score: 0.88,
  },
  {
    id: 'def-sys-1',
    category: 'systems',
    title: 'Braking & ABS Hydraulic Subsystem',
    titleAr: 'نظام الفرامل ومكابح ABS الهيدروليكية',
    subtitle: 'CAN ID: 0x1A0 • 4-wheel pad wear & rotor telemetry',
    subtitleAr: 'ناقل CAN: 0x1A0 • قياس تآكل الفحمات وسماكة الهوبات',
    badge: 'Subsystem CAN',
    badgeAr: 'نظام CAN الفرعي',
    score: 0.85,
  },
];

/**
 * Global Multilingual Search Engine (Supports English and Arabic)
 */
export function executeGlobalSearch(query: string, lang: 'en' | 'ar' = 'en'): GlobalSearchResultItem[] {
  if (!query || query.trim() === '') {
    return DEFAULT_GLOBAL_ITEMS;
  }

  const analysis = analyzeMultilingualAutomotiveQuery(query);
  const qLower = query.toLowerCase().trim();
  const tokens = qLower.split(/\s+/).filter(Boolean);
  const isArQuery = analysis.detectedLanguage === 'ar';
  const preferAr = isArQuery || lang === 'ar';

  const results: GlobalSearchResultItem[] = [];

  // Helper to add item with scoring
  const addItem = (item: GlobalSearchResultItem) => {
    // Avoid duplicate IDs
    const existingIndex = results.findIndex((r) => r.id === item.id);
    if (existingIndex >= 0) {
      if (item.score > results[existingIndex].score) {
        results[existingIndex] = item;
      }
    } else {
      results.push(item);
    }
  };

  // =================== 1. MATCH VEHICLES ===================
  for (const v of VEHICLE_PROFILES) {
    const vTextEn = `${v.make} ${v.model} ${v.year} ${v.generation} ${v.engine} ${v.trim} ${v.transmission}`.toLowerCase();
    let score = 0;

    // Check canonical matches
    if (analysis.makeEn && v.make.toLowerCase() === analysis.makeEn.toLowerCase()) score += 0.35;
    if (analysis.modelEn && v.model.toLowerCase().includes(analysis.modelEn.toLowerCase())) score += 0.45;
    if (analysis.year && v.year === analysis.year) score += 0.3;

    // Fuzzy text match
    const sim = fuzzySimilarity(analysis.normalizedQuery, vTextEn);
    if (sim > 0.3) score += sim * 0.4;

    if (score >= 0.3 || tokens.some((t) => vTextEn.includes(t))) {
      const makeAr = analysis.makeAr || (v.make === 'Toyota' ? 'تويوتا' : v.make === 'Ford' ? 'فورد' : v.make === 'Honda' ? 'هوندا' : v.make);
      const modelAr = analysis.modelAr || (v.model === 'Camry' ? 'كامري' : v.model === 'F-150' ? 'إف-150' : v.model === 'Civic' ? 'سيفيك' : v.model);

      addItem({
        id: `veh-${v.id}`,
        category: 'vehicles',
        title: `${v.make} ${v.model} ${v.year} (${v.generation})`,
        titleAr: `${makeAr} ${modelAr} ${v.year} (${v.generation})`,
        subtitle: `${v.engine} • ${v.horsepower} HP • ${v.transmission}`,
        subtitleAr: `${v.engine} • ${v.horsepower} حصان • ${v.transmission}`,
        badge: `${v.make} Profile`,
        badgeAr: `ملف ${makeAr}`,
        score: score + 0.1,
        metadata: { vehicleId: v.id, vehicle: v },
      });
    }
  }

  // =================== 2. MATCH REPAIRS & TASKS ===================
  for (const v of VEHICLE_PROFILES) {
    const isVehicleMatched =
      (analysis.makeEn && v.make.toLowerCase() === analysis.makeEn.toLowerCase()) ||
      (analysis.modelEn && v.model.toLowerCase().includes(analysis.modelEn.toLowerCase())) ||
      (analysis.year && v.year === analysis.year);

    for (const task of v.knownMaintenanceTasks) {
      const taskText = `${task.title} ${task.component} ${task.system} ${v.make} ${v.model}`.toLowerCase();
      let score = 0;

      if (isVehicleMatched) score += 0.35;

      // Component match
      if (analysis.componentEn) {
        const cLower = analysis.componentEn.toLowerCase();
        if (taskText.includes(cLower) || (task.component && task.component.toLowerCase().includes(cLower))) {
          score += 0.45;
        }
      }

      // Action match (e.g. Replacement / تغيير)
      if (analysis.actionEn) {
        const aLower = analysis.actionEn.toLowerCase();
        if (taskText.includes(aLower) || task.title.toLowerCase().includes(aLower)) {
          score += 0.25;
        }
      }

      // Token overlap
      for (const t of tokens) {
        if (t.length > 2 && taskText.includes(t)) {
          score += 0.15;
        }
      }

      if (score >= 0.3) {
        // Generate Arabic task title
        let taskTitleAr = task.title;
        if (task.component.toLowerCase().includes('battery')) {
          taskTitleAr = `تغيير بطارية ${v.model === 'Camry' ? 'كامري' : v.model} 12 فولت وإعادة ضبط الكمبيوتر`;
        } else if (task.component.toLowerCase().includes('coolant')) {
          taskTitleAr = `تفريغ وتعبئة سائل تبريد محرك ${v.model}`;
        } else if (task.component.toLowerCase().includes('oil')) {
          taskTitleAr = `تغيير زيت وفلتر محرك ${v.model}`;
        } else if (task.component.toLowerCase().includes('spark')) {
          taskTitleAr = `تغيير شمعات الاحتراق (البواجي) ${v.model}`;
        } else if (task.component.toLowerCase().includes('brake light')) {
          taskTitleAr = `تغيير لمبة وسويتش الفرامل ${v.model}`;
        }

        addItem({
          id: `rep-${task.id}`,
          category: 'repairs',
          title: task.title,
          titleAr: taskTitleAr,
          subtitle: `${v.year} ${v.make} ${v.model} • ${task.system} (${task.difficulty})`,
          subtitleAr: `${v.year} ${v.make} ${v.model} • نظام ${task.system} (${task.difficulty})`,
          badge: `${task.estimatedLaborHours}h Labor`,
          badgeAr: `${task.estimatedLaborHours} ساعة عمل`,
          score: score + 0.15,
          metadata: { task, vehicle: v, vehicleId: v.id },
        });

        // Recommended OEM Parts inside task
        for (const p of task.recommendedParts) {
          let partScore = score * 0.9;
          const pText = `${p.name} ${p.oemNumber} ${task.component}`.toLowerCase();
          if (tokens.some((t) => pText.includes(t))) partScore += 0.2;

          let partNameAr = p.name;
          if (p.name.toLowerCase().includes('battery')) {
            partNameAr = `بطارية تويوتا الأصلية Group 35 (640 CCA)`;
          } else if (p.name.toLowerCase().includes('coolant')) {
            partNameAr = `سائل تبريد فورد موتوركرافت أصفر مركز`;
          } else if (p.name.toLowerCase().includes('bulb')) {
            partNameAr = `لمبة إضاءة وسويتش فرامل 7443`;
          }

          addItem({
            id: `part-${p.oemNumber}`,
            category: 'parts',
            title: `${p.name} (OEM #${p.oemNumber})`,
            titleAr: `${partNameAr} (رقم أصلي #${p.oemNumber})`,
            subtitle: `For ${v.make} ${v.model} • Est. Cost: ${p.avgCost}`,
            subtitleAr: `متوافق مع ${v.make} ${v.model} • التكلفة التقديرية: ${p.avgCost}`,
            badge: 'OEM Part',
            badgeAr: 'قطعة أصلية OEM',
            score: partScore,
            metadata: { part: p, vehicle: v, vehicleId: v.id },
          });
        }
      }
    }
  }

  // =================== 3. MATCH SYSTEM CORE COMPONENTS (Prompt examples) ===================
  // Component mapping test list
  const CORE_SYSTEM_COMPONENTS = [
    {
      id: 'comp-battery',
      category: 'systems' as const,
      title: '12V BCI Group 35 Battery & IBS Sensor',
      titleAr: 'بطارية 12 فولت وحساس الشحن الذكي IBS',
      subtitle: 'BCI 35 • 640 CCA • ALT 150A Fusible Link • LIN-Bus State of Charge',
      subtitleAr: 'سعة 640 CCA تيار بدء • فيوز ALT 150A • مراقبة الشحن عبر LIN-Bus',
      badge: 'Electrical System',
      badgeAr: 'نظام الكهرباء',
      keywordsEn: ['battery', '12v', 'bci', 'group 35', 'cca', 'ibs', 'charging', 'accumulator'],
      keywordsAr: ['بطارية', 'بطاريه', 'البطارية', 'مركم', 'شحن', 'دينامو'],
    },
    {
      id: 'comp-fuel-pump',
      category: 'parts' as const,
      title: 'High-Pressure Fuel Pump (HPFP) & In-Tank Module',
      titleAr: 'مضخة الوقود عالي الضغط (طرمبة البنزين)',
      subtitle: '200 Bar direct injection rail pressure • In-tank sender module & filter',
      subtitleAr: 'ضغط سكة الحقن 200 بار • طرمبة البنزين داخل التانكي مع الفلتر',
      badge: 'Fuel System',
      badgeAr: 'نظام الوقود',
      keywordsEn: ['fuel pump', 'hpfp', 'lpfp', 'fuel pressure', 'fuel rail', 'pump module'],
      keywordsAr: ['مضخة الوقود', 'طرمبة البنزين', 'طلمبة البنزين', 'طرمبة بنزين', 'طرمبه الوقود', 'فيول بمب'],
    },
    {
      id: 'comp-water-pump',
      category: 'parts' as const,
      title: 'Engine Coolant Water Pump & Impeller Assembly',
      titleAr: 'مضخة ماء المحرك (طرمبة الماء)',
      subtitle: 'Engine mechanical/electric water pump • Dual impeller & ceramic seal',
      subtitleAr: 'طرمبة ماء المحرك مع دافع التدفق وسدادة السيراميك لمنع التسريب',
      badge: 'Cooling System',
      badgeAr: 'نظام التبريد',
      keywordsEn: ['water pump', 'coolant pump', 'impeller', 'cooling pump'],
      keywordsAr: ['مضخة الماء', 'طرمبة الماء', 'طرمبة الموية', 'طلمبة المية', 'طرمبه الماء', 'ووتر بمب'],
    },
    {
      id: 'comp-alternator',
      category: 'systems' as const,
      title: 'Denso 150A Hairpin Alternator & LIN Regulator',
      titleAr: 'مولد الكهرباء والدينامو (دنسو 150 أمبير)',
      subtitle: 'Denso SC6 hairpin stator • 12-diode bridge • 13.8V - 14.6V regulated',
      subtitleAr: 'دينامو دنسو سلك مجدول • جسر توحيد 12 ديود • تنظيم الجهد 14.4 فولت',
      badge: 'Electrical System',
      badgeAr: 'نظام الكهرباء',
      keywordsEn: ['alternator', 'dynamo', 'charging generator', 'stator', 'voltage regulator'],
      keywordsAr: ['مولد', 'المولد', 'دينامو', 'الدينامو', 'دينمو', 'مولد الكهرباء', 'الترنيتور'],
    },
    {
      id: 'comp-starter',
      category: 'systems' as const,
      title: 'Planetary Gear Reduction Starter Motor (1.4 kW)',
      titleAr: 'بادئ الحركة وموتور السلف (1.4 كيلوواط)',
      subtitle: 'Dual-coil magnetic solenoid (Terminal 50) • Cranking draw: 120-160A',
      subtitleAr: 'كتاوت ومغناطيس سحب ودفع (طرف 50) • سحب تيار التدوير 150 أمبير',
      badge: 'Electrical System',
      badgeAr: 'نظام الكهرباء',
      keywordsEn: ['starter', 'starter motor', 'cranking motor', 'solenoid', 'terminal 50'],
      keywordsAr: ['بادئ الحركة', 'سلف', 'السلف', 'مارش', 'المارش', 'بادئ التشغيل', 'سيلف'],
    },
    {
      id: 'comp-radiator',
      category: 'systems' as const,
      title: 'Aluminum Core Engine Cooling Radiator',
      titleAr: 'راديتر تبريد المحرك ومبرد الألمنيوم',
      subtitle: 'Dual-pass aluminum tube core • 1.1 Bar pressure cap • Fan shroud',
      subtitleAr: 'قلب ألمنيوم مزدوج القنوات • غطاء ضغط 1.1 بار • مسار سائل التبريد',
      badge: 'Thermal Management',
      badgeAr: 'النظام الحراري',
      keywordsEn: ['radiator', 'cooling radiator', 'heat exchanger', 'radiator cap'],
      keywordsAr: ['راديتر', 'الراديتر', 'رديتر', 'الرديتر', 'رادياتير', 'مبرد المحرك', 'مبرد'],
    },
    {
      id: 'comp-hvac',
      category: 'systems' as const,
      title: 'HVAC Climate Control & A/C Compressor Loop',
      titleAr: 'مكيف السيارة ونظام التكييف والتدفئة',
      subtitle: 'Variable-displacement swashplate compressor • R1234yf / R134a loop',
      subtitleAr: 'كمبروسر مكيف متغير الإزاحة • دائرة غاز الفريون وفلتر المقصورة',
      badge: 'HVAC System',
      badgeAr: 'نظام التكييف',
      keywordsEn: ['hvac', 'air conditioning', 'a/c', 'ac', 'climate control', 'compressor', 'freon'],
      keywordsAr: ['مكيف', 'المكيف', 'تكييف', 'التكييف', 'نظام التكييف', 'كمبروسر المكيف', 'فريون'],
    },
  ];

  for (const c of CORE_SYSTEM_COMPONENTS) {
    let score = 0;
    const normQuery = analysis.normalizedQuery;

    // Check English keywords
    for (const kw of c.keywordsEn) {
      if (qLower.includes(kw)) score += 0.5;
    }

    // Check Arabic keywords
    for (const kw of c.keywordsAr) {
      const normKw = normalizeArabic(kw);
      if (normQuery.includes(normKw)) score += 0.5;
    }

    // Check detected component from analysis
    if (analysis.componentEn && c.title.toLowerCase().includes(analysis.componentEn.toLowerCase())) {
      score += 0.5;
    }

    if (score >= 0.4) {
      addItem({
        id: c.id,
        category: c.category,
        title: c.title,
        titleAr: c.titleAr,
        subtitle: c.subtitle,
        subtitleAr: c.subtitleAr,
        badge: c.badge,
        badgeAr: c.badgeAr,
        score: Math.min(0.99, score),
        metadata: { systemId: c.id },
      });
    }
  }

  // =================== 4. MATCH DTC CODES ===================
  const dtcList = [
    {
      code: 'P0171',
      title: 'System Too Lean (Bank 1)',
      titleAr: 'فقر خليط الوقود والهواء (بنك 1)',
      desc: 'Unmetered air intake leak, dirty MAF sensor, or low fuel rail pressure',
      descAr: 'تسريب هواء شفط غير مقاس، اتساخ حساس الماف، أو ضعف ضغط الوقود',
      keywordsAr: ['فقر الوقود', 'خليط فقير', 'تسريب هواء', 'p0171', 'كود p0171'],
    },
    {
      code: 'P0300',
      title: 'Random / Multiple Cylinder Misfire Detected',
      titleAr: 'احتراق ناقص عشوائي / تفتفة وتقطيع في أسطوانات المحرك',
      desc: 'Worn spark plugs, faulty ignition coils, low fuel pump pressure',
      descAr: 'تآكل شمعات الاحتراق (البواجي)، تلف كويلات الإشعال، أو ضعف البنزين',
      keywordsAr: ['ميس فاير', 'ميسفاير', 'تفتفة', 'تقطيع', 'احتراق ناقص', 'p0300', 'كود p0300'],
    },
    {
      code: 'P0420',
      title: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      titleAr: 'انخفاض كفاءة دبة التلوث / المحول الحفاز عن الحد الأدنى',
      desc: 'Catalytic converter degradation or downstream oxygen sensor variance',
      descAr: 'تلف أو انسداد دبة التلوث (المحول الحفاز) أو قراءة حساس الشكمان الخلفي',
      keywordsAr: ['دبة التلوث', 'دبة الشكمان', 'المحول الحفاز', 'p0420', 'كود p0420'],
    },
    {
      code: 'P2681',
      title: 'Engine Coolant Bypass Valve Control Circuit Open',
      titleAr: 'دائرة صمام تحويل سائل التبريد مفتوحة (بلف الحرارة)',
      desc: 'Thermostat bypass valve actuator circuit or harness resistance fault',
      descAr: 'عطل في دائرة مشغل بلف تحويل سائل التبريد الكهربائي أو فيوز التبريد',
      keywordsAr: ['بلف التبريد', 'بلف الحرارة', 'صمام التبريد', 'p2681', 'كود p2681'],
    },
    {
      code: 'P0016',
      title: 'Crankshaft - Camshaft Correlation Bank 1 Sensor A',
      titleAr: 'عدم تطابق تزامن حساس عمود الكرنك مع عمود الكامات',
      desc: 'Timing chain stretch, variable cam timing (VCT) phaser solenoid oil clog',
      descAr: 'تمدد جنزير التايمن أو اتساخ صمام VCT لعمود الكامات برواسب الزيت',
      keywordsAr: ['حساس الكرنك', 'حساس الكامة', 'جنزير التايمن', 'تزامن', 'p0016', 'كود p0016'],
    },
  ];

  for (const dtc of dtcList) {
    let score = 0;
    if (analysis.dtcCode === dtc.code || qLower.includes(dtc.code.toLowerCase())) {
      score += 0.95;
    }

    if (tokens.some((t) => dtc.title.toLowerCase().includes(t))) {
      score += 0.4;
    }

    for (const arKw of dtc.keywordsAr) {
      if (analysis.normalizedQuery.includes(normalizeArabic(arKw))) {
        score += 0.45;
      }
    }

    if (score >= 0.4) {
      addItem({
        id: `dtc-${dtc.code}`,
        category: 'DTC codes',
        title: `DTC ${dtc.code}: ${dtc.title}`,
        titleAr: `كود DTC ${dtc.code}: ${dtc.titleAr}`,
        subtitle: dtc.desc,
        subtitleAr: dtc.descAr,
        badge: 'DTC Fault',
        badgeAr: 'كود عطل DTC',
        score: score,
        metadata: { dtc },
      });
    }
  }

  // =================== 5. MATCH DIAGNOSTICS & TOOLS ===================
  const toolsList = [
    {
      id: 'tool-torque',
      name: 'Calibrated Digital Torque Wrench (10 - 210 Nm)',
      nameAr: 'مفتاح عزم رقمي معاير (10 - 210 نيوتن متر)',
      desc: 'Preset torque for wheel lugs (103 Nm), spark plugs (18 Nm), oil filter (25 Nm)',
      descAr: 'جدول عزوم الشد لصواميل العجلات (103 نيوتن متر)، البواجي، وفلتر الزيت',
      cat: 'tools' as const,
      keywordsAr: ['عزم', 'شد', 'مفتاح عزم', 'ربط', 'تورك'],
    },
    {
      id: 'tool-dmm-drop',
      name: 'Automotive Digital Multimeter (Voltage Drop & Resistance)',
      nameAr: 'ملتيميتر رقمي للسيارات (فحص هبوط الجهد والمقاومة)',
      desc: 'Measure voltage drop (< 0.2V on B+ cable, < 0.1V on ground loop)',
      descAr: 'قياس هبوط الجهد على كابل البطارية الموجب وسلك الأرضي وفحص الأوم',
      cat: 'diagnostics' as const,
      keywordsAr: ['ملتيميتر', 'فحص الجهد', 'هبوط الجهد', 'مقاومة', 'اوم', 'فولت'],
    },
    {
      id: 'tool-cca-tester',
      name: 'Battery Conductance Analyzer & Cold Cranking Amps (CCA) Tester',
      nameAr: 'جهاز فحص كفاءة البطارية وأمبير التدوير على البارد (CCA)',
      desc: 'Evaluates internal resistance (mΩ), State of Health (SOH) and CCA output',
      descAr: 'فحص المقاومة الداخلية بالميلي أوم وصحة البطارية وقوة التدوير',
      cat: 'diagnostics' as const,
      keywordsAr: ['فحص بطارية', 'جهاز البطارية', 'cca', 'تيار البدء', 'سعة البطارية'],
    },
    {
      id: 'tool-smoke-leak',
      name: 'Digital Smoke Leak Detector (Intake & Vacuum)',
      nameAr: 'جهاز كشف تسريب الهواء والدخان (تسريب الفاكيوم)',
      desc: 'Pinpoints unmetered air leaks causing P0171 lean faults with mineral oil smoke',
      descAr: 'تحديد أماكن تسريب هواء السحب المسبب لكود P0171 بدخان الزيت الطبي',
      cat: 'diagnostics' as const,
      keywordsAr: ['تسريب هواء', 'فحص الدخان', 'جهاز الدخان', 'تسريب فاكيوم', 'خلخلة'],
    },
  ];

  for (const tl of toolsList) {
    let score = 0;
    for (const t of tokens) {
      if (tl.name.toLowerCase().includes(t)) score += 0.25;
    }
    for (const kw of tl.keywordsAr) {
      if (analysis.normalizedQuery.includes(normalizeArabic(kw))) score += 0.45;
    }

    if (score >= 0.35) {
      addItem({
        id: tl.id,
        category: tl.cat,
        title: tl.name,
        titleAr: tl.nameAr,
        subtitle: tl.desc,
        subtitleAr: tl.descAr,
        badge: tl.cat === 'tools' ? 'Workshop Tool' : 'Diagnostic Tool',
        badgeAr: tl.cat === 'tools' ? 'أداة ورشة' : 'أداة تشخيص',
        score: score,
      });
    }
  }

  // Sort descending by score and return top 25
  return results.sort((a, b) => b.score - a.score).slice(0, 25);
}
