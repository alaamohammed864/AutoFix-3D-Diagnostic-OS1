import { Language } from '../types';

export type DiagnosticStatus = 'Likely Cause' | 'Possible Cause' | 'Requires Inspection';

export interface DiagnosticTestOption {
  label: string;
  labelAr: string;
  value: 'yes' | 'no' | 'pass' | 'fail' | 'partial' | string;
  resultType: 'passed' | 'failed' | 'neutral';
  nextNodeId?: string;
  isConclusion?: boolean;
  conclusionId?: string;
}

export interface DiagnosticTreeNode {
  id: string;
  question: string;
  questionAr: string;
  system: string;
  systemAr: string;
  targetComponent: string;
  testDescription: string;
  testDescriptionAr: string;
  expectedResult: string;
  expectedResultAr: string;
  safetyWarning?: string;
  safetyWarningAr?: string;
  options: DiagnosticTestOption[];
}

export interface DiagnosticConclusion {
  id: string;
  title: string;
  titleAr: string;
  status: DiagnosticStatus;
  confidenceScore: number; // e.g. 88 (representing 88%)
  rootCause: string;
  rootCauseAr: string;
  repairProcedure: string[];
  repairProcedureAr: string[];
  partsInvolved: {
    name: string;
    partNumber: string;
    estCost: string;
  }[];
  toolsRequired: string[];
  references: string[];
  recommendedNextSteps: string[];
  recommendedNextStepsAr: string[];
}

export interface SymptomDefinition {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  possibleSystems: string[];
  possibleComponents: string[];
  rootNodeId: string;
}

export interface TestExecutionRecord {
  question: string;
  system: string;
  component: string;
  expected: string;
  actual: string;
  result: 'passed' | 'failed' | 'neutral';
  timestamp: string;
}

export interface DiagnosticReportData {
  reportId: string;
  createdAt: string;
  vehicle: {
    make: string;
    model: string;
    year: string | number;
    vin: string;
    engine: string;
    transmission: string;
  };
  symptom: string;
  possibleSystems: string[];
  possibleComponents: string[];
  testsPerformed: TestExecutionRecord[];
  conclusion: DiagnosticConclusion;
  confidence: number;
}

export const PROFESSIONAL_DISCLAIMER = {
  en: 'PROFESSIONAL WORKSHOP DISCLAIMER: Diagnostic decision tree recommendations and probability rankings are computerized decision-support heuristics designed to assist certified automotive technicians. Modern motor vehicles incorporate high-voltage electrical circuits, pressurized flammable fuel, and high-temperature moving components. This automated analysis does not replace physical multi-point testing with calibrated workshop equipment. Always verify findings against OEM factory service manuals, obey SAE safety practices, and disconnect the battery ground when servicing high-current systems.',
  ar: 'إخلاء مسؤولية مهني لورش الصيانة: توصيات شجرة القرارات التشخيصية ونسب الاحتمالية الموضحة هي أدوات استرشادية حاسوبية مصممة لمساعدة الفنيين والمهندسين المعتمدين. تحتوي المركبات الحديثة على دوائر كهربائية عالية الجهد، وأنظمة وقود مضغوطة قابلة للاشتعال، وأجزاء ميكانيكية ذات درجات حرارة بالغة الارتفاع. لا يُعد هذا التشخيص بديلاً عن الفحص المخبري الميداني باستخدام أجهزة القياس المعايرة. يُرجى دائماً مراجعة كتيبات الصيانة المعتمدة من المصنع، وتطبيق معايير السلامة المهنية لجمعية مهندسي السيارات (SAE).',
};

// ==========================================
// PRE-DEFINED DIAGNOSTIC DECISION TREES
// ==========================================

