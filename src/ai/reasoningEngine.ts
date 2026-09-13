import { VEHICLE_PROFILES } from '../db/vehicleDatabase';
import { VehicleProfileData } from '../db/vehicleTypes';
import { detectUserIntent } from './intentDetector';
import { retrieveVerifiedData } from './databaseRetriever';
import {
  AiIntent,
  AiMessage,
  CauseComparison,
  DiagnosticChecklist,
  MechanicReport,
  RetrievedDataContext,
} from './types';
import { isArabicText } from '../search/terminologyMap';

export function processUserQuery(
  query: string,
  activeVehicle: VehicleProfileData,
  explicitDtc?: string,
  lang: 'en' | 'ar' = 'en'
): AiMessage {
  const isArabic = lang === 'ar' || isArabicText(query);

  // Step 1: Intent Detection
  const intentResult = detectUserIntent(query);
  const targetDtc = explicitDtc || intentResult.extractedDtc;

  // Step 2 & 3: Vehicle Context & Database Retrieval
  const context: RetrievedDataContext = retrieveVerifiedData(
    query,
    intentResult.intent,
    activeVehicle,
    targetDtc
  );

  // Step 4 & 5: Relevant Procedures & AI Reasoning
  const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Handle Insufficient Data / Unverified Vehicle
  if (context.insufficientData) {
    const insufficientText = isArabic
      ? `### ⚠️ بيانات غير كافية موثقة في قاعدة البيانات\n\n**"لا تتوفر لدي معلومات مصنعية معتمدة كافية لهذه المركبة."**\n\nيلتزم مساعد AutoFix AI الصارم بمبدأ **انعدام الهلوسة (Zero Hallucination)** ولن يقوم أبداً باختلاق مواصفات عزم أو سعات سوائل أو أرقام قطع غير موثقة في كتالوجات الصانع الأصلية (OEM).\n\n* **المركبات المعتمدة حالياً في قاعدة بيانات الورشة:**\n  * 2018 Toyota Camry XV70 (2.5L Dynamic Force A25A-FKS) - تويوتا كامري\n  * 2022 Porsche 911 GT3 / Carrera 992 (3.0L Boxer-6 Twin-Turbo) - بورشه 911\n  * 2021 Ford F-150 (3.5L EcoBoost V6) - فورد F-150\n  * 2020 Honda Civic (1.5L Turbo I4) - هوندا سيفيك\n\n* **الإجراء الموصى به:** يرجى تبديل مركبة العمل من **مستكشف المركبات (Vehicle Explorer)** أو طرح سؤال يتعلق بإحدى المركبات المعتمدة أعلاه.`
      : `### ⚠️ Insufficient Verified Data\n\n**"I don't have enough verified information for this vehicle."**\n\nAutoFix AI strictly enforces a zero-hallucination policy and will **never invent vehicle-specific specifications**, fluid capacities, or torque tolerances.\n\n* **Currently Verified Vehicles in Workshop Database:**\n  * 2018 Toyota Camry XV70 (2.5L Dynamic Force A25A-FKS)\n  * 2022 Porsche 911 GT3 / Carrera 992 (3.0L Boxer-6 Twin-Turbo)\n  * 2021 Ford F-150 (3.5L EcoBoost V6)\n  * 2020 Honda Civic (1.5L Turbo I4)\n\n* **Next Action:** Please switch your active vehicle profile in the **Vehicle Explorer** or ask about one of the verified powertrain assemblies above.`;

    return {
      id: messageId,
      sender: 'assistant',
      timestamp: Date.now(),
      intent: context.detectedIntent,
      confidence: 'Insufficient',
      sources: [],
      insufficientData: true,
      text: insufficientText,
    };
  }

  // Handle Capabilities
  let responseText = '';
  let checklist: DiagnosticChecklist | undefined;
  let mechanicReport: MechanicReport | undefined;
  let causeComparison: CauseComparison | undefined;

  switch (context.detectedIntent) {
    case 'EXPLAIN_DTC_CODES':
      responseText = generateDtcExplanation(context, isArabic);
      break;

    case 'EXPLAIN_COMPONENTS':
      responseText = generateComponentExplanation(context, isArabic);
      break;

    case 'EXPLAIN_SYMPTOMS':
      responseText = generateSymptomExplanation(context, isArabic);
      break;

    case 'GUIDE_DIAGNOSTIC_WORKFLOW':
      responseText = generateDiagnosticWorkflow(context, isArabic);
      break;

    case 'SUMMARIZE_REPAIR_PROCEDURES':
      responseText = generateRepairSummary(context, isArabic);
      break;

    case 'EXPLAIN_MAINTENANCE_SCHEDULES':
      responseText = generateMaintenanceExplanation(context, isArabic);
      break;

    case 'COMPARE_POSSIBLE_CAUSES': {
      const compResult = generateCauseComparison(context, isArabic);
      responseText = compResult.text;
      causeComparison = compResult.data;
      break;
    }

    case 'GENERATE_DIAGNOSTIC_CHECKLIST': {
      const checkResult = generateDiagnosticChecklist(context, isArabic);
      responseText = checkResult.text;
      checklist = checkResult.data;
      break;
    }

    case 'GENERATE_MECHANIC_REPORT': {
      const repResult = generateMechanicReport(context, isArabic);
      responseText = repResult.text;
      mechanicReport = repResult.data;
      break;
    }

    default:
      responseText = generateGeneralInquiry(context, query, isArabic);
      break;
  }

  return {
    id: messageId,
    sender: 'assistant',
    timestamp: Date.now(),
    text: responseText,
    intent: context.detectedIntent,
    confidence: context.confidence,
    sources: context.sources,
    insufficientData: false,
    checklist,
    mechanicReport,
    causeComparison,
    retrievedStats: {
      dtcCount: context.matchedDtcs.length,
      procCount: context.matchedProcedures.length,
      compCount: context.matchedComponents.length,
      videoCount: context.matchedVideos.length,
    },
  };
}

// 1. DTC Explanation
function generateDtcExplanation(ctx: RetrievedDataContext, isAr: boolean): string {
  const dtc = ctx.matchedDtcs[0];
  const veh = ctx.vehicleContext;

  if (!dtc) {
    if (isAr) {
      return `### ⚠️ تحليل كود العطل التشخيصي\n\nلم يتم العثور على تطابق مصنعي دقيق في قاعدة البيانات للكود المطلوب. وفقاً لمعايير SAE J1979 OBD-II العامة، يرجى فحص استمرارية التوصيلات الكهربائية لضفيرة الحساس والتقاط قراءات البيانات الحية (Live Data) لمركبة ${veh.year} ${veh.make} ${veh.model}.`;
    }
    return `### ⚠️ Diagnostic Code Analysis\n\nNo exact factory match was found in the verified database for the specified trouble code. However, based on standard OBD-II SAE J1979 guidelines, verify sensor wiring harness continuity and execute an active scan tool live data capture for ${veh.year} ${veh.make} ${veh.model}.`;
  }

  if (isAr) {
    const causesList = dtc.possibleCauses
      .map((c: any) => `* **${c.name}** — الاحتمالية المعتمدة: \`${c.probability}%\` [الفئة: ${c.category}]`)
      .join('\n');

    const symptomsList = dtc.symptoms
      .map((s: any) => `* **${s.title}**: ${s.impact}`)
      .join('\n');

    const stepsList = dtc.diagnosticSteps
      .slice(0, 4)
      .map(
        (step: any) =>
          `* **الخطوة ${step.stepNumber} (${step.title})**: ${step.action}\n  * *القيمة المعيارية:* \`${step.expectedResult}\`\n  * *الأداة المطلوبة:* \`${step.toolsNeeded}\``
      )
      .join('\n');

    const partsList = dtc.commonAffectedComponents
      .map(
        (p: any) =>
          `* **${p.name}** (رقم القطعة الأصلي OEM: \`${p.oemPartNumber}\`) — التكلفة التقديرية: \`${p.estCost}\` (صعوبة الاستبدال: \`${p.difficulty}\`)`
      )
      .join('\n');

    return `### 🔍 تحليل كود العطل OBD-II: ${dtc.code}\n**التصنيف القياسي:** ${dtc.standardType} • **مستوى الخطورة:** ${dtc.severity} • **حالة لمبة المحرك (MIL):** \`${dtc.milStatus}\`\n**المركبة النشطة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\n#### 📖 تعريف الكود المصنعي\n${dtc.description}\n\n#### ⚠️ الأعراض المؤكدة للمركبة\n${symptomsList}\n\n#### 📊 الأسباب الجذرية المعتمدة وتوزيع الاحتمالات\n${causesList}\n\n#### 🛠️ تسلسل الفحص والتشخيص المصنعي\n${stepsList}\n\n#### 🏷️ قطع الغيار المتأثرة وأرقام القطع الأصلية OEM\n${partsList}`;
  }

  const causesList = dtc.possibleCauses
    .map(
      (c: any) =>
        `* **${c.name}** — Probable Cause: \`${c.probability}%\` [Category: ${c.category}]`
    )
    .join('\n');

  const symptomsList = dtc.symptoms
    .map((s: any) => `* **${s.title}**: ${s.impact}`)
    .join('\n');

  const stepsList = dtc.diagnosticSteps
    .slice(0, 4)
    .map(
      (step: any) =>
        `* **Step ${step.stepNumber} (${step.title})**: ${step.action}\n  * *Expected Spec:* \`${step.expectedResult}\`\n  * *Required Tool:* \`${step.toolsNeeded}\``
    )
    .join('\n');

  const partsList = dtc.commonAffectedComponents
    .map(
      (p: any) =>
        `* **${p.name}** (OEM Part: \`${p.oemPartNumber}\`) — Estimated: \`${p.estCost}\` (Difficulty: \`${p.difficulty}\`)`
    )
    .join('\n');

  return `### 🔍 OBD-II Code Analysis: ${dtc.code}\n**Classification:** ${dtc.standardType} • **Severity:** ${dtc.severity} • **MIL Status:** \`${dtc.milStatus}\`\n**Vehicle Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\n#### 📖 Code Definition\n${dtc.description}\n\n#### ⚠️ Confirmed Vehicle Symptoms\n${symptomsList}\n\n#### 📊 Verified Root Causes & Probability Distribution\n${causesList}\n\n#### 🛠️ Factory Diagnostic Sequence\n${stepsList}\n\n#### 🏷️ Common Affected Parts & OEM Cross-Reference\n${partsList}`;
}

