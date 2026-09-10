import { VEHICLE_PROFILES } from './vehicleDatabase';
import { NaturalSearchParsedResult, VehicleProfileData, KnownMaintenanceTask, FluidSpec, BatterySpec } from './vehicleTypes';

// Levenshtein Distance for typo tolerance
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

// Semantic Dictionaries for entity detection
const MAKES = ['toyota', 'ford', 'honda', 'porsche', 'bmw', 'chevrolet', 'audi', 'nissan', 'mercedes'];

const MODELS: Record<string, string> = {
  camry: 'Camry',
  'f-150': 'F-150',
  f150: 'F-150',
  civic: 'Civic',
  '911': '911 Carrera',
  m3: 'M3 Competition',
  corvette: 'Corvette',
  rav4: 'RAV4',
};

const SYSTEMS: Record<string, string> = {
  electrical: 'Electrical & Charging',
  battery: 'Electrical & Charging',
  charging: 'Electrical & Charging',
  cooling: 'Thermal & Cooling',
  thermal: 'Thermal & Cooling',
  coolant: 'Thermal & Cooling',
  radiator: 'Thermal & Cooling',
  brake: 'Braking System',
  brakes: 'Braking System',
  braking: 'Braking System',
  abs: 'Braking System',
  engine: 'Powertrain & Engine',
  powertrain: 'Powertrain & Engine',
  transmission: 'Transmission & Drivetrain',
  gearbox: 'Transmission & Drivetrain',
  pdk: 'Transmission & Drivetrain',
  cvt: 'Transmission & Drivetrain',
  lighting: 'Lighting & Electronics',
  lights: 'Lighting & Electronics',
  light: 'Lighting & Electronics',
  lamp: 'Lighting & Electronics',
  hvac: 'Climate Control / HVAC',
  ac: 'Climate Control / HVAC',
};

const COMPONENTS: Record<string, string> = {
  battery: '12V Battery & Sensor Terminal',
  coolant: 'Engine Coolant & Antifreeze',
  antifreeze: 'Engine Coolant & Antifreeze',
  'brake light': 'Brake Light Bulb / Stop Light Switch',
  'brake lights': 'Brake Light Bulb / Stop Light Switch',
  'tail light': 'Brake Light Bulb / Stop Light Switch',
  'stop light': 'Brake Light Bulb / Stop Light Switch',
  bulb: 'Lighting Bulbs & Sockets',
  pads: 'Brake Pads & Friction Material',
  'brake pads': 'Front/Rear Brake Pads',
  rotors: 'Brake Rotors & Discs',
  oil: 'Engine Motor Oil & Filter',
  'oil filter': 'Engine Motor Oil & Filter',
  'spark plug': 'Spark Plugs & Gap',
  'spark plugs': 'Spark Plugs & Gap',
  thermostat: 'Coolant Thermostat & Bypass Valve',
  'bypass valve': 'Coolant Bypass Valve',
  tires: 'Tires & Wheels',
  tire: 'Tires & Wheels',
  condenser: 'A/C Condenser & Refrigerant',
  'cam phaser': 'Variable Cam Timing (VCT) Phasers',
  phaser: 'Variable Cam Timing (VCT) Phasers',
  'intake manifold': 'Intake Manifold & Vacuum Lines',
  vacuum: 'Intake Manifold & Vacuum Lines',
};

const REPAIR_ACTIONS: Record<string, string> = {
  replacement: 'Replacement',
  replace: 'Replacement',
  replacing: 'Replacement',
  flush: 'System Flush',
  flushing: 'System Flush',
  bleed: 'Hydraulic Bleed',
  bleeding: 'Hydraulic Bleed',
  change: 'Change / Drain & Refill',
  changing: 'Change / Drain & Refill',
  inspection: 'Inspection & Testing',
  inspect: 'Inspection & Testing',
  diagnostic: 'Diagnostic & DTC Scan',
  diagnostics: 'Diagnostic & DTC Scan',
  diagnose: 'Diagnostic & DTC Scan',
  service: 'Scheduled Service',
  servicing: 'Scheduled Service',
  torque: 'Torque & Fastening',
  torquing: 'Torque & Fastening',
  repair: 'Repair & Overhaul',
  fix: 'Repair & Overhaul',
};

