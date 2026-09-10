import { Language } from '../types';

export type DtcCategory = 'Powertrain' | 'Body' | 'Chassis' | 'Network';

export interface DtcDetail {
  code: string;
  category: DtcCategory;
  standardType: 'SAE Generic' | 'Manufacturer Specific';
  system: string;
  systemAr: string;
  subsystem: string;
  description: string;
  descriptionAr: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Informational';
  milStatus: 'MIL Steady' | 'MIL Flashing (Severe)' | 'Pending' | 'None';
  targetComponentId?: string; // 3D component link
  highlightCylinder?: number; // 1, 2, 3, 4, etc.
  highlightBank?: number; // 1, 2
  possibleCauses: {
    name: string;
    nameAr: string;
    probability: number; // 0 - 100
    category: 'Ignition' | 'Fuel' | 'Mechanical' | 'Sensors' | 'Electrical' | 'Emission';
  }[];
  symptoms: {
    title: string;
    titleAr: string;
    impact: string;
  }[];
  diagnosticSteps: {
    stepNumber: number;
    title: string;
    titleAr: string;
    action: string;
    expectedResult: string;
    toolsNeeded: string;
  }[];
  commonAffectedComponents: {
    name: string;
    oemPartNumber: string;
    estCost: string;
    difficulty: 'Easy' | 'Intermediate' | 'Professional';
  }[];
  recommendedChecks: {
    testName: string;
    specValue: string;
    sensorPid?: string;
  }[];
  repairReferences: {
    title: string;
    referenceCode: string;
    type: 'TSB' | 'OEM Manual' | 'Wiring Diagram' | 'Torque Spec';
  }[];
  freezeFrameTemplate: {
    rpm: number;
    engineLoad: string;
    coolantTemp: string;
    stft: string;
    ltft: string;
    vehicleSpeed: string;
    fuelPressure: string;
  };
}

export interface DtcCorrelation {
  codes: string[];
  title: string;
  titleAr: string;
  correlationStrength: number; // 0 - 100%
  relationshipType: 'Causal Chain' | 'Shared Failure Root' | 'Cascade Malfunction' | 'False Positive Trigger';
  summary: string;
  summaryAr: string;
  primaryRootCause: string;
  consequentialCodes: string[];
  unifiedDiagnosticProcedure: string[];
  sharedComponents: string[];
  diagnosticPriorityOrder: string[];
}

