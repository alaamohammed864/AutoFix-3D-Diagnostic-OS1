// AutoFix 3D - Enterprise Admin Data Repository & State Engine
// Manages 16 sections with Provenance, Data Quality classification, and Admin operations

import {
  AdminSection,
  BaseAdminRecord,
  DataQualitySummary,
  QualityStatus,
  RecordProvenance,
  AdminVehicleRecord,
  AdminManufacturerRecord,
  AdminModelRecord,
  AdminEngineRecord,
  AdminSystemRecord,
  AdminComponentRecord,
  AdminRepairRecord,
  AdminDiagnosticRecord,
  AdminDtcRecord,
  AdminMaintenanceRecord,
  AdminVideoRecord,
  AdminSourceRecord,
  AdminImportRecord,
  AdminUserRecord,
  AdminReportRecord,
  AdminSystemHealthMetric,
} from './types';
import {
  createInitialProvenance,
  appendProvenanceHistory,
  validateRecordQuality,
} from './provenanceHelper';

const STORAGE_KEY = 'autofix_admin_store_v1';

// Seed Generators
function buildSeedData(): Record<AdminSection, BaseAdminRecord[]> {
  const porscheVin = 'WP0AB2A99NS264091';
  const toyotaVin = '4T1B11HK5JU123456';
  const bmwVin = 'WBA5R1C59KFG12044';

  const vehicles: AdminVehicleRecord[] = [
    {
      id: 'veh_01',
      title: '2022 Porsche 911 Carrera S (992)',
      make: 'Porsche',
      model: '911 Carrera S',
      year: 2022,
      vin: porscheVin,
      generation: '992',
      trim: 'Carrera S Coupe',
      bodyStyle: 'Coupe 2-Door',
      engineCode: 'MDG.GA 3.0L Twin-Turbo',
      powertrain: 'Rear-Engine Twin-Turbo Flat-6',
      drivetrain: 'RWD',
      transmission: '8-Speed Porsche Doppelkupplung (PDK)',
      curbWeightLbs: 3382,
      status: 'Active',
      createdAt: '2026-01-15T08:00:00Z',
      updatedAt: '2026-08-10T14:30:00Z',
      provenance: createInitialProvenance('Porsche PIWIS Technical Data', 'Verified', {
        sourceUrl: 'https://techinfo2.porsche.com/piwis',
        importedBy: 'Senior Telemetry Ingest',
        confidenceScore: 99,
      }),
    },
    {
      id: 'veh_02',
      title: '2018 Toyota Camry SE (XV70)',
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      vin: toyotaVin,
      generation: 'XV70',
      trim: 'SE Sport',
      bodyStyle: 'Sedan 4-Door',
      engineCode: 'A25A-FKS Dynamic Force',
      powertrain: 'Front-Transverse 2.5L I4 D-4S',
      drivetrain: 'FWD',
      transmission: 'Direct-Shift 8-Speed Automatic (UB80E)',
      curbWeightLbs: 3340,
      status: 'Active',
      createdAt: '2026-01-18T09:00:00Z',
      updatedAt: '2026-08-12T11:00:00Z',
      provenance: createInitialProvenance('Toyota TIS Technical Information', 'Verified', {
        sourceUrl: 'https://techinfo.toyota.com',
        importedBy: 'Batch Service Agent',
        confidenceScore: 96,
      }),
    },
    {
      id: 'veh_03',
      title: '2020 BMW 330i xDrive (G20)',
      make: 'BMW',
      model: '330i xDrive',
      year: 2020,
      vin: bmwVin,
      generation: 'G20',
      trim: 'M Sport Edition',
      bodyStyle: 'Sedan 4-Door',
      engineCode: 'B48B20 2.0L Turbo',
      powertrain: 'Front Longitudinal Turbo I4',
      drivetrain: 'AWD',
      transmission: 'ZF 8HP51 Steptronic 8-Speed',
      curbWeightLbs: 3764,
      status: 'Active',
      createdAt: '2026-02-01T12:00:00Z',
      updatedAt: '2026-08-14T09:15:00Z',
      provenance: createInitialProvenance('BMW AIR Diagnostics Portal', 'Verified', {
        sourceUrl: 'https://bmw-air.corp.bmw/tech',
        importedBy: 'Workshop Lead Tech',
        confidenceScore: 94,
      }),
    },
    {
      id: 'veh_04',
      title: '2019 Toyota Camry SE [RAW INGESTION]',
      make: 'Toyota',
      model: 'Camry',
      year: 2019,
      vin: '4T1B11HK5KU889912',
      generation: 'XV70',
      trim: 'SE Sport',
      status: 'Active',
      createdAt: '2026-07-20T10:00:00Z',
      updatedAt: '2026-07-20T10:00:00Z',
      provenance: createInitialProvenance('CarCareKiosk Scrape Feed', 'Unverified', {
        sourceUrl: 'https://carcarekiosk.com/feed/toyota-camry-2019',
        importedBy: 'Web Harvester Bot',
        confidenceScore: 68,
        qualityIssues: ['Unverified engine displacement', 'Missing torque specs'],
      }),
    },
    {
      id: 'veh_05',
      title: '2018 Toyota Camry (Duplicate Candidate)',
      make: 'Toyota',
      model: 'Camry',
      year: 2018,
      vin: toyotaVin, // Matching VIN!
      status: 'Active',
      createdAt: '2026-08-01T16:00:00Z',
      updatedAt: '2026-08-01T16:00:00Z',
      provenance: {
        ...createInitialProvenance('Aftermarket Parts Depot', 'Duplicate', {
          sourceUrl: 'https://aftermarket-parts.example.com/item/3301',
          confidenceScore: 60,
          qualityIssues: ['Exact VIN collision with veh_02'],
        }),
        duplicateOf: 'veh_02',
      },
    },
    {
      id: 'veh_06',
      title: 'Legacy Fleet Chassis Prototype',
      make: 'Unknown OEM',
      model: 'Concept Testbed',
      year: 0, // Missing
      status: 'Disabled',
      createdAt: '2026-08-05T08:00:00Z',
      updatedAt: '2026-08-05T08:00:00Z',
      provenance: createInitialProvenance('Internal Workshop Scratchpad', 'Missing Data', {
        importedBy: 'Junior Tech',
        confidenceScore: 35,
        qualityIssues: ['Vehicle year missing', 'No VIN allocated', 'Missing powertrain spec'],
      }),
    },
  ];

  const manufacturers: AdminManufacturerRecord[] = [
    {
      id: 'mfg_porsche',
      title: 'Dr. Ing. h.c. F. Porsche AG',
      name: 'Porsche AG',
      country: 'Germany',
      foundedYear: 1931,
      headquarters: 'Stuttgart, Baden-Württemberg',
      parentCompany: 'Volkswagen Group',
      oemPortalUrl: 'https://techinfo2.porsche.com',
      apiSupportStatus: 'Active',
      vehiclesCount: 14,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('OEM Corporate Directory', 'Verified', {
        sourceUrl: 'https://porsche.com/corporate',
        confidenceScore: 100,
      }),
    },
    {
      id: 'mfg_toyota',
      title: 'Toyota Motor Corporation',
      name: 'Toyota Motor Corp',
      country: 'Japan',
      foundedYear: 1937,
      headquarters: 'Toyota City, Aichi Prefecture',
      parentCompany: 'Toyota Group',
      oemPortalUrl: 'https://techinfo.toyota.com',
      apiSupportStatus: 'Active',
      vehiclesCount: 42,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('Toyota Global Registry', 'Verified', {
        confidenceScore: 100,
      }),
    },
    {
      id: 'mfg_bmw',
      title: 'Bayerische Motoren Werke AG',
      name: 'BMW AG',
      country: 'Germany',
      foundedYear: 1916,
      headquarters: 'Munich, Bavaria',
      oemPortalUrl: 'https://bmw-air.corp.bmw',
      apiSupportStatus: 'Active',
      vehiclesCount: 28,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('BMW Tech Information Network', 'Verified', {
        confidenceScore: 98,
      }),
    },
    {
      id: 'mfg_byton',
      title: 'Byton Automotive EV',
      name: 'Byton',
      country: 'China',
      foundedYear: 2017,
      headquarters: 'Nanjing',
      apiSupportStatus: 'Offline',
      vehiclesCount: 1,
      status: 'Disabled',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
      provenance: createInitialProvenance('EV Industry Directory', 'Needs Review', {
        confidenceScore: 72,
        qualityIssues: ['Company operations restructured; API portal offline'],
      }),
    },
  ];

  const models: AdminModelRecord[] = [
    {
      id: 'mod_911',
      title: 'Porsche 911 Series',
      manufacturer: 'Porsche AG',
      modelName: '911',
      chassisCode: '992',
      marketSegment: 'High-Performance Sports Car',
      productionStartYear: 2019,
      productionEndYear: 'Present',
      supportedGenerations: ['992.1', '992.2 Hybrid', '991.2 Legacy'],
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Porsche Catalog System', 'Verified'),
    },
    {
      id: 'mod_camry',
      title: 'Toyota Camry',
      manufacturer: 'Toyota Motor Corp',
      modelName: 'Camry',
      chassisCode: 'XV70',
      marketSegment: 'Mid-size Executive Sedan',
      productionStartYear: 2017,
      productionEndYear: 2024,
      supportedGenerations: ['XV70', 'XV80 Next-Gen'],
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Toyota Product Planning', 'Verified'),
    },
    {
      id: 'mod_3series',
      title: 'BMW 3-Series',
      manufacturer: 'BMW AG',
      modelName: '3-Series',
      chassisCode: 'G20',
      marketSegment: 'Compact Executive Sports Sedan',
      productionStartYear: 2018,
      productionEndYear: 'Present',
      supportedGenerations: ['G20 Pre-LCI', 'G20 LCI'],
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('BMW KSD Technical Catalog', 'Verified'),
    },
  ];

  const engines: AdminEngineRecord[] = [
    {
      id: 'eng_mdg_ga',
      title: 'Porsche MDG.GA 3.0L Boxer Twin-Turbo',
      engineCode: 'MDG.GA',
      manufacturer: 'Porsche AG',
      displacementLiters: 3.0,
      cylinderConfig: 'Flat-6 (Boxer)',
      aspiration: 'Twin Turbo',
      horsepower: 443,
      torqueLbFt: 390,
      fuelSystem: 'Direct Fuel Injection (DFI) Piezo with Central Injector',
      compressionRatio: '10.2:1',
      oilViscositySpec: '0W-40 Porsche A40/C40 Synthetic',
      status: 'Active',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-07-22T00:00:00Z',
      provenance: createInitialProvenance('Porsche Powertrain Specification', 'Verified'),
    },
    {
      id: 'eng_a25a',
      title: 'Toyota A25A-FKS Dynamic Force 2.5L',
      engineCode: 'A25A-FKS',
      manufacturer: 'Toyota Motor Corp',
      displacementLiters: 2.5,
      cylinderConfig: 'Inline-4',
      aspiration: 'Naturally Aspirated',
      horsepower: 203,
      torqueLbFt: 184,
      fuelSystem: 'D-4S Dual Direct and Port Injection with VVT-iE',
      compressionRatio: '13.0:1',
      oilViscositySpec: '0W-16 ILSAC GF-6B',
      status: 'Active',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-07-22T00:00:00Z',
      provenance: createInitialProvenance('Toyota Global Powertrain DB', 'Verified'),
    },
    {
      id: 'eng_b58',
      title: 'BMW B58B30M1 3.0L TwinPower Turbo',
      engineCode: 'B58B30M1',
      manufacturer: 'BMW AG',
      displacementLiters: 3.0,
      cylinderConfig: 'Inline-6',
      aspiration: 'Single Turbo',
      horsepower: 382,
      torqueLbFt: 369,
      fuelSystem: 'High-Precision Direct Injection (350 bar) with Valvetronic',
      compressionRatio: '11.0:1',
      oilViscositySpec: '0W-30 BMW Longlife-01 FE',
      status: 'Active',
      createdAt: '2026-01-15T00:00:00Z',
      updatedAt: '2026-07-22T00:00:00Z',
      provenance: createInitialProvenance('BMW Engine Architecture Dept', 'Verified'),
    },
  ];

  const systems: AdminSystemRecord[] = [
    {
      id: 'sys_powertrain',
      title: 'Powertrain & Engine Management',
      systemCode: 'POWERTRAIN',
      name: 'Engine & Transmission Calibration',
      criticalityLevel: 'Safety Critical',
      subsystemsCount: 8,
      ecuNetworkBus: 'CAN-FD',
      leadSensorType: 'Bosch Wideband UEGO O2 & Knock Sensors',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('ISO 26262 Functional Safety Registry', 'Verified'),
    },
    {
      id: 'sys_braking',
      title: 'Electro-Hydraulic Braking & ABS/ESC',
      systemCode: 'BRAKING_ESC',
      name: 'Active Braking & Dynamic Stability',
      criticalityLevel: 'Safety Critical',
      subsystemsCount: 4,
      ecuNetworkBus: 'FlexRay',
      leadSensorType: 'Active Hall-Effect Wheel Speed Sensors (4-Channel)',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('Bosch ESP 9.3 Chassis Systems', 'Verified'),
    },
    {
      id: 'sys_thermal',
      title: 'Thermal Management & Cooling Circuit',
      systemCode: 'THERMAL_COOLING',
      name: 'Engine & Intercooler Thermal Regulators',
      criticalityLevel: 'High',
      subsystemsCount: 5,
      ecuNetworkBus: 'LIN',
      leadSensorType: 'Dual NTC Coolant Temperature Transducers',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('Denso Thermal Systems Blueprint', 'Verified'),
    },
    {
      id: 'sys_electrical',
      title: 'Low-Voltage Electrical & LIN Bus',
      systemCode: 'ELECTRICAL_LV',
      name: 'Power Distribution & Gateway Network',
      criticalityLevel: 'High',
      subsystemsCount: 12,
      ecuNetworkBus: 'CAN-High',
      leadSensorType: 'Intelligent Battery Sensor (IBS)',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('Continental Automotive Network Spec', 'Verified'),
    },
  ];

  const components: AdminComponentRecord[] = [
    {
      id: 'cmp_maf_01',
      title: 'Hot-Film Mass Air Flow (MAF) Sensor',
      componentName: 'MAF Sensor Assembly',
      system: 'POWERTRAIN',
      subsystem: 'Air Induction',
      oemPartNumber: '22204-75030',
      alternatePartNumbers: ['197400-2000', 'AF10141'],
      voltageRating: '12V / 0-5V Signal',
      pinCount: 5,
      operatingTempRange: '-40°C to +125°C',
      failureRateCategory: 'Common',
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Denso Aftermarket OEM Specs', 'Verified'),
    },
    {
      id: 'cmp_o2_upstream',
      title: 'Air-Fuel Ratio (A/F) Upstream Sensor Bank 1',
      componentName: 'Wideband Oxygen Sensor',
      system: 'POWERTRAIN',
      subsystem: 'Exhaust & Emissions',
      oemPartNumber: '89467-33200',
      voltageRating: '12V Heated / 3.3V Core',
      pinCount: 4,
      failureRateCategory: 'Moderate',
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Toyota Parts Master Catalog', 'Verified'),
    },
    {
      id: 'cmp_spark_iridium',
      title: 'Iridium Long-Life Spark Plug (Set of 4)',
      componentName: 'Ignition Spark Plug',
      system: 'POWERTRAIN',
      subsystem: 'Ignition Secondary',
      oemPartNumber: 'FC16HR-Q8',
      alternatePartNumbers: ['90919-01275'],
      failureRateCategory: 'Moderate',
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Denso OEM Ignition Manual', 'Verified'),
    },
    {
      id: 'cmp_abs_pump',
      title: 'ESC Hydraulic Modulator Unit & Valve Block',
      componentName: 'ABS Pump Assembly',
      system: 'BRAKING_ESC',
      subsystem: 'Hydraulic Actuation',
      oemPartNumber: '44510-06280',
      failureRateCategory: 'Rare',
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Advics Brake Engineering', 'Verified'),
    },
  ];

  const repairs: AdminRepairRecord[] = [
    {
      id: 'rep_spark_replace',
      title: 'A25A-FKS Spark Plug Replacement & Coil Inspection',
      procedureCode: 'PROC-IGN-001',
      category: 'Ignition & Tune-Up',
      applicableVehicle: 'Toyota Camry 2018-2024 (A25A-FKS 2.5L)',
      difficulty: 'Intermediate',
      estimatedMinutes: 45,
      requiredTools: ['14mm Thin-Wall Magnetic Spark Plug Socket', '3/8" Digital Torque Wrench', '0.8mm Wire Feeler Gauge'],
      torqueSpecsSummary: 'Ignition Coil Bolt: 10 Nm (89 in-lbs); Spark Plug: 17 Nm (12.5 ft-lbs)',
      stepsCount: 7,
      status: 'Active',
      createdAt: '2026-01-12T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
      provenance: createInitialProvenance('Toyota Factory Repair Manual', 'Verified'),
    },
    {
      id: 'rep_brake_bleed',
      title: 'Two-Person Hydraulic Brake Fluid Flush & ABS Cycle',
      procedureCode: 'PROC-BRK-004',
      category: 'Braking Hydraulics',
      applicableVehicle: 'Universal Hydraulic Vehicles (DOT 4 / LV)',
      difficulty: 'Intermediate',
      estimatedMinutes: 60,
      requiredTools: ['10mm Flare Nut Wrench', 'Bleeder Catch Bottle with One-Way Valve', 'Scan Tool for ABS Actuator Bleed Mode'],
      torqueSpecsSummary: 'Bleeder Screw: 8.5 Nm (75 in-lbs)',
      stepsCount: 9,
      status: 'Active',
      createdAt: '2026-01-12T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
      provenance: createInitialProvenance('Alldata Pro Automotive Tech Series', 'Verified'),
    },
    {
      id: 'rep_pdk_fluid',
      title: 'Porsche 992 PDK Dual-Clutch Gearbox Fluid Service',
      procedureCode: 'PROC-PDK-009',
      category: 'Drivetrain & Transmission',
      applicableVehicle: 'Porsche 911 992 (Carrera, S, 4S, GTS)',
      difficulty: 'Master Tech',
      estimatedMinutes: 120,
      requiredTools: ['PIWIS III Diagnostic Tester', 'Fluid Filling Adapter VAS 6262A', 'Infrared Thermometer'],
      torqueSpecsSummary: 'Transmission Drain Plug: 30 Nm; Level Check Plug: 18 Nm',
      stepsCount: 14,
      status: 'Active',
      createdAt: '2026-01-12T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
      provenance: createInitialProvenance('Porsche Workshop Service Information (POSES)', 'Verified'),
    },
  ];

  const diagnostics: AdminDiagnosticRecord[] = [
    {
      id: 'diag_p0171_tree',
      title: 'System Too Lean (Bank 1) Guided Diagnostic Tree',
      testId: 'DIAG-TREE-P0171',
      symptom: 'Check Engine Light (MIL), Rough Idle, Hesitation under Load',
      targetSystem: 'POWERTRAIN (Fuel Trim & Air Induction)',
      testProtocol: 'CAN Live PID',
      expectedParameters: 'LTFT between -8% and +8%; STFT rapid oscillation around 0%',
      failureThreshold: 'LTFT > +25.0% or Total Fuel Trim > +35.0%',
      nextStepsIfFault: 'Perform Smoke Test on Intake Manifold; Inspect PCV Valve Diaphragm; Log MAF g/s at WOT Redline',
      status: 'Active',
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-08-15T00:00:00Z',
      provenance: createInitialProvenance('ASE Master Diagnostic Guide', 'Verified'),
    },
    {
      id: 'diag_c1201_tree',
      title: 'Engine Control System Malfunction Inter-ECU Handshake',
      testId: 'DIAG-TREE-C1201',
      symptom: 'VSC / TRAC OFF Indicator illuminated with ABS Warning',
      targetSystem: 'BRAKING_ESC (ECU Gateway Cross-Talk)',
      testProtocol: 'OBD-II Mode 06',
      expectedParameters: 'ECM to Skid Control ECU heartbeat frame latency < 20ms',
      failureThreshold: 'ECM reporting active emissions DTC or heartbeat frame timeout > 200ms',
      nextStepsIfFault: 'Clear ECM faults first; recalibrate Zero-Point Steering Angle Sensor',
      status: 'Active',
      createdAt: '2026-01-20T00:00:00Z',
      updatedAt: '2026-08-15T00:00:00Z',
      provenance: createInitialProvenance('Toyota ABS/VSC Diagnostic Handbook', 'Verified'),
    },
  ];

  const dtc: AdminDtcRecord[] = [
    {
      id: 'dtc_p0300',
      title: 'P0300: Random / Multiple Cylinder Misfire Detected',
      code: 'P0300',
      standard: 'SAE J2012',
      system: 'POWERTRAIN',
      subsystem: 'Ignition & Combustion Quality',
      severity: 'CRITICAL',
      milStatus: 'Active Immediate',
      recommendedAction: 'Check secondary ignition coils, fuel delivery pressure, and vacuum leaks',
      freezeFrameRequired: true,
      status: 'Active',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('SAE International Standards J2012_201612', 'Verified'),
    },
    {
      id: 'dtc_p0171',
      title: 'P0171: System Too Lean (Bank 1)',
      code: 'P0171',
      standard: 'SAE J2012',
      system: 'POWERTRAIN',
      subsystem: 'Air-Fuel Metering',
      severity: 'MODERATE',
      milStatus: 'Pending 2-Trip',
      recommendedAction: 'Inspect intake boot tear, dirty MAF sensor, low fuel rail pressure, or PCV leak',
      freezeFrameRequired: true,
      status: 'Active',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('OBD-II Community Verified Telemetry', 'Verified'),
    },
    {
      id: 'dtc_c1201',
      title: 'C1201: Engine Control System Malfunction / Fail-Safe Request',
      code: 'C1201',
      standard: 'OEM Manufacturer Proprietary',
      system: 'CHASSIS',
      subsystem: 'Braking & VSC Stability Gateway',
      severity: 'MODERATE',
      milStatus: 'Active Immediate',
      recommendedAction: 'Retrieve primary ECM trouble codes before servicing ABS/VSC hardware',
      freezeFrameRequired: false,
      status: 'Active',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Toyota OEM Chassis Codes', 'Verified'),
    },
    {
      id: 'dtc_u0100',
      title: 'U0100: Lost Communication With ECM/PCM "A"',
      code: 'U0100',
      standard: 'SAE J2012',
      system: 'NETWORK',
      subsystem: 'CAN-Bus Backbone Communication',
      severity: 'CRITICAL',
      milStatus: 'Active Immediate',
      recommendedAction: 'Measure CAN-H to CAN-L termination resistance (nominal 60 Ohms across bus)',
      freezeFrameRequired: true,
      status: 'Active',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('Bosch Automotive CAN Specification', 'Verified'),
    },
  ];

  const maintenance: AdminMaintenanceRecord[] = [
    {
      id: 'maint_oil_10k',
      title: 'Engine Oil & Filter Service (10,000 Miles / 12 Months)',
      scheduleCode: 'MAINT-ENG-OIL-10K',
      applicableModel: 'Toyota Camry A25A-FKS 2.5L',
      mileageInterval: 10000,
      monthInterval: 12,
      serviceCategory: 'Engine Lubrication',
      inspectOrReplace: 'Replace',
      fluidSpecification: '0W-16 Synthetic Oil (4.8 Quarts / 4.5 Liters with filter)',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('Toyota Warranty & Maintenance Guide', 'Verified'),
    },
    {
      id: 'maint_brake_fluid_2yr',
      title: 'Brake Fluid Replacement & Hydraulic Flush (24 Months)',
      scheduleCode: 'MAINT-BRK-FLUID-2Y',
      applicableModel: 'Universal Porsche / Toyota / BMW',
      mileageInterval: 30000,
      monthInterval: 24,
      serviceCategory: 'Brake Hydraulics',
      inspectOrReplace: 'Flush & Bleed',
      fluidSpecification: 'DOT 4 High-Boiling Low-Viscosity (Dry BP > 265°C)',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('Porsche Maintenance Schedule', 'Verified'),
    },
    {
      id: 'maint_spark_100k',
      title: 'Iridium Spark Plug Replacement (100,000 Miles)',
      scheduleCode: 'MAINT-IGN-SPARK-100K',
      applicableModel: 'Toyota Camry 2.5L',
      mileageInterval: 100000,
      monthInterval: 120,
      serviceCategory: 'Ignition',
      inspectOrReplace: 'Replace',
      fluidSpecification: 'Denso FC16HR-Q8 (0.8mm factory pre-gapped)',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-06-01T00:00:00Z',
      provenance: createInitialProvenance('OEM Service Interval Table', 'Verified'),
    },
  ];

  const videos: AdminVideoRecord[] = [
    {
      id: 'vid_camry_battery',
      title: 'How to Replace 12V Battery in 2018-2024 Toyota Camry',
      videoTitle: 'Toyota Camry 12V Battery Step-by-Step Replacement',
      provider: 'CarCareKiosk',
      videoUrl: 'https://www.carcarekiosk.com/video/2018_Toyota_Camry_SE_2.5L_4_Cyl./battery/replace_battery',
      durationSeconds: 245,
      associatedProcedureId: 'rep_battery_replace',
      vehicleApplicability: 'Toyota Camry XV70 2018-2024',
      resolution: '1080p',
      hasSubtitles: true,
      status: 'Active',
      createdAt: '2026-02-10T00:00:00Z',
      updatedAt: '2026-08-01T00:00:00Z',
      provenance: createInitialProvenance('CarCareKiosk Video CDN', 'Verified'),
    },
    {
      id: 'vid_porsche_pdk',
      title: 'Porsche 992 PDK Filter & Clutch Calibration Guide',
      videoTitle: 'Porsche 992 Transmission Service Masterclass',
      provider: 'AutoFix Internal Studio',
      videoUrl: 'https://cdn.autofix.internal/media/videos/porsche_992_pdk_calibration.mp4',
      durationSeconds: 780,
      associatedProcedureId: 'rep_pdk_fluid',
      vehicleApplicability: 'Porsche 911 992 Carrera / Turbo',
      resolution: '4K',
      hasSubtitles: true,
      status: 'Active',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-08-05T00:00:00Z',
      provenance: createInitialProvenance('AutoFix Internal Studio Lab', 'Verified'),
    },
  ];

  const sources: AdminSourceRecord[] = [
    {
      id: 'src_oem_portal',
      title: 'OEM Tier 1 Technical Data Feeds',
      sourceName: 'OEM Direct Gateway (Porsche / Toyota / BMW)',
      category: 'OEM Technical Data',
      endpointUrl: 'https://api.oem-telemetry.internal/v1',
      syncFrequency: 'Daily',
      recordsSuppliedCount: 1420,
      apiHealthStatus: 'Healthy',
      confidenceRating: 99,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
      provenance: createInitialProvenance('ISO 20078 Extended Vehicle API', 'Verified'),
    },
    {
      id: 'src_carcarekiosk',
      title: 'CarCareKiosk Automotive Video & DIY Index',
      sourceName: 'CarCareKiosk Ingestion Hub',
      category: 'Third-Party Aftermarket',
      endpointUrl: 'https://api.carcarekiosk.com/v2/integration',
      syncFrequency: 'Weekly',
      recordsSuppliedCount: 385,
      apiHealthStatus: 'Healthy',
      confidenceRating: 92,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
      provenance: createInitialProvenance('CarCareKiosk Partner API', 'Verified'),
    },
    {
      id: 'src_nhtsa',
      title: 'NHTSA Recalls & Safety Bulletins',
      sourceName: 'US NHTSA VPIC Vehicle API',
      category: 'Government Safety',
      endpointUrl: 'https://vpic.nhtsa.dot.gov/api',
      syncFrequency: 'Daily',
      recordsSuppliedCount: 890,
      apiHealthStatus: 'Healthy',
      confidenceRating: 98,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-08-20T00:00:00Z',
      provenance: createInitialProvenance('US DOT NHTSA Open Data', 'Verified'),
    },
  ];

  const imports: AdminImportRecord[] = [
    {
      id: 'imp_2026_09',
      title: 'Batch Sync: Toyota XV70 Service Procedures',
      jobId: 'JOB-SYNC-9014',
      sourceProvider: 'Toyota TIS Official Feed',
      importedEntityType: 'Repairs & DTC',
      recordsCount: 128,
      validCount: 124,
      errorsCount: 2,
      duplicatesCount: 2,
      executionDurationMs: 1420,
      statusText: 'Completed',
      status: 'Active',
      createdAt: '2026-09-01T03:00:00Z',
      updatedAt: '2026-09-01T03:02:22Z',
      provenance: createInitialProvenance('Automated Nightly Worker', 'Verified'),
    },
    {
      id: 'imp_2026_08',
      title: 'CarCareKiosk Media Catalog Ingestion',
      jobId: 'JOB-SYNC-8841',
      sourceProvider: 'CarCareKiosk Adapter',
      importedEntityType: 'Instructional Videos',
      recordsCount: 45,
      validCount: 42,
      errorsCount: 1,
      duplicatesCount: 2,
      executionDurationMs: 860,
      statusText: 'Completed',
      status: 'Active',
      createdAt: '2026-08-28T04:00:00Z',
      updatedAt: '2026-08-28T04:01:26Z',
      provenance: createInitialProvenance('CarCareKiosk Sync Worker', 'Verified'),
    },
  ];

  const users: AdminUserRecord[] = [
    {
      id: 'usr_admin_005',
      title: 'System Security Administrator',
      fullName: 'System Security Administrator',
      email: 'admin.root@autofix.internal',
      role: 'Administrator',
      workshopAffiliation: 'Central Engineering & Governance',
      activeSessions: 2,
      lastLoginAt: '2026-09-12T08:09:45Z',
      permissionsList: ['*'],
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-09-12T08:09:45Z',
      provenance: createInitialProvenance('Internal User Directory', 'Verified'),
    },
    {
      id: 'usr_mgr_004',
      title: 'Sarah Jenkins (Workshop Supervisor)',
      fullName: 'Sarah Jenkins',
      email: 'manager.sarah@autofix.internal',
      role: 'Workshop Manager',
      workshopAffiliation: 'Riyadh Flagship Service Center',
      activeSessions: 1,
      lastLoginAt: '2026-09-11T16:20:00Z',
      permissionsList: ['reports:view', 'audit:view', 'repairs:assign', 'dtc:clear'],
      status: 'Active',
      createdAt: '2026-01-10T00:00:00Z',
      updatedAt: '2026-09-11T16:20:00Z',
      provenance: createInitialProvenance('Internal User Directory', 'Verified'),
    },
    {
      id: 'usr_tech_003',
      title: 'Eng. Aala Mohammed (Lead Architect & Master Tech)',
      fullName: 'Eng. Aala Mohammed',
      email: 'tech.aala@autofix.internal',
      role: 'Mechanic',
      workshopAffiliation: 'Riyadh Flagship Service Center',
      activeSessions: 1,
      lastLoginAt: '2026-09-12T07:14:00Z',
      permissionsList: ['dtc:clear', 'repairs:execute', 'telemetry:live', 'tools:torque'],
      status: 'Active',
      createdAt: '2026-01-12T00:00:00Z',
      updatedAt: '2026-09-12T07:14:00Z',
      provenance: createInitialProvenance('Internal User Directory', 'Verified'),
    },
    {
      id: 'usr_suspended_99',
      title: 'Terminated Contractor Account',
      fullName: 'Temporary Ingestion Bot User',
      email: 'bot.contractor@autofix.internal',
      role: 'User',
      workshopAffiliation: 'External Contractor',
      activeSessions: 0,
      lastLoginAt: '2026-06-15T12:00:00Z',
      permissionsList: ['vehicles:view_public'],
      status: 'Disabled',
      createdAt: '2026-05-01T00:00:00Z',
      updatedAt: '2026-06-20T00:00:00Z',
      provenance: createInitialProvenance('Internal User Directory', 'Needs Review', {
        qualityIssues: ['Account revoked due to contractor rotation'],
      }),
    },
  ];

  const reports: AdminReportRecord[] = [
    {
      id: 'rep_quality_aug26',
      title: 'Automotive Data Cleanliness & Integrity Audit - August 2026',
      reportTitle: 'Monthly Data Cleanliness & Quality Audit',
      reportType: 'Data Quality Audit',
      generatedBy: 'System Security Administrator',
      format: 'PDF',
      metricsSummary: '94.2% verified accuracy; 2 duplicates isolated; 0 security breaches',
      status: 'Active',
      createdAt: '2026-09-01T08:00:00Z',
      updatedAt: '2026-09-01T08:00:00Z',
      provenance: createInitialProvenance('Governance Engine', 'Verified'),
    },
    {
      id: 'rep_dtc_heatmap',
      title: 'Diagnostic Trouble Code Prevalence across Fleet Models',
      reportTitle: 'Fleet DTC Heatmap & Failure Rate Index',
      reportType: 'DTC Incidence Heatmap',
      generatedBy: 'Sarah Jenkins',
      format: 'CSV',
      metricsSummary: 'Top code: P0171 (Lean Bank 1, 41% of incidents); P0300 (22%)',
      status: 'Active',
      createdAt: '2026-09-05T10:00:00Z',
      updatedAt: '2026-09-05T10:00:00Z',
      provenance: createInitialProvenance('Telemetry Analytics Engine', 'Verified'),
    },
  ];

  const systemHealth: AdminSystemHealthMetric[] = [
    {
      id: 'hlth_gateway',
      title: 'Automotive OBD-II Gateway & CAN Ingress Node',
      serviceName: 'CAN-Bus Gateway Core',
      subsystemNode: 'node-can-primary.eu-west',
      uptimePercentage: 99.98,
      latencyMs: 12,
      statusIndicator: 'Healthy',
      lastHealthCheck: new Date().toISOString(),
      details: 'All socket connections stable at 20Hz refresh rate',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-09-12T08:00:00Z',
      provenance: createInitialProvenance('System Monitoring Daemon', 'Verified'),
    },
    {
      id: 'hlth_rbac_service',
      title: 'Authentication & Server-Enforced RBAC Middleware',
      serviceName: 'JWT & RBAC Police Service',
      subsystemNode: 'auth-cluster-01',
      uptimePercentage: 100.0,
      latencyMs: 4,
      statusIndicator: 'Healthy',
      lastHealthCheck: new Date().toISOString(),
      details: 'Tamper-evident audit chain verified. Zero hash divergences.',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-09-12T08:00:00Z',
      provenance: createInitialProvenance('System Monitoring Daemon', 'Verified'),
    },
    {
      id: 'hlth_carcarekiosk',
      title: 'External CarCareKiosk Media Mirror',
      serviceName: 'Video Streaming Mirror Node',
      subsystemNode: 'cdn-mirror-us',
      uptimePercentage: 98.4,
      latencyMs: 84,
      statusIndicator: 'Warning',
      lastHealthCheck: new Date().toISOString(),
      details: 'Elevated latency observed on transatlantic transit provider',
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-09-12T08:00:00Z',
      provenance: createInitialProvenance('Synthetic Pinger', 'Needs Review'),
    },
  ];

  return {
    'data-quality': [], // Virtual section derived dynamically
    vehicles,
    manufacturers,
    models,
    engines,
    systems,
    components,
    repairs,
    diagnostics,
    dtc,
    maintenance,
    videos,
    sources,
    imports,
    users,
    reports,
    'system-health': systemHealth,
  };
}