export const DIAGNOSTIC_CONCLUSIONS: Record<string, DiagnosticConclusion> = {
  'concl-dead-battery': {
    id: 'concl-dead-battery',
    title: 'Discharged / Severely Degraded 12V AGM Battery',
    titleAr: 'بطارية 12V مفرغة الشحنة أو متآكلة الخلايا الداخلية',
    status: 'Likely Cause',
    confidenceScore: 92,
    rootCause:
      'The battery open-circuit voltage collapsed below 9.6V under crank load, indicating sulfation, cell degradation, or high internal impedance unable to energize the starter solenoid.',
    rootCauseAr:
      'انهار جهد البطارية المفتوح إلى ما دون 9.6 فولت أثناء محاولة التدوير، مما يؤكد كبرتة الألواح أو تآكل الخلايا الداخلية أو زيادة المقاومة العالية التي تمنع تشغيل ملف المارش.',
    repairProcedure: [
      'Perform battery conductance test with a certified battery analyzer (e.g. Midtronics).',
      'If health is under 70%, disconnect negative terminal first, then positive terminal.',
      'Remove battery hold-down clamp (10mm/13mm socket).',
      'Clean terminal connectors with wire brush and baking soda neutralizing solution.',
      'Install OEM-equivalent AGM battery matching factory CCA and Amp-Hour rating.',
      'Register new battery profile in the vehicle Gateway/BMS control module using scan tool.',
    ],
    repairProcedureAr: [
      'إجراء اختبار توصيلية البطارية باستخدام جهاز فحص البطاريات المعتمد.',
      'إذا كانت نسبة كفاءة البطارية أقل من 70%، افصل القطب السالب أولاً ثم القطب الموجب.',
      'فك مسامير حامل تثبيت البطارية باستخدام مفتاح 10 مم أو 13 مم.',
      'تنظيف أطراف التوصيل بفرشاة سلكية ومحلول كربونات الصودا لمعادلة الأحماض.',
      'تركيب بطارية AGM مطابقة لمواصفات المصنع من حيث تيار التدوير البارد CCA والسعة Ah.',
      'تسجيل وترميز البطارية الجديدة في وحدة إدارة الطاقة BMS عبر جهاز الفحص OBD.',
    ],
    partsInvolved: [
      { name: '12V 80Ah 800CCA AGM Battery', partNumber: 'OEM-992-915-105-B', estCost: '$260 - $340' },
      { name: 'Anti-Corrosion Terminal Washers', partNumber: 'UNI-BAT-WSH-01', estCost: '$4 - $8' },
    ],
    toolsRequired: ['Digital Multimeter', 'Battery Conductance Analyzer', '10mm & 13mm Sockets', 'OBD-II Scan Tool with Battery Registration Function'],
    references: ['SAE J537 Battery Standard', 'OEM Workshop Manual Section 27-06 (Power Supply)'],
    recommendedNextSteps: [
      'Test alternator charging output under full electrical load (>13.8V - 14.5V).',
      'Perform 45-minute parasitic drain quiescent current test (<35 mA draw).',
    ],
    recommendedNextStepsAr: [
      'فحص جهد شحن الدينامو تحت التحميل الكامل للتحقق من وصول الجهد إلى 13.8V - 14.5V.',
      'إجراء فحص تسريب التيار الخامل (Parasitic Drain) للتأكد من أن السحب أقل من 35 مللي أمبير.',
    ],
  },

  'concl-starter-solenoid': {
    id: 'concl-starter-solenoid',
    title: 'Seized Starter Motor Solenoid / Worn Carbon Brushes',
    titleAr: 'عطل في ملف أوتوماتيك المارش أو تآكل فحمات المحرك الكهربائي',
    status: 'Likely Cause',
    confidenceScore: 89,
    rootCause:
      'Battery voltage remained stable at 12.5V with audible relay actuation, but no current passed to the starter armature due to burned contact disks or hung starter brushes.',
    rootCauseAr:
      'بقي جهد البطارية ثابتاً عند 12.5 فولت مع سماع تكة الريليه، ولكن لم يمر تيار إلى قلب المارش نتيجة احتراق نقاط التلامس النحاسية أو التصاق الفحمات.',
    repairProcedure: [
      'Elevate vehicle safely on lift and disconnect battery negative cable.',
      'Remove underbody splash protection shields.',
      'Locate starter motor on bellhousing and test direct B+ terminal feed and terminal 50 start trigger signal.',
      'Unbolt starter mounting bolts (E14 Torx / 16mm bolts).',
      'Inspect flywheel/flexplate ring gear teeth for missing or chipped teeth.',
      'Install replacement high-torque starter motor, torquing mounting fasteners to 45 Nm.',
      'Reconnect battery and verify crisp engagement and crank speed (>250 RPM).',
    ],
    repairProcedureAr: [
      'رفع المركبة بأمان وفصل كابل القطب السالب للبطارية.',
      'فك بطانات الحماية البلاستيكية السفلية للمحرك.',
      'فحص طرف التغذية المباشر B+ وسلك إشارة التشغيل Terminal 50 في المارش.',
      'فك مسامير تثبيت المارش على جدار القير.',
      'معاينة أسنان حذاف المحرك للتأكد من خلوها من الكسر أو التآكل.',
      'تركيب المارش الجديد وربط المسامير بعزم 45 نيوتن-متر.',
      'إعادة توصيل البطارية واختبار سرعة التدوير (>250 دورة/دقيقة).',
    ],
    partsInvolved: [
      { name: 'High-Torque Reduction Starter Motor', partNumber: 'OEM-000-110-845', estCost: '$220 - $410' },
      { name: 'Starter Heat Shield Gasket', partNumber: 'OEM-992-110-12', estCost: '$18 - $30' },
    ],
    toolsRequired: ['Vehicle Hoist / Jack Stands', '1/2" Ratchet & E-Torx Set', 'Digital Multimeter / Voltage Drop Leads'],
    references: ['SAE J544 Starting Motor Specification', 'Wiring Diagram Section 27-20'],
    recommendedNextSteps: [
      'Perform voltage drop test on starter ground cable (<0.2V drop).',
      'Inspect ignition switch terminal 50 command circuit.',
    ],
    recommendedNextStepsAr: [
      'إجراء اختبار هبوط الجهد على كابل التأريض الخاص بالمارش (يجب ألا يتعدى 0.2 فولت).',
      'فحص دائرة إشارة مفتاح التشغيل عبر وحدة التحكم.',
    ],
  },

  'concl-starter-relay-fuse': {
    id: 'concl-starter-relay-fuse',
    title: 'Open Starter Fuse or Faulty Starter Relay (Terminal 50)',
    titleAr: 'احتراق فيوز المارش أو تلف ريليه بادئ الحركة (طرف 50)',
    status: 'Likely Cause',
    confidenceScore: 86,
    rootCause:
      'Control module commanded starter engagement, but the primary 40A/50A starter circuit fuse was blown or relay contacts have pitted open.',
    rootCauseAr:
      'أرسلت وحدة التحكم أمر بدء التشغيل، ولكن الفيوز الرئيسي لدائرة المارش محترق أو أن نقاط تلامس الريليه تلفت نتيجة القوس الكهربائي.',
    repairProcedure: [
      'Open front trunk / engine bay pre-fuse distribution box.',
      'Locate Starter Relay (R04) and Fuse (F12, 40A Maxi).',
      'Measure continuity across fuse blades using digital multimeter.',
      'Bench-test relay by applying 12V across pins 85 & 86 while measuring resistance across pins 30 & 87 (<0.5 ohm expected).',
      'Replace blown fuse or relay with exact OE specification rating.',
    ],
    repairProcedureAr: [
      'فتح صندوق الفيوزات الرئيسي في حجرة المحرك أو الشنطة الأمامية.',
      'تحديد ريليه المارش والفيوز المخصص لدائرة البادئ (40A Maxi).',
      'فحص استمرارية الفيوز باستخدام وضع الجرس في الملتيميتر.',
      'اختبار الريليه خارجياً بتوصيل 12V على الأطراف 85 و 86 وقياس مقاومة أطراف التوصيل 30 و 87.',
      'استبدال الفيوز أو الريليه التالف بآخر مطابق للأمبير المعتمد.',
    ],
    partsInvolved: [
      { name: '40A Maxi Blade Fuse', partNumber: 'FUSE-MAX-40A', estCost: '$5 - $10' },
      { name: '5-Pin Automotive Power Relay', partNumber: 'RELAY-12V-40A-01', estCost: '$15 - $28' },
    ],
    toolsRequired: ['Digital Multimeter', 'Fuse Puller Tool', 'Test Light'],
    references: ['Power Distribution & Fuse Box Schematics Section 97'],
    recommendedNextSteps: ['Inspect starter harness for short-to-ground that could cause repeated fuse blowing.'],
    recommendedNextStepsAr: ['فحص ظفيرة المارش للتأكد من عدم وجود التماس كهربائي يسبب تكرار احتراق الفيوز.'],
  },

  'concl-fuel-pump': {
    id: 'concl-fuel-pump',
    title: 'In-Tank Electric Fuel Pump or Fuel Pump Driver Module Failure',
    titleAr: 'تلف مضخة الوقود الكهربائية في الخزان أو وحدة التحكم بمضخة الوقود (FPDM)',
    status: 'Likely Cause',
    confidenceScore: 88,
    rootCause:
      'No fuel pressure generated at the low-pressure supply line. The low-pressure fuel pump (LPFP) failed to energize during key-on prime cycle.',
    rootCauseAr:
      'انعدام ضغط الوقود في خط الإمداد منخفض الضغط. فشلت طلمبة البنزين الغاطسة في العمل وضخ الوقود عند فتح السويتش.',
    repairProcedure: [
      'Verify 12V power and PWM command signal at fuel pump tank connector under rear seat.',
      'Relieve residual fuel system pressure via test port.',
      'Disconnect fuel lines using quick-release disconnect tools.',
      'Unscrew tank locking ring using fuel sender lock ring tool.',
      'Extract fuel pump assembly, taking care not to bend float arm sensor.',
      'Install replacement OEM fuel pump module and new rubber sealing ring.',
      'Prime system 3 times and inspect for leaks before starting engine.',
    ],
    repairProcedureAr: [
      'فحص وصول تغذية 12V وإشارة التحكم PWM إلى فيشة الطلمبة أسفل المقعد الخلفي.',
      'تفريغ الضغط المتبقي في منظومة الوقود عبر بلف الفحص.',
      'فصل خراطيم الوقود باستخدام أدوات فك الكلبسات السريعة.',
      'فك حلقة إحكام قفل الخزان باستخدام الأداة المخصصة لطلمبات الوقود.',
      'إخراج طلمبة البنزين كاملة مع مراعاة عدم إتلاف ذراع عوامة البنزين.',
      'تركيب المضخة الأصلية الجديدة مع حلقة دائرية (O-ring) جديدة.',
      'تشغيل السويتش 3 مرات لتحضير الوقود والتحقق من عدم وجود أي تسريب قبل التشغيل.',
    ],
    partsInvolved: [
      { name: 'OEM In-Tank Fuel Delivery Module', partNumber: 'OEM-992-201-081', estCost: '$380 - $550' },
      { name: 'Fuel Tank Lock Ring Seal Gasket', partNumber: 'SEAL-TANK-78', estCost: '$14 - $22' },
    ],
    toolsRequired: ['Fuel Pressure Test Gauge Set', 'Fuel Tank Lock Ring Spanner', 'Non-Sparking Brass Punches', 'Multimeter'],
    references: ['SAE J2044 Fuel Coupling Standard', 'Fuel Delivery Manual Section 20-05'],
    recommendedNextSteps: ['Inspect fuel filter for heavy sediment contamination and check fuel quality.'],
    recommendedNextStepsAr: ['فحص فلتر الوقود للتأكد من خلوه من الرواسب والشوائب، ومعاينة نقاء البنزين.'],
  },

  'concl-crankshaft-sensor': {
    id: 'concl-crankshaft-sensor',
    title: 'Defective Crankshaft Position Sensor (CKP) / Loss of RPM Sync',
    titleAr: 'تلف حساس موضع عمود الكرنك (حساس الكرنك) وفقدان إشارة التزامن',
    status: 'Likely Cause',
    confidenceScore: 91,
    rootCause:
      'The engine cranks vigorously but the Engine Control Module (ECM) receives zero RPM signal. Without crankshaft position reference, the ECU suppresses both fuel injector pulse and spark ignition to prevent out-of-time combustion.',
    rootCauseAr:
      'يدور المحرك بالمارش بشكل طبيعي ولكن كمبيوتر المحرك يقرأ 0 RPM. في غياب إشارة حساس الكرنك، يقطع الكمبيوتر نبضات البخاخات والشرارة تماماً لمنع الاحتراق غير المتزامن.',
    repairProcedure: [
      'Connect OBD-II live telemetry scanner and monitor engine speed PID during active cranking.',
      'Confirm reading displays 0 RPM during crank (expected >180-250 RPM).',
      'Disconnect CKP sensor harness connector and measure coil resistance (expected 800 - 1200 ohms) or Hall effect reference voltage (5V).',
      'Remove sensor retention fastener (usually E10 or 10mm bolt on bellhousing / front cover).',
      'Inspect sensor tip for metal shaving accumulation or physical contact with reluctor wheel.',
      'Install replacement OEM magnetic/Hall CKP sensor and torque to 9 Nm.',
      'Clear diagnostic trouble codes and perform CKP variation relearn procedure.',
    ],
    repairProcedureAr: [
      'توصيل جهاز الفحص ومراقبة قراءة سرعة دوران المحرك (RPM) أثناء التدوير بالمارش.',
      'التأكد من أن القراءة تظل 0 RPM أثناء محاولة التشغيل (المتوقع >180-250 RPM).',
      'فصل فيشة حساس الكرنك وقياس المقاومة (المتوقع 800 - 1200 أوم) أو جهد التغذية 5V.',
      'فك مسمار تثبيت الحساس على غطاء المحرك أو جدار القير.',
      'معاينة رأس الحساس للتأكد من خلوه من برادة الحديد أو الاحتكاك بمسننات الترس الدوار.',
      'تركيب الحساس الأصلي الجديد وربطه بعزم 9 نيوتن-متر.',
      'مسح أكواد الأعطال وعمل معايرة وبرمجة لحساس الكرنك (Crank Relearn).',
    ],
    partsInvolved: [
      { name: 'OEM Hall-Effect Crankshaft Position Sensor', partNumber: 'OEM-046-906-433', estCost: '$85 - $145' },
      { name: 'Sensor O-Ring Seal', partNumber: 'SEAL-O-12x2', estCost: '$4 - $7' },
    ],
    toolsRequired: ['OBD-II Live Data Scanner', 'Digital Storage Oscilloscope (Optional)', '1/4" Ratchet & E10 Torx Socket'],
    references: ['SAE J1979 Engine RPM Parameter ID', 'Engine Timing Diagnostics Section 24-15'],
    recommendedNextSteps: [
      'Check camshaft position sensors (CMP) for synchronous cam-to-crank correlation.',
      'Verify ground circuit integrity to ECM.',
    ],
    recommendedNextStepsAr: [
      'فحص حساسات الكامات للتحقق من تطابق التزامن بين الكرنك والكامة.',
      'فحص سلامة التوصيل الأرضي لكمبيوتر المحرك ECM.',
    ],
  },

  'concl-immobilizer-lockout': {
    id: 'concl-immobilizer-lockout',
    title: 'Anti-Theft Immobilizer Key Transponder Lockout (PAS / BCM)',
    titleAr: 'تفعيل نظام الحماية ضد السرقة وإقفال نظام الإيموبلايزر (عدم التعرف على المفتاح)',
    status: 'Likely Cause',
    confidenceScore: 94,
    rootCause:
      'The security transponder in the key fob failed cryptographic handshake with the RFID antenna ring or Gateway, triggering anti-theft lockout that disables injector pulses while allowing crank.',
    rootCauseAr:
      'فشلت شريحة المفتاح الذكي في إتمام المصافحة المشفرة مع حلقة الهوائي أو كمبيوتر الراحة BCM، مما نشط نظام منع السرقة وقطع حقن الوقود مع السماح بالتدوير.',
    repairProcedure: [
      'Check instrument cluster for flashing security key / padlock warning icon.',
      'Scan BCM/KESSY control modules for DTCs (e.g. B104B, P1570 Engine Blocked by Immobilizer).',
      'Replace key fob CR2032 lithium coin cell battery.',
      'Attempt vehicle start using secondary backup factory key.',
      'If backup key fails, inspect RFID induction loop coil around steering column / center console start button.',
      'Perform dealer-level or pass-thru key transponder re-synchronization procedure.',
    ],
    repairProcedureAr: [
      'ملاحظة وميض لمبة المفتاح أو القفل الأمني في لوحة العدادات.',
      'فحص كمبيوتر الراحة BCM للتأكد من وجود كود حظر المحرك (مثل P1570).',
      'تغيير بطارية ريموت المفتاح (CR2032).',
      'محاولة تشغيل المركبة باستخدام المفتاح الاحتياطي الثاني للمركبة.',
      'إذا استمر العطل، فحص ملف هوائي الاستشعار حول زر التشغيل أو عامود الدركسون.',
      'إعادة برمجة ومطابقة المفاتيح بجهاز فحص متقدم يدعم وظائف منع السرقة.',
    ],
    partsInvolved: [
      { name: 'CR2032 Key Fob Battery', partNumber: 'BAT-CR2032', estCost: '$5 - $9' },
      { name: 'Steering Column Transponder Antenna', partNumber: 'OEM-ANT-992-02', estCost: '$95 - $160' },
    ],
    toolsRequired: ['High-End Automotive Diagnostic Scanner with Security Access', 'Key RF Signal Detector Tool'],
    references: ['SAE J2186 Immobilizer Interface Guidelines', 'Security & Access Control Manual Section 96'],
    recommendedNextSteps: ['Check for aftermarket remote start or tracker spliced into CAN bus lines.'],
    recommendedNextStepsAr: ['التأكد من عدم وجود أجهزة تتبع أو تشغيل عن بعد تجارية متصلة بأسلاك شبكة الـ CAN.'],
  },

  'concl-low-compression': {
    id: 'concl-low-compression',
    title: 'Low Engine Cylinder Compression / Skipped Timing Chain',
    titleAr: 'انخفاض ضغط الانضغاط في السلندرات أو اختلال توقيت جنزير المحرك',
    status: 'Requires Inspection',
    confidenceScore: 78,
    rootCause:
      'Engine spins unusually fast and unevenly during crank, indicating loss of combustion chamber seal caused by jumped timing chain, bent valves, or blown head gasket.',
    rootCauseAr:
      'يدور المحرك بسرعة عالية غير معتادة وخفيفة أثناء التدوير، مما يدل على فقدان الضغط الداخلي لغرف الاحتراق بسبب قفز جنزير التايمنق أو اعوجاج الصمامات.',
    repairProcedure: [
      'Remove all spark plugs and fuel pump fuse.',
      'Install mechanical compression gauge with threaded adapter into Cylinder 1.',
      'Crank engine for 5-6 compression strokes with throttle wide open.',
      'Repeat test across all cylinders, recording pressure values (expected 160-190 PSI, variance <10%).',
      'If compression is <100 PSI across adjacent cylinders, perform cylinder leakdown test with compressed air.',
      'Remove timing cover and verify camshaft and crankshaft timing marks alignment.',
    ],
    repairProcedureAr: [
      'فك جميع شمعات الاحتراق (البواجي) وسحب فيوز طلمبة البنزين.',
      'تركيب ساعة قياس ضغط الانضغاط في فتحة السلندر رقم 1.',
      'تدوير المحرك بالمارش 5 إلى 6 دورات مع فتح بوابة الهواء بالكامل.',
      'تكرار القياس لجميع السلندرات وتدوين النتائج (المتوقع 160-190 PSI بفارق لا يتعدى 10%).',
      'إذا انخفض الضغط عن 100 PSI، إجراء اختبار تسريب الهواء (Leakdown Test).',
      'فك غطاء التايمنق ومطابقة علامات ضبط توقيت الكرنك وعمود الكامات.',
    ],
    partsInvolved: [
      { name: 'Timing Chain & Hydraulic Tensioner Kit', partNumber: 'OEM-TIM-KIT-992', estCost: '$450 - $780' },
      { name: 'Multi-Layer Steel (MLS) Cylinder Head Gasket', partNumber: 'OEM-HG-992-01', estCost: '$120 - $210' },
    ],
    toolsRequired: ['Threaded Compression Tester Kit', 'Cylinder Leakdown Detector Gauge', 'Borescope Inspection Camera'],
    references: ['SAE J1349 Engine Mechanical Testing', 'Engine Overhaul Manual Section 15-02'],
    recommendedNextSteps: ['Perform borescope visual inspection of piston crowns and valve heads.'],
    recommendedNextStepsAr: ['فحص قمم المكابس ورؤوس الصمامات بكاميرا التنظير البورسكوب.'],
  },
};