// Canonical DTC Database covering P0xxx, P1xxx, P2xxx, P3xxx, Bxxxx, Cxxxx, Uxxxx
export const CANONICAL_DTC_DATABASE: Record<string, DtcDetail> = {
  // P0301 - Flagship Example
  P0301: {
    code: 'P0301',
    category: 'Powertrain',
    standardType: 'SAE Generic',
    system: 'Engine',
    systemAr: 'المحرك',
    subsystem: 'Ignition & Combustion Chamber',
    description: 'Cylinder 1 Misfire Detected',
    descriptionAr: 'تم رصد خلل في احتراق الأسطوانة رقم 1 (Misfire)',
    severity: 'High',
    milStatus: 'MIL Flashing (Severe)',
    targetComponentId: 'engine',
    highlightCylinder: 1,
    highlightBank: 1,
    possibleCauses: [
      { name: 'Defective or worn spark plug (excessive electrode gap)', nameAr: 'بواجي تالفة أو متآكلة (خلوص قطب مفرط)', probability: 85, category: 'Ignition' },
      { name: 'Failed Cylinder 1 ignition coil pack (internal breakdown)', nameAr: 'تلف كويل الإشعال للأسطوانة 1', probability: 82, category: 'Ignition' },
      { name: 'Clogged or sticking Cylinder 1 fuel injector', nameAr: 'انسداد أو تعليق بخاخ الوقود للأسطوانة 1', probability: 68, category: 'Fuel' },
      { name: 'Low cylinder compression (worn rings / leaking valves)', nameAr: 'انخفاض ضغط الأسطوانة (شنابر أو صمامات مسربة)', probability: 45, category: 'Mechanical' },
      { name: 'Intake runner vacuum leak near Cylinder 1 port', nameAr: 'تسريب هواء شفط (فاكيوم) بجوار ممر الأسطوانة 1', probability: 55, category: 'Sensors' },
      { name: 'Worn camshaft lobe or collapsed hydraulic lifter', nameAr: 'تآكل حدبة الكامة أو عطل التكايات الهيدروليكية', probability: 28, category: 'Mechanical' },
    ],
    symptoms: [
      { title: 'Engine misfire & rough idle shaking', titleAr: 'اهتزاز ورجفة بالمحرك عند الوقوف والسلانسيه', impact: 'High' },
      { title: 'Check Engine Light flashing under acceleration', titleAr: 'وميض لمبة المحرك عند التسارع والتحميل', impact: 'Critical' },
      { title: 'Noticeable drop in engine power and throttle lag', titleAr: 'فقدان ملحوظ في العزم وتأخر الاستجابة', impact: 'High' },
      { title: 'Fuel odor from unburnt hydrocarbons in exhaust', titleAr: 'رائحة وقود غير محترق تنبعث من العادم', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Ignition Coil Cross-Swap Isolation Test',
        titleAr: 'اختبار تبديل كويل الإشعال بين الأسطوانات',
        action: 'Swap Cylinder 1 ignition coil with Cylinder 2. Clear codes and road test vehicle.',
        expectedResult: 'If misfire shifts to Cylinder 2 (P0302), replace defective coil. If misfire remains on P0301, coil is good.',
        toolsNeeded: '10mm socket, OBD-II scanner, ratchet',
      },
      {
        stepNumber: 2,
        title: 'Spark Plug Inspection & Gap Verification',
        titleAr: 'فحص شمعة الاحتراق وخلوص الشرر',
        action: 'Extract Cylinder 1 spark plug. Inspect for carbon fouling, fuel wetting, ash deposits, or cracked insulator porcelain. Measure electrode gap with feeler gauge.',
        expectedResult: 'Gap must be within OEM spec (0.75 - 0.85 mm). Center electrode sharp and porcelain intact.',
        toolsNeeded: '5/8" or 14mm magnetic spark plug socket, wire gap gauge',
      },
      {
        stepNumber: 3,
        title: 'Fuel Injector Noid Light & Resistance Test',
        titleAr: 'فحص نبضة البخاخ والمقاومة الكهربائية',
        action: 'Disconnect Cyl 1 injector harness. Plug in noid light to verify ECM pulsing ground signal during crank. Measure injector coil resistance across pins.',
        expectedResult: 'Noid light pulses steadily. Coil resistance reads 12.0 - 14.5 Ohms at 20°C.',
        toolsNeeded: 'Automotive Noid light kit, digital multimeter',
      },
      {
        stepNumber: 4,
        title: 'Intake Manifold Runner Smoke Leak Test',
        titleAr: 'فحص تسريب الفاكيوم بمولد الدخان',
        action: 'Inject pressurized smoke (0.5 PSI) into intake manifold port with throttle held closed.',
        expectedResult: 'Zero smoke escaping from Cylinder 1 manifold runner gasket or injector boss O-ring.',
        toolsNeeded: 'EVAP smoke machine, spotlight',
      },
      {
        stepNumber: 5,
        title: 'Dynamic Compression & Cylinder Leakdown Test',
        titleAr: 'فحص انضغاط المحرك ونسبة تسريب الأسطوانة',
        action: 'Thread compression gauge into spark plug well. Crank engine for 5 compression strokes with throttle wide open.',
        expectedResult: 'Compression must exceed 150 PSI with less than 10% variation compared to sister cylinders.',
        toolsNeeded: 'Compression gauge kit, remote starter switch',
      },
    ],
    commonAffectedComponents: [
      { name: 'Cylinder 1 Ignition Coil Pack', oemPartNumber: '992-905-110-C', estCost: '$95.00', difficulty: 'Easy' },
      { name: 'High Performance Iridium Spark Plug', oemPartNumber: 'SILZKFR8E7S', estCost: '$18.50', difficulty: 'Easy' },
      { name: 'Direct Fuel Injector #1', oemPartNumber: '06H-906-036-AB', estCost: '$165.00', difficulty: 'Intermediate' },
      { name: 'Intake Manifold Runner Gasket', oemPartNumber: '06J-129-717-A', estCost: '$22.00', difficulty: 'Intermediate' },
    ],
    recommendedChecks: [
      { testName: 'Ignition Coil Primary Resistance', specValue: '0.6 - 1.2 Ohms', sensorPid: 'IGN_PRI_1' },
      { testName: 'Mode $06 Misfire Cylinder 1 Count', specValue: '0 Counts / 1000 Revs', sensorPid: 'TID$0B_CID$01' },
      { testName: 'Cylinder 1 Compression Pressure', specValue: '175 PSI (Min 145 PSI)', sensorPid: 'COMP_CYL1' },
      { testName: 'Short Term Fuel Trim (STFT Bank 1)', specValue: '-5% to +5% (Alert > +15%)', sensorPid: 'STFT1' },
    ],
    repairReferences: [
      { title: 'Factory Service Manual: 4-Cylinder Direct Injection Ignition System', referenceCode: 'FSM-ENG-1502', type: 'OEM Manual' },
      { title: 'Technical Service Bulletin: Misfire on Cold Start Due to Carbon Build-up', referenceCode: 'TSB 19-NA-042', type: 'TSB' },
      { title: 'Spark Plug Torque Specification: 25 Nm (18.5 lb-ft) dry threads', referenceCode: 'TORQ-SP-01', type: 'Torque Spec' },
    ],
    freezeFrameTemplate: {
      rpm: 2150,
      engineLoad: '48.2%',
      coolantTemp: '92°C (198°F)',
      stft: '+24.5%',
      ltft: '+18.2%',
      vehicleSpeed: '62 km/h',
      fuelPressure: '145 Bar (2,100 PSI)',
    },
  },

  // P0171 - System Too Lean (Bank 1)
  P0171: {
    code: 'P0171',
    category: 'Powertrain',
    standardType: 'SAE Generic',
    system: 'Fuel & Air Metering',
    systemAr: 'نظام الوقود ومعايرة الهواء',
    subsystem: 'Intake Air & Closed-Loop Fuel Control',
    description: 'System Too Lean (Bank 1)',
    descriptionAr: 'خلطة وقود فقيرة جداً في الصف 1 (زيادة هواء أو نقص وقود)',
    severity: 'High',
    milStatus: 'MIL Steady',
    targetComponentId: 'engine',
    highlightBank: 1,
    possibleCauses: [
      { name: 'Intake vacuum leak (cracked boot, PCV valve, intake gasket)', nameAr: 'تسريب هواء فاكيوم (لي مكسور، بلف بخار، وجه ثلاجة)', probability: 90, category: 'Sensors' },
      { name: 'Contaminated or faulty Mass Air Flow (MAF) sensor', nameAr: 'حساس كتلة الهواء (MAF) متسخ أو عاطل', probability: 80, category: 'Sensors' },
      { name: 'Weak fuel pump or clogged fuel filter (low fuel rail pressure)', nameAr: 'ضعف طرمبة البنزين أو انسداد فلتر الوقود', probability: 70, category: 'Fuel' },
      { name: 'Defective Upstream Oxygen Sensor (Bank 1 Sensor 1)', nameAr: 'حساس الأكسجين العلوي مسجل قراءة كاذبة', probability: 60, category: 'Sensors' },
      { name: 'Exhaust manifold leak upstream of O2 sensor', nameAr: 'تنسيم في هدرز العادم قبل حساس الأكسجين', probability: 55, category: 'Emission' },
    ],
    symptoms: [
      { title: 'Total Fuel Trim (STFT + LTFT) exceeding +25%', titleAr: 'تراكم قراءات تصحيح الوقود بأكثر من +25%', impact: 'Critical' },
      { title: 'Engine pinging / spark knock under moderate load', titleAr: 'صوت صرقعة (Knock) عند الدعس والتسارع', impact: 'High' },
      { title: 'Hesitation or stumbling upon initial acceleration', titleAr: 'تردد وتكتمة عند الضغط على دواسة البنزين', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Smoke Test Intake Manifold for Unmetered Air',
        action: 'Connect smoke generator to intake duct after MAF. Seal airbox opening and pressurize system to 1.0 PSI.',
        expectedResult: 'No smoke leaks around intake boots, PCV hoses, or brake booster line.',
        toolsNeeded: 'Automotive Smoke Tester',
        titleAr: 'فحص تسريب الفاكيوم بمولد الدخان',
      },
      {
        stepNumber: 2,
        title: 'MAF Sensor Live Data Volumetric Efficiency Test',
        action: 'Monitor MAF g/s at idle and wide-open throttle (WOT). Rule of thumb: idle reading should approximately equal engine displacement in liters (e.g. 2.0L ≈ 2.0 g/s).',
        expectedResult: 'MAF reading scales cleanly without flat spots to ~80% of max horsepower rating at redline.',
        toolsNeeded: 'OBD-II Live Graphing Scanner',
        titleAr: 'اختبار بيانات حساس MAF الحيّة',
      },
      {
        stepNumber: 3,
        title: 'Fuel Rail Pressure Verification',
        action: 'Measure high-pressure fuel rail under load. Compare actual versus ECM target pressure.',
        expectedResult: 'Actual rail pressure closely tracks target (within ±3 Bar).',
        toolsNeeded: 'Digital scan tool or mechanical fuel pressure gauge',
        titleAr: 'قياس ضغط مسطرة الوقود الفعلية',
      },
    ],
    commonAffectedComponents: [
      { name: 'Mass Air Flow Sensor (MAF)', oemPartNumber: '06J-906-461-D', estCost: '$145.00', difficulty: 'Easy' },
      { name: 'Crankcase PCV Breather Valve Oil Separator', oemPartNumber: '06H-103-495-AK', estCost: '$120.00', difficulty: 'Intermediate' },
      { name: 'Upstream Air-Fuel Ratio Sensor (Bank 1 Sensor 1)', oemPartNumber: '06K-906-262-B', estCost: '$180.00', difficulty: 'Intermediate' },
    ],
    recommendedChecks: [
      { testName: 'Long Term Fuel Trim (LTFT Bank 1)', specValue: '< +10% (Flagged at > +15%)', sensorPid: 'LTFT1' },
      { testName: 'MAF Sensor Output at Idle', specValue: '2.0 - 4.5 g/sec', sensorPid: 'MAF_GS' },
      { testName: 'Fuel Rail Pressure at Warm Idle', specValue: '35 - 50 Bar (GDI)', sensorPid: 'FRP_BAR' },
    ],
    repairReferences: [
      { title: 'OEM Lean Condition Diagnostic Flowchart', referenceCode: 'DIAG-FL-0171', type: 'OEM Manual' },
      { title: 'TSB: Torn PCV Diaphragm Causing Whistling Noise and P0171', referenceCode: 'TSB 20-08-01', type: 'TSB' },
    ],
    freezeFrameTemplate: {
      rpm: 1850,
      engineLoad: '32.1%',
      coolantTemp: '90°C (194°F)',
      stft: '+23.4%',
      ltft: '+19.5%',
      vehicleSpeed: '55 km/h',
      fuelPressure: '138 Bar',
    },
  },

  // P0300 - Random / Multiple Cylinder Misfire
  P0300: {
    code: 'P0300',
    category: 'Powertrain',
    standardType: 'SAE Generic',
    system: 'Engine',
    systemAr: 'المحرك',
    subsystem: 'Ignition & Fuel Delivery',
    description: 'Random / Multiple Cylinder Misfire Detected',
    descriptionAr: 'رصد خلل احتراق عشوائي / متعدد الأسطوانات',
    severity: 'Critical',
    milStatus: 'MIL Flashing (Severe)',
    targetComponentId: 'engine',
    possibleCauses: [
      { name: 'Systemic low fuel pressure or contaminated fuel', nameAr: 'انخفاض ضغط الوقود العام أو وقود ملوث', probability: 88, category: 'Fuel' },
      { name: 'Major intake vacuum leak affecting all cylinders', nameAr: 'تسريب هواء فاكيوم كبير يؤثر على المحرك بالكامل', probability: 82, category: 'Sensors' },
      { name: 'EGR valve stuck open allowing exhaust gas at idle', nameAr: 'بلف الـ EGR معلق في وضع الفتح أثناء السلانسيه', probability: 70, category: 'Emission' },
      { name: 'Worn spark plugs on all cylinders or aged coil harness', nameAr: 'بواجي متآكلة بجميع الأسطوانات أو ضفيرة كويلات قديمة', probability: 65, category: 'Ignition' },
      { name: 'Jumped timing chain or crankshaft reluctor wheel error', nameAr: 'تغير في توقيت جنزير الصدر أو عجلة حساس الكرنك', probability: 60, category: 'Mechanical' },
    ],
    symptoms: [
      { title: 'Violent engine shaking across all RPM ranges', titleAr: 'رجفة قوية في المحرك بجميع السرعات', impact: 'Critical' },
      { title: 'Engine stalls when stopping at red lights', titleAr: 'انطفاء المحرك عند التوقف في الإشارات', impact: 'High' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Mode $06 Misfire History Monitor by Cylinder',
        action: 'Review OBD-II Mode $06 cylinder misfire counters to verify if random or clustering on specific bank.',
        expectedResult: 'All cylinders showing elevated misfire event counts.',
        toolsNeeded: 'OBD-II Bi-Directional Scanner',
        titleAr: 'فحص عدادات الميس فاير لكل أسطوانة (Mode 06)',
      },
    ],
    commonAffectedComponents: [
      { name: 'Complete Set Iridium Spark Plugs (x4 / x6)', oemPartNumber: 'SP-KIT-GEN', estCost: '$85.00', difficulty: 'Intermediate' },
      { name: 'In-Tank Fuel Pump Module', oemPartNumber: 'FP-MOD-OEM', estCost: '$320.00', difficulty: 'Intermediate' },
    ],
    recommendedChecks: [
      { testName: 'System Fuel Pressure', specValue: '58 PSI (Port) / 150 Bar (Direct)', sensorPid: 'FUEL_PRESS' },
    ],
    repairReferences: [
      { title: 'Diagnostic Tree: Random Multi-Cylinder Misfire', referenceCode: 'REF-P0300-TREE', type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 1200,
      engineLoad: '52.0%',
      coolantTemp: '88°C',
      stft: '+18.0%',
      ltft: '+16.5%',
      vehicleSpeed: '12 km/h',
      fuelPressure: '90 Bar (Low)',
    },
  },

  // P0420 - Catalyst System Efficiency Below Threshold (Bank 1)
  P0420: {
    code: 'P0420',
    category: 'Powertrain',
    standardType: 'SAE Generic',
    system: 'Exhaust & Emissions',
    systemAr: 'العادم والانبعاثات',
    subsystem: 'Catalytic Converter & Aftertreatment',
    description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    descriptionAr: 'كفاءة دبة التلوث / المحول الحفاز أقل من الحد المسموح (صف 1)',
    severity: 'Moderate',
    milStatus: 'MIL Steady',
    targetComponentId: 'exhaust',
    highlightBank: 1,
    possibleCauses: [
      { name: 'Degraded / melted catalytic converter internal honeycomb substrate', nameAr: 'تلف أو انهيار خلايا دبة التلوث السيراميكية', probability: 85, category: 'Emission' },
      { name: 'Previous chronic misfires or oil burning poisoning catalyst', nameAr: 'تلوث المحول الحفاز نتيجة ميس فاير سابق أو حرق زيت', probability: 80, category: 'Emission' },
      { name: 'Downstream O2 sensor (Bank 1 Sensor 2) aging or slow switching', nameAr: 'تراجع أداء حساس الأكسجين السفلي', probability: 65, category: 'Sensors' },
      { name: 'Exhaust leak near or between upstream and downstream sensors', nameAr: 'تنسيم عادم بين الحساسين', probability: 60, category: 'Emission' },
    ],
    symptoms: [
      { title: 'Failed state emissions / smog inspection test', titleAr: 'رسوب في الفحص الدوري للسيارات والانبعاثات', impact: 'High' },
      { title: 'Subtle sulfur / rotten egg smell from tailpipe', titleAr: 'انبعاث رائحة كبريت أو بيض فاسد من الشكمان', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Compare Upstream vs Downstream O2 Sensor Switching Waveforms',
        action: 'Graph B1S1 (wide-band or 0.1-0.9V cycling) versus B1S2 at 2,500 RPM cruise.',
        expectedResult: 'Upstream switches rapidly; downstream MUST stay flat and steady around 0.6 - 0.75V (indicating oxygen storage capacity). If downstream mimics upstream, converter is dead.',
        toolsNeeded: 'Dual-Channel Digital Storage Oscilloscope or Fast Scanner',
        titleAr: 'مقارنة إشارات حساس الأكسجين العلوي والسفلي',
      },
    ],
    commonAffectedComponents: [
      { name: 'Direct-Fit Three-Way Catalytic Converter', oemPartNumber: '992-251-053-C', estCost: '$890.00', difficulty: 'Professional' },
      { name: 'Downstream Heated Oxygen Sensor (B1S2)', oemPartNumber: '06K-906-262-S', estCost: '$140.00', difficulty: 'Intermediate' },
    ],
    recommendedChecks: [
      { testName: 'Catalyst Inlet vs Outlet Temperature Differential', specValue: 'Outlet 30°C - 50°C hotter than inlet', sensorPid: 'CAT_TEMP' },
    ],
    repairReferences: [
      { title: 'Catalyst Replacement & Verification Test Cycle', referenceCode: 'TSB 18-09-22', type: 'TSB' },
    ],
    freezeFrameTemplate: {
      rpm: 2400,
      engineLoad: '42.0%',
      coolantTemp: '94°C',
      stft: '+1.5%',
      ltft: '+3.2%',
      vehicleSpeed: '105 km/h',
      fuelPressure: '142 Bar',
    },
  },

  // P1101 - Manufacturer Specific Powertrain (Airflow out of range)
  P1101: {
    code: 'P1101',
    category: 'Powertrain',
    standardType: 'Manufacturer Specific',
    system: 'Air Induction & Electronic Throttle',
    systemAr: 'نظام سحب الهواء والخانق الإلكتروني',
    subsystem: 'Intake Airflow Performance',
    description: 'Intake Airflow System Performance (MAF sensor out of calibrated range)',
    descriptionAr: 'أداء نظام تدفق هواء السحب خارج النطاق المعاير (خاص بالصانع)',
    severity: 'Moderate',
    milStatus: 'MIL Steady',
    targetComponentId: 'engine',
    possibleCauses: [
      { name: 'Carbon deposits on electronic throttle plate / bore', nameAr: 'تراكم كربون على بوابة الثروتل والخانق الإلكتروني', probability: 85, category: 'Mechanical' },
      { name: 'Air filter box improperly sealed or dirty air filter', nameAr: 'فلتر هواء غير محكم الإغلاق أو متسخ', probability: 75, category: 'Sensors' },
      { name: 'Oil accumulation on MAF sensing hot-wire', nameAr: 'تراكم أبخرة زيت على سلك حساس الـ MAF الساخن', probability: 70, category: 'Sensors' },
    ],
    symptoms: [
      { title: 'Unstable idle RPM hunting (dipping then revving)', titleAr: 'تذبذب وتأرجح دورات المحرك بالسلانسيه', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Inspect & Clean Electronic Throttle Body',
        action: 'Remove intake boot. Inspect backside of butterfly throttle plate for carbon buildup. Clean with throttle body solvent and perform idle relearn.',
        expectedResult: 'Clean metallic bore with smooth closing action.',
        toolsNeeded: 'Throttle cleaner spray, soft lint-free rag, scan tool',
        titleAr: 'فحص وتنظيف بوابة الثروتل الإلكترونية',
      },
    ],
    commonAffectedComponents: [
      { name: 'Electronic Throttle Body Assembly', oemPartNumber: '06F-133-062-Q', estCost: '$210.00', difficulty: 'Intermediate' },
      { name: 'High-Flow OEM Engine Air Filter', oemPartNumber: '992-129-620-A', estCost: '$38.00', difficulty: 'Easy' },
    ],
    recommendedChecks: [
      { testName: 'Calculated Airflow vs Measured MAF Ratio', specValue: 'Within ±7% deviation', sensorPid: 'CALC_AIR_RATIO' },
    ],
    repairReferences: [
      { title: 'Electronic Throttle Re-learn Procedure', referenceCode: 'TECH-THROT-01', type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 720,
      engineLoad: '19.5%',
      coolantTemp: '89°C',
      stft: '+4.0%',
      ltft: '+2.5%',
      vehicleSpeed: '0 km/h',
      fuelPressure: '42 Bar',
    },
  },

  // P2187 - System Too Lean at Idle (Bank 1)
  P2187: {
    code: 'P2187',
    category: 'Powertrain',
    standardType: 'SAE Generic',
    system: 'Fuel & Air Metering',
    systemAr: 'نظام الوقود ومعايرة الهواء',
    subsystem: 'Idle Fuel Control',
    description: 'System Too Lean at Idle (Bank 1)',
    descriptionAr: 'خلطة وقود فقيرة أثناء السلانسيه فقط (صف 1)',
    severity: 'High',
    milStatus: 'MIL Steady',
    targetComponentId: 'engine',
    highlightBank: 1,
    possibleCauses: [
      { name: 'Stuck open EVAP Purge Solenoid Valve', nameAr: 'بلف بخار البنزين (EVAP Canister Purge) معلق مفتوح', probability: 88, category: 'Emission' },
      { name: 'Torn PCV valve rubber diaphragm', nameAr: 'تمزق جلدة ديافراجم بلف تبخير الزيت (PCV)', probability: 84, category: 'Mechanical' },
      { name: 'Dipstick O-ring or oil filler cap seal leaking unmetered air', nameAr: 'تنسيم هواء من غطاء الزيت أو جلدة عيار الزيت', probability: 72, category: 'Mechanical' },
      { name: 'Brake booster vacuum hose check valve leaking', nameAr: 'تنسيم في لي سيرفو الفرامل أو صمام الرجوع', probability: 60, category: 'Brakes' as any },
    ],
    symptoms: [
      { title: 'High fuel trims (+25%) strictly at idle; drops to normal (<+5%) at 2,500 RPM', titleAr: 'ارتفاع قراءات تصحيح الوقود فقط عند الوقوف، واعتدالها عند القيادة بسرعة', impact: 'High' },
      { title: 'High pitched whistle or sucking noise from oil cap area', titleAr: 'صوت صفير أو شفط هواء حاد من منطقة غطاء الزيت', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'EVAP Purge Valve Vacuum Hold Test',
        action: 'Disconnect EVAP purge valve line going to intake manifold with engine idling. Place finger over valve nipple.',
        expectedResult: 'No vacuum suction should be felt at idle with purge command at 0%. If suction felt, valve is leaking.',
        toolsNeeded: 'Hand vacuum pump / finger seal test',
        titleAr: 'فحص إحكام بلف تصريف أبخرة الوقود EVAP',
      },
    ],
    commonAffectedComponents: [
      { name: 'EVAP Purge Solenoid Valve', oemPartNumber: '06H-906-517-B', estCost: '$48.00', difficulty: 'Easy' },
      { name: 'Crankcase Ventilation PCV Valve Assembly', oemPartNumber: '06H-103-495-AH', estCost: '$135.00', difficulty: 'Intermediate' },
    ],
    recommendedChecks: [
      { testName: 'Crankcase Vacuum Pressure', specValue: '-25 to -30 mbar', sensorPid: 'CRANKCASE_VAC' },
    ],
    repairReferences: [
      { title: 'TSB: Vacuum Leak from Oil Separator Diaphragm', referenceCode: 'TSB 17-04-89', type: 'TSB' },
    ],
    freezeFrameTemplate: {
      rpm: 680,
      engineLoad: '16.8%',
      coolantTemp: '91°C',
      stft: '+24.8%',
      ltft: '+18.0%',
      vehicleSpeed: '0 km/h',
      fuelPressure: '45 Bar',
    },
  },

  // P3000 - Hybrid Battery Control System
  P3000: {
    code: 'P3000',
    category: 'Powertrain',
    standardType: 'Manufacturer Specific',
    system: 'Hybrid & EV Powertrain',
    systemAr: 'منظومة الدفع الهجينة والكهربائية',
    subsystem: 'High Voltage Battery ECU',
    description: 'High Voltage Battery Control System Malfunction',
    descriptionAr: 'عطل في نظام التحكم ببطارية الجهد العالي (هايبرد)',
    severity: 'Critical',
    milStatus: 'MIL Steady',
    targetComponentId: 'battery',
    possibleCauses: [
      { name: 'High-voltage battery block voltage delta exceeds 0.3V', nameAr: 'فارق جهد غير متزن بين خلايا بطارية الهايبرد يزيد عن 0.3V', probability: 85, category: 'Electrical' },
      { name: 'HV Battery cooling fan blocked by dust or failed', nameAr: 'انسداد مروحة تبريد بطارية الهايبرد أو تعطلها', probability: 78, category: 'Sensors' },
      { name: 'Interlock switch service plug loose or not fully locked', nameAr: 'قابس أمان الجهد العالي (Safety Plug) غير مغلق بإحكام', probability: 65, category: 'Electrical' },
    ],
    symptoms: [
      { title: 'Master Warning triangle illuminated on cluster', titleAr: 'ظهور مثلث التحذير الرئيسي ولمبة الهايبرد باللوحة', impact: 'Critical' },
      { title: 'Vehicle operating in limp-home internal combustion mode only', titleAr: 'السيارة تعمل بمحرك البنزين فقط مع فقدان دعم البطارية', impact: 'High' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Check Individual HV Cell Block Voltages (Block 1 - 14)',
        action: 'Connect OEM scan tool and monitor live block voltages under regenerative braking and electric-only acceleration.',
        expectedResult: 'All block voltages must track within 0.20V of each other. Divergence > 0.30V confirms bad module.',
        toolsNeeded: 'Class 0 1000V Insulated Gloves, OEM Scan Tool',
        titleAr: 'فحص جهود حزم بطارية الهايبرد المنفردة',
      },
    ],
    commonAffectedComponents: [
      { name: 'Hybrid Battery Cooling Fan Blower Assembly', oemPartNumber: 'G9280-47080', estCost: '$180.00', difficulty: 'Intermediate' },
      { name: 'HV Battery Monitored Module Pack', oemPartNumber: 'G9510-47062', estCost: '$1,950.00', difficulty: 'Professional' },
    ],
    recommendedChecks: [
      { testName: 'HV Battery Max Block Voltage Delta', specValue: '< 0.20 V', sensorPid: 'HV_BAT_MAX_DIFF' },
    ],
    repairReferences: [
      { title: 'High Voltage Safety & Battery Servicing Manual', referenceCode: 'HV-SAFETY-DOC', type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 0,
      engineLoad: '0.0%',
      coolantTemp: '34°C',
      stft: '0.0%',
      ltft: '0.0%',
      vehicleSpeed: '45 km/h',
      fuelPressure: 'N/A',
    },
  },

  // B0001 - Body: Driver Frontal Stage 1 Deployment Control
  B0001: {
    code: 'B0001',
    category: 'Body',
    standardType: 'SAE Generic',
    system: 'Safety Restraints (SRS / Airbag)',
    systemAr: 'أنظمة السلامة والوسائد الهوائية (SRS)',
    subsystem: 'Steering Wheel Clockspring & Squib Circuit',
    description: 'Driver Frontal Stage 1 Deployment Control (Airbag Circuit)',
    descriptionAr: 'دائرة إطلاق الوسادة الهوائية الأمامية للسائق - المرحلة 1',
    severity: 'Critical',
    milStatus: 'MIL Steady',
    targetComponentId: 'electrical',
    possibleCauses: [
      { name: 'Steering column clockspring (spiral cable) internal ribbon snapped', nameAr: 'انقطاع شريحة بوق/إيرباق الدركسون (Clockspring Spiral Cable)', probability: 92, category: 'Electrical' },
      { name: 'Corroded or loose yellow SRS airbag connector under steering column', nameAr: 'تآكل أو رخاوة في فيش الإيرباق الأصفر أسفل عمود المقود', probability: 75, category: 'Electrical' },
      { name: 'Driver airbag steering wheel squib igniter resistance out of spec', nameAr: 'مقاومة صاعق كيس الهواء للسائق خارج النطاق المسموح', probability: 60, category: 'Sensors' },
    ],
    symptoms: [
      { title: 'Red Airbag / SRS Warning lamp permanently lit', titleAr: 'إضاءة لمبة الإيرباق والوسائد الهوائية الحمراء باستمرار', impact: 'Critical' },
      { title: 'Horn or steering wheel multifunction buttons inoperative', titleAr: 'تعطل البوق أو أزرار تحكم الدركسون بالتزامن', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Clockspring Continuity & Resistance Check with Airbag Simulator Resistor',
        action: 'Disconnect battery, wait 10 min. Unplug steering wheel airbag. Connect 2.2 Ohm fused dummy load into harness. Check if code becomes history.',
        expectedResult: 'If code clears with dummy load, clockspring or airbag squib is verified faulty.',
        toolsNeeded: 'SRS Airbag Simulator 2.2 Ohm load tool, T30 Torx',
        titleAr: 'فحص شريحة الدركسون بمقاومة محاكاة الإيرباق 2.2 أوم',
      },
    ],
    commonAffectedComponents: [
      { name: 'Steering Column Spiral Cable / Clockspring', oemPartNumber: '84306-0E010', estCost: '$165.00', difficulty: 'Intermediate' },
      { name: 'Driver Steering Wheel Airbag Module', oemPartNumber: '4N0-880-201-G', estCost: '$680.00', difficulty: 'Professional' },
    ],
    recommendedChecks: [
      { testName: 'Driver Squib Resistance', specValue: '2.1 - 2.6 Ohms (NEVER use standard ohmmeter directly on live squib!)', sensorPid: 'SRS_SQB_RES' },
    ],
    repairReferences: [
      { title: 'Supplemental Restraint System Deactivation & Reactivation Protocol', referenceCode: 'SRS-SAFE-01', type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 0,
      engineLoad: '0.0%',
      coolantTemp: '24°C',
      stft: '0.0%',
      ltft: '0.0%',
      vehicleSpeed: '0 km/h',
      fuelPressure: '0 Bar',
    },
  },

  // C0035 - Chassis: Left Front Wheel Speed Sensor
  C0035: {
    code: 'C0035',
    category: 'Chassis',
    standardType: 'SAE Generic',
    system: 'Brakes & Traction (ABS / ESC)',
    systemAr: 'المكابح وأنظمة الثبات (ABS / مانع الانزلاق)',
    subsystem: 'Wheel Speed Telemetry',
    description: 'Left Front Wheel Speed Sensor Circuit Malfunction',
    descriptionAr: 'عطل في دائرة حساس سرعة العجلة الأمامية اليسرى (ABS)',
    severity: 'High',
    milStatus: 'MIL Steady',
    targetComponentId: 'brakes',
    possibleCauses: [
      { name: 'Broken or chaffed sensor wiring harness in wheel well suspension stroke', nameAr: 'قطع أو اهتراء في سلك الحساس داخل بطانة الرفرف بفعل حركة المساعد', probability: 88, category: 'Electrical' },
      { name: 'Defective active Hall-effect wheel speed sensor', nameAr: 'تلف حساس الـ ABS الممغنط', probability: 82, category: 'Sensors' },
      { name: 'Cracked or missing magnetic encoder ring in wheel bearing seal', nameAr: 'تلف أو تآكل شريحة التمغنط في رمان العجلة (Magnetic Reluctor)', probability: 65, category: 'Mechanical' },
      { name: 'Metal debris / rust flakes bridging sensor air gap', nameAr: 'تراكم برادة حديد أو صدأ على رأس الحساس', probability: 55, category: 'Mechanical' },
    ],
    symptoms: [
      { title: 'ABS and Traction Control (ESC/TCS) warning lights ON', titleAr: 'إضاءة لمبات الـ ABS ونظام مانع الانزلاق في الطبلون', impact: 'High' },
      { title: 'False ABS pulsation / pedal buzz at low speeds right before stopping', titleAr: 'رجفة كاذبة في دواسة الفرامل قبل التوقف التام مباشرة', impact: 'High' },
      { title: 'Cruise control and speedometer disabled or intermittent', titleAr: 'تعطل مثبت السرعة وتذبذب عداد السرعة', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Four-Wheel Live Speed Sensor Graphing During Slow Roll',
        action: 'Drive vehicle at 10-15 km/h while logging all 4 wheel speeds on scan tool. Inspect for dropouts on LF sensor.',
        expectedResult: 'Left front wheel speed tracks identically with RF, LR, and RR wheels (within 0.5 km/h).',
        toolsNeeded: 'Live Graphing OBD-II Scanner',
        titleAr: 'رسم بياني مباشر لسرعات العجلات الأربع أثناء التدحرج',
      },
      {
        stepNumber: 2,
        title: 'Sensor Supply Voltage & Signal Line Scope Check',
        action: 'Backprobe 2-wire harness. Check for 12V or 5V reference from ABS module. Spin wheel by hand to check square-wave or current switching (7mA / 14mA).',
        expectedResult: 'Clean digital square wave pulse per tooth/magnetic pole revolution.',
        toolsNeeded: 'Automotive Scope or DMM with Hertz frequency',
        titleAr: 'قياس الفولتية ونبضات الحساس عبر الأوسيلوسكوب',
      },
    ],
    commonAffectedComponents: [
      { name: 'Left Front ABS Wheel Speed Sensor', oemPartNumber: '4F0-927-803-B', estCost: '$72.00', difficulty: 'Easy' },
      { name: 'Front Wheel Hub Bearing with Magnetic Ring', oemPartNumber: '8K0-498-625-C', estCost: '$185.00', difficulty: 'Intermediate' },
    ],
    recommendedChecks: [
      { testName: 'Sensor Reference Supply Voltage', specValue: '11.5 - 13.8 VDC', sensorPid: 'LF_ABS_VOLT' },
      { testName: 'LF Wheel Speed Output', specValue: 'Matches sister wheels', sensorPid: 'LF_WHEEL_SPD' },
    ],
    repairReferences: [
      { title: 'ABS Wheel Speed Sensor Replacement & Air Gap Specs', referenceCode: 'ABS-CHASS-401', type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 1600,
      engineLoad: '28.0%',
      coolantTemp: '85°C',
      stft: '0.0%',
      ltft: '0.0%',
      vehicleSpeed: '42 km/h (LF reading 0 km/h)',
      fuelPressure: 'N/A',
    },
  },

  // U0100 - Network: Lost Communication with ECM/PCM
  U0100: {
    code: 'U0100',
    category: 'Network',
    standardType: 'SAE Generic',
    system: 'Network & Communication',
    systemAr: 'شبكة الاتصالات والكنترول (CAN Bus)',
    subsystem: 'High-Speed Powertrain CAN-C Bus',
    description: 'Lost Communication with ECM/PCM "A"',
    descriptionAr: 'فقدان الاتصال بكنترول المحرك الرئيسي (ECM / PCM)',
    severity: 'Critical',
    milStatus: 'MIL Steady',
    targetComponentId: 'electrical',
    possibleCauses: [
      { name: 'Blown ECM main power relay or blown ignition fuse', nameAr: 'احتراق كتاوت كنترول المحرك الرئيسي أو الفيوز المغذي له', probability: 90, category: 'Electrical' },
      { name: 'CAN-High or CAN-Low twisted pair shorted to ground or severed', nameAr: 'التماس أو قطع في سلكي شبكة الكان باس (CAN-High / CAN-Low)', probability: 85, category: 'Electrical' },
      { name: 'Loose or water-corroded ECM 94-pin harness header connector', nameAr: 'دخول ماء أو تآكل في فيش كمبيوتر المحرك الرئيسي', probability: 75, category: 'Electrical' },
      { name: 'Chassis ground wire loose or broken at engine block / unibody lug', nameAr: 'انفصال أو رخاوة كابل الأرضي الرئيسي (Ground G101)', probability: 70, category: 'Electrical' },
    ],
    symptoms: [
      { title: 'Engine cranks but does not start (no spark, no injector pulse)', titleAr: 'المحرك يدور بالمارش لكن لا يشتغل إطلاقاً', impact: 'Critical' },
      { title: 'Instrument cluster gauges drop to zero; traction & ABS lights lit', titleAr: 'سقوط عدادات الطبلون وإضاءة لمبات التحذير المتعددة', impact: 'Critical' },
      { title: 'Transmission locks in 3rd gear limp mode', titleAr: 'القير يعلق بالنمرة الثالثة في وضع الطوارئ', impact: 'High' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: 'Measure CAN Bus Split Termination Resistance at DLC Pin 6 & 14',
        action: 'Disconnect battery negative. Connect digital ohmmeter between OBD-II DLC Pin 6 (CAN-H) and Pin 14 (CAN-L).',
        expectedResult: 'Must read exactly 60.0 Ohms (two 120-Ohm resistors in parallel inside ECM & Gateway). If 120 Ohms, one node or resistor is open.',
        toolsNeeded: 'Digital Multimeter, DLC breakout box',
        titleAr: 'قياس مقاومة شبكة الكان باس (60 أوم) بين المنفذين 6 و 14',
      },
      {
        stepNumber: 2,
        title: 'ECM B+ Power and Ground Voltage Drop Check',
        action: 'Backprobe ECM pin for battery 12V under key-on load. Check ground pins to battery negative.',
        expectedResult: 'Power pins read > 12.2V; ground voltage drop < 0.05V.',
        toolsNeeded: 'Automotive backprobe pins, DMM',
        titleAr: 'فحص وصول الكهرباء والأرضي لفيش كمبيوتر المحرك',
      },
    ],
    commonAffectedComponents: [
      { name: 'ECM Power Main Relay (Terminal 30 / 15)', oemPartNumber: '4H0-951-253-A', estCost: '$26.00', difficulty: 'Easy' },
      { name: 'Central Gateway ECU Module', oemPartNumber: '4N0-907-468-H', estCost: '$390.00', difficulty: 'Professional' },
    ],
    recommendedChecks: [
      { testName: 'CAN Bus Resistance across Pin 6 & 14', specValue: '58 - 62 Ohms (Exact: 60.0 Ohms)', sensorPid: 'CAN_OHM' },
      { testName: 'CAN-High Voltage to Ground', specValue: '2.5V - 3.5V (Dominant)', sensorPid: 'CAN_H_VOLT' },
      { testName: 'CAN-Low Voltage to Ground', specValue: '1.5V - 2.5V (Recessive)', sensorPid: 'CAN_L_VOLT' },
    ],
    repairReferences: [
      { title: 'CAN-FD Network Architecture & Gateway Troubleshooting', referenceCode: 'NET-CAN-202', type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 0,
      engineLoad: '0.0%',
      coolantTemp: '20°C',
      stft: '0.0%',
      ltft: '0.0%',
      vehicleSpeed: '0 km/h',
      fuelPressure: '0 Bar',
    },
  },
};

// MULTI-CODE CORRELATION RULES ENGINE
export const CORRELATION_RULES: DtcCorrelation[] = [
  // 1. P0301 + P0171 (User's specific prompt example!)
  {
    codes: ['P0301', 'P0171'],
    title: 'Cylinder 1 Lean Misfire Interaction',
    titleAr: 'تفاعل متبادل: ميس فاير الأسطوانة 1 مع خلطة وقود فقيرة في الصف 1',
    correlationStrength: 94,
    relationshipType: 'Shared Failure Root',
    summary:
      'P0301 (Cylinder 1 Misfire) and P0171 (System Too Lean Bank 1) are strongly causally linked. An unmetered vacuum leak located directly at the Cylinder 1 intake manifold runner gasket, or a partially clogged Cylinder 1 fuel injector, starves that specific cylinder of fuel, causing both localized lean combustion misfire and triggering bank-wide positive fuel trim correction (+25%).',
    summaryAr:
      'يرتبط كود P0301 مع P0171 ارتباطاً وثيقاً. وجود تسريب فاكيوم (هواء غير محسوب) عند وجه ممر أسطوانة 1، أو انسداد جزئي في بخاخ الأسطوانة 1، يسبب تجويع الأسطوانة من الوقود مما يؤدي لميس فاير ويدفع كمبيوتر السيارة لرفع تصحيح الوقود العام بالصف 1.',
    primaryRootCause: 'Intake runner vacuum leak near Cylinder 1 or clogged Cylinder 1 Fuel Injector',
    consequentialCodes: ['P0171'],
    unifiedDiagnosticProcedure: [
      'Perform smoke test directly targeting the Cylinder 1 intake manifold runner seal and injector boss.',
      'Inspect Cylinder 1 spark plug for lean white ash deposits versus sister cylinders.',
      'Swap Cylinder 1 fuel injector to Cylinder 2; observe if misfire moves to P0302 while P0171 persists.',
      'Monitor Short Term Fuel Trim (STFT) while spraying propane or carb cleaner around Cylinder 1 intake port (if trim drops instantly, vacuum leak confirmed).',
    ],
    sharedComponents: [
      'Cylinder 1 Intake Manifold Runner Gasket',
      'Cylinder 1 Fuel Injector O-Rings',
      'Cylinder 1 Spark Plug',
      'Mass Air Flow (MAF) Sensor',
    ],
    diagnosticPriorityOrder: ['P0301', 'P0171'],
  },

  // 2. P0300 + P0171 + P0174 (Massive Intake Vacuum Leak or Low Fuel Pressure)
  {
    codes: ['P0300', 'P0171'],
    title: 'Multi-Cylinder Fuel Starvation / Vacuum Ingress',
    titleAr: 'تجويع وقود متعدد الأسطوانات / تسريب فاكيوم عام',
    correlationStrength: 96,
    relationshipType: 'Shared Failure Root',
    summary:
      'A random multi-cylinder misfire (P0300) occurring alongside system lean faults on both banks (P0171/P0174) indicates a single shared upstream fault: either a massive unmetered air leak before intake division (cracked intake boot, torn PCV diaphragm) or deficient fuel delivery pressure starving all injectors.',
    summaryAr:
      'وجود ميس فاير عشوائي مع كود فقر الوقود يدل على عطل رئيسي مشترك upstream: إما تسريب هواء كبير قبل انقسام الثلاجة (لي مقطوع أو ديافراجم التبخير) أو ضعف طرمبة البنزين.',
    primaryRootCause: 'Torn PCV diaphragm, cracked intake ducting, or failing in-tank fuel pump',
    consequentialCodes: ['P0300'],
    unifiedDiagnosticProcedure: [
      'Check fuel rail delivery pressure with mechanical gauge under load.',
      'Perform complete intake smoke test from MAF sensor to throttle body.',
      'Verify crankcase vacuum; if extreme suction on oil filler cap, replace PCV separator.',
    ],
    sharedComponents: ['PCV Valve Assembly', 'Fuel Pump Module', 'Intake Air Boot'],
    diagnosticPriorityOrder: ['P0171', 'P0300'],
  },

  // 3. P0420 + P0301 (Misfire Causing Catalyst Damage)
  {
    codes: ['P0420', 'P0301'],
    title: 'Upstream Misfire Destroying Catalytic Converter',
    titleAr: 'ميس فاير أسطوانة يؤدي لاحتراق وتلف دبة التلوث',
    correlationStrength: 91,
    relationshipType: 'Causal Chain',
    summary:
      'CRITICAL CAUSAL SEQUENCE: A raw fuel misfire on Cylinder 1 (P0301) sends unburnt gasoline directly into the exhaust stream. When raw fuel contacts the 800°C catalytic converter, it ignites internally, causing catastrophic thermal meltdown of the catalyst substrate and triggering P0420. DO NOT replace catalytic converter until misfire is 100% cured, or the new converter will be ruined within 50 miles!',
    summaryAr:
      'تسلسل سببي خطير: الميس فاير يرسل بنزيناً غير محترق مباشرة لدبة التلوث مما يشعلها حرارياً من الداخل ويدمر خلاياها مسبباً P0420. لا تقم بتغيير دبة التلوث أبداً قبل إصلاح الميس فاير أولاً!',
    primaryRootCause: 'Ignition or fuel delivery misfire on Cylinder 1 (P0301) burning catalyst substrate',
    consequentialCodes: ['P0420'],
    unifiedDiagnosticProcedure: [
      'STEP 1: Diagnose and resolve P0301 ignition/fuel fault immediately.',
      'STEP 2: Use borescope through O2 sensor bung to inspect catalytic converter monolith for melting or disintegration.',
      'STEP 3: Verify downstream O2 sensor response before deciding on catalytic converter replacement.',
    ],
    sharedComponents: ['Catalytic Converter', 'Cylinder 1 Ignition Coil', 'Spark Plug'],
    diagnosticPriorityOrder: ['P0301', 'P0420'],
  },

  // 4. P2187 + P0171 (Lean Condition Patterning)
  {
    codes: ['P2187', 'P0171'],
    title: 'Idle Vacuum Leak Dominated Lean Condition',
    titleAr: 'تسريب فاكيوم حرج مؤثر خاصة عند السلانسيه',
    correlationStrength: 95,
    relationshipType: 'Shared Failure Root',
    summary:
      'P2187 explicitly indicates the lean condition occurs primarily at idle, confirming an intake vacuum leak rather than a fuel delivery or MAF issue (vacuum leaks have highest impact at idle when manifold vacuum is highest, and diminish at wide open throttle).',
    summaryAr:
      'كود P2187 يؤكد أن الخلطة الفقيرة تحدث عند الوقوف فقط، مما يحصر العطل بنسبة 95% في تسريب فاكيوم (بلف EVAP معلق أو وجه ثلاجة) وليس ضعف طرمبة وقود.',
    primaryRootCause: 'Stuck open EVAP purge valve, torn PCV diaphragm, or intake manifold gasket leak',
    consequentialCodes: ['P0171'],
    unifiedDiagnosticProcedure: [
      'Pinch off EVAP purge line and observe if idle trims return to normal.',
      'Smoke test intake manifold and brake booster vacuum lines.',
    ],
    sharedComponents: ['EVAP Purge Solenoid', 'PCV Valve', 'Intake Gasket'],
    diagnosticPriorityOrder: ['P2187', 'P0171'],
  },

  // 5. U0100 + C0035 or U0121 (CAN Bus Cascade)
  {
    codes: ['U0100', 'C0035'],
    title: 'Chassis Telemetry Propagation Over Dropped Bus',
    titleAr: 'تداخل أعطال منظومة الشاسيه وفقدان شبكة الاتصال',
    correlationStrength: 88,
    relationshipType: 'Cascade Malfunction',
    summary:
      'The ECM and ABS modules exchange wheel speed and torque reduction requests over high-speed CAN. When CAN bus communication drops (U0100), the chassis system registers simultaneous wheel speed sensor errors due to packet timeouts.',
    summaryAr:
      'تعتمد وحدة ABS وكمبيوتر المحرك على تبادل قراءات سرعة العجلات عبر شبكة CAN. عند انقطاع الاتصال تتولد أعطال فرامل كاذبة مرتبطة بانقطاع الإشارة.',
    primaryRootCause: 'CAN-bus wiring fault or main power relay drop',
    consequentialCodes: ['C0035'],
    unifiedDiagnosticProcedure: [
      'Diagnose CAN-bus communication (Pin 6/14 resistance) before replacing any wheel speed sensors.',
    ],
    sharedComponents: ['CAN-bus Twisted Pair Wiring', 'Main ECM Power Relay'],
    diagnosticPriorityOrder: ['U0100', 'C0035'],
  },
];

// Helper to decode ANY DTC code in P0xxx, P1xxx, P2xxx, P3xxx, Bxxxx, Cxxxx, Uxxxx
export function parseAndDecodeDtc(inputCode: string, lang: Language): DtcDetail {
  const cleanCode = inputCode.trim().toUpperCase();

  // If directly in canonical catalog
  if (CANONICAL_DTC_DATABASE[cleanCode]) {
    return CANONICAL_DTC_DATABASE[cleanCode];
  }

  // Analyze structure based on SAE J2012 / ISO 15031
  const firstChar = cleanCode.charAt(0);
  const secondChar = cleanCode.charAt(1);
  const thirdChar = cleanCode.charAt(2);

  let category: DtcCategory = 'Powertrain';
  let systemName = 'Powertrain System';
  let systemAr = 'منظومة القوة والدفع';
  let targetComp = 'engine';

  if (firstChar === 'B') {
    category = 'Body';
    systemName = 'Body & Safety Electronics';
    systemAr = 'كهرباء الهيكل والأمان';
    targetComp = 'electrical';
  } else if (firstChar === 'C') {
    category = 'Chassis';
    systemName = 'Chassis, Brakes & Steering';
    systemAr = 'الشاسيه والفرامل والتعليق';
    targetComp = 'brakes';
  } else if (firstChar === 'U') {
    category = 'Network';
    systemName = 'Network & Bus Communication';
    systemAr = 'شبكة الاتصالات والكان باس';
    targetComp = 'electrical';
  }

  const isGeneric = secondChar === '0' || secondChar === '2';
  const standardType = isGeneric ? 'SAE Generic' : 'Manufacturer Specific';

  // Subsystem interpretation
  let subsystem = 'Auxiliary Electronic Controller';
  let description = `Diagnostic Trouble Code ${cleanCode} - Circuit / Performance Fault`;
  let descriptionAr = `كود الفحص التشخيصي ${cleanCode} - عطل في الدائرة أو الأداء`;
  let cylNumber: number | undefined = undefined;

  // Check misfire P0301-P0312
  if (cleanCode.startsWith('P030') || cleanCode.startsWith('P031')) {
    const num = parseInt(cleanCode.slice(3), 10);
    if (!isNaN(num) && num >= 1 && num <= 12) {
      cylNumber = num;
      subsystem = `Cylinder ${num} Combustion Chamber`;
      description = `Cylinder ${num} Misfire Detected`;
      descriptionAr = `تم رصد خلل في احتراق الأسطوانة رقم ${num} (Misfire)`;
    }
  } else if (firstChar === 'P') {
    switch (thirdChar) {
      case '0':
      case '1':
      case '2':
        subsystem = 'Fuel and Air Metering';
        description = `Fuel and Air Metering Control Malfunction (${cleanCode})`;
        descriptionAr = `عطل في نظام معايرة الهواء والوقود (${cleanCode})`;
        break;
      case '3':
        subsystem = 'Ignition System or Misfire';
        description = `Ignition System Misfire or Spark Fault (${cleanCode})`;
        descriptionAr = `عطل في نظام الإشعال أو توليد الشرر (${cleanCode})`;
        break;
      case '4':
        subsystem = 'Auxiliary Emissions Controls';
        description = `Auxiliary Emission Control System Performance (${cleanCode})`;
        descriptionAr = `عطل في نظام التحكم بالانبعاثات والبيئة (${cleanCode})`;
        targetComp = 'exhaust';
        break;
      case '5':
        subsystem = 'Vehicle Speed & Idle Control';
        description = `Vehicle Speed Control & Idle Air System (${cleanCode})`;
        descriptionAr = `عطل في التحكم بسرعة السيارة أو سرعة السلانسيه (${cleanCode})`;
        break;
      case '6':
        subsystem = 'Computer & Auxiliary Outputs';
        description = `Internal Control Module Processor / Memory Fault (${cleanCode})`;
        descriptionAr = `عطل في معالج وحدة التحكم الإلكترونية (${cleanCode})`;
        break;
      case '7':
      case '8':
      case '9':
        subsystem = 'Automatic Transmission & Drivetrain';
        description = `Transmission & Hydraulic Gearbox Control Circuit (${cleanCode})`;
        descriptionAr = `عطل في منظومة ناقل الحركة الأوتوماتيكي (${cleanCode})`;
        targetComp = 'transmission';
        break;
    }
  }

  // Synthesize rich dynamic DTC structure
  return {
    code: cleanCode,
    category,
    standardType,
    system: systemName,
    systemAr,
    subsystem,
    description,
    descriptionAr,
    severity: 'High',
    milStatus: 'MIL Steady',
    targetComponentId: targetComp,
    highlightCylinder: cylNumber,
    possibleCauses: [
      { name: `Sensor / component electrical harness open or short to ground`, nameAr: 'قطع أو التماس في ضفيرة الحساس أو المشغل', probability: 80, category: 'Electrical' },
      { name: `Target actuator or sensor internal electronic failure`, nameAr: 'تلف داخلي في الحساس أو المشغل الإلكتروني', probability: 75, category: 'Sensors' },
      { name: `Loose, backed-out, or oxidized terminal pins at connector`, nameAr: 'رخاوة أو أكسدة في أطراف الفيش الكهربائي', probability: 65, category: 'Electrical' },
      { name: `Operating parameter deviation due to mechanical wear`, nameAr: 'انحراف قيم التشغيل نتيجة تآكل ميكانيكي', probability: 50, category: 'Mechanical' },
    ],
    symptoms: [
      { title: 'Check Engine / Malfunction Indicator Lamp illuminated', titleAr: 'إضاءة لمبة فحص المحرك / التحذير', impact: 'High' },
      { title: 'Subsystem performance degradation or fail-safe mode', titleAr: 'تراجع أداء المنظومة أو الدخول في وضع الأمان (Limp Mode)', impact: 'Medium' },
    ],
    diagnosticSteps: [
      {
        stepNumber: 1,
        title: `Verify Code Presence & Freeze Frame Parameters`,
        titleAr: 'التحقق من الكود وقراءة شاشة التجميد',
        action: `Connect diagnostic scan tool, record freeze frame snapshot, verify if fault is current active or history.`,
        expectedResult: 'Parameters establish engine RPM, coolant temperature, and load during fault occurrence.',
        toolsNeeded: 'OBD-II / CAN Scan Tool',
      },
      {
        stepNumber: 2,
        title: `Wiring Harness & Connector Pin Inspection`,
        titleAr: 'فحص الضفيرة وأفياش التوصيل',
        action: `Inspect wire routing for abrasions, pinch points, or thermal damage. Disconnect connector and inspect pins for moisture, corrosion, or pin drag tension.`,
        expectedResult: 'Clean, dry pins with solid friction retention; zero frayed copper strands.',
        toolsNeeded: 'Digital Multimeter, terminal probe kit, flashlight',
      },
      {
        stepNumber: 3,
        title: `Reference Voltage & Ground Continuity Check`,
        titleAr: 'فحص الفولتية المرجعية والتأريض',
        action: `Measure 5.0V / 12.0V reference feed and check resistance to battery negative ground (< 0.5 Ohms).`,
        expectedResult: 'Stable voltage supply without fluctuations.',
        toolsNeeded: 'Digital Multimeter',
      },
    ],
    commonAffectedComponents: [
      { name: `${cleanCode} Sensor / Control Element`, oemPartNumber: `OEM-${cleanCode}-A`, estCost: '$125.00', difficulty: 'Intermediate' },
      { name: `Wiring Harness Connector Pigtail`, oemPartNumber: `PIG-${cleanCode}-01`, estCost: '$28.00', difficulty: 'Easy' },
    ],
    recommendedChecks: [
      { testName: 'Reference Voltage Circuit', specValue: '5.0V ± 0.1V or 12.0V Battery Bus', sensorPid: 'REF_V' },
      { testName: 'Signal Circuit Voltage Drop', specValue: '< 200 mV under load', sensorPid: 'SIG_VDROP' },
    ],
    repairReferences: [
      { title: `Factory Service Manual: Diagnostic Routine for ${cleanCode}`, referenceCode: `FSM-${cleanCode}`, type: 'OEM Manual' },
    ],
    freezeFrameTemplate: {
      rpm: 1950,
      engineLoad: '42.0%',
      coolantTemp: '88°C',
      stft: '+3.0%',
      ltft: '+4.5%',
      vehicleSpeed: '52 km/h',
      fuelPressure: '135 Bar',
    },
  };
}

// CORRELATION ENGINE: Evaluates multiple active DTC codes
export function evaluateDtcCorrelations(activeCodes: string[]): DtcCorrelation[] {
  if (activeCodes.length < 2) return [];

  const upperCodes = activeCodes.map((c) => c.trim().toUpperCase());
  const foundCorrelations: DtcCorrelation[] = [];

  // 1. Check direct rule matches
  for (const rule of CORRELATION_RULES) {
    const allPresent = rule.codes.every((rc) => upperCodes.includes(rc));
    if (allPresent) {
      foundCorrelations.push(rule);
    }
  }

  // 2. Dynamic Algorithmic Correlation Synthesizer for arbitrary combinations
  // e.g. If multiple misfires (P0301 + P0302 or P0301 + P0303)
  const misfireCodes = upperCodes.filter((c) => c.startsWith('P030') || c.startsWith('P031'));
  if (misfireCodes.length >= 2 && !foundCorrelations.some((c) => c.codes.includes(misfireCodes[0]))) {
    foundCorrelations.push({
      codes: misfireCodes,
      title: 'Adjacent / Dual-Cylinder Combustion Misfire',
      titleAr: 'خلل احتراق متزامن في أسطوانتين متجاورتين',
      correlationStrength: 89,
      relationshipType: 'Shared Failure Root',
      summary: `Simultaneous misfires detected across ${misfireCodes.join(
        ' & '
      )}. If these cylinders are adjacent in the block firing order, inspect for blown cylinder head gasket between cylinders or cracked dual-coil wasted-spark pack.`,
      summaryAr: `تم رصد ميس فاير متزامن في الأسطوانات ${misfireCodes.join(
        ' و '
      )}. إذا كانت الأسطوانات متجاورة، يُشتبه بنسبة عالية بتلف وجه رأس المحرك (Head Gasket) بين الأسطوانتين.`,
      primaryRootCause: 'Blown head gasket between cylinders or shared coil pack',
      consequentialCodes: misfireCodes.slice(1),
      unifiedDiagnosticProcedure: [
        'Perform cylinder leakdown test on both cylinders to check for air escaping into adjacent spark plug hole.',
        'Inspect cooling system for combustion gas bubbles using chemical block tester fluid.',
      ],
      sharedComponents: ['Cylinder Head Gasket', 'Ignition Coil Pack'],
      diagnosticPriorityOrder: misfireCodes,
    });
  }

  // Check if multiple U-codes (Network bus error)
  const uCodes = upperCodes.filter((c) => c.startsWith('U'));
  if (uCodes.length >= 2 && !foundCorrelations.some((c) => c.codes.includes(uCodes[0]))) {
    foundCorrelations.push({
      codes: uCodes,
      title: 'Multiple Control Module Network Communication Dropout',
      titleAr: 'انقطاع اتصالات شبكة الكان باس بين وحدات متعددة',
      correlationStrength: 95,
      relationshipType: 'Shared Failure Root',
      summary: `Multiple modules reporting lost communication (${uCodes.join(
        ', '
      )}) indicates a central bus disruption (short to power/ground or blown Gateway power feed) rather than individual module failures.`,
      summaryAr: `رصد انقطاع اتصالات في عدة وحدات يؤكد وجود خلل مركزي في ضفيرة الكان باس أو الفيوز الرئيسي، وليس عطلاً في الوحدات المنفصلة.`,
      primaryRootCause: 'Main Gateway ECU, CAN-bus physical wiring short, or central ground failure',
      consequentialCodes: uCodes,
      unifiedDiagnosticProcedure: [
        'Measure DLC termination resistance across Pin 6 and Pin 14 with battery disconnected (must be 60 Ohms).',
        'Check battery terminal voltage and test charging system for severe AC ripple.',
      ],
      sharedComponents: ['Central Gateway Module', 'CAN Twisted Pair Trunk Harness'],
      diagnosticPriorityOrder: uCodes,
    });
  }

  return foundCorrelations;
}