class AdminDataStore {
  private data: Record<AdminSection, BaseAdminRecord[]>;
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.data = this.loadFromStorage();
  }

  private loadFromStorage(): Record<AdminSection, BaseAdminRecord[]> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.vehicles && parsed.components) {
          return parsed;
        }
      }
    } catch {
      // Ignore fallback
    }
    return buildSeedData();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('Failed saving admin store to localStorage:', e);
    }
    this.notifySubscribers();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Subscriber error in AdminStore:', err);
      }
    });
  }

  // Get records for a section
  public getSectionRecords(section: AdminSection): BaseAdminRecord[] {
    if (section === 'data-quality') {
      return this.getAllRecordsAcrossSections();
    }
    return this.data[section] || [];
  }

  public getAllRecordsAcrossSections(): BaseAdminRecord[] {
    const list: BaseAdminRecord[] = [];
    const keys: AdminSection[] = [
      'vehicles',
      'manufacturers',
      'models',
      'engines',
      'systems',
      'components',
      'repairs',
      'diagnostics',
      'dtc',
      'maintenance',
      'videos',
      'sources',
      'imports',
      'users',
      'reports',
      'system-health',
    ];
    for (const key of keys) {
      if (this.data[key]) {
        list.push(...this.data[key]);
      }
    }
    return list;
  }

  // 1. CREATE RECORD
  public createRecord(
    section: AdminSection,
    recordData: Partial<BaseAdminRecord>,
    actor = 'System Security Administrator'
  ): BaseAdminRecord {
    if (section === 'data-quality') {
      throw new Error('Cannot create record directly inside virtual data-quality section');
    }

    const now = new Date().toISOString();
    const id = recordData.id || `${section.slice(0, 3)}_${Date.now()}`;
    const provenance =
      recordData.provenance ||
      createInitialProvenance(
        recordData.source || 'OEM Manual Entry',
        'Unverified',
        { importedBy: actor }
      );

    const newRecord: BaseAdminRecord = {
      ...recordData,
      id,
      title: recordData.title || `New ${section} record`,
      status: recordData.status || 'Active',
      createdAt: now,
      updatedAt: now,
      provenance,
    };

    // Immediate quality classification
    const audit = validateRecordQuality(newRecord, section);
    newRecord.provenance.verificationStatus = audit.status;
    newRecord.provenance.qualityIssues = audit.issues;
    newRecord.provenance.confidenceScore = audit.confidenceScore;

    if (!this.data[section]) {
      this.data[section] = [];
    }
    this.data[section].unshift(newRecord);
    this.saveToStorage();
    return newRecord;
  }

  // 2. EDIT RECORD
  public editRecord(
    section: AdminSection,
    id: string,
    updates: Partial<BaseAdminRecord>,
    actor = 'System Security Administrator'
  ): BaseAdminRecord {
    const records = this.data[section];
    if (!records) throw new Error(`Section ${section} not found`);

    const idx = records.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error(`Record with id ${id} not found in ${section}`);

    const existing = records[idx];
    const now = new Date().toISOString();

    const updatedProvenance = appendProvenanceHistory(
      existing.provenance,
      'EDITED',
      actor,
      `Fields modified: ${Object.keys(updates).join(', ')}`
    );

    const merged: BaseAdminRecord = {
      ...existing,
      ...updates,
      id: existing.id, // Immutable ID
      updatedAt: now,
      provenance: updatedProvenance,
    };

    // Re-verify quality after edit
    const audit = validateRecordQuality(merged, section);
    merged.provenance.verificationStatus = audit.status;
    merged.provenance.qualityIssues = audit.issues;
    merged.provenance.confidenceScore = audit.confidenceScore;

    records[idx] = merged;
    this.saveToStorage();
    return merged;
  }

  // 3. DELETE RECORD (Hard delete or purge)
  public deleteRecord(section: AdminSection, id: string): boolean {
    const records = this.data[section];
    if (!records) return false;
    const initialLen = records.length;
    this.data[section] = records.filter((r) => r.id !== id);
    if (this.data[section].length !== initialLen) {
      this.saveToStorage();
      return true;
    }
    return false;
  }

  // 4. DISABLE / ENABLE RECORD (Soft delete toggle)
  public toggleRecordStatus(
    section: AdminSection,
    id: string,
    actor = 'System Security Administrator'
  ): BaseAdminRecord {
    const records = this.data[section];
    if (!records) throw new Error(`Section ${section} not found`);

    const record = records.find((r) => r.id === id);
    if (!record) throw new Error(`Record ${id} not found`);

    const nextStatus = record.status === 'Active' ? 'Disabled' : 'Active';
    record.status = nextStatus;
    record.updatedAt = new Date().toISOString();
    record.provenance = appendProvenanceHistory(
      record.provenance,
      'DISABLED',
      actor,
      `Record status toggled to ${nextStatus}`
    );

    this.saveToStorage();
    return record;
  }

  // 5. VALIDATE RECORD
  public validateRecord(
    section: AdminSection,
    id: string,
    actor = 'System Security Administrator'
  ): { record: BaseAdminRecord; audit: ReturnType<typeof validateRecordQuality> } {
    const records = this.data[section];
    if (!records) throw new Error(`Section ${section} not found`);

    const record = records.find((r) => r.id === id);
    if (!record) throw new Error(`Record ${id} not found`);

    const audit = validateRecordQuality(record, section);
    record.provenance.verificationStatus = audit.status;
    record.provenance.qualityIssues = audit.issues;
    record.provenance.confidenceScore = audit.confidenceScore;
    record.provenance = appendProvenanceHistory(
      record.provenance,
      'VALIDATED',
      actor,
      `Audit completed. Classified as ${audit.status} with ${audit.issues.length} issues.`
    );

    this.saveToStorage();
    return { record, audit };
  }

  // 6. VALIDATE ALL RECORDS ACROSS ALL SECTIONS
  public validateAllQuality(actor = 'System Security Administrator'): DataQualitySummary {
    const sections: AdminSection[] = [
      'vehicles',
      'manufacturers',
      'models',
      'engines',
      'systems',
      'components',
      'repairs',
      'diagnostics',
      'dtc',
      'maintenance',
      'videos',
      'sources',
      'imports',
      'users',
      'reports',
      'system-health',
    ];

    for (const sec of sections) {
      const records = this.data[sec] || [];
      for (const rec of records) {
        const audit = validateRecordQuality(rec, sec);
        // Do not overwrite manual 'Duplicate' status unless merged
        if (rec.provenance.verificationStatus !== 'Duplicate') {
          rec.provenance.verificationStatus = audit.status;
        }
        rec.provenance.qualityIssues = audit.issues;
        rec.provenance.confidenceScore = audit.confidenceScore;
      }
    }

    this.saveToStorage();
    return this.getQualitySummary();
  }

  // 7. MERGE DUPLICATES
  public mergeDuplicates(
    section: AdminSection,
    masterId: string,
    duplicateId: string,
    mergedFields: Partial<BaseAdminRecord>,
    actor = 'System Security Administrator'
  ): BaseAdminRecord {
    const records = this.data[section];
    if (!records) throw new Error(`Section ${section} not found`);

    const masterIdx = records.findIndex((r) => r.id === masterId);
    const dupIdx = records.findIndex((r) => r.id === duplicateId);

    if (masterIdx === -1 || dupIdx === -1) {
      throw new Error('Master or duplicate record not found in section');
    }

    const master = records[masterIdx];
    const duplicate = records[dupIdx];

    // Combine provenance history
    const combinedHistory = [
      {
        timestamp: new Date().toISOString(),
        action: 'MERGED' as const,
        actor,
        details: `Merged duplicate record '${duplicate.id}' (${duplicate.title}) into master. Provenance sources unified.`,
      },
      ...(master.provenance.history || []),
      ...(duplicate.provenance.history || []),
    ];

    const mergedMaster: BaseAdminRecord = {
      ...master,
      ...mergedFields,
      id: master.id,
      updatedAt: new Date().toISOString(),
      provenance: {
        ...master.provenance,
        verificationStatus: 'Verified',
        qualityIssues: [],
        confidenceScore: Math.min(100, Math.max(master.provenance.confidenceScore, 95)),
        source: `${master.provenance.source} + ${duplicate.provenance.source}`,
        history: combinedHistory,
      },
    };

    // Remove duplicate record or mark as disabled with merged tombstone
    records[masterIdx] = mergedMaster;
    records.splice(dupIdx, 1); // Purge duplicate from active list

    this.saveToStorage();
    return mergedMaster;
  }

  // 8. IMPORT BATCH WITH PROVENANCE TRACKING
  public importBatch(
    section: AdminSection,
    recordsToImport: Partial<BaseAdminRecord>[],
    sourceMetadata: {
      source: string;
      sourceUrl?: string;
      license?: string;
      importedBy: string;
    }
  ): { imported: number; valid: number; duplicates: number } {
    let valid = 0;
    let duplicates = 0;

    if (!this.data[section]) {
      this.data[section] = [];
    }

    const existingRecords = this.data[section];
    const existingTitles = new Set(existingRecords.map((r) => r.title.toLowerCase()));

    for (const rec of recordsToImport) {
      const isDup = rec.title && existingTitles.has(rec.title.toLowerCase());
      if (isDup) {
        duplicates++;
      } else {
        valid++;
      }

      const provenance = createInitialProvenance(
        sourceMetadata.source,
        isDup ? 'Duplicate' : 'Unverified',
        {
          sourceUrl: sourceMetadata.sourceUrl,
          license: sourceMetadata.license,
          importedBy: sourceMetadata.importedBy,
        }
      );

      this.createRecord(
        section,
        {
          ...rec,
          provenance,
        },
        sourceMetadata.importedBy
      );
    }

    // Record this job into 'imports' section
    this.createRecord(
      'imports',
      {
        title: `Batch Import: ${recordsToImport.length} ${section} records from ${sourceMetadata.source}`,
        jobId: `JOB-IMP-${Date.now()}`,
        sourceProvider: sourceMetadata.source,
        importedEntityType: section,
        recordsCount: recordsToImport.length,
        validCount: valid,
        errorsCount: 0,
        duplicatesCount: duplicates,
        executionDurationMs: Math.floor(Math.random() * 800) + 400,
        statusText: 'Completed',
        status: 'Active',
      },
      sourceMetadata.importedBy
    );

    this.saveToStorage();
    return {
      imported: recordsToImport.length,
      valid,
      duplicates,
    };
  }

  // 9. DATA QUALITY DASHBOARD SUMMARY
  public getQualitySummary(): DataQualitySummary {
    const allRecords = this.getAllRecordsAcrossSections();

    let verified = 0;
    let unverified = 0;
    let needsReview = 0;
    let duplicate = 0;
    let missingData = 0;

    const sections: AdminSection[] = [
      'vehicles',
      'manufacturers',
      'models',
      'engines',
      'systems',
      'components',
      'repairs',
      'diagnostics',
      'dtc',
      'maintenance',
      'videos',
      'sources',
      'imports',
      'users',
      'reports',
      'system-health',
    ];

    const sectionBreakdown: DataQualitySummary['sectionBreakdown'] = {} as any;

    for (const sec of sections) {
      sectionBreakdown[sec] = {
        total: 0,
        verified: 0,
        unverified: 0,
        needsReview: 0,
        duplicate: 0,
        missingData: 0,
      };

      const records = this.data[sec] || [];
      for (const rec of records) {
        sectionBreakdown[sec].total++;
        const status = rec.provenance?.verificationStatus || 'Unverified';

        if (status === 'Verified') {
          verified++;
          sectionBreakdown[sec].verified++;
        } else if (status === 'Unverified') {
          unverified++;
          sectionBreakdown[sec].unverified++;
        } else if (status === 'Needs Review') {
          needsReview++;
          sectionBreakdown[sec].needsReview++;
        } else if (status === 'Duplicate') {
          duplicate++;
          sectionBreakdown[sec].duplicate++;
        } else if (status === 'Missing Data') {
          missingData++;
          sectionBreakdown[sec].missingData++;
        }
      }
    }

    const total = allRecords.length;
    // Health score weighted formula: Verified: 100%, Unverified: 75%, Needs Review: 50%, Duplicate: 20%, Missing: 0%
    const weighted =
      verified * 1.0 + unverified * 0.75 + needsReview * 0.5 + duplicate * 0.2 + missingData * 0.0;
    const overallHealthScore = total > 0 ? Math.round((weighted / total) * 100) : 100;

    return {
      totalRecords: total,
      verifiedCount: verified,
      unverifiedCount: unverified,
      needsReviewCount: needsReview,
      duplicateCount: duplicate,
      missingDataCount: missingData,
      overallHealthScore,
      sectionBreakdown,
    };
  }

  // Reset to initial seed data
  public resetToFactorySeed(): void {
    this.data = buildSeedData();
    this.saveToStorage();
  }
}

export const adminStore = new AdminDataStore();