// ==========================================
// TREE NODES FOR "Engine won't start"
// ==========================================

export const DIAGNOSTIC_TREE_NODES: Record<string, DiagnosticTreeNode> = {
  // ROOT NODE
  'node-starter-crank': {
    id: 'node-starter-crank',
    question: 'Does the starter motor crank the engine when the key / start button is activated?',
    questionAr: 'هل يدور محرك بادئ الحركة (المارش) عند الضغط على زر التشغيل؟',
    system: 'Starting System',
    systemAr: 'منظومة بادئ الحركة والكهرباء',
    targetComponent: 'Starter Motor & Flywheel',
    testDescription:
      'Turn the ignition to the START position and listen carefully to the engine bay. Note whether the engine rotates, produces a single click, rapid clicking, or complete silence.',
    testDescriptionAr:
      'أدر السويتش إلى وضع التشغيل واستمع باهتمام لحجرة المحرك. لاحظ ما إذا كان المحرك يدور بالمارش، أو يصدر تكة واحدة، أو تكات سريعة، أو صمتاً تاماً.',
    expectedResult:
      'The starter motor should spin vigorously, cranking the engine smoothly at approximately 200 - 280 RPM.',
    expectedResultAr:
      'يجب أن يدور المارش بنشاط وقوة، ويدير المحرك بسلاسة عند سرعة تدوير تقارب 200 إلى 280 دورة/دقيقة.',
    safetyWarning: 'Ensure transmission is in Park or Neutral with the parking brake fully engaged.',
    safetyWarningAr: 'تأكد من وضع القير في وضع التوقف (P) أو الفضاء (N) مع سحب فرامل اليد بالكامل.',
    options: [
      {
        label: 'NO - Complete silence, single click, or rapid clicking',
        labelAr: 'لا - صمت تام، أو تكة واحدة قوية، أو طقطقة سريعة متتالية',
        value: 'no',
        resultType: 'failed',
        nextNodeId: 'node-battery-voltage',
      },
      {
        label: 'YES - Starter cranks engine (normal or fast speed)',
        labelAr: 'نعم - المارش يدور ويدير المحرك بشكل طبيعي أو سريع',
        value: 'yes',
        resultType: 'passed',
        nextNodeId: 'node-fuel-pump-prime',
      },
    ],
  },

  // BRANCH: NO CRANK -> TEST BATTERY VOLTAGE
  'node-battery-voltage': {
    id: 'node-battery-voltage',
    question: 'What is the 12V battery open-circuit voltage and cranking voltage drop?',
    questionAr: 'ما هي قراءة جهد بطارية 12V عند السكون وأثناء محاولة التشغيل؟',
    system: 'Electrical System',
    systemAr: 'المنظومة الكهربائية',
    targetComponent: '12V AGM Starter Battery',
    testDescription:
      'Set digital multimeter to DC Volts (20V range). Place red lead on positive terminal post and black lead on negative post. Measure resting voltage, then have an assistant turn the key to START.',
    testDescriptionAr:
      'اضبط جهاز الملتيميتر على قياس الجهد المستمر DCV. ضع المجس الأحمر على القطب الموجب والأسود على السالب. قس الجهد في حالة السكون ثم أثناء محاولة التدوير.',
    expectedResult:
      'Resting voltage must be ≥ 12.6V (100% SoC). Voltage under start load must stay above 10.0V.',
    expectedResultAr:
      'يجب أن يكون جهد السكون ≥ 12.6 فولت (شحن 100%). وأثناء محاولة التشغيل يجب ألا يقل الجهد عن 10.0 فولت.',
    options: [
      {
        label: 'Low - Resting voltage < 12.0V or collapses below 9.6V under load',
        labelAr: 'منخفض - الجهد أقل من 12.0V أو ينهار تحت 9.6V عند محاولة التشغيل',
        value: 'low',
        resultType: 'failed',
        isConclusion: true,
        conclusionId: 'concl-dead-battery',
      },
      {
        label: 'Normal - Resting 12.6V+, holds above 10.5V under load',
        labelAr: 'سليم - الجهد 12.6V فأكثر، ويثبت فوق 10.5V أثناء محاولة التشغيل',
        value: 'normal',
        resultType: 'passed',
        nextNodeId: 'node-starter-relay',
      },
    ],
  },

  // BRANCH: BATTERY GOOD, BUT NO CRANK -> TEST STARTER RELAY & TERMINALS
  'node-starter-relay': {
    id: 'node-starter-relay',
    question: 'Does the starter relay click and deliver 12V to Terminal 50 on the starter solenoid?',
    questionAr: 'هل يصدر ريليه المارش صوت نقرة ويوصل 12V لسلك الإشارة (Terminal 50)؟',
    system: 'Starting & Ignition System',
    systemAr: 'دائرة التحكم ببادئ الحركة',
    targetComponent: 'Starter Relay & Terminal 50 Signal',
    testDescription:
      'Locate starter relay in fuse box. Feel for relay click when key is turned to start, and probe the small wire (Terminal 50) on the starter motor with a backprobe or test light.',
    testDescriptionAr:
      'حدد موقع ريليه المارش في علبة الفيوزات. تحسس صوت تكة الريليه وافحص وصول 12V إلى السلك الصغير (Terminal 50) المتصل بأوتوماتيك المارش.',
    expectedResult:
      'Solid 12.2V - 12.6V present on Terminal 50 momentarily when the ignition is in the START position.',
    expectedResultAr:
      'وصول جهد كامل 12.2V - 12.6V لحظة وضع السويتش على التشغيل START.',
    options: [
      {
        label: 'NO - No voltage arrives at Terminal 50, relay does not actuate',
        labelAr: 'لا - لا تصل أي كهرباء للسلك الصغير والريليه لا يعمل',
        value: 'no',
        resultType: 'failed',
        isConclusion: true,
        conclusionId: 'concl-starter-relay-fuse',
      },
      {
        label: 'YES - Full 12V arrives at Terminal 50, but starter motor does not spin',
        labelAr: 'نعم - تصل 12V كاملة لسلك المارش ولكن المارش نفسه لا يدور إطلاقاً',
        value: 'yes',
        resultType: 'passed',
        isConclusion: true,
        conclusionId: 'concl-starter-solenoid',
      },
    ],
  },

  // BRANCH: CRANKS -> TEST FUEL PRIMING
  'node-fuel-pump-prime': {
    id: 'node-fuel-pump-prime',
    question: 'Can you hear the fuel pump buzz/prime for 2-3 seconds when ignition is switched to ON?',
    questionAr: 'هل تسمع صوت طنين مضخة الوقود (تحضير البنزين) لمدة ثانيتين عند فتح السويتش؟',
    system: 'Fuel Delivery System',
    systemAr: 'منظومة إمداد الوقود',
    targetComponent: 'In-Tank Low-Pressure Fuel Pump',
    testDescription:
      'With the radio, blower fan, and cabin noise off, switch the ignition ON without starting. Listen near the rear seats/fuel tank for a distinct humming sound as the system pressurizes the fuel rail.',
    testDescriptionAr:
      'أغلق الراديو ومكيف الهواء وجميع مصادر الضوضاء، وافتح السويتش ON دون تشغيل. استمع بجوار المقعد الخلفي لطنين طلمبة البنزين وهي تحضر الضغط.',
    expectedResult:
      'Clear audible 2-second electric motor hum from the tank area, indicating pump priming.',
    expectedResultAr:
      'سماع صوت طنين كهربائي واضح لمدة ثانيتين من منطقة الخزان يدل على تشغيل الطلمبة.',
    options: [
      {
        label: 'NO - Complete silence from tank, no priming heard',
        labelAr: 'لا - صمت تام من جهة الخزان، لا يوجد أي صوت تحضير',
        value: 'no',
        resultType: 'failed',
        isConclusion: true,
        conclusionId: 'concl-fuel-pump',
      },
      {
        label: 'YES - Distinct fuel pump prime heard',
        labelAr: 'نعم - سمع صوت تحضير طلمبة البنزين بوضوح تام',
        value: 'yes',
        resultType: 'passed',
        nextNodeId: 'node-tach-rpm',
      },
    ],
  },

  // BRANCH: FUEL PUMP PRIMES -> TEST TACHOMETER / CRANK SENSOR
  'node-tach-rpm': {
    id: 'node-tach-rpm',
    question: 'Does the tachometer needle bounce or scan tool register RPM (180+ RPM) during cranking?',
    questionAr: 'هل يتحرك مؤشر الـ RPM أو يقرأ جهاز الفحص سرعة دوران (>180 RPM) أثناء التدوير؟',
    system: 'Engine Management & Sensors',
    systemAr: 'حساسات إدارة المحرك الإلكترونية',
    targetComponent: 'Crankshaft Position Sensor (CKP)',
    testDescription:
      'Observe the instrument cluster tachometer while cranking, or read the live Engine Speed PID on an OBD-II scanner. The ECU requires this signal to detect crankshaft rotation.',
    testDescriptionAr:
      'راقب مؤشر عداد RPM في الطبلون أثناء التدوير، أو انظر لقراءة سرعة المحرك في جهاز الفحص. يحتاج الكمبيوتر لهذه الإشارة لمعرفة دوران عمود الكرنك.',
    expectedResult:
      'Tachometer should lift off 0 and fluctuate at 200 - 250 RPM, showing active engine synchronization.',
    expectedResultAr:
      'يجب أن يرتفع مؤشر الـ RPM قليلاً عن الصفر ويتحرك حول 200 إلى 250 دورة/دقيقة.',
    options: [
      {
        label: 'NO - Needle stays glued at zero (0 RPM displayed on scanner)',
        labelAr: 'لا - المؤشر ثابت تماماً على الصفر وجهاز الفحص يقرأ 0 RPM',
        value: 'no',
        resultType: 'failed',
        isConclusion: true,
        conclusionId: 'concl-crankshaft-sensor',
      },
      {
        label: 'YES - Live RPM registers smoothly (200+ RPM detected)',
        labelAr: 'نعم - عداد RPM يتحرك ويسجل أكثر من 200 دورة/دقيقة',
        value: 'yes',
        resultType: 'passed',
        nextNodeId: 'node-immobilizer-check',
      },
    ],
  },

  // BRANCH: RPM DETECTED -> TEST IMMOBILIZER / SECURITY
  'node-immobilizer-check': {
    id: 'node-immobilizer-check',
    question: 'Is the anti-theft security / key padlock icon flashing or illuminated on the instrument cluster?',
    questionAr: 'هل تومض لمبة الحماية ضد السرقة (علامة المفتاح أو القفل) في شاشة العدادات؟',
    system: 'Anti-Theft Security System',
    systemAr: 'نظام الحماية والأمان (الإيموبلايزر)',
    targetComponent: 'Immobilizer Key Transponder & BCM',
    testDescription:
      'Observe the dashboard warning telltales. If the transponder handshake failed, the security warning will flash rapidly or remain illuminated, disabling ignition/injection.',
    testDescriptionAr:
      'راقب لمبات التحذير في الطبلون. إذا فشل التعرف على شفرة المفتاح، ستومض لمبة الأمان بسرعة أو تظل مضاءة وتقطع تشغيل المحرك.',
    expectedResult:
      'The security icon should illuminate briefly for 2 seconds upon key-on and then extinguish completely.',
    expectedResultAr:
      'يجب أن تضيء لمبة الأمان لمدة ثانيتين فقط عند فتح السويتش ثم تنطفئ تماماً.',
    options: [
      {
        label: 'YES - Security light is blinking rapidly or stays ON solid',
        labelAr: 'نعم - لمبة الأمان تومض بسرعة أو تظل مضاءة باستمرار',
        value: 'yes',
        resultType: 'failed',
        isConclusion: true,
        conclusionId: 'concl-immobilizer-lockout',
      },
      {
        label: 'NO - Security light turned OFF normally',
        labelAr: 'لا - انطفأت لمبة الأمان بشكل طبيعي تماماً',
        value: 'no',
        resultType: 'passed',
        nextNodeId: 'node-crank-sound',
      },
    ],
  },

  // BRANCH: IMMOBILIZER OFF -> TEST CRANK SOUND / COMPRESSION
  'node-crank-sound': {
    id: 'node-crank-sound',
    question: 'How does the engine sound during cranking? Is the cadence normal or unusually fast and hollow?',
    questionAr: 'كيف يبدو صوت دوران المحرك؟ هل هو صوت إيقاعي طبيعي أم سريع جداً وخفيف؟',
    system: 'Engine Mechanical & Compression',
    systemAr: 'الميكانيكا وضغط الانضغاط الداخلي',
    targetComponent: 'Cylinder Compression & Timing Chain',
    testDescription:
      'Listen to the starter rhythm. A healthy engine has a distinct, rhythmic "chug-chug-chug" as pistons fight compression on each stroke. An engine with lost compression spins unnaturally fast like an electric drill.',
    testDescriptionAr:
      'استمع لإيقاع صوت التدوير. المحرك السليم له نبرة إيقاعية مميزة نتيجة مقاومة المكابس لضغط الهواء. إذا كان الضغط مفقوداً، يدور المحرك بسرعة فائقة وخفة مثل الدريل.',
    expectedResult:
      'Steady, rhythmic cranking rhythm with noticeable compression resistance every 180 degrees of rotation.',
    expectedResultAr:
      'صوت دوران إيقاعي متزن يوضح مقاومة غرف الاحتراق لضغط الهواء في كل شوط.',
    options: [
      {
        label: 'Unusually fast, smooth, or hollow spinning (no rhythmic resistance)',
        labelAr: 'دوران سريع جداً وخفيف وغير إيقاعي (انعدام مقاومة الانضغاط)',
        value: 'fast-hollow',
        resultType: 'failed',
        isConclusion: true,
        conclusionId: 'concl-low-compression',
      },
      {
        label: 'Normal rhythmic compression cadence',
        labelAr: 'صوت دوران طبيعي منتظم بمقاومة انضغاط واضحة',
        value: 'normal',
        resultType: 'passed',
        isConclusion: true,
        conclusionId: 'concl-fuel-pump', // defaults to fuel delivery starvation
      },
    ],
  },
};