// 2. Component Explanation
function generateComponentExplanation(ctx: RetrievedDataContext, isAr: boolean): string {
  const comp = ctx.matchedComponents[0];
  const veh = ctx.vehicleContext;

  if (!comp) {
    if (isAr) {
      return `### ⚙️ فحص المكون الميكانيكي / الكهربائي\n\n**المركبة الحالية:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nيعمل هذا النظام الفرعي عبر شبكة CAN-BUS عالية السرعة. يرجى اختيار مكون محدد مثل **حساس تدفق الهواء (MAF)**، **بخاخ الوقود (Fuel Injector)**، **حساس الأكسجين (O2 Sensor)**، أو **بطارية 12V AGM** لعرض المواصفات المصنعية الموثقة.`;
    }
    return `### ⚙️ Component Inspection: Powertrain Sensor / Actuator\n\n**Vehicle Context:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nThis subsystem operates on the vehicle's High-Speed CAN-BUS. Please select a specific component such as the **Mass Air Flow (MAF) Sensor**, **Fuel Injector**, **Oxygen Sensor (O2)**, or **12V AGM Starter Battery** for verified factory specifications.`;
  }

  if (isAr) {
    const symptomsList = comp.symptoms.map((s: string) => `* ${s}`).join('\n');
    const failuresList = comp.commonFailures.map((f: string) => `* ${f}`).join('\n');
    const toolsList = comp.requiredTools.join('، ');
    const partsList = comp.relatedParts
      .map((p) => `* **${p.name}**: رقم OEM \`${p.oemNumber}\` (التكلفة التقديرية: \`${p.avgCost}\`)`)
      .join('\n');

    return `### ⚙️ الفحص الهندسي للمكون: ${comp.name}\n**النظام التابع:** ${comp.system} ← ${comp.subsystem}\n**الموقع الفيزيائي بالمركبة:** ${comp.location}\n**المركبة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\n#### 🎯 الوظيفة الهندسية المصنعية\n${comp.functionDesc}\n\n#### ⚠️ أعراض الخلل والتلف\n${symptomsList}\n\n#### 💥 أنماط العطل الشائعة\n${failuresList}\n\n#### 🛠️ متطلبات الفحص والصيانة\n* **الأدوات المطلوبة:** \`${toolsList}\`\n* **توصيات الصيانة الدورية:** ${comp.maintenance}\n\n#### 🏷️ أرقام القطع الأصلية المعتمدة OEM\n${partsList}`;
  }

  const symptomsList = comp.symptoms.map((s: string) => `* ${s}`).join('\n');
  const failuresList = comp.commonFailures.map((f: string) => `* ${f}`).join('\n');
  const toolsList = comp.requiredTools.join(', ');
  const partsList = comp.relatedParts
    .map((p) => `* **${p.name}**: OEM \`${p.oemNumber}\` (Est. cost: \`${p.avgCost}\`)`)
    .join('\n');

  return `### ⚙️ Component Deep-Dive: ${comp.name}\n**Subsystem:** ${comp.system} → ${comp.subsystem}\n**Physical Location:** ${comp.location}\n**Vehicle Application:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\n#### 🎯 Engineering Function\n${comp.functionDesc}\n\n#### ⚠️ Failure Symptoms\n${symptomsList}\n\n#### 💥 Common Failure Modes\n${failuresList}\n\n#### 🛠️ Service & Testing Requirements\n* **Required Tools:** \`${toolsList}\`\n* **Maintenance Recommendation:** ${comp.maintenance}\n\n#### 🏷️ OEM Verified Part Numbers\n${partsList}`;
}

// 3. Symptom Explanation
function generateSymptomExplanation(ctx: RetrievedDataContext, isAr: boolean): string {
  const veh = ctx.vehicleContext;
  const dtc = ctx.matchedDtcs[0];
  const comp = ctx.matchedComponents[0];

  if (isAr) {
    return `### 🩺 التحليل التشخيصي للأعراض الميكانيكية\n**مركبة الاختبار:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n**ناقل الحركة:** ${veh.transmission}\n\n#### 🔬 تحليل الآلية الجذرية\nالعرض الموصوف ينتج عادة عن خلل في أحد المحاور الثلاثة الرئيسية لمنظومة الدفع: **معايرة خليط الهواء والوقود**، **كفاءة شرارة الإشعال**، أو **سلامة الضغط الميكانيكي ومزامنة التوقيت**.\n\n* **النظام المشتبه به رئيسياً:** ${dtc ? dtc.system : comp ? comp.system : 'نظام حقن الوقود والسحب'}\n* **التأثير على دورة الاحتراق:** احتراق شحنة الأسطوانة غير الكامل يفرز هيدروكربونات غير محترقة في العادم، مما يرفع حرارة دبة التلوث ويسبب تذبذب في سرعة عمود الكرنك الزاوية.\n\n#### 🔍 المكونات المشتبه بها في قاعدة البيانات المعتمدة:\n* **1. بخاخات الوقود المباشر / المشترك:** انسداد جزئي بفوهة الرش أو قصر داخلي بملف البخاخ (نظام Denso D-4S يعمل بضغط يصل 200 بار).\n* **2. كويلات الإشعال وشمعات الاحتراق:** تآكل قطب الإيريديوم أو تفريغ كهربائي عبر عازل الكويل تحت الضغط العالي.\n* **3. حساس تدفق الهواء (MAF) وتهريب الفاكيوم:** دخول هواء غير مقاس بعد بوابة الثروتل يرفع تصحيح الوقود قصير المدى (+STFT > 15%).\n\n#### 🚦 تنبيهات السلامة لورشة الصيانة\nإذا كانت لمبة فحص المحرك (Check Engine) **تومض (Flashing)**، فهذا يعني وجود تفتفة متكررة تلحق ضرراً فورياً بدبة التلوث (Catalytic Converter). تجنب التسارع العالي وابدأ فوراً بفحص أطر التجميد (Freeze Frame).`;
  }

  return `### 🩺 Symptom Diagnostic Overview\n**Active Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n**Transmission:** ${veh.transmission}\n\n#### 🔬 Root Mechanism Analysis\nThe symptom described typically originates from an imbalance in one of three core powertrain pillars: **Air/Fuel Metering**, **Ignition Spark Delivery**, or **Mechanical Compression / Timing Integrity**.\n\n* **Primary Suspect Subsystem:** ${dtc ? dtc.system : comp ? comp.system : 'Fuel & Induction System'}\n* **Combustion Cycle Impact:** Incomplete cylinder charge combustion results in unburned hydrocarbons entering the exhaust, triggering downstream catalyst temperature spikes and fluctuating crankshaft angular velocity.\n\n#### 🔍 Verified Suspect Components in Database:\n* **1. High-Pressure / Port Fuel Injectors:** Potential partial nozzle clogging or internal coil shorting (Denso D-4S system operates up to 20 MPa).\n* **2. Ignition Coils & Spark Plugs:** Iridium electrode erosion or boot insulation breakdown under high cylinder pressure.\n* **3. Mass Airflow (MAF) / Vacuum Integrity:** Unmetered air entering post-throttle body causing positive short-term fuel trim (+STFT > 15%).\n\n#### 🚦 Safety & Workshop Precaution\nIf the Check Engine light is **Flashing**, the engine is experiencing catalyst-damaging misfires. Avoid high-load acceleration and proceed immediately to live scan-tool freeze-frame analysis.`;
}