// Global Command Item Definition for CTRL + K
export interface GlobalSearchResultItem {
  id: string;
  category: 'vehicles' | 'repairs' | 'parts' | 'systems' | 'diagnostics' | 'maintenance' | 'DTC codes' | 'tools';
  title: string;
  subtitle: string;
  badge?: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * Natural language automotive search parser:
 * Detects Make, Model, Year, System, Component, Repair Action with typo tolerance.
 */
export function parseAndExecuteNaturalSearch(query: string): NaturalSearchParsedResult {
  const cleanQuery = query.toLowerCase().trim();
  const tokens = cleanQuery.split(/[\s,]+/);

  const detected: NaturalSearchParsedResult['detected'] = {};

  // 1. Detect 4-digit Year
  for (const token of tokens) {
    if (/^(19[89]\d|20[0-3]\d)$/.test(token)) {
      detected.year = parseInt(token, 10);
      break;
    }
  }

  // 2. Detect Make with fuzzy matching
  for (const token of tokens) {
    for (const make of MAKES) {
      if (fuzzySimilarity(token, make) >= 0.8) {
        detected.make = make.charAt(0).toUpperCase() + make.slice(1);
        break;
      }
    }
    if (detected.make) break;
  }

  // 3. Detect Model with fuzzy matching
  for (let i = 0; i < tokens.length; i++) {
    const single = tokens[i];
    const double = i < tokens.length - 1 ? `${tokens[i]} ${tokens[i + 1]}` : '';

    for (const [key, canonical] of Object.entries(MODELS)) {
      if (double && fuzzySimilarity(double, key) >= 0.8) {
        detected.model = canonical;
        break;
      }
      if (fuzzySimilarity(single, key) >= 0.8) {
        detected.model = canonical;
        break;
      }
    }
    if (detected.model) break;
  }

  // 4. Detect Component with fuzzy matching
  for (let i = 0; i < tokens.length; i++) {
    const single = tokens[i];
    const double = i < tokens.length - 1 ? `${tokens[i]} ${tokens[i + 1]}` : '';

    for (const [key, canonical] of Object.entries(COMPONENTS)) {
      if (double && (double === key || fuzzySimilarity(double, key) >= 0.85)) {
        detected.component = canonical;
        break;
      }
      if (single === key || fuzzySimilarity(single, key) >= 0.85) {
        detected.component = canonical;
        break;
      }
    }
    if (detected.component) break;
  }

  // 5. Detect System
  for (const token of tokens) {
    for (const [key, canonical] of Object.entries(SYSTEMS)) {
      if (fuzzySimilarity(token, key) >= 0.8) {
        detected.system = canonical;
        break;
      }
    }
    if (detected.system) break;
  }

  // 6. Detect Repair Action
  for (const token of tokens) {
    for (const [key, canonical] of Object.entries(REPAIR_ACTIONS)) {
      if (fuzzySimilarity(token, key) >= 0.8) {
        detected.repairAction = canonical;
        break;
      }
    }
    if (detected.repairAction) break;
  }

  // Find candidate vehicle from detected Make, Model, Year
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

  // If no exact match, fallback to vehicle whose make/model best matches the query
  if (!matchedVehicle) {
    let bestScore = 0;
    for (const vehicle of VEHICLE_PROFILES) {
      const vStr = `${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase();
      const sim = fuzzySimilarity(cleanQuery, vStr);
      if (sim > bestScore && sim > 0.4) {
        bestScore = sim;
        matchedVehicle = vehicle;
      }
    }
  }

  // Collect matching tasks
  const matchedTasks: KnownMaintenanceTask[] = [];
  const matchedFluids: { vehicle: VehicleProfileData; fluid: FluidSpec }[] = [];
  let matchedBattery: { vehicle: VehicleProfileData; battery: BatterySpec } | undefined = undefined;

  const targetVehicles = matchedVehicle ? [matchedVehicle] : VEHICLE_PROFILES;

  for (const v of targetVehicles) {
    // Check known tasks
    for (const task of v.knownMaintenanceTasks) {
      const taskText = `${task.title} ${task.component} ${task.system}`.toLowerCase();
      let match = false;
      if (detected.component && taskText.includes(detected.component.toLowerCase().split(' ')[0])) {
        match = true;
      }
      for (const t of tokens) {
        if (t.length > 2 && taskText.includes(t)) {
          match = true;
          break;
        }
      }
      if (match) {
        matchedTasks.push(task);
      }
    }

    // Check fluids
    for (const fluid of v.fluids) {
      const fText = `${fluid.name} ${fluid.spec} ${fluid.notes || ''}`.toLowerCase();
      if (
        (detected.component && detected.component.toLowerCase().includes('coolant') && fText.includes('coolant')) ||
        (detected.component && detected.component.toLowerCase().includes('oil') && fText.includes('oil')) ||
        tokens.some((t) => t.length > 3 && fText.includes(t))
      ) {
        matchedFluids.push({ vehicle: v, fluid });
      }
    }

    // Check battery
    if (
      (detected.component && detected.component.toLowerCase().includes('battery')) ||
      tokens.some((t) => t.includes('batter'))
    ) {
      matchedBattery = { vehicle: v, battery: v.battery };
    }
  }

  return {
    rawQuery: query,
    detected,
    matchedVehicle,
    matchedTasks,
    matchedFluids,
    matchedBattery,
    confidence: matchedVehicle ? 0.95 : 0.6,
  };
}

/**
 * Global Command Palette Search (CTRL + K)
 * Queries across:
 * - vehicles
 * - repairs
 * - parts
 * - systems
 * - diagnostics
 * - maintenance
 * - DTC codes
 * - tools
 */
export function executeGlobalSearch(query: string): GlobalSearchResultItem[] {
  if (!query || query.trim() === '') {
    // Return curated default suggestions
    return [
      {
        id: 'def-veh-1',
        category: 'vehicles',
        title: 'Toyota Camry 2018 (XV70) - 2.5L I4',
        subtitle: '8-speed Automatic • Dynamic Force 203 HP',
        badge: 'Vehicle Profile',
        score: 1.0,
      },
      {
        id: 'def-dtc-1',
        category: 'DTC codes',
        title: 'DTC P0171 - System Too Lean (Bank 1)',
        subtitle: 'Intake vacuum leak, fuel pressure & O2 sensor diagnostic tree',
        badge: 'Active Fault',
        score: 0.98,
      },
      {
        id: 'def-rep-1',
        category: 'repairs',
        title: 'Camry 12V Battery Replacement & ECU Reset',
        subtitle: 'Group 35 AGM / Flooded procedure & torque specs',
        badge: 'Factory Guide',
        score: 0.95,
      },
      {
        id: 'def-maint-1',
        category: 'maintenance',
        title: 'Ford F-150 Motorcraft Yellow Coolant Flush',
        subtitle: 'WSS-M97B57-A2 vacuum bleed procedure',
        badge: '100,000 mi Interval',
        score: 0.92,
      },
      {
        id: 'def-part-1',
        category: 'parts',
        title: 'Honda Civic 7443 Brake Light Bulb & Stop Switch',
        subtitle: 'OEM # 33303-SL4-003 / 36750-TBA-A01',
        badge: 'OEM Part',
        score: 0.9,
      },
      {
        id: 'def-tool-1',
        category: 'tools',
        title: 'Calibrated Torque Wrench (10 - 210 Nm)',
        subtitle: 'Wheel lug torque, caliper carrier & spark plug specs',
        badge: 'Workshop Tool',
        score: 0.88,
      },
      {
        id: 'def-diag-1',
        category: 'diagnostics',
        title: 'Live CAN-FD Bus Terminal Monitor',
        subtitle: 'ISO 15765-4 real-time hex stream & PID parser',
        badge: 'Scanner Tool',
        score: 0.86,
      },
      {
        id: 'def-sys-1',
        category: 'systems',
        title: 'Braking & ABS Hydraulic Subsystem',
        subtitle: 'CAN ID: 0x1A0 • 4-wheel pad wear & rotor telemetry',
        badge: 'Subsystem CAN',
        score: 0.85,
      },
    ];
  }

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/);
  const results: GlobalSearchResultItem[] = [];

  // 1. Search Vehicles
  for (const v of VEHICLE_PROFILES) {
    const vText = `${v.make} ${v.model} ${v.year} ${v.generation} ${v.engine} ${v.trim} ${v.transmission}`.toLowerCase();
    const score = fuzzySimilarity(q, vText);
    if (score > 0.3 || tokens.some((t) => vText.includes(t))) {
      results.push({
        id: `veh-${v.id}`,
        category: 'vehicles',
        title: `${v.make} ${v.model} ${v.year} (${v.generation})`,
        subtitle: `${v.engine} • ${v.horsepower} HP • ${v.transmission}`,
        badge: `${v.make} Profile`,
        score: score + 0.1,
        metadata: { vehicleId: v.id },
      });
    }
  }

  // 2. Search Repairs & Known Tasks
  for (const v of VEHICLE_PROFILES) {
    for (const task of v.knownMaintenanceTasks) {
      const taskText = `${task.title} ${task.component} ${task.system} ${v.make} ${v.model}`.toLowerCase();
      const score = fuzzySimilarity(q, taskText);
      if (score > 0.3 || tokens.some((t) => taskText.includes(t))) {
        results.push({
          id: `rep-${task.id}`,
          category: 'repairs',
          title: task.title,
          subtitle: `${v.year} ${v.make} ${v.model} • ${task.system} (${task.difficulty})`,
          badge: `${task.estimatedLaborHours}h Labor`,
          score: score + 0.15,
          metadata: { task, vehicle: v },
        });

        // 3. Search Parts inside tasks
        for (const p of task.recommendedParts) {
          const pText = `${p.name} ${p.oemNumber} ${task.component}`.toLowerCase();
          if (tokens.some((t) => pText.includes(t))) {
            results.push({
              id: `part-${p.oemNumber}`,
              category: 'parts',
              title: `${p.name} (OEM #${p.oemNumber})`,
              subtitle: `For ${v.make} ${v.model} • Est. Cost: ${p.avgCost}`,
              badge: 'OEM Part',
              score: 0.75,
              metadata: { part: p, vehicle: v },
            });
          }
        }
      }
    }
  }

  // 4. Search Fluids
  for (const v of VEHICLE_PROFILES) {
    for (const fluid of v.fluids) {
      const fText = `${fluid.name} ${fluid.spec} ${fluid.capacity} ${v.make} ${v.model}`.toLowerCase();
      if (tokens.some((t) => fText.includes(t))) {
        results.push({
          id: `fluid-${v.id}-${fluid.name}`,
          category: 'maintenance',
          title: `${v.make} ${v.model} ${fluid.name}: ${fluid.spec}`,
          subtitle: `Capacity: ${fluid.capacity} • Interval: ${fluid.serviceInterval}`,
          badge: 'Fluid Spec',
          score: 0.78,
          metadata: { fluid, vehicle: v },
        });
      }
    }
  }

  // 5. Search Systems
  const knownSystems = [
    { title: 'Powertrain & Engine Management', sub: 'CAN 1 • Fuel rail, Ignition timing, Boost', id: 'sys-powertrain' },
    { title: 'Transmission & Dual-Clutch / Automatic', sub: 'CAN ID: 0x488 • Clutch wear & Shift adaptation', id: 'sys-trans' },
    { title: 'Braking & ABS Control Module', sub: 'CAN ID: 0x1A0 • Rotor thickness, Friction pads', id: 'sys-brake' },
    { title: 'Thermal & Cooling Management', sub: 'CAN ID: 0x228 • Thermostat mapped open, Fan duty cycle', id: 'sys-cool' },
    { title: 'Electrical, Battery & Charging', sub: 'CAN ID: 0x3C4 • AGM SOC, Alternator, Parasitic draw', id: 'sys-elec' },
    { title: 'Lighting & Electronics Control', sub: 'CAN ID: 0x5E0 • Stop light switch, LED modules', id: 'sys-light' },
  ];
  for (const sys of knownSystems) {
    if (tokens.some((t) => sys.title.toLowerCase().includes(t) || sys.sub.toLowerCase().includes(t))) {
      results.push({
        id: sys.id,
        category: 'systems',
        title: sys.title,
        subtitle: sys.sub,
        badge: 'Subsystem CAN',
        score: 0.8,
      });
    }
  }

  // 6. Search DTC codes
  const dtcList = [
    { code: 'P0171', title: 'System Too Lean (Bank 1)', desc: 'Intake unmetered air leak, MAF or fuel pressure issue' },
    { code: 'P0300', title: 'Random/Multiple Cylinder Misfire Detected', desc: 'Spark plugs, ignition coils or low fuel pressure' },
    { code: 'P0420', title: 'Catalyst System Efficiency Below Threshold (Bank 1)', desc: 'Pre/post O2 sensor or catalytic converter' },
    { code: 'P2681', title: 'Engine Coolant Bypass Valve Control Circuit Open', desc: 'Thermostat bypass valve actuator circuit' },
    { code: 'P0016', title: 'Crankshaft Position - Camshaft Position Correlation Bank 1', desc: 'VCT Cam phasers or stretched chain' },
  ];
  for (const dtc of dtcList) {
    if (
      q.includes(dtc.code.toLowerCase()) ||
      tokens.some((t) => dtc.title.toLowerCase().includes(t) || dtc.code.toLowerCase().includes(t))
    ) {
      results.push({
        id: `dtc-${dtc.code}`,
        category: 'DTC codes',
        title: `DTC ${dtc.code}: ${dtc.title}`,
        subtitle: dtc.desc,
        badge: 'DTC Fault',
        score: 0.95,
        metadata: { dtc },
      });
    }
  }

  // 7. Search Diagnostics & Tools
  const toolsList = [
    { name: 'Pneumatic Brake Bleeder Kit (2.0 Bar)', desc: 'Pressure bleed sequence for ABS master cylinders', cat: 'tools' },
    { name: 'Digital Smoke Leak Detector (0.8 Bar)', desc: 'Pinpoint intake plenum & vacuum line leaks', cat: 'diagnostics' },
    { name: '14mm Magnetic Thin-Wall Swivel Spark Plug Socket', desc: 'Boxer & V6 cylinder head plug extraction', cat: 'tools' },
    { name: 'Battery Conductance Analyzer & CCA Tester', desc: 'Measures internal resistance (mΩ) and Cold Cranking Amps', cat: 'diagnostics' },
    { name: '36mm Low-Profile Oil Filter Socket', desc: 'Toyota & German cartridge filter canisters (25 Nm)', cat: 'tools' },
  ];
  for (const tl of toolsList) {
    if (tokens.some((t) => tl.name.toLowerCase().includes(t) || tl.desc.toLowerCase().includes(t))) {
      results.push({
        id: `tl-${tl.name}`,
        category: tl.cat as any,
        title: tl.name,
        subtitle: tl.desc,
        badge: tl.cat === 'tools' ? 'Workshop Tool' : 'Diagnostic Tool',
        score: 0.82,
      });
    }
  }

  // Sort by score descending and return top 20
  return results.sort((a, b) => b.score - a.score).slice(0, 20);
}