// ==========================================
// PRESET SYMPTOMS CATALOG
// ==========================================

export const SYMPTOM_CATALOG: SymptomDefinition[] = [
  {
    id: 'sym-crank-no-start',
    title: 'Engine cranks but doesn\'t start',
    titleAr: 'المحرك يدور بالمارش لكن لا يشتغل',
    description: 'The starter motor turns the engine over, but combustion fails to catch.',
    descriptionAr: 'محرك بادئ الحركة يدير المحرك بشكل طبيعي ولكن لا يحدث احتراق أو دوران ذاتي.',
    icon: 'power_settings_new',
    possibleSystems: ['Fuel Delivery', 'Ignition System', 'Engine Management Sensors', 'Security / Anti-Theft', 'Engine Mechanical'],
    possibleComponents: ['12V Battery', 'Starter Motor', 'In-Tank Fuel Pump', 'Crankshaft Position Sensor', 'Ignition Coils', 'Immobilizer Key'],
    rootNodeId: 'node-starter-crank',
  },
  {
    id: 'sym-no-crank-no-start',
    title: 'Engine won\'t start (No Crank / Silence)',
    titleAr: 'المحرك لا يشتغل إطلاقاً (لا يوجد تدوير / صمت)',
    description: 'Turning key produces silence, a single click, or rapid chattering clicks.',
    descriptionAr: 'عند محاولة التشغيل لا يصدر صوت، أو تسمع تكة واحدة أو طقطقة سريعة متتالية.',
    icon: 'battery_alert',
    possibleSystems: ['Starting System', '12V Power Distribution', 'Ignition Switch', 'Starter Motor Solenoid'],
    possibleComponents: ['12V AGM Battery', 'Starter Relay', 'Starter Solenoid', 'Battery Cable Terminals', 'Neutral Safety Switch'],
    rootNodeId: 'node-battery-voltage',
  },
  {
    id: 'sym-brakes-spongy',
    title: 'Brake pedal feels soft or sinks to floor',
    titleAr: 'دواسة الفرامل إسفنجية أو تهبط لأسفل',
    description: 'Braking response is delayed and pedal requires excessive travel to generate stopping force.',
    descriptionAr: 'استجابة الفرامل ضعيفة والدواسة تغوص في الأرضية وتتطلب مسافة طويلة للتوقف.',
    icon: 'do_not_disturb_on',
    possibleSystems: ['Hydraulic Braking', 'ABS / ESC Hydraulic Unit', 'Vacuum Booster'],
    possibleComponents: ['Brake Master Cylinder', 'Brake Fluid Lines', 'ABS Modulator Valves', 'Brake Caliper Piston Seals'],
    rootNodeId: 'node-starter-crank', // Fallback or dedicated
  },
  {
    id: 'sym-engine-overheating',
    title: 'Engine overheating in traffic',
    titleAr: 'ارتفاع حرارة المحرك عند التوقف والازدحام',
    description: 'Coolant temperature needle climbs into red zone during idling or stop-and-go traffic.',
    descriptionAr: 'مؤشر حرارة ماء الرديتر يرتفع للمنطقة الحمراء أثناء الوقوف أو في الزحام.',
    icon: 'device_thermostat',
    possibleSystems: ['Thermal Management', 'Radiator Cooling Fans', 'Coolant Circulation'],
    possibleComponents: ['Electric Cooling Fan Assembly', 'Thermostat Housing', 'Water Pump Impeller', 'Coolant Expansion Cap'],
    rootNodeId: 'node-starter-crank',
  },
  {
    id: 'sym-ac-warm-air',
    title: 'A/C blows warm air',
    titleAr: 'مكيف الهواء يخرج هواء حار وغير بارد',
    description: 'Vent air fails to cool down despite A/C button engaged and blower operating at max.',
    descriptionAr: 'فتحات المكيف تخرج هواء دافئ على الرغم من تشغيل زر AC والمروحة على أقصى سرعة.',
    icon: 'mode_fan',
    possibleSystems: ['HVAC Refrigeration', 'A/C Compressor Clutch', 'Blend Door Actuators'],
    possibleComponents: ['A/C Compressor', 'Refrigerant R134a/R1234yf', 'Pressure Switch Sensor', 'Condenser Fan'],
    rootNodeId: 'node-starter-crank',
  },
  {
    id: 'sym-battery-draining',
    title: 'Battery keeps draining overnight (Parasitic Draw)',
    titleAr: 'البطارية تفضى وتفرغ شحنتها طوال الليل',
    description: 'Vehicle fails to start in the morning after sitting parked for 8+ hours.',
    descriptionAr: 'السيارة لا تشتغل في الصباح بعد توقفها لأكثر من 8 ساعات بسبب تفريغ كهربائي.',
    icon: 'battery_unknown',
    possibleSystems: ['Electrical Network', 'CAN Gateway Sleep Mode', 'Body Control Modules'],
    possibleComponents: ['Infotainment Head Unit', 'Alternator Diode Trio', 'Door Latch Microswitch', 'BCM Module'],
    rootNodeId: 'node-starter-crank',
  },
];