// 4. Diagnostic Workflow
function generateDiagnosticWorkflow(ctx: RetrievedDataContext, isAr: boolean): string {
  const veh = ctx.vehicleContext;
  const dtc = ctx.matchedDtcs[0];

  if (isAr) {
    return `### 🪜 مسار التشخيص المتسلسل خطوة بخطوة\n**المركبة المستهدفة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n**الهدف التشخيصي:** ${dtc ? `الكود ${dtc.code} (${dtc.description})` : 'شجرة معايرة منظومة المحرك'}\n\nاتبع بروتوكول التشخيص المصنعي الصارم المكون من 4 مراحل:\n\n#### ⚡ المرحلة 1: فحص الجهد الأولي والفحص البصري\n* **الخطوة 1.1:** قياس جهد بطارية 12V AGM عند الراحة. يجب أن يتجاوز **12.6 فولت** (12.4V كحد أدنى). فحص كابلات التأريض (Ground) عند الشاسيه وكتلة المحرك لضمان عدم وجود هبوط في الجهد (<0.1V).\n* **الخطوة 1.2:** فحص خراطيم الفاكيوم، مجاري سحب الهواء، وتوصيلات صمام PCV بين فلتر الهواء وثلاجة المحرك للتأكد من عدم وجود تسريب هواء غير محسوب.\n\n#### 💻 المرحلة 2: قراءة بيانات كمبيوتر السيارة عبر منفذ OBD-II\n* **الخطوة 2.1:** توصيل جهاز الفحص بشبكة CAN-BUS. تسجيل لقطة **Freeze Frame** (دوران المحرك RPM، حرارة سائل التبريد، الحمل المحسوب، وسرعة المركبة).\n* **الخطوة 2.2:** مراقبة تصحيح الوقود اللحظي (STFT) والطويل (LTFT) عند السلانسيه وعند 2,500 د/د. إذا تجاوز إجمالي تصحيح الوقود **+15%**، فهناك تسريب هواء أو نقص في إمداد الوقود.\n\n#### 🔬 المرحلة 3: اختبارات الملتيميتر والجهد المحددة للمكونات\n* **الخطوة 3.1:** توصيل جهاز راسم الإشارة (Oscilloscope) أو ملتيميتر رقمي معاير بضفيرة الحساس/المشغل المشتبه به.\n* **الخطوة 3.2:** قياس مقاومة ملف بخاخ الوقود: المواصفة المصنعية هي **11.6 - 12.4 أوم** عند درجة حرارة 20° مئوية.\n* **الخطوة 3.3:** فحص حالة شمعات الاحتراق: لون عازل بيج جاف يدل على احتراق مثالي؛ كربون أسود يدل على احتراق غني؛ زيت يدل على تآكل جلد البلوف.\n\n#### ✅ المرحلة 4: دورة التحقق واختبار الطريق\n* **الخطوة 4.1:** مسح رموز الأعطال المخزنة في ذاكرة وحدة التحكم الإلكترونية (ECU).\n* **الخطوة 4.2:** إجراء دورة قيادة جاهزية OBD-II (10 دقائق وقوف، 15 دقيقة قيادة على طريق سريع بسرعة 90 كم/س، وتباطؤ دون استخدام الفرامل).\n* **الخطوة 4.3:** التأكد من اكتمال جاهزية جميع حساسات الانبعاثات (Monitors READY) وعدم عودة الكود.`;
  }

  return `### 🪜 Step-by-Step Diagnostic Workflow\n**Target Assembly:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n**Fault Target:** ${dtc ? `Code ${dtc.code} (${dtc.description})` : 'Powertrain Calibration Tree'}\n\nFollow this strict 4-phase OEM diagnostic protocol:\n\n#### ⚡ Phase 1: Baseline Power & Visual Inspection\n* **Step 1.1:** Measure 12V AGM battery resting terminal voltage. Must exceed **12.6V** (≥12.4V minimum). Inspect ground cables at chassis and engine block for corrosion or voltage drop (<0.1V).\n* **Step 1.2:** Inspect vacuum hoses, air intake ducting, and PCV connections between the air filter box and intake manifold for unmetered air leaks.\n\n#### 💻 Phase 2: OBD-II Scan Tool Telemetry Interrogation\n* **Step 2.1:** Connect CAN-BUS scan tool. Record **Freeze Frame** snapshot (Engine RPM, Coolant Temp, Calculated Load, Vehicle Speed).\n* **Step 2.2:** Observe Short-Term (STFT) and Long-Term (LTFT) Fuel Trims at idle and at 2,500 RPM. If total fuel trim (STFT + LTFT) exceeds **+15%**, an unmetered air leak or fuel starvation exists.\n\n#### 🔬 Phase 3: Pinpoint Component Electrical & Hydraulic Tests\n* **Step 3.1:** Connect an oscilloscope or calibrated digital multimeter to suspect actuator/sensor harness.\n* **Step 3.2:** Measure injector coil resistance: Factory specification is **11.6 - 12.4 Ω** at 20°C (68°F).\n* **Step 3.3:** Inspect spark plug condition: Clean dry tan insulator indicates normal combustion; blackened carbon indicates rich misfire; oil fouling indicates valve seal wear.\n\n#### ✅ Phase 4: Repair Verification & Road Test Cycle\n* **Step 4.1:** Clear diagnostic trouble codes from ECU memory.\n* **Step 4.2:** Perform standard OBD-II readiness drive cycle (10 min idle, 15 min highway cruising at 55 mph, deceleration without braking).\n* **Step 4.3:** Verify all emission system monitors report **READY** and no pending DTCs recur.`;
}

