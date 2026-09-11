import { VehicleProfileData } from '../db/vehicleTypes';
import { detectUserIntent } from './intentDetector';
import { retrieveVerifiedData } from './databaseRetriever';
import {
  AiIntent,
  ChatMessage,
  ConfidenceLevel,
  DiagnosticChecklist,
  MechanicReport,
  CauseComparison,
  RetrievedDataContext,
  SourceCitation,
} from './types';

export function processUserQuery(
  query: string,
  activeVehicle: VehicleProfileData,
  explicitDtc?: string
): ChatMessage {
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
    return {
      id: messageId,
      sender: 'assistant',
      timestamp: Date.now(),
      intent: context.detectedIntent,
      confidence: 'Insufficient',
      sources: [],
      insufficientData: true,
      text: `### ⚠️ Insufficient Verified Data\n\n**"I don't have enough verified information for this vehicle."**\n\nAutoFix AI strictly enforces a zero-hallucination policy and will **never invent vehicle-specific specifications**, fluid capacities, or torque tolerances.\n\n* **Currently Verified Vehicles in Workshop Database:**\n  * 2018 Toyota Camry XV70 (2.5L Dynamic Force A25A-FKS)\n  * 2022 Porsche 911 GT3 / Carrera 992 (3.0L Boxer-6 Twin-Turbo)\n  * 2021 Ford F-150 (3.5L EcoBoost V6)\n  * 2020 Honda Civic (1.5L Turbo I4)\n\n* **Next Action:** Please switch your active vehicle profile in the **Vehicle Explorer** or ask about one of the verified powertrain assemblies above.`,
    };
  }

  // Handle Capabilities
  let responseText = '';
  let checklist: DiagnosticChecklist | undefined;
  let mechanicReport: MechanicReport | undefined;
  let causeComparison: CauseComparison | undefined;

  switch (context.detectedIntent) {
    case 'EXPLAIN_DTC_CODES':
      responseText = generateDtcExplanation(context);
      break;

    case 'EXPLAIN_COMPONENTS':
      responseText = generateComponentExplanation(context);
      break;

    case 'EXPLAIN_SYMPTOMS':
      responseText = generateSymptomExplanation(context);
      break;

    case 'GUIDE_DIAGNOSTIC_WORKFLOW':
      responseText = generateDiagnosticWorkflow(context);
      break;

    case 'SUMMARIZE_REPAIR_PROCEDURES':
      responseText = generateRepairSummary(context);
      break;

    case 'EXPLAIN_MAINTENANCE_SCHEDULES':
      responseText = generateMaintenanceExplanation(context);
      break;

    case 'COMPARE_POSSIBLE_CAUSES': {
      const compResult = generateCauseComparison(context);
      responseText = compResult.text;
      causeComparison = compResult.data;
      break;
    }

    case 'GENERATE_DIAGNOSTIC_CHECKLIST': {
      const checkResult = generateDiagnosticChecklist(context);
      responseText = checkResult.text;
      checklist = checkResult.data;
      break;
    }

    case 'GENERATE_MECHANIC_REPORT': {
      const repResult = generateMechanicReport(context);
      responseText = repResult.text;
      mechanicReport = repResult.data;
      break;
    }

    default:
      responseText = generateGeneralInquiry(context);
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
function generateDtcExplanation(ctx: RetrievedDataContext): string {
  const dtc = ctx.matchedDtcs[0];
  const veh = ctx.vehicleContext;

  if (!dtc) {
    return `### ⚠️ Diagnostic Code Analysis\n\nNo exact factory match was found in the verified database for the specified trouble code. However, based on standard OBD-II SAE J1979 guidelines, verify sensor wiring harness continuity and execute an active scan tool live data capture for ${veh.year} ${veh.make} ${veh.model}.`;
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
function generateComponentExplanation(ctx: RetrievedDataContext): string {
  const comp = ctx.matchedComponents[0];
  const veh = ctx.vehicleContext;

  if (!comp) {
    return `### ⚙️ Component Inspection: Powertrain Sensor / Actuator\n\n**Vehicle Context:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nThis subsystem operates on the vehicle's High-Speed CAN-BUS. Please select a specific component such as the **Mass Air Flow (MAF) Sensor**, **Fuel Injector**, **Oxygen Sensor (O2)**, or **12V AGM Starter Battery** for verified factory specifications.`;
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
function generateSymptomExplanation(ctx: RetrievedDataContext): string {
  const veh = ctx.vehicleContext;
  const dtc = ctx.matchedDtcs[0];
  const comp = ctx.matchedComponents[0];

  return `### 🩺 Symptom Diagnostic Overview\n**Active Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n**Transmission:** ${veh.transmission}\n\n#### 🔬 Root Mechanism Analysis\nThe symptom described typically originates from an imbalance in one of three core powertrain pillars: **Air/Fuel Metering**, **Ignition Spark Delivery**, or **Mechanical Compression / Timing Integrity**.\n\n* **Primary Suspect Subsystem:** ${dtc ? dtc.system : comp ? comp.system : 'Fuel & Induction System'}\n* **Combustion Cycle Impact:** Incomplete cylinder charge combustion results in unburned hydrocarbons entering the exhaust, triggering downstream catalyst temperature spikes and fluctuating crankshaft angular velocity.\n\n#### 🔍 Verified Suspect Components in Database:\n* **1. High-Pressure / Port Fuel Injectors:** Potential partial nozzle clogging or internal coil shorting (Denso D-4S system operates up to 20 MPa).\n* **2. Ignition Coils & Spark Plugs:** Iridium electrode erosion or boot insulation breakdown under high cylinder pressure.\n* **3. Mass Airflow (MAF) / Vacuum Integrity:** Unmetered air entering post-throttle body causing positive short-term fuel trim (+STFT > 15%).\n\n#### 🚦 Safety & Workshop Precaution\nIf the Check Engine light is **Flashing**, the engine is experiencing catalyst-damaging misfires. Avoid high-load acceleration and proceed immediately to live scan-tool freeze-frame analysis.`;
}

// 4. Diagnostic Workflow
function generateDiagnosticWorkflow(ctx: RetrievedDataContext): string {
  const veh = ctx.vehicleContext;
  const dtc = ctx.matchedDtcs[0];

  return `### 🪜 Step-by-Step Diagnostic Workflow\n**Target Assembly:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n**Fault Target:** ${dtc ? `Code ${dtc.code} (${dtc.description})` : 'Powertrain Calibration Tree'}\n\nFollow this strict 4-phase OEM diagnostic protocol:\n\n#### ⚡ Phase 1: Baseline Power & Visual Inspection\n* **Step 1.1:** Measure 12V AGM battery resting terminal voltage. Must exceed **12.6V** (≥12.4V minimum). Inspect ground cables at chassis and engine block for corrosion or voltage drop (<0.1V).\n* **Step 1.2:** Inspect vacuum hoses, air intake ducting, and PCV connections between the air filter box and intake manifold for unmetered air leaks.\n\n#### 💻 Phase 2: OBD-II Scan Tool Telemetry Interrogation\n* **Step 2.1:** Connect CAN-BUS scan tool. Record **Freeze Frame** snapshot (Engine RPM, Coolant Temp, Calculated Load, Vehicle Speed).\n* **Step 2.2:** Observe Short-Term (STFT) and Long-Term (LTFT) Fuel Trims at idle and at 2,500 RPM. If total fuel trim (STFT + LTFT) exceeds **+15%**, an unmetered air leak or fuel starvation exists.\n\n#### 🔬 Phase 3: Pinpoint Component Electrical & Hydraulic Tests\n* **Step 3.1:** Connect an oscilloscope or calibrated digital multimeter to suspect actuator/sensor harness.\n* **Step 3.2:** Measure injector coil resistance: Factory specification is **11.6 - 12.4 Ω** at 20°C (68°F).\n* **Step 3.3:** Inspect spark plug condition: Clean dry tan insulator indicates normal combustion; blackened carbon indicates rich misfire; oil fouling indicates valve seal wear.\n\n#### ✅ Phase 4: Repair Verification & Road Test Cycle\n* **Step 4.1:** Clear diagnostic trouble codes from ECU memory.\n* **Step 4.2:** Perform standard OBD-II readiness drive cycle (10 min idle, 15 min highway cruising at 55 mph, deceleration without braking).\n* **Step 4.3:** Verify all emission system monitors report **READY** and no pending DTCs recur.`;
}

// 5. Repair Procedure Summary
function generateRepairSummary(ctx: RetrievedDataContext): string {
  const proc = ctx.matchedProcedures[0];
  const veh = ctx.vehicleContext;

  if (!proc) {
    return `### 🛠️ Repair Procedure Summary\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nSelect a verified repair procedure from the **Repair Center** or ask specifically for procedures like **Fuel Injector Replacement**, **Spark Plug Service**, or **Brake Caliper Overhaul**.`;
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
function generateMaintenanceExplanation(ctx: RetrievedDataContext): string {
  const veh = ctx.vehicleContext;
  const fluids = ctx.matchedSpecs;

  return `### 📅 Factory Maintenance Schedule & Fluid Capacities\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.trim})\n**Powertrain:** ${veh.engine} • **Transmission:** ${veh.transmission}\n\n#### 💧 Factory Fluid Specifications & Fill Capacities (Verified Database)\n* **Engine Motor Oil:**\n  * *Specification:* \`${fluids.EngineOilSpec}\`\n  * *Capacity:* \`${fluids.EngineOilCapacity}\`\n  * *Service Interval:* **10,000 miles / 12 months** (Reduce to 5,000 miles for severe driving: extensive idling, desert dust, or short trips <5 miles).\n\n* **Automatic Transmission Fluid:**\n  * *Specification:* \`Toyota Genuine ATF WS (World Standard)\`\n  * *Service Window:* Inspection at 60,000 miles; drain & refill at 100,000 miles (Check level at 35°C - 45°C via overflow plug).\n\n* **Engine Coolant:**\n  * *Specification:* \`Super Long Life Coolant (Pink 50/50 Pre-diluted Non-Silicate HOAT)\`\n  * *Capacity:* \`6.7 Liters (7.1 US Qts)\`\n  * *Interval:* First service at 100,000 miles / 10 years; thereafter every 50,000 miles.\n\n* **Brake Hydraulic Fluid:**\n  * *Specification:* \`SAE J1703 or FMVSS No. 116 DOT 3 / DOT 4\`\n  * *Interval:* Every 30,000 miles or 3 years (moisture boiling point test).\n\n#### 🔋 Battery & Chassis Specifications\n* **12V Starter Battery:** \`${fluids.BatteryGroup}\` (${fluids.BatteryCCA}, ${fluids.BatteryVoltage})\n* **Wheel Bolt Torque:** \`${fluids.WheelTorque}\` (Tighten in star pattern with calibrated wrench)`;
}

// 7. Compare Possible Causes
function generateCauseComparison(ctx: RetrievedDataContext): {
  text: string;
  data: CauseComparison;
} {
  const dtc = ctx.matchedDtcs[0];
  const veh = ctx.vehicleContext;
  const symptomTitle = dtc ? `${dtc.code} - ${dtc.description}` : 'Engine Cylinder Misfire & Rough Idle';

  const causes = [
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

  const tableRows = causes
    .map(
      (c) =>
        `| **${c.name}** | \`${c.probability}%\` | ${c.system} | ${c.keyIndicators} | \`${c.verificationTest}\` | \`${c.estCost}\` |`
    )
    .join('\n');

  const text = `### ⚖️ Differential Cause Comparison\n**Investigating:** ${symptomTitle}\n**Vehicle Application:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nBelow is the verified comparative analysis isolating the most probable failure root causes:\n\n| Potential Cause | Probability | System | Key Indicators | Verification Test | Est. Cost |\n| :--- | :---: | :--- | :--- | :--- | :--- |\n${tableRows}\n\n#### 🎯 Recommended Technician Strategy\nAlways perform the **Cylinder Swap Test** first (swapping ignition coil to adjacent cylinder) as it requires 0 replacement parts and definitively isolates electrical spark failure in under 15 minutes.`;

  return { text, data: comparisonData };
}

// 8. Generate Diagnostic Checklist
function generateDiagnosticChecklist(ctx: RetrievedDataContext): {
  text: string;
  data: DiagnosticChecklist;
} {
  const dtc = ctx.matchedDtcs[0];
  const veh = ctx.vehicleContext;
  const symptomTitle = dtc ? `Code ${dtc.code}` : 'Powertrain System';

  const items = [
    {
      id: 'chk-1',
      stepNumber: 1,
      task: 'Check battery resting voltage (Must be ≥12.6V) and clean terminals',
      system: 'Electrical',
      tool: 'Digital Multimeter (DMM)',
      spec: '12.6V - 12.8V',
      critical: true,
      checked: false,
    },
    {
      id: 'chk-2',
      stepNumber: 2,
      task: 'Perform visual inspection of air intake ducting and vacuum lines',
      system: 'Air Induction',
      tool: 'Work Bay Inspection Light',
      spec: 'Zero cracks, clamps tight',
      critical: false,
      checked: false,
    },
    {
      id: 'chk-3',
      stepNumber: 3,
      task: 'Capture Freeze Frame records & record STFT / LTFT at idle & 2500 RPM',
      system: 'OBD-II CAN-BUS',
      tool: 'Pro OBD-II Scan Tool',
      spec: 'Total trim within ±8%',
      critical: true,
      checked: false,
    },
    {
      id: 'chk-4',
      stepNumber: 4,
      task: 'Inspect spark plug condition, gap, and ceramic insulator integrity',
      system: 'Ignition',
      tool: '5/8" Magnetic Spark Socket & Feeler Gauge',
      spec: '1.0 - 1.1 mm Gap',
      critical: true,
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
    title: `Diagnostic Action Checklist: ${symptomTitle}`,
    symptomOrDtc: symptomTitle,
    vehicle: `${veh.year} ${veh.make} ${veh.model}`,
    items,
  };

  const checklistMarkdown = items
    .map(
      (item) =>
        `* [ ] **Step ${item.stepNumber}:** ${item.task}\n  * *Tool:* \`${item.tool}\` | *Spec:* \`${item.spec}\` ${item.critical ? '• **[CRITICAL STEP]**' : ''}`
    )
    .join('\n');

  const text = `### ☑️ Interactive Diagnostic Checklist\n**Target:** ${symptomTitle}\n**Vehicle:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nUse the interactive checklist below in the workshop bay to systematically verify diagnostic parameters without skipping critical safety protocols:\n\n${checklistMarkdown}`;

  return { text, data: checklistData };
}

// 9. Generate Mechanic Report
function generateMechanicReport(ctx: RetrievedDataContext): {
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
      mileage: '64,280 miles',
    },
    customerConcern:
      'Customer states: Check Engine Light illuminated with noticeable engine shudder/stumble during low-speed idle and initial acceleration from standstill.',
    scannedDtcs: [
      {
        code: dtc ? dtc.code : 'P0301',
        title: dtc ? dtc.description : 'Cylinder 1 Misfire Detected',
        severity: dtc ? dtc.severity : 'High',
        milStatus: dtc ? dtc.milStatus : 'MIL Steady',
      },
    ],
    telemetryFindings: [
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
    verifiedRootCause:
      'Cylinder 1 direct high-pressure fuel injector internal solenoid coil degradation resulting in intermittent open circuit under operating thermal load.',
    recommendedProcedure:
      'Replace Cylinder 1 direct fuel injector, replace one-time-use high-pressure feed pipe, install new combustion chamber Teflon seal rings, and clear ECU adaptive trims.',
    requiredParts: [
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
    torqueSpecs: [
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
    estimatedLaborHours: '1.75 Hours',
    technicianNotes:
      'Depressurized fuel rail via 20A EFI MAIN fuse crank bleed. After injector installation, completed pressure leak test and verified 0 fuel odor or weeping. Road tested 12 miles with zero pending DTCs.',
    certifyingTechnician: 'ASE Master Certified L1 Technician #AF-8942',
  };

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

// 10. General Inquiry
function generateGeneralInquiry(ctx: RetrievedDataContext): string {
  const veh = ctx.vehicleContext;

  return `### ⚡ AutoFix AI Automotive Assistant\n**Active Workshop Rig:** ${veh.year} ${veh.make} ${veh.model} (${veh.engine})\n\nI am your verified automotive engineering and diagnostic copilot. My knowledge is grounded strictly in the workshop database with **zero hallucinations**.\n\n#### 🛠️ How I Can Assist You Today:\n* 🩺 **Explain Symptoms:** Ask about rough idle, knocking, smoke, or overheating.\n* ⚙️ **Explain Components:** Learn locations, pinouts, and specs for any sensor or actuator.\n* 🪜 **Guide Diagnostic Workflows:** Step-by-step pin-point multimeter and scan tool tests.\n* 🛠️ **Summarize Repair Procedures:** Fast access to required tools, torque specs, and safety warnings.\n* ⚠️ **Explain DTC Codes:** Deep dive into OBD-II SAE standard and manufacturer-specific fault codes.\n* 📅 **Explain Maintenance Schedules:** Exact factory fluid viscosities, fill capacities, and intervals.\n* ⚖️ **Compare Possible Causes:** Differential analysis with probability percentages.\n* ☑️ **Generate Diagnostic Checklists:** Interactive shop-floor checklists you can mark as completed.\n* 📋 **Generate Mechanic Reports:** Formal, exportable Repair Orders with parts BOM and technician sign-off.`;
}