// Helper: Find or synthesize a symptom
export function findOrCreateSymptomTree(query: string, lang: Language): SymptomDefinition {
  const normalized = query.toLowerCase().trim();

  // Try exact or partial matches
  const found = SYMPTOM_CATALOG.find(
    (s) =>
      normalized.includes(s.title.toLowerCase()) ||
      s.title.toLowerCase().includes(normalized) ||
      (normalized.includes('start') && s.id === 'sym-crank-no-start') ||
      (normalized.includes('crank') && s.id === 'sym-crank-no-start') ||
      (normalized.includes('تشغيل') && s.id === 'sym-crank-no-start') ||
      (normalized.includes('مارش') && s.id === 'sym-crank-no-start') ||
      (normalized.includes('بطار') && s.id === 'sym-no-crank-no-start') ||
      (normalized.includes('حرار') && s.id === 'sym-engine-overheating') ||
      (normalized.includes('فرامل') && s.id === 'sym-brakes-spongy') ||
      (normalized.includes('مكيف') && s.id === 'sym-ac-warm-air')
  );

  if (found) return found;

  // Synthesize dynamic symptom definition for custom entry
  return {
    id: `sym-custom-${Date.now()}`,
    title: query,
    titleAr: query,
    description: `User reported issue: "${query}". Interactive decision tree mapped to primary automotive fault trees.`,
    descriptionAr: `العطل المدخل: "${query}". تم إنشاء شجرة قرارات ديناميكية لفحص المنظومة الميكانيكية والكهربائية.`,
    icon: 'search_check',
    possibleSystems: ['Powertrain & Engine', 'Electrical & Sensors', 'Fuel Delivery', 'Electronic Control Modules'],
    possibleComponents: ['12V Power Supply', 'Primary Sensors', 'Fuel Delivery Module', 'CAN Bus Network'],
    rootNodeId: 'node-starter-crank',
  };
}

// Map conclusion to 3D component ID in componentDatabase
export function get3DComponentIdForConclusion(conclusionId: string): string {
  switch (conclusionId) {
    case 'concl-dead-battery':
      return 'comp-battery';
    case 'concl-starter-solenoid':
    case 'concl-starter-relay-fuse':
      return 'comp-starter';
    case 'concl-fuel-pump':
      return 'comp-fuel-rail';
    case 'concl-crankshaft-sensor':
    case 'concl-low-compression':
      return 'comp-engine-block';
    case 'concl-immobilizer-lockout':
      return 'comp-ecu-harness';
    default:
      return 'comp-engine-block';
  }
}