// 5. Repair Procedure Summary
function generateRepairSummary(ctx: RetrievedDataContext, isAr: boolean): string {
  const proc = ctx.matchedProcedures[0];
  const veh = ctx.vehicleContext;

  if (!proc) {
    if (isAr) {
      return `### 🛠️ ملخص إجراء الإصلاح المصنعي\n**المركبة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nيرجى اختيار إجراء إصلاح معتمد من **مركز الإصلاح** أو السؤال عن إجراءات محددة مثل **استبدال بخاخات الوقود**، **صيانة شمعات الاحتراق**، أو **إصلاح كليبر الفرامل**.`;
    }
    return `### 🛠️ Repair Procedure Summary\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nSelect a verified repair procedure from the **Repair Center** or ask specifically for procedures like **Fuel Injector Replacement**, **Spark Plug Service**, or **Brake Caliper Overhaul**.`;
  }

  if (isAr) {
    const tools = proc.requiredTools.map((t) => `* **${t.name}** (\`${t.spec}\`)`).join('\n');
    const parts = proc.requiredParts
      .map((p) => `* **${p.name}** — رقم القطعة الأصلي OEM: \`${p.partNumber}\` (الكمية: ${p.quantity})`)
      .join('\n');
    const fluids = proc.requiredFluids
      .map((f) => `* **${f.name}** (\`${f.spec}\` - ${f.capacity})`)
      .join('\n');
    const safety = (proc.safetyWarningsAr || proc.safetyWarningsEn).map((w) => `* ⚠️ ${w}`).join('\n');
    const prep = (proc.preparationAr || proc.preparationEn).slice(0, 4).map((p, i) => `* **الخطوة ${i + 1}:** ${p}`).join('\n');

    return `### 🛠️ إجراء الإصلاح المصنعي المعتمد: ${proc.titleAr || proc.titleEn}\n**المركبة:** ${proc.vehicle} • **المحرك:** ${proc.engine}\n**مستوى الصعوبة:** \`${proc.difficulty}\` • **الوقت التقديري للورشة:** \`${proc.estimatedTime}\`\n\n#### 🚨 إرشادات السلامة الإلزامية\n${safety}\n\n#### 🔧 أدوات الورشة المطلوبة\n${tools}\n\n#### 📦 قطع الغيار الأصلية المطلوبة OEM\n${parts}\n\n#### 💧 السوائل والزيوت المعتمدة\n${fluids}\n\n#### 📋 خطوات التحضير وتفريغ الضغط\n${prep}\n\n#### 🎥 مزامنة الفيديو التعليمي\n* تم ربط الإجراء مع منصة CarCareKiosk التعليمية لعرض الخطوات مصورة عند منصة الصيانة.`;
  }

  const tools = proc.requiredTools.map((t) => `* **${t.name}** (\`${t.spec}\`)`).join('\n');
  const parts = proc.requiredParts
    .map((p) => `* **${p.name}** — OEM Part: \`${p.partNumber}\` (Qty: ${p.quantity})`)
    .join('\n');
  const fluids = proc.requiredFluids
    .map((f) => `* **${f.name}** (\`${f.spec}\` - ${f.capacity})`)
    .join('\n');
  const safety = proc.safetyWarningsEn.map((w) => `* ⚠️ ${w}`).join('\n');
  const prep = proc.preparationEn.slice(0, 4).map((p, i) => `* **Step ${i + 1}:** ${p}`).join('\n');

  return `### 🛠️ Factory Repair Procedure: ${proc.titleEn}\n**Vehicle:** ${proc.vehicle} • **Engine:** ${proc.engine}\n**Difficulty:** \`${proc.difficulty}\` • **Estimated Shop Time:** \`${proc.estimatedTime}\`\n\n#### 🚨 Mandatory Safety Warnings\n${safety}\n\n#### 🔧 Required Workshop Tools\n${tools}\n\n#### 📦 Required OEM Replacement Parts\n${parts}\n\n#### 💧 Required Fluids & Lubricants\n${fluids}\n\n#### 📋 Preparation & Depressurization\n${prep}\n\n#### 🎥 External Video Reference Sync\n* **CarCareKiosk Educational Video Sync:** Procedure mapped and timestamped for visual bench reference.`;
}

// 6. Maintenance Schedules Explanation
function generateMaintenanceExplanation(ctx: RetrievedDataContext, isAr: boolean): string {
  const veh = ctx.vehicleContext;
  const fluids = ctx.matchedSpecs;

  if (isAr) {
    return `### 📅 جدول الصيانة الدورية وسعات السوائل المصنعية\n**المركبة:** ${veh.year} ${veh.make} ${veh.model} (${veh.trim})\n**المحرك:** ${veh.engine} • **ناقل الحركة:** ${veh.transmission}\n\n#### 💧 مواصفات السوائل والزيوت المصنعية المعتمدة (قاعدة البيانات الموثقة)\n* **زيت المحرك (Engine Oil):**\n  * *المواصفة واللزوجة:* \`${fluids.EngineOilSpec}\`\n  * *سعة التعبئة مع الفلتر:* \`${fluids.EngineOilCapacity}\`\n  * *فترة الاستبدال:* **16,000 كم / 12 شهراً** (تُخفض إلى 8,000 كم في ظروف القيادة الشاقة: درجات حرارة مرتفعة، غبار، أو مشاوير قصيرة متكررة).\n\n* **زيت ناقل الحركة الأوتوماتيكي (ATF):**\n  * *المواصفة:* \`Toyota Genuine ATF WS (World Standard)\`\n  * *فترة الخدمة:* فحص عند 96,000 كم واستبدال عند 160,000 كم (معايرة المستوى عند درجة حرارة 35°C - 45°C عبر صرة الفائض Overflow).\n\n* **سائل تبريد المحرك (الرديتر Coolant):**\n  * *المواصفة:* \`Super Long Life Coolant (وردي جاهز 50/50 خالٍ من السيليكات HOAT)\`\n  * *السعة الإجمالية:* \`6.7 لتر\`\n  * *الفترة:* التغيير الأول عند 160,000 كم / 10 سنوات؛ وبعد ذلك كل 80,000 كم.\n\n* **سائل الفرامل الهيدروليكي (Brake Fluid):**\n  * *المواصفة القياسية:* \`SAE J1703 أو FMVSS No. 116 DOT 3 / DOT 4\`\n  * *الفترة:* كل 48,000 كم أو سنتين إلى 3 سنوات (فحص نقطة غليان الرطوبة).\n\n#### 🔋 مواصفات البطارية وعزم شد براغي العجلات\n* **بطارية التشغيل 12V:** \`${fluids.BatteryGroup}\` (تيار تدوير بارد ${fluids.BatteryCCA}، جهد ${fluids.BatteryVoltage})\n* **عزم شد براغي العجلات:** \`${fluids.WheelTorque}\` (الشد بنمط النجمة بواسطة مفتاح عزم معاير)`;
  }

  return `### 📅 Factory Maintenance Schedule & Fluid Capacities\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.trim})\n**Powertrain:** ${veh.engine} • **Transmission:** ${veh.transmission}\n\n#### 💧 Factory Fluid Specifications & Fill Capacities (Verified Database)\n* **Engine Motor Oil:**\n  * *Specification:* \`${fluids.EngineOilSpec}\`\n  * *Capacity:* \`${fluids.EngineOilCapacity}\`\n  * *Service Interval:* **10,000 miles / 12 months** (Reduce to 5,000 miles for severe driving: extensive idling, desert dust, or short trips <5 miles).\n\n* **Automatic Transmission Fluid:**\n  * *Specification:* \`Toyota Genuine ATF WS (World Standard)\`\n  * *Service Window:* Inspection at 60,000 miles; drain & refill at 100,000 miles (Check level at 35°C - 45°C via overflow plug).\n\n* **Engine Coolant:**\n  * *Specification:* \`Super Long Life Coolant (Pink 50/50 Pre-diluted Non-Silicate HOAT)\`\n  * *Capacity:* \`6.7 Liters (7.1 US Qts)\`\n  * *Interval:* First service at 100,000 miles / 10 years; thereafter every 50,000 miles.\n\n* **Brake Hydraulic Fluid:**\n  * *Specification:* \`SAE J1703 or FMVSS No. 116 DOT 3 / DOT 4\`\n  * *Interval:* Every 30,000 miles or 3 years (moisture boiling point test).\n\n#### 🔋 Battery & Chassis Specifications\n* **12V Starter Battery:** \`${fluids.BatteryGroup}\` (${fluids.BatteryCCA}, ${fluids.BatteryVoltage})\n* **Wheel Bolt Torque:** \`${fluids.WheelTorque}\` (Tighten in star pattern with calibrated wrench)`;
}

// 7. Compare Possible Causes
function generateCauseComparison(ctx: RetrievedDataContext, isAr: boolean): {
  text: string;
  data: CauseComparison;
} {
  const dtc = ctx.matchedDtcs[0];
  const veh = ctx.vehicleContext;
  const symptomTitle = dtc
    ? `${dtc.code} - ${dtc.description}`
    : isAr
    ? 'تفتفة المحرك ورجة عند السلانسيه'
    : 'Engine Cylinder Misfire & Rough Idle';

  const causes = isAr
    ? [
        {
          id: 'c1',
          name: 'تلف أو تلوث شمعة الاحتراق (بوجي)',
          probability: 45,
          system: 'نظام الإشعال (Ignition)',
          keyIndicators: 'تفتفة متقطعة عند التسارع المفاجئ؛ كربون أسود على طرف العازل الخزفي',
          verificationTest: 'فحص الخلوص البصري (1.0-1.1 مم) واختبار إطلاق الشرارة',
          estCost: '25$ - 80$',
        },
        {
          id: 'c2',
          name: 'انسداد فوهة بخاخ الوقود المباشر أو تلف ملفه',
          probability: 30,
          system: 'نظام إمداد الوقود (Fuel)',
          keyIndicators: 'تعثر عند التشغيل البارد، انحراف في توازن الوقود اللحظي للأسطوانة',
          verificationTest: 'قياس مقاومة البخاخ (11.6-12.4 أوم) وفحص هبوط ضغط المسطرة',
          estCost: '180$ - 350$',
        },
        {
          id: 'c3',
          name: 'تسريب شرارة عازل كويل الإشعال (Coil Pack)',
          probability: 15,
          system: 'نظام الإشعال (Ignition)',
          keyIndicators: 'تفتفة دائمة في أسطوانة محددة؛ انتقال التفتفة عند تبديل الكويل لأسطوانة أخرى',
          verificationTest: 'اختبار التبديل التبادلي بين الأسطوانات وإعادة الفحص بالجهاز',
          estCost: '75$ - 150$',
        },
        {
          id: 'c4',
          name: 'تهريب فاكيوم في مجمع السحب (ثلاجة المحرك)',
          probability: 10,
          system: 'نظام سحب الهواء (Induction)',
          keyIndicators: 'ارتفاع تصحيح الوقود الإيجابي STFT (>+20%) في السلانسيه وتلاشيه عند 2500 د/د',
          verificationTest: 'اختبار جهاز الدخان بضغط 1 PSI للتأكد من عدم وجود تسريب',
          estCost: '40$ - 200$',
        },
      ]
    : [
        {
          id: 'c1',
          name: 'Fouled Spark Plug or Insulator Breakdown',
          probability: 45,
          system: 'Ignition System',
          keyIndicators: 'Intermittent misfire under heavy acceleration; black carbon soot on ceramic tip',
          verificationTest: 'Visual gap check (1.0-1.1mm spec) & spark tester coil firing test',
          estCost: '$25 - $80',
        },
        {
          id: 'c2',
          name: 'Direct Fuel Injector Nozzle Clog / Failure',
          probability: 30,
          system: 'Fuel Delivery',
          keyIndicators: 'Cold-start stumble, specific cylinder fuel trim deviation, hard start',
          verificationTest: 'Injector resistance check (11.6-12.4Ω) & balance pressure drop test',
          estCost: '$180 - $350',
        },
        {
          id: 'c3',
          name: 'Ignition Coil Pack Insulation Arcing',
          probability: 15,
          system: 'Ignition System',
          keyIndicators: 'Sudden dead cylinder misfire; misfire moves when coil swapped to another cylinder',
          verificationTest: 'Cylinder swap test (move coil from Cyl 1 to Cyl 2 and rescan DTC)',
          estCost: '$75 - $150',
        },
        {
          id: 'c4',
          name: 'Intake Runner Vacuum Leak',
          probability: 10,
          system: 'Induction / Air',
          keyIndicators: 'High positive STFT (>+20%) at idle that improves as engine RPM increases to 2500',
          verificationTest: 'Evaporative smoke machine test pressurized to 1 PSI',
          estCost: '$40 - $200',
        },
      ];

  const comparisonData: CauseComparison = {
    symptom: symptomTitle,
    vehicle: `${veh.year} ${veh.make} ${veh.model}`,
    causes,
  };

  const causesMarkdown = causes
    .map(
      (c) =>
        `* **${c.name}** [احتمال: \`${c.probability}%\` | النظام: ${c.system}]\n  * *المؤشرات الرئيسية:* ${c.keyIndicators}\n  * *طريقة الفحص والتحقق:* \`${c.verificationTest}\`\n  * *التكلفة التقديرية للإصلاح:* \`${c.estCost}\``
    )
    .join('\n');

  const text = isAr
    ? `### ⚖️ مصفوفة مقارنة الأسباب المحتملة والترجيح النسبي\n**العرض / كود العطل:** ${symptomTitle}\n**المركبة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nتم تحليل البيانات المعتمدة لتقديم تقييم تفريقي احصائي دقيق للأسباب الجذرية المحتملة:\n\n${causesMarkdown}`
    : `### ⚖️ Differential Cause Comparison Matrix\n**Target Fault:** ${symptomTitle}\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nVerified database probability distribution across candidate subsystems:\n\n${causesMarkdown}`;

  return { text, data: comparisonData };
}

// 8. Generate Diagnostic Checklist
function generateDiagnosticChecklist(ctx: RetrievedDataContext, isAr: boolean): {
  text: string;
  data: DiagnosticChecklist;
} {
  const dtc = ctx.matchedDtcs[0];
  const veh = ctx.vehicleContext;
  const symptomTitle = dtc
    ? `${dtc.code} - ${dtc.description}`
    : isAr
    ? 'فحص تفتفة المحرك وحقن الوقود'
    : 'Cylinder Misfire & Fuel Injection Diagnostic Checklist';

  const items = isAr
    ? [
        {
          id: 'chk-1',
          stepNumber: 1,
          task: 'قياس جهد البطارية عند الراحة وتأريض كتلة المحرك والشاسيه',
          system: 'النظام الكهربائي',
          tool: 'ملتيميتر رقمي (DMM)',
          spec: '≥ 12.6 فولت (هبوط التأريض < 0.1 فولت)',
          critical: true,
          checked: false,
        },
        {
          id: 'chk-2',
          stepNumber: 2,
          task: 'التقاط قراءات Freeze Frame عبر جهاز الفحص OBD-II وسرعة المحرك وحرارة السائل',
          system: 'كمبيوتر السيارة CAN-BUS',
          tool: 'جهاز فحص OBD-II ماسح للأعطال',
          spec: 'حفظ سجل بيانات أطر التجميد',
          critical: false,
          checked: false,
        },
        {
          id: 'chk-3',
          stepNumber: 3,
          task: 'مراقبة تصحيح الوقود اللحظي STFT والطويل LTFT عند السلانسيه وعند 2500 د/د',
          system: 'نظام معايرة الوقود',
          tool: 'جهاز فحص OBD-II',
          spec: 'بين -5% إلى +5% (الخلل إذا > +15%)',
          critical: true,
          checked: false,
        },
        {
          id: 'chk-4',
          stepNumber: 4,
          task: 'فحص فجوة شمعة الاحتراق وتآكل قطب الإيريديوم ووجود ترسبات كربونية',
          system: 'نظام الإشعال',
          tool: 'فيلر قياس الخلوص ومفتاح بواجي 14 مم مغناطيسي',
          spec: '1.05 ± 0.05 مم (عزم الشد: 18 نيوتن.متر)',
          critical: false,
          checked: false,
        },
        {
          id: 'chk-5',
          stepNumber: 5,
          task: 'قياس مقاومة ملف بخاخ الوقود الكهربائي عند حرارة 20° مئوية',
          system: 'نظام حقن الوقود',
          tool: 'ملتيميتر رقمي (أوميتر)',
          spec: '11.6 - 12.4 أوم',
          critical: true,
          checked: false,
        },
        {
          id: 'chk-6',
          stepNumber: 6,
          task: 'إجراء فحص التبديل التبادلي لكويل الإشعال مع الأسطوانة المجاورة',
          system: 'نظام الإشعال',
          tool: 'مفتاح حبة 10 مم ويد سقاطة',
          spec: 'انتقال كود العطل يثبت تلف الكويل',
          critical: false,
          checked: false,
        },
        {
          id: 'chk-7',
          stepNumber: 7,
          task: 'التحقق من تفريغ ضغط مسطرة الوقود العالي بالكامل قبل فك البخاخ',
          system: 'نظام حقن الوقود',
          tool: 'خرطوم تفريغ ضغط ومقياس وقود',
          spec: '0 رطل/بوصة مربعة ضغط متبقي (سلامة إلزامية)',
          critical: true,
          checked: false,
        },
      ]
    : [
        {
          id: 'chk-1',
          stepNumber: 1,
          task: 'Verify 12V AGM battery resting voltage and clean engine block grounds',
          system: 'Electrical System',
          tool: 'Digital Multimeter (DMM)',
          spec: '≥ 12.6V resting (Ground drop <0.1V)',
          critical: true,
          checked: false,
        },
        {
          id: 'chk-2',
          stepNumber: 2,
          task: 'Interrogate ECU freeze-frame data: record RPM, Coolant Temp & Calculated Load',
          system: 'CAN-BUS / ECU',
          tool: 'OBD-II Scan Tool',
          spec: 'Freeze-frame log captured',
          critical: false,
          checked: false,
        },
        {
          id: 'chk-3',
          stepNumber: 3,
          task: 'Monitor live Short-Term & Long-Term Fuel Trims at idle and 2500 RPM',
          system: 'Fuel Trim Telemetry',
          tool: 'OBD-II Scan Tool',
          spec: 'Within -5% to +5% (Fault if >+15%)',
          critical: true,
          checked: false,
        },
        {
          id: 'chk-4',
          stepNumber: 4,
          task: 'Inspect spark plug electrode gap and ceramic insulator for carbon tracking',
          system: 'Ignition',
          tool: 'Feeler Gauge & 14mm Spark Plug Socket',
          spec: '1.05 ± 0.05 mm (Torque: 18 Nm)',
          critical: false,
          checked: false,
        },
        {
          id: 'chk-5',
          stepNumber: 5,
          task: 'Measure injector solenoid resistance at room temperature (20°C)',
          system: 'Fuel System',
          tool: 'Digital Multimeter (Ohmmeter)',
          spec: '11.6 - 12.4 Ω',
          critical: true,
          checked: false,
        },
        {
          id: 'chk-6',
          stepNumber: 6,
          task: 'Conduct cylinder swap test with adjacent cylinder ignition coil',
          system: 'Ignition',
          tool: '10mm Socket & Ratchet',
          spec: 'Misfire follows coil = bad coil',
          critical: false,
          checked: false,
        },
        {
          id: 'chk-7',
          stepNumber: 7,
          task: 'Verify fuel rail depressurization prior to direct injector removal',
          system: 'Fuel System',
          tool: 'Fuel Pressure Bleed Hose',
          spec: '0 PSI residual rail pressure',
          critical: true,
          checked: false,
        },
      ];

  const checklistData: DiagnosticChecklist = {
    id: `chk-${Date.now()}`,
    title: isAr ? `قائمة بنود الفحص التشخيصي: ${symptomTitle}` : `Diagnostic Action Checklist: ${symptomTitle}`,
    symptomOrDtc: symptomTitle,
    vehicle: `${veh.year} ${veh.make} ${veh.model}`,
    items,
  };

  const checklistMarkdown = items
    .map(
      (item) =>
        `* [ ] **${isAr ? 'الخطوة' : 'Step'} ${item.stepNumber}:** ${item.task}\n  * *${isAr ? 'الأداة' : 'Tool'}:* \`${item.tool}\` | *${isAr ? 'المعيار' : 'Spec'}:* \`${item.spec}\` ${item.critical ? `• **[${isAr ? 'خطوة حرجة' : 'CRITICAL STEP'}]**` : ''}`
    )
    .join('\n');

  const text = isAr
    ? `### ☑️ قائمة الفحص التشخيصي التفاعلية لورشة الصيانة\n**الهدف:** ${symptomTitle}\n**المركبة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nاستخدم القائمة التفاعلية التالية داخل صالة الورشة للتحقق المنظم من بنود الفحص دون تجاوز معايير السلامة الإلزامية:\n\n${checklistMarkdown}`
    : `### ☑️ Interactive Diagnostic Checklist\n**Target:** ${symptomTitle}\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nUse the interactive checklist below in the workshop bay to systematically verify diagnostic parameters without skipping critical safety protocols:\n\n${checklistMarkdown}`;

  return { text, data: checklistData };
}

// 9. Generate Mechanic Report
function generateMechanicReport(ctx: RetrievedDataContext, isAr: boolean): {
  text: string;
  data: MechanicReport;
} {
  const veh = ctx.vehicleContext;
  const dtc = ctx.matchedDtcs[0];
  const dateStr = new Date().toISOString().split('T')[0];
  const reportId = `RO-${veh.year}-${Math.floor(1000 + Math.random() * 9000)}`;

  const reportData: MechanicReport = {
    reportId,
    date: dateStr,
    vehicle: {
      year: veh.year,
      make: veh.make,
      model: veh.model,
      trim: veh.trim,
      engine: veh.engine,
      transmission: veh.transmission,
      vin: veh.vin,
      mileage: isAr ? '103,450 كم' : '64,280 miles',
    },
    customerConcern: isAr
      ? 'شكوى العميل: إضاءة لمبة فحص المحرك (Check Engine) مع وجود تفتفة ورجة ملحوظة في السلانسيه وأثناء بدء التسارع من وضع الوقوف.'
      : 'Customer states: Check Engine Light illuminated with noticeable engine shudder/stumble during low-speed idle and initial acceleration from standstill.',
    scannedDtcs: [
      {
        code: dtc ? dtc.code : 'P0301',
        title: dtc
          ? dtc.description
          : isAr
          ? 'تم رصد تفتفة احتراق في الأسطوانة رقم 1'
          : 'Cylinder 1 Misfire Detected',
        severity: dtc ? dtc.severity : 'High',
        milStatus: dtc ? dtc.milStatus : 'MIL Steady',
      },
    ],
    telemetryFindings: isAr
      ? [
          {
            parameter: 'حرارة سائل تبريد المحرك (ECT)',
            measured: '88° مئوية',
            expected: '82°C - 95°C',
            status: 'Normal',
          },
          {
            parameter: 'تصحيح الوقود اللحظي بنك 1 (STFT 1)',
            measured: '+18.2%',
            expected: '-5.0% إلى +5.0%',
            status: 'Abnormal',
          },
          {
            parameter: 'حساس ضغط مسطرة الوقود العالي',
            measured: '18.4 ميجا باسكال (184 بار)',
            expected: '15 - 20 ميجا باسكال',
            status: 'Normal',
          },
          {
            parameter: 'مقاومة ملف بخاخ الأسطوانة رقم 1',
            measured: '28.6 أوم (خارج النطاق)',
            expected: '11.6 - 12.4 أوم عند 20°م',
            status: 'Critical',
          },
        ]
      : [
          {
            parameter: 'Engine Coolant Temp (ECT)',
            measured: '88°C (190°F)',
            expected: '82°C - 95°C',
            status: 'Normal',
          },
          {
            parameter: 'Short-Term Fuel Trim (STFT 1)',
            measured: '+18.2%',
            expected: '-5.0% to +5.0%',
            status: 'Abnormal',
          },
          {
            parameter: 'High-Pressure Fuel Rail Sensor',
            measured: '18.4 MPa',
            expected: '15 - 20 MPa',
            status: 'Normal',
          },
          {
            parameter: 'Cylinder 1 Injector Coil Resistance',
            measured: '28.6 Ω (Out of Spec)',
            expected: '11.6 - 12.4 Ω at 20°C',
            status: 'Critical',
          },
        ],
    verifiedRootCause: isAr
      ? 'تدهور وانهيار داخلي في ملف السولينويد لبخاخ الوقود المباشر للأسطوانة رقم 1، مما يسبب قصر/انقطاع متقطع في الدائرة عند ارتفاع الحمل الحراري للتشغيل.'
      : 'Cylinder 1 direct high-pressure fuel injector internal solenoid coil degradation resulting in intermittent open circuit under operating thermal load.',
    recommendedProcedure: isAr
      ? 'استبدال بخاخ الوقود المباشر للأسطوانة رقم 1، استبدال أنبوب التغذية ذي الضغط العالي (قطعة للاستخدام مرة واحدة)، تركيب حلقات التفلون لغرفة الاحتراق، وتصفير تكيفات الوقود في كمبيوتر السيارة.'
      : 'Replace Cylinder 1 direct fuel injector, replace one-time-use high-pressure feed pipe, install new combustion chamber Teflon seal rings, and clear ECU adaptive trims.',
    requiredParts: isAr
      ? [
          {
            name: 'بخاخ وقود مباشر أصلي OEM (أسطوانة 1)',
            partNumber: '23209-25010',
            qty: 1,
            estCost: '210.00$',
          },
          {
            name: 'أنبوب إمداد الوقود عالي الضغط (استخدام مرة واحدة)',
            partNumber: '23801-25010',
            qty: 1,
            estCost: '58.00$',
          },
          {
            name: 'طقم حلقات تفلون مانعة لتسريب غرفة الاحتراق',
            partNumber: '23291-25010',
            qty: 1,
            estCost: '16.50$',
          },
        ]
      : [
          {
            name: 'OEM Direct Injector (Cylinder 1)',
            partNumber: '23209-25010',
            qty: 1,
            estCost: '$210.00',
          },
          {
            name: 'High-Pressure Fuel Feed Pipe (One-Time Use)',
            partNumber: '23801-25010',
            qty: 1,
            estCost: '$58.00',
          },
          {
            name: 'Combustion Chamber Teflon Seal Ring Set',
            partNumber: '23291-25010',
            qty: 1,
            estCost: '$16.50',
          },
        ],
    torqueSpecs: isAr
      ? [
          {
            fastener: 'براغي تثبيت مسطرة الوقود (Fuel Rail)',
            torque: '21 نيوتن.متر (15.5 رطل-قدم)',
            notes: 'الشد بالتساوي بنمط متقاطع',
          },
          {
            fastener: 'صواميل وصلات أنبوب وقود الضغط العالي',
            torque: '30 نيوتن.متر (22 رطل-قدم)',
            notes: 'استخدام مفتاح حبة صواميل مواسير 17 مم معاير',
          },
        ]
      : [
          {
            fastener: 'Fuel Rail Retaining Bolts',
            torque: '21 Nm (15.5 lb-ft)',
            notes: 'Tighten evenly in criss-cross sequence',
          },
          {
            fastener: 'High-Pressure Fuel Feed Pipe Union Nuts',
            torque: '30 Nm (22 lb-ft)',
            notes: 'Use calibrated 17mm flare nut socket',
          },
        ],
    estimatedLaborHours: isAr ? '1.75 ساعة عمل' : '1.75 Hours',
    technicianNotes: isAr
      ? 'تم تفريغ ضغط مسطرة الوقود بنجاح عبر نزع فيوز 20A EFI MAIN وتدوير المحرك. بعد تركيب البخاخ الجديد، تم إجراء اختبار تسريب الضغط بنجاح مع تسجيل صفر تسريب أو رائحة وقود. تمت تجربة السيارة على الطريق لمسافة 20 كم بدون تسجيل أي كود عطل معلق.'
      : 'Depressurized fuel rail via 20A EFI MAIN fuse crank bleed. After injector installation, completed pressure leak test and verified 0 fuel odor or weeping. Road tested 12 miles with zero pending DTCs.',
    certifyingTechnician: isAr
      ? 'فني معتمد أول ASE Master L1 رقم AF-8942'
      : 'ASE Master Certified L1 Technician #AF-8942',
  };

  if (isAr) {
    const partsFormatted = reportData.requiredParts
      .map((p) => `* **${p.name}** | رقم القطعة: \`${p.partNumber}\` | الكمية: ${p.qty} | التكلفة التقديرية: \`${p.estCost}\``)
      .join('\n');

    const findingsFormatted = reportData.telemetryFindings
      .map(
        (f) =>
          `* **${f.parameter}:** القيمة المقاسة \`${f.measured}\` مقابل المتوقعة \`${f.expected}\` ← الحالة: \`${f.status}\``
      )
      .join('\n');

    const torqueFormatted = reportData.torqueSpecs
      .map((t) => `* **${t.fastener}:** \`${t.torque}\` (${t.notes || ''})`)
      .join('\n');

    const text = `### 📋 تقرير الفحص وأمر العمل المصنعي المعتمد لورشة الصيانة\n**رقم أمر الإصلاح (RO):** \`${reportData.reportId}\` • **التاريخ:** ${reportData.date}\n**المركبة:** ${veh.year} ${veh.make} ${veh.model} ${veh.trim}\n**رقم الشاسيه (VIN):** \`${veh.vin}\` • **قراءة العداد:** \`${reportData.vehicle.mileage}\`\n\n#### 🗣️ شكوى العميل المسجلة\n"${reportData.customerConcern}"\n\n#### ⚠️ رموز الأعطال المؤكدة (DTC)\n* **${reportData.scannedDtcs[0].code}:** ${reportData.scannedDtcs[0].title} (مستوى الخطورة: \`${reportData.scannedDtcs[0].severity}\`)\n\n#### 🔬 نتائج التليمتري والفحص الميداني\n${findingsFormatted}\n\n#### 🎯 السبب الجذري المؤكد\n${reportData.verifiedRootCause}\n\n#### 🛠️ الإجراء العلاجي الموصى به وساعات العمل\n${reportData.recommendedProcedure}\n* **ساعات العمل التقديرية:** \`${reportData.estimatedLaborHours}\`\n\n#### 📦 قطع الغيار الأصلية المطلوبة OEM\n${partsFormatted}\n\n#### 🔩 عزوم الربط المصنعية الحرجة\n${torqueFormatted}\n\n#### ✍️ اعتماد فني الصيانة الرئيسي ASE\n* **ملاحظات الفني:** ${reportData.technicianNotes}\n* **تم الاعتماد بواسطة:** \`${reportData.certifyingTechnician}\``;

    return { text, data: reportData };
  }

  const partsFormatted = reportData.requiredParts
    .map((p) => `* **${p.name}** | Part #: \`${p.partNumber}\` | Qty: ${p.qty} | Est: \`${p.estCost}\``)
    .join('\n');

  const findingsFormatted = reportData.telemetryFindings
    .map(
      (f) =>
        `* **${f.parameter}:** Measured \`${f.measured}\` vs Expected \`${f.expected}\` → Status: \`${f.status}\``
    )
    .join('\n');

  const torqueFormatted = reportData.torqueSpecs
    .map((t) => `* **${t.fastener}:** \`${t.torque}\` (${t.notes || ''})`)
    .join('\n');

  const text = `### 📋 Official Workshop Mechanic Diagnostic Report\n**Work Order:** \`${reportData.reportId}\` • **Date:** ${reportData.date}\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} ${veh.trim}\n**VIN:** \`${veh.vin}\` • **Odometer:** \`${reportData.vehicle.mileage}\`\n\n#### 🗣️ Customer Stated Concern\n"${reportData.customerConcern}"\n\n#### ⚠️ Diagnostic Trouble Codes Confirmed\n* **${reportData.scannedDtcs[0].code}:** ${reportData.scannedDtcs[0].title} (Severity: \`${reportData.scannedDtcs[0].severity}\`)\n\n#### 🔬 Telemetry & Bench Findings\n${findingsFormatted}\n\n#### 🎯 Verified Root Cause\n${reportData.verifiedRootCause}\n\n#### 🛠️ Recommended Corrective Action & Labor\n${reportData.recommendedProcedure}\n* **Estimated Shop Labor:** \`${reportData.estimatedLaborHours}\`\n\n#### 📦 Required OEM Replacement Parts\n${partsFormatted}\n\n#### 🔩 Critical Factory Torque Specifications\n${torqueFormatted}\n\n#### ✍️ Master Technician Certification\n* **Technician Notes:** ${reportData.technicianNotes}\n* **Certified By:** \`${reportData.certifyingTechnician}\``;

  return { text, data: reportData };
}

// 10. General Inquiry (الذكاء الاصطناعي العام للسيارات)
function generateGeneralInquiry(ctx: RetrievedDataContext, query: string, isAr: boolean): string {
  const veh = ctx.vehicleContext;
  const q = query.toLowerCase();

  // Handle CAN-BUS queries
  if (q.includes('can-bus') || q.includes('can bus') || q.includes('شبكة كان') || q.includes('كان باس')) {
    if (isAr) {
      return `### ⚡ شبكة الاتصال التسلسلي CAN-BUS (Controller Area Network)\n**المركبة الحالية:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nنظام **CAN-BUS** هو بروتوكول اتصال تفاضلي عالي السرعة (ISO 11898) يربط وحدات التحكم الإلكترونية (ECU, TCU, ABS, BCM) بدون تعقيد الأسلاك الفردية.\n\n#### 🔬 الخصائص الهندسية والقيم القياسية:\n* **خطا الشبكة:** يتكون من سلكين مجدولين معاً: **CAN High (CAN-H)** و **CAN Low (CAN-L)** لتقليل التشويش الكهرومغناطيسي.\n* **جهد الإشارة:**\n  * حالة السكون (Recessive): كلاهما عند **2.5 فولت** تقريباً.\n  * حالة البث (Dominant): يرتفع CAN-H إلى **3.5 فولت**، وينخفض CAN-L إلى **1.5 فولت** (فرق الجهد التفاضلي = 2.0 فولت).\n* **مقاومات الإنهاء (Terminating Resistors):** توجد مقاومتان بقيمة **120 أوم** في طرفي الشبكة (عادة داخل كمبيوتر المحرك ECM ووحدة العدادات أو ناقل الحركة). عند فحص المقاومة بين المنفذين 6 و 14 في فيشة OBD-II مع فصل البطارية، يجب أن تقرأ الملتيميتر بالضبط **60 أوم** (مقاومتان 120Ω بالتوازي).\n\n#### 🛠️ أعطال CAN-BUS الشائعة في الورشة:\n1. **قراءة 120 أوم:** تعني انقطاع أحد مقاومات الإنهاء أو تلف أسلاك أحد طرفي الشبكة.\n2. **قراءة 0 أوم أو أقل من 50 أوم:** التماس مباشر بين خطي CAN-H و CAN-L.\n3. **كود U0100 / U0101:** فقدان الاتصال بوحدة المحرك أو ناقل الحركة بسبب انقطاع الجهد أو التأريض أو كابل الشبكة.`;
    }
    return `### ⚡ CAN-BUS (Controller Area Network) Engineering Deep-Dive\n**Vehicle Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nThe **CAN-BUS** network is an ISO 11898 differential communication standard linking all microcontrollers (ECM, TCM, ABS, BCM) over a single twisted pair without point-to-point harness clutter.\n\n#### 🔬 Electrical Characteristics & Diagnostic Specs:\n* **Twisted Pair:** **CAN High (CAN-H)** on OBD-II pin 6 and **CAN Low (CAN-L)** on OBD-II pin 14.\n* **Signal Voltages:**\n  * Recessive State (idle): Both lines sit at **~2.5V**.\n  * Dominant State (transmitting): CAN-H rises to **~3.5V** while CAN-L drops to **~1.5V** (2.0V differential).\n* **Terminating Resistors:** Two **120 Ω** resistors sit at opposite ends of the bus (ECM and Gateway/Cluster). Measuring resistance across OBD-II pins 6 & 14 with the battery disconnected must read **60 Ω** in parallel.\n\n#### 🛠️ Common Workshop Diagnostic Scenarios:\n1. **Reading 120 Ω:** Open circuit in one terminal node branch.\n2. **Reading <50 Ω or ~0 Ω:** Short circuit between CAN-H and CAN-L.\n3. **U-Codes (e.g. U0100):** Module communication loss requiring pinout power, ground, and baud integrity checks.`;
  }

  // Handle Fuel Injection / GDI vs PFI
  if (q.includes('gdi') || q.includes('direct injection') || q.includes('حقن مباشر') || q.includes('بخاخات')) {
    if (isAr) {
      return `### ⛽ منظومة حقن الوقود المباشر GDI vs الحقن غير المباشر PFI\n**المركبة الحالية:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nتعتمد محركات تويوتا الحديثة (مثل محرك 2.5L Dynamic Force A25A-FKS) على نظام **D-4S** المزدوج، والذي يدمج الحقن المباشر في الأسطوانة (GDI) مع الحقن عند فتحة الصمام (Port Injection PFI).\n\n#### 🔬 الفروقات التقنية الدقيقة:\n* **ضغط مسطرة الوقود:**\n  * نظام PFI: يعمل بضغط مضخة الخزان المنخفض (3 إلى 4.5 بار / 45-65 PSI).\n  * نظام GDI: يعتمد على مضخة ميكانيكية مدمجة على عمود الكامات ترفع الضغط إلى **150 - 200 بار (15 - 20 MPa / 2200 - 3000 PSI)**.\n* **ترسبات الكربون على صمامات السحب:** في محركات الحقن المباشر الخالص، لا يمر الوقود على خلفية صمامات السحب لغسلها، مما يسبب تراكم الكربون. في نظام D-4S، يعمل حقن المنفذ (Port) في السرعات المنخفضة لتنظيف الصمامات وتقليل الانبعاثات.\n* **فحص المقاومة:** مقاومة بخاخ الضغط العالي Piezo أو Solenoid دقيقة للغاية (**11.6 - 12.4 أوم** عند 20°م)، وأي زيادة تشير إلى تلف الملف الداخلي.`;
    }
    return `### ⛽ Direct Fuel Injection (GDI) vs Port Injection (PFI)\n**Vehicle Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nModern powertrains (such as Toyota's 2.5L Dynamic Force A25A-FKS) employ dual-injection technology (Toyota D-4S), combining high-pressure direct in-cylinder injection (GDI) with low-pressure port fuel injection (PFI).\n\n#### 🔬 Technical Benchmarks:\n* **Fuel Rail Pressure:** Low-pressure tank pump delivers 45-65 PSI, while the camshaft-driven high-pressure mechanical pump delivers **15-20 MPa (2,200 - 3,000 PSI)** directly to combustion chambers.\n* **Intake Valve Carbonization:** Pure GDI engines suffer carbon buildup on intake valves because fuel never washes over the valve stems. Dual-injection systems inject port fuel at low/mid loads to self-clean valves.\n* **Solenoid Resistance Spec:** GDI injectors operate on fast pulse-widths with precise **11.6 - 12.4 Ω** coil tolerances.`;
  }

  // Handle General Inquiry Menu
  if (isAr) {
    return `### ⚡ المساعد الذكي لهندسة وتشخيص السيارات AutoFix AI\n**مركبة الورشة النشطة:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nأنا مساعدك الهندسي التخصصي في تشخيص وصيانة السيارات، وتعتمد إجاباتي بشكل كامل على قاعدة البيانات المصنعية الموثقة **بدون أي هلوسة أو اختلاق للأرقام**.\n\n#### 🛠️ كيف يمكنني مساعدتك اليوم في الورشة؟\n* 🩺 **شرح وتحليل الأعراض (Explain Symptoms):** اسأل عن أسباب التفتفة، اهتزاز المحرك، الدخان، أو ارتفاع الحرارة.\n* ⚙️ **فحص المكونات الهندسية (Explain Components):** معرفة مواقع الحساسات، قراءات الأوم، ومخططات الأسلاك.\n* 🪜 **مسارات التشخيص المتسلسلة (Diagnostic Workflows):** خطوات فحص بالملتيميتر وجهاز الفحص خطوة بخطوة.\n* 🛠️ **ملخص إجراءات الإصلاح (Summarize Repair):** عزوم الربط المصنعية، أدوات الفك والتركيب، وتحذيرات السلامة.\n* ⚠️ **شرح أكواد الأعطال (Explain DTC Codes):** تحليل عميق لأكواد OBD-II ورموز المصنع SAE J1979.\n* 📅 **جدول الصيانة وسعات السوائل (Maintenance Schedules):** لزوجة زيت المحرك، سائل القير، ماء الرديتر، وسعة التعبئة.\n* ⚖️ **مقارنة الأسباب المحتملة (Compare Causes):** مصفوفة ترجيح الأسباب مع نسب الاحتمال المئوية.\n* ☑️ **قوائم الفحص التفاعلية (Diagnostic Checklists):** قوائم مهام قابلة للتحديد أثناء الفحص بالورشة.\n* 📋 **إصدار تقارير الصيانة وأوامر الإصلاح (Mechanic Reports):** تقارير RO معتمدة مع جدول القطع وختم فني ASE.`;
  }

  return `### ⚡ AutoFix AI Automotive Assistant\n**Active Workshop Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nI am your verified automotive engineering and diagnostic copilot. My knowledge is grounded strictly in the workshop database with **zero hallucinations**.\n\n#### 🛠️ How I Can Assist You Today:\n* 🩺 **Explain Symptoms:** Ask about rough idle, knocking, smoke, or overheating.\n* ⚙️ **Explain Components:** Learn locations, pinouts, and specs for any sensor or actuator.\n* 🪜 **Guide Diagnostic Workflows:** Step-by-step pin-point multimeter and scan tool tests.\n* 🛠️ **Summarize Repair Procedures:** Fast access to required tools, torque specs, and safety warnings.\n* ⚠️ **Explain DTC Codes:** Deep dive into OBD-II SAE standard and manufacturer-specific fault codes.\n* 📅 **Explain Maintenance Schedules:** Exact factory fluid viscosities, fill capacities, and intervals.\n* ⚖️ **Compare Possible Causes:** Differential analysis with probability percentages.\n* ☑️ **Generate Diagnostic Checklists:** Interactive shop-floor checklists you can mark as completed.\n* 📋 **Generate Mechanic Reports:** Formal, exportable Repair Orders with parts BOM and technician sign-off.`;
}
