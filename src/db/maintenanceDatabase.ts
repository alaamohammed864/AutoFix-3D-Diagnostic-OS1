import {
  MaintenanceCategory,
  MaintenanceCategorySpec,
  TimelineInterval,
  ComprehensiveServiceRecord,
  CategoryStatusResult,
  TimelineIntervalStatusResult,
} from './maintenanceTypes';

export const ALL_MAINTENANCE_CATEGORIES: MaintenanceCategory[] = [
  'Engine Oil',
  'Oil Filter',
  'Air Filter',
  'Cabin Filter',
  'Coolant',
  'Brake Fluid',
  'Transmission Fluid',
  'Power Steering Fluid',
  'Spark Plugs',
  'Battery',
  'Belts',
  'Wipers',
  'Tires',
  'Brakes',
  'Suspension',
  'Lights',
];

export const CATEGORY_META: Record<
  MaintenanceCategory,
  { nameEn: string; nameAr: string; icon: string; defaultIntervalKm: number; defaultIntervalMonths: number }
> = {
  'Engine Oil': {
    nameEn: 'Engine Oil',
    nameAr: 'زيت المحرك',
    icon: 'oil_barrel',
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 12,
  },
  'Oil Filter': {
    nameEn: 'Oil Filter',
    nameAr: 'فلتر الزيت',
    icon: 'filter_alt',
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 12,
  },
  'Air Filter': {
    nameEn: 'Engine Air Filter',
    nameAr: 'فلتر هواء المحرك',
    icon: 'air',
    defaultIntervalKm: 30000,
    defaultIntervalMonths: 24,
  },
  'Cabin Filter': {
    nameEn: 'Cabin Microfilter',
    nameAr: 'فلتر مقصورة الركاب (المكيف)',
    icon: 'hvac',
    defaultIntervalKm: 20000,
    defaultIntervalMonths: 12,
  },
  Coolant: {
    nameEn: 'Engine Coolant',
    nameAr: 'سائل التبريد (ماء الرادياتير)',
    icon: 'ac_unit',
    defaultIntervalKm: 60000,
    defaultIntervalMonths: 48,
  },
  'Brake Fluid': {
    nameEn: 'Brake Fluid',
    nameAr: 'سائل الفرامل',
    icon: 'water_drop',
    defaultIntervalKm: 40000,
    defaultIntervalMonths: 24,
  },
  'Transmission Fluid': {
    nameEn: 'Transmission Fluid',
    nameAr: 'سائل ناقل الحركة (الجير)',
    icon: 'settings_backup_restore',
    defaultIntervalKm: 60000,
    defaultIntervalMonths: 48,
  },
  'Power Steering Fluid': {
    nameEn: 'Power Steering System',
    nameAr: 'نظام التوجيه الهيدروليكي / الكهربائي',
    icon: 'adjust',
    defaultIntervalKm: 60000,
    defaultIntervalMonths: 48,
  },
  'Spark Plugs': {
    nameEn: 'Spark Plugs',
    nameAr: 'شمعات الاحتراق (البواجي)',
    icon: 'flash_on',
    defaultIntervalKm: 60000,
    defaultIntervalMonths: 48,
  },
  Battery: {
    nameEn: '12V Starter Battery',
    nameAr: 'بطارية التشغيل 12V',
    icon: 'battery_charging_full',
    defaultIntervalKm: 40000,
    defaultIntervalMonths: 36,
  },
  Belts: {
    nameEn: 'Drive Belts & Tensioners',
    nameAr: 'سيور المحرك والشدادات',
    icon: 'all_inclusive',
    defaultIntervalKm: 60000,
    defaultIntervalMonths: 48,
  },
  Wipers: {
    nameEn: 'Wiper Blades',
    nameAr: 'شفرات مساحات الزجاج',
    icon: 'water',
    defaultIntervalKm: 15000,
    defaultIntervalMonths: 12,
  },
  Tires: {
    nameEn: 'Tires & Alignment',
    nameAr: 'الإطارات والوزن والمحاذاة',
    icon: 'trip_origin',
    defaultIntervalKm: 10000,
    defaultIntervalMonths: 6,
  },
  Brakes: {
    nameEn: 'Brake Pads & Rotors',
    nameAr: 'أقمشة وأقراص الفرامل',
    icon: 'disc_full',
    defaultIntervalKm: 30000,
    defaultIntervalMonths: 24,
  },
  Suspension: {
    nameEn: 'Suspension & Steering Arms',
    nameAr: 'المساعدات ومقصات التعليق',
    icon: 'swap_calls',
    defaultIntervalKm: 40000,
    defaultIntervalMonths: 36,
  },
  Lights: {
    nameEn: 'Exterior & Interior Lights',
    nameAr: 'منظومة الإضاءة والأنوار',
    icon: 'lightbulb',
    defaultIntervalKm: 20000,
    defaultIntervalMonths: 12,
  },
};

// ==========================================
// VEHICLE SPECIFIC FACTORY OEM SPECS
// ==========================================

export const VEHICLE_CATEGORY_SPECS: Record<string, Record<MaintenanceCategory, MaintenanceCategorySpec>> = {
  // 1. TOYOTA CAMRY 2018 (XV70) 2.5L
  'toyota-camry-2018-xv70-2.5l-se-auto': {
    'Engine Oil': {
      category: 'Engine Oil',
      nameEn: 'Engine Oil (Toyota Genuine 0W-16)',
      nameAr: 'زيت المحرك الأصلي تويوتا 0W-16',
      icon: 'oil_barrel',
      intervalKm: 10000,
      intervalMonths: 12,
      oemSpec: 'Toyota Genuine Motor Oil SAE 0W-16 (API SP / ILSAC GF-6B)',
      capacityOrSpec: '4.8 Liters (5.1 US Qts)',
      inspectionChecklist: [
        'Drain engine oil while operating temp is warm',
        'Replace drain plug crush gasket (Part # 90430-12031)',
        'Torque oil pan drain plug to 40 Nm (30 lb-ft)',
        'Check dipstick level after 5-minute engine idle',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$65 - $85',
      severity: 'critical',
    },
    'Oil Filter': {
      category: 'Oil Filter',
      nameEn: 'Engine Oil Filter Element',
      nameAr: 'عنصر فلتر زيت المحرك',
      icon: 'filter_alt',
      intervalKm: 10000,
      intervalMonths: 12,
      oemSpec: 'Toyota Genuine Cartridge Filter',
      oemPartNumber: '04152-YZZA1',
      capacityOrSpec: 'Cartridge with O-rings and drain tool',
      inspectionChecklist: [
        'Replace canister O-ring and lubricate with fresh 0W-16',
        'Torque plastic/alloy filter housing cap to 25 Nm (18 lb-ft)',
        'Inspect for oil leaks around gasket perimeter under 2,000 RPM',
      ],
      estimatedLaborHours: 0.2,
      averageCostRange: '$12 - $18',
      severity: 'critical',
    },
    'Air Filter': {
      category: 'Air Filter',
      nameEn: 'Engine Air Intake Cleaner Filter',
      nameAr: 'فلتر سحب هواء المحرك',
      icon: 'air',
      intervalKm: 30000,
      intervalMonths: 24,
      oemSpec: 'Toyota High-Efficiency Non-Woven Fabric Filter',
      oemPartNumber: '17801-F0020',
      capacityOrSpec: 'Direct drop-in OEM box filter',
      inspectionChecklist: [
        'Unclip airbox cover and check for debris or moisture',
        'Inspect Mass Air Flow (MAF) sensor wire upstream',
        'Seat sealing rubber flange flat in airbox lower housing',
      ],
      estimatedLaborHours: 0.2,
      averageCostRange: '$24 - $38',
      severity: 'standard',
    },
    'Cabin Filter': {
      category: 'Cabin Filter',
      nameEn: 'Cabin Microfilter & Pollen Element',
      nameAr: 'فلتر هواء المقصورة ضد الغبار واللقاح',
      icon: 'hvac',
      intervalKm: 20000,
      intervalMonths: 12,
      oemSpec: 'Toyota Premium Charcoal Activated Deodorizing Filter',
      oemPartNumber: '87139-0E040',
      capacityOrSpec: 'Behind glovebox tray access port',
      inspectionChecklist: [
        'Dampen glovebox damper arm carefully during removal',
        'Observe AIR FLOW direction arrow stamped on element',
        'Vacuum HVAC blower wheel fan cavity before insertion',
      ],
      estimatedLaborHours: 0.3,
      averageCostRange: '$20 - $35',
      severity: 'standard',
    },
    Coolant: {
      category: 'Coolant',
      nameEn: 'Toyota Super Long Life Pink Coolant',
      nameAr: 'سائل التبريد الوردي طويل الأمد من تويوتا',
      icon: 'ac_unit',
      intervalKm: 80000,
      intervalMonths: 60,
      oemSpec: 'Toyota Super Long Life Coolant (50/50 Pre-Diluted)',
      capacityOrSpec: '6.7 Liters (7.1 US Qts)',
      inspectionChecklist: [
        'Check freeze point with refractometer (-37°C spec)',
        'Inspect electric water pump and thermostat housing for crusting',
        'Purge trapped air through radiator bleeder valve',
      ],
      estimatedLaborHours: 1.0,
      averageCostRange: '$110 - $160',
      severity: 'critical',
    },
    'Brake Fluid': {
      category: 'Brake Fluid',
      nameEn: 'Hydraulic Brake Fluid (DOT 4 / DOT 3)',
      nameAr: 'سائل الفرامل الهيدروليكي DOT 4',
      icon: 'water_drop',
      intervalKm: 40000,
      intervalMonths: 24,
      oemSpec: 'FMVSS 116 DOT 4 / SAE J1704 High Temperature',
      capacityOrSpec: '1.0 Liter system flush',
      inspectionChecklist: [
        'Measure boiling point or moisture tester (< 2% water required)',
        'Perform pressure flush at all 4 caliper bleed screws',
        'Verify ABS modulator reservoir is filled to MAX line',
      ],
      estimatedLaborHours: 0.8,
      averageCostRange: '$85 - $130',
      severity: 'critical',
    },
    'Transmission Fluid': {
      category: 'Transmission Fluid',
      nameEn: 'Automatic Transmission Fluid (Toyota WS)',
      nameAr: 'زيت ناقل الحركة الأوتوماتيكي تويوتا WS',
      icon: 'settings_backup_restore',
      intervalKm: 80000,
      intervalMonths: 60,
      oemSpec: 'Toyota Genuine ATF WS (World Standard)',
      capacityOrSpec: '6.8 Liters total / 2.6 Liters drain & refill',
      inspectionChecklist: [
        'Check fluid level via overflow tube at 35°C - 45°C ATF temp',
        'Verify TCM fluid degradation counter via diagnostic scanner',
        'Inspect transmission cooler lines and pan seal',
      ],
      estimatedLaborHours: 1.2,
      averageCostRange: '$180 - $260',
      severity: 'critical',
    },
    'Power Steering Fluid': {
      category: 'Power Steering Fluid',
      nameEn: 'Electric Power Steering (EPS) Calibration & Rack',
      nameAr: 'منظومة التوجيه الكهربائية (EPS) والمحاذاة',
      icon: 'adjust',
      intervalKm: 60000,
      intervalMonths: 48,
      oemSpec: 'Electronic Brushless EPS Motor - Sealed Unit (No Hydraulic Fluid)',
      capacityOrSpec: 'EPS Zero-Point Sensor Calibration',
      inspectionChecklist: [
        'Inspect inner/outer tie rod rubber accordion dust boots',
        'Scan EPS ECU for torque sensor zero-point drift',
        'Check rack mounting bushings for excessive play',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$50 - $90',
      severity: 'standard',
      systemNote: 'Camry XV70 utilizes full electric power steering. No fluid reservoir required.',
    },
    'Spark Plugs': {
      category: 'Spark Plugs',
      nameEn: 'Denso Iridium Long-Life Spark Plugs',
      nameAr: 'شمعات إشعال إيريديوم طويلة العمر دينسو',
      icon: 'flash_on',
      intervalKm: 100000,
      intervalMonths: 72,
      oemSpec: 'Denso FC16HR-Q8 (0.031" / 0.8mm factory gap)',
      oemPartNumber: '90919-01298',
      capacityOrSpec: '4 Plugs (Torque: 21 Nm / 15 lb-ft)',
      inspectionChecklist: [
        'Disconnect ignition coil wiring harnesses gently',
        'Inspect plug tube wells for oil contamination from valve cover',
        'Do not gap iridium center electrode tip (factory pre-gapped)',
        'Torque to exactly 21 Nm without anti-seize',
      ],
      estimatedLaborHours: 1.0,
      averageCostRange: '$140 - $210',
      severity: 'critical',
    },
    Battery: {
      category: 'Battery',
      nameEn: '12V Lead-Acid Starter Battery (Group 35)',
      nameAr: 'بطارية تشغيل 12 فولت فئة 35',
      icon: 'battery_charging_full',
      intervalKm: 40000,
      intervalMonths: 36,
      oemSpec: 'BCI Group 35, 640 CCA, 100 min Reserve Capacity',
      oemPartNumber: '00544-24F60-575',
      capacityOrSpec: '12.6V Resting Voltage',
      inspectionChecklist: [
        'Conduct conductance battery load test with digital analyzer',
        'Clean terminal posts with brass brush & apply dielectric grease',
        'Verify alternator charging output at 13.8V - 14.6V under electrical load',
      ],
      estimatedLaborHours: 0.3,
      averageCostRange: '$150 - $220',
      severity: 'critical',
    },
    Belts: {
      category: 'Belts',
      nameEn: 'Serpentine Accessory Drive Belt',
      nameAr: 'سير المحرك الإضافي (سير الدينامو والمكيف)',
      icon: 'all_inclusive',
      intervalKm: 80000,
      intervalMonths: 60,
      oemSpec: 'EPDM Micro-V Multi-Ribbed Serpentine Belt',
      oemPartNumber: '90916-02758',
      capacityOrSpec: 'Automatic Spring Tensioner Assembly',
      inspectionChecklist: [
        'Inspect ribs for micro-cracks (>3 cracks per inch requires change)',
        'Check automatic tensioner alignment arrow within operational range',
        'Spin idler pulleys by hand to check for bearing roughness',
      ],
      estimatedLaborHours: 0.6,
      averageCostRange: '$85 - $140',
      severity: 'standard',
    },
    Wipers: {
      category: 'Wipers',
      nameEn: 'Toyota Sightline Hybrid Wiper Blades',
      nameAr: 'شفرات مساحات الزجاج الأمامي الهجينة',
      icon: 'water',
      intervalKm: 15000,
      intervalMonths: 12,
      oemSpec: 'Driver 26" (650mm), Passenger 18" (450mm) Hybrid Beam',
      capacityOrSpec: 'J-Hook Connection',
      inspectionChecklist: [
        'Inspect rubber edge for tearing, splitting, or UV hardening',
        'Clean windshield glass ceramic border to prevent chatter',
        'Test washer fluid spray pattern and nozzle flow',
      ],
      estimatedLaborHours: 0.2,
      averageCostRange: '$30 - $55',
      severity: 'standard',
    },
    Tires: {
      category: 'Tires',
      nameEn: 'Tire Rotation, Balance & Alignment',
      nameAr: 'تدوير الإطارات وترصيصها وضبط زوايا العجلات',
      icon: 'trip_origin',
      intervalKm: 10000,
      intervalMonths: 6,
      oemSpec: '235/45R18 94V (35 PSI Front / 35 PSI Rear)',
      capacityOrSpec: 'Wheel Lug Torque: 103 Nm (76 lb-ft)',
      inspectionChecklist: [
        'Measure tread depth at inner, center, and outer tread ribs',
        'Rotate in forward cross pattern for FWD vehicles',
        'Torque lug nuts using star sequence to 103 Nm with torque wrench',
        'Reset TPMS threshold sensor in dashboard instrument cluster',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$35 - $60',
      severity: 'standard',
    },
    Brakes: {
      category: 'Brakes',
      nameEn: 'Front & Rear Brake Pads and Rotors',
      nameAr: 'أقمشة وأقراص فرامل العجلات الأمامية والخلفية',
      icon: 'disc_full',
      intervalKm: 30000,
      intervalMonths: 24,
      oemSpec: 'Ceramic OEM Low-Dust Friction Compound',
      oemPartNumber: '04465-33480 (Front) / 04466-33230 (Rear)',
      capacityOrSpec: 'Min pad thickness 3.0mm / Rotor runout < 0.05mm',
      inspectionChecklist: [
        'Measure pad thickness with vernier gauge (Replace if < 3.0mm)',
        'Check rotor disc thickness with micrometer against discard spec',
        'Lubricate caliper slide pins with high-temperature silicone paste',
        'Inspect electronic parking brake (EPB) actuator harness for rubbing',
      ],
      estimatedLaborHours: 1.5,
      averageCostRange: '$180 - $350',
      severity: 'critical',
    },
    Suspension: {
      category: 'Suspension',
      nameEn: 'MacPherson Struts & Multi-Link Suspension',
      nameAr: 'المساعدات ومقصات التعليق وقضيب التوازن',
      icon: 'swap_calls',
      intervalKm: 40000,
      intervalMonths: 36,
      oemSpec: 'Gas-Pressurized Twin-Tube Struts & Stabilizer End Links',
      capacityOrSpec: 'Factory Geometry Spec (Toe +0.05°, Camber -0.5°)',
      inspectionChecklist: [
        'Inspect strut body for hydraulic oil misting or severe leakage',
        'Check front lower control arm compliance bushings for tearing',
        'Check stabilizer sway bar end link ball sockets for play',
        'Bounce test chassis corners to verify damping rebound control',
      ],
      estimatedLaborHours: 0.8,
      averageCostRange: '$90 - $160',
      severity: 'standard',
    },
    Lights: {
      category: 'Lights',
      nameEn: 'Bi-LED Headlights, DRLs & Signal Lamps',
      nameAr: 'المصابيح الأمامية LED وإشارات التنبيه والمكابح',
      icon: 'lightbulb',
      intervalKm: 20000,
      intervalMonths: 12,
      oemSpec: 'Integrated Solid-State OEM LED Projector Units',
      capacityOrSpec: 'Auto-High Beam (AHB) Camera Monitored',
      inspectionChecklist: [
        'Verify low-beam cut-off line height on optical aiming board',
        'Check rear LED high-mount third brake light operation',
        'Inspect headlamp polycarbonate lenses for UV haze or moisture ingress',
      ],
      estimatedLaborHours: 0.3,
      averageCostRange: '$20 - $50',
      severity: 'standard',
    },
  },

  // 2. FORD F-150 2021 (14th Gen) 3.5L EcoBoost
  'ford-f150-2021-14gen-3.5l-ecoboost-4x4': {
    'Engine Oil': {
      category: 'Engine Oil',
      nameEn: 'Motorcraft SAE 5W-30 Full Synthetic',
      nameAr: 'زيت موتوركرافت تخليقي 5W-30',
      icon: 'oil_barrel',
      intervalKm: 10000,
      intervalMonths: 12,
      oemSpec: 'Ford WSS-M2C961-A1 (API SP / ILSAC GF-6A)',
      capacityOrSpec: '5.7 Liters (6.0 US Qts)',
      inspectionChecklist: [
        'Drain oil via yellow twist plug or 15mm bolt',
        'Reset Ford Intelligent Oil-Life Monitor (IOLM)',
        'Inspect twin turbocharger oil feed pipes for sweating',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$75 - $95',
      severity: 'critical',
    },
    'Oil Filter': {
      category: 'Oil Filter',
      nameEn: 'Motorcraft FL-500S Filter',
      nameAr: 'فلتر زيت أصلي موتوركرافت FL-500S',
      icon: 'filter_alt',
      intervalKm: 10000,
      intervalMonths: 12,
      oemSpec: 'Motorcraft Spin-on Filter with Silicone Anti-Drainback',
      oemPartNumber: 'FL-500S',
      capacityOrSpec: 'Spin-on metal canister',
      inspectionChecklist: [
        'Lube gasket with clean oil; hand tighten 3/4 turn past gasket contact',
        'Clean plastic under-oil drip channel',
      ],
      estimatedLaborHours: 0.2,
      averageCostRange: '$14 - $20',
      severity: 'critical',
    },
    'Air Filter': {
      category: 'Air Filter',
      nameEn: 'Motorcraft FA-1883 Air Filter',
      nameAr: 'فلتر هواء المحرك موتوركرافت FA-1883',
      icon: 'air',
      intervalKm: 30000,
      intervalMonths: 24,
      oemSpec: 'Motorcraft Pleated Paper High-Flow Element',
      oemPartNumber: 'FA-1883',
      capacityOrSpec: 'Heavy duty twin-turbo high flow airbox',
      inspectionChecklist: [
        'Inspect airbox intake duct for leaves or road dirt',
        'Ensure air filter sealing gasket sits airtight in grooves',
      ],
      estimatedLaborHours: 0.2,
      averageCostRange: '$28 - $42',
      severity: 'standard',
    },
    'Cabin Filter': {
      category: 'Cabin Filter',
      nameEn: 'Motorcraft FP-98 Cabin Air Filter',
      nameAr: 'فلتر مقصورة الركاب موتوركرافت FP-98',
      icon: 'hvac',
      intervalKm: 20000,
      intervalMonths: 12,
      oemSpec: 'Motorcraft Carbon Particle Filter',
      oemPartNumber: 'FP-98',
      capacityOrSpec: 'Behind upper dashboard glove department',
      inspectionChecklist: ['Release glovebox retainers; insert filter with arrow DOWN'],
      estimatedLaborHours: 0.3,
      averageCostRange: '$25 - $40',
      severity: 'standard',
    },
    Coolant: {
      category: 'Coolant',
      nameEn: 'Motorcraft Yellow Antifreeze/Coolant',
      nameAr: 'سائل التبريد الأصفر موتوركرافت',
      icon: 'ac_unit',
      intervalKm: 80000,
      intervalMonths: 60,
      oemSpec: 'Ford WSS-M97B57-A1 (POAT Phosphate OAT)',
      capacityOrSpec: '13.2 Liters (14.0 US Qts)',
      inspectionChecklist: [
        'Inspect degas bottle cap seal and pressure test system to 21 PSI',
        'Verify auxiliary turbo intercooler coolant circuit',
      ],
      estimatedLaborHours: 1.2,
      averageCostRange: '$130 - $190',
      severity: 'critical',
    },
    'Brake Fluid': {
      category: 'Brake Fluid',
      nameEn: 'Motorcraft High Performance DOT 4 LV',
      nameAr: 'سائل الفرامل موتوركرافت DOT 4 LV منخفض اللزوجة',
      icon: 'water_drop',
      intervalKm: 40000,
      intervalMonths: 24,
      oemSpec: 'Ford WSS-M6C65-A2 / ISO 4925 Class 6',
      capacityOrSpec: '1.5 Liters system bleed',
      inspectionChecklist: [
        'Pressure bleed hydraulic circuit including electric brake booster',
        'Verify pedal firmness under maximum deceleration simulation',
      ],
      estimatedLaborHours: 0.9,
      averageCostRange: '$95 - $145',
      severity: 'critical',
    },
    'Transmission Fluid': {
      category: 'Transmission Fluid',
      nameEn: 'Motorcraft MERCON ULV (10R80 10-Speed)',
      nameAr: 'زيت جير 10 سرعات موتوركرافت ميركون ULV',
      icon: 'settings_backup_restore',
      intervalKm: 80000,
      intervalMonths: 60,
      oemSpec: 'Ford WSS-M2C949-A (Ultra Low Viscosity)',
      capacityOrSpec: '12.4 Liters (13.1 Qts total)',
      inspectionChecklist: [
        'Inspect transmission dipstick plug located on passenger side of case',
        'Verify temperature is at 96°C - 101°C during level verification',
      ],
      estimatedLaborHours: 1.5,
      averageCostRange: '$220 - $310',
      severity: 'critical',
    },
    'Power Steering Fluid': {
      category: 'Power Steering Fluid',
      nameEn: 'Electric Power-Assisted Steering (EPAS) Inspection',
      nameAr: 'فحص منظومة التوجيه الكهربائي EPAS',
      icon: 'adjust',
      intervalKm: 60000,
      intervalMonths: 48,
      oemSpec: 'Ford EPAS High-Torque Rack (No Hydraulic Reservoir)',
      capacityOrSpec: 'Electric Belt Drive on Rack Gear',
      inspectionChecklist: [
        'Inspect steering shaft U-joints for rust and binding',
        'Inspect heavy-duty tie rod ends for joint looseness',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$55 - $95',
      severity: 'standard',
    },
    'Spark Plugs': {
      category: 'Spark Plugs',
      nameEn: 'Motorcraft SP-578 Iridium Plugs',
      nameAr: 'شمعات إشعال إيريديوم موتوركرافت SP-578',
      icon: 'flash_on',
      intervalKm: 60000,
      intervalMonths: 48,
      oemSpec: 'Motorcraft SP-578 / CYFS-12Y-PCT (0.030" gap)',
      capacityOrSpec: '6 Plugs (18 Nm torque)',
      inspectionChecklist: [
        'Check gap carefully with wire gauge to 0.030" (EcoBoost boost tolerance)',
        'Replace rubber coil boots and apply silicone dielectric grease',
      ],
      estimatedLaborHours: 1.4,
      averageCostRange: '$180 - $260',
      severity: 'critical',
    },
    Battery: {
      category: 'Battery',
      nameEn: 'Motorcraft Tested Tough MAX AGM (Group 48 / H6)',
      nameAr: 'بطارية موتوركرافت AGM فئة H6',
      icon: 'battery_charging_full',
      intervalKm: 40000,
      intervalMonths: 36,
      oemSpec: 'BCI Group 48 / H6 AGM, 760 CCA, 120 min Reserve',
      capacityOrSpec: 'Battery Monitoring System (BMS) Reset required',
      inspectionChecklist: [
        'Reset BMS memory in BCM via OBD diagnostic scan tool on battery replacement',
        'Check auxiliary pro-power onboard inverter 12V connection',
      ],
      estimatedLaborHours: 0.4,
      averageCostRange: '$190 - $260',
      severity: 'critical',
    },
    Belts: {
      category: 'Belts',
      nameEn: 'Motorcraft Serpentine & Stretchy A/C Belt',
      nameAr: 'سيور المحرك والمكيف المزدوجة موتوركرافت',
      icon: 'all_inclusive',
      intervalKm: 80000,
      intervalMonths: 60,
      oemSpec: 'Ford Dual Drive Belts (Main Serpentine + Elastic AC Belt)',
      capacityOrSpec: 'Requires special stretch-belt install tool',
      inspectionChecklist: [
        'Inspect belt ribs and check tensioner pulley bearing play',
        'Verify A/C compressor belt tension',
      ],
      estimatedLaborHours: 0.8,
      averageCostRange: '$110 - $175',
      severity: 'standard',
    },
    Wipers: {
      category: 'Wipers',
      nameEn: 'Motorcraft Premium All-Weather Blades',
      nameAr: 'مساحات زجاج موتوركرافت لجميع الفصول',
      icon: 'water',
      intervalKm: 15000,
      intervalMonths: 12,
      oemSpec: '22" Driver / 22" Passenger Heavy Duty Beam',
      capacityOrSpec: 'Top-lock truck wiper attachment',
      inspectionChecklist: ['Inspect rubber edge and clean blade silicone coating'],
      estimatedLaborHours: 0.2,
      averageCostRange: '$35 - $55',
      severity: 'standard',
    },
    Tires: {
      category: 'Tires',
      nameEn: 'Tire Rotation, Pressure & 4WD Balance',
      nameAr: 'تدوير عجلات الدفع الرباعي والترصيص',
      icon: 'trip_origin',
      intervalKm: 10000,
      intervalMonths: 6,
      oemSpec: '275/60R20 115T (35 PSI Front / 35 PSI Rear)',
      capacityOrSpec: 'Wheel Lug Torque: 204 Nm (150 lb-ft)',
      inspectionChecklist: [
        'Perform rearward-cross tire rotation for 4WD truck platform',
        'Torque 6-lug heavy nuts in cross pattern to 150 lb-ft',
        'Inspect spare tire pressure under bed',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$40 - $70',
      severity: 'standard',
    },
    Brakes: {
      category: 'Brakes',
      nameEn: 'Heavy-Duty 4-Wheel Disc Brake Pads',
      nameAr: 'أقمشة فرامل الخدمة الشاقة ديسكات أمامية وخلفية',
      icon: 'disc_full',
      intervalKm: 30000,
      intervalMonths: 24,
      oemSpec: 'Motorcraft Severe-Duty Semi-Metallic / Ceramic Compound',
      capacityOrSpec: 'Front 350mm Vented / Rear 336mm Vented with EPB',
      inspectionChecklist: [
        'Engage EPB Service Mode via scan tool or brake pedal combo before service',
        'Measure pad friction material thickness',
      ],
      estimatedLaborHours: 1.6,
      averageCostRange: '$220 - $400',
      severity: 'critical',
    },
    Suspension: {
      category: 'Suspension',
      nameEn: 'Front Double Wishbone & Rear Leaf Springs',
      nameAr: 'مقصات التعليق الأمامية ومساعدات ويايات الشاحنة',
      icon: 'swap_calls',
      intervalKm: 40000,
      intervalMonths: 36,
      oemSpec: 'Heavy-duty twin-tube FX4 shock absorbers and rear leaf pack',
      capacityOrSpec: 'Torque U-bolts: 149 Nm (110 lb-ft)',
      inspectionChecklist: [
        'Inspect rear leaf spring U-bolts and rubber axle pads',
        'Check upper and lower ball joints with dial indicator',
      ],
      estimatedLaborHours: 0.8,
      averageCostRange: '$95 - $170',
      severity: 'standard',
    },
    Lights: {
      category: 'Lights',
      nameEn: 'Dynamic Bending Quad-Beam LED Headlamps',
      nameAr: 'المصابيح الأمامية LED الديناميكية وإضاءة المقطورة',
      icon: 'lightbulb',
      intervalKm: 20000,
      intervalMonths: 12,
      oemSpec: 'Ford Smart Quad-Beam LED with Pro-Trailer Light Check',
      capacityOrSpec: 'Automatic level aiming sensor',
      inspectionChecklist: [
        'Test 7-pin trailer lighting circuit with trailer simulator tool',
        'Verify auto-leveling vertical beam calibration',
      ],
      estimatedLaborHours: 0.3,
      averageCostRange: '$30 - $60',
      severity: 'standard',
    },
  },

  // 3. PORSCHE 911 GT3 (992) 4.0L PDK
  'porsche-911-gt3-992-4.0l-pdk': {
    'Engine Oil': {
      category: 'Engine Oil',
      nameEn: 'Mobil 1 ESP X3 0W-40 (Porsche C40 Approval)',
      nameAr: 'زيت محرك موبيل 1 ESP X3 0W-40 المعتمد من بورش C40',
      icon: 'oil_barrel',
      intervalKm: 10000,
      intervalMonths: 12,
      oemSpec: 'Porsche C40 Specification (Full Synthetic 9,000 RPM Rated)',
      capacityOrSpec: '8.0 Liters (8.45 Qts) with Dry Sump Evacuation',
      inspectionChecklist: [
        'Drain oil from dry-sump reservoir tank and engine crankcase sump plugs',
        'Replace aluminum sealing crush washers (Part # 900-123-106-30)',
        'Check oil level via digital instrument cluster at 90°C oil temp',
      ],
      estimatedLaborHours: 1.2,
      averageCostRange: '$220 - $320',
      severity: 'critical',
    },
    'Oil Filter': {
      category: 'Oil Filter',
      nameEn: 'Porsche OEM Cartridge Filter',
      nameAr: 'فلتر زيت محرك بورش الأصلي',
      icon: 'filter_alt',
      intervalKm: 10000,
      intervalMonths: 12,
      oemSpec: 'Porsche OEM 9A2-107-225-00 Cartridge',
      oemPartNumber: '9A2-107-225-00',
      capacityOrSpec: 'High-flow paper element for 9,000 RPM oil pressures',
      inspectionChecklist: [
        'Lubricate filter housing O-ring and torque cap to 25 Nm',
        'Inspect pleats for metallic particle wash',
      ],
      estimatedLaborHours: 0.4,
      averageCostRange: '$35 - $50',
      severity: 'critical',
    },
    'Air Filter': {
      category: 'Air Filter',
      nameEn: 'Twin High-Flow Intake Filters',
      nameAr: 'فلاتر سحب الهواء المزدوجة عالية التدفق',
      icon: 'air',
      intervalKm: 20000,
      intervalMonths: 24,
      oemSpec: 'Porsche OEM 992-129-620 Conical Elements',
      capacityOrSpec: 'Requires rear engine cover spoiler service position',
      inspectionChecklist: [
        'Place rear wing into maintenance service angle',
        'Clean carbon ram-air decklid ducts before replacing elements',
      ],
      estimatedLaborHours: 1.0,
      averageCostRange: '$120 - $180',
      severity: 'standard',
    },
    'Cabin Filter': {
      category: 'Cabin Filter',
      nameEn: 'Porsche Fine Dust Charcoal Filter',
      nameAr: 'فلتر تنقية هواء المقصورة ضد الغبار الدقيق',
      icon: 'hvac',
      intervalKm: 20000,
      intervalMonths: 24,
      oemSpec: 'Porsche Activated Charcoal Pollen Filter (992-819-429)',
      capacityOrSpec: 'Front cowl plenum & passenger footwell dual stages',
      inspectionChecklist: ['Replace pre-filter under frunk cowl and secondary cabin microfilter'],
      estimatedLaborHours: 0.5,
      averageCostRange: '$75 - $110',
      severity: 'standard',
    },
    Coolant: {
      category: 'Coolant',
      nameEn: 'Porsche Genuine Coolant G40 (Pink / Violet)',
      nameAr: 'سائل تبريد بورش الأصلي G40 طويل الأمد',
      icon: 'ac_unit',
      intervalKm: 60000,
      intervalMonths: 48,
      oemSpec: 'Porsche TL-774-G (G40 Si-OAT)',
      capacityOrSpec: '23.0 Liters total chassis fill (Front dual radiators)',
      inspectionChecklist: [
        'Vacuum refill cooling circuit with Porsche PIWIS diagnostic bleeder mode',
        'Clear front bumper air intakes of gravel and track debris',
      ],
      estimatedLaborHours: 2.0,
      averageCostRange: '$250 - $380',
      severity: 'critical',
    },
    'Brake Fluid': {
      category: 'Brake Fluid',
      nameEn: 'Castrol SRF / Porsche Racing DOT 4',
      nameAr: 'سائل فرامل السباقات كاسترول SRF / بورش DOT 4',
      icon: 'water_drop',
      intervalKm: 20000,
      intervalMonths: 24,
      oemSpec: 'DOT 4 High Boiling Point (>310°C Dry / >270°C Wet)',
      capacityOrSpec: '1.5 Liters pressure bleed',
      inspectionChecklist: [
        'Flush both inner and outer bleed nipples on 6-piston front calipers',
        'Inspect ceramic pistons for thermal cracking',
      ],
      estimatedLaborHours: 1.2,
      averageCostRange: '$180 - $260',
      severity: 'critical',
    },
    'Transmission Fluid': {
      category: 'Transmission Fluid',
      nameEn: 'Porsche PDK Clutch & Gear Oil (Dual Fluid System)',
      nameAr: 'سائل كلتش وتروس جير بورش PDK المزدوج',
      icon: 'settings_backup_restore',
      intervalKm: 60000,
      intervalMonths: 48,
      oemSpec: 'Pentosin FFL-3 (Clutch) & Mobilube PTX 75W-90 (Differential)',
      capacityOrSpec: 'PDK dual chamber drain & refill',
      inspectionChecklist: [
        'Execute PDK oil calibration via PIWIS tester during fill cycle',
        'Verify electronic locking rear differential oil level',
      ],
      estimatedLaborHours: 2.5,
      averageCostRange: '$480 - $650',
      severity: 'critical',
    },
    'Power Steering Fluid': {
      category: 'Power Steering Fluid',
      nameEn: 'Porsche Electromechanical Power Steering & Rear Axle Steer',
      nameAr: 'توجيه بورش الكهروميكانيكي مع توجيه المحور الخلفي',
      icon: 'adjust',
      intervalKm: 40000,
      intervalMonths: 48,
      oemSpec: 'Sealed Dual-Actuator Electromechanical Steering & Rear Axle Steer (RAS)',
      capacityOrSpec: 'Electronic calibration check',
      inspectionChecklist: [
        'Inspect rear axle steering electromechanical actuators and boots',
        'Check steering angle sensor center index calibration',
      ],
      estimatedLaborHours: 0.8,
      averageCostRange: '$90 - $150',
      severity: 'standard',
    },
    'Spark Plugs': {
      category: 'Spark Plugs',
      nameEn: 'Porsche OEM GT3 High-RPM Spark Plugs',
      nameAr: 'شمعات إشعال بورش GT3 لمحركات 9000 دورة',
      icon: 'flash_on',
      intervalKm: 30000,
      intervalMonths: 24,
      oemSpec: 'Bosch / Porsche High Thermal Range Plugs (992-905-601)',
      capacityOrSpec: '6 Plugs (Torque: 28 Nm without lubricant)',
      inspectionChecklist: [
        'Remove rear inner fender liners and heat shielding for cylinder access',
        'Inspect ceramic insulator for high-RPM flashover tracking',
      ],
      estimatedLaborHours: 2.5,
      averageCostRange: '$280 - $420',
      severity: 'critical',
    },
    Battery: {
      category: 'Battery',
      nameEn: 'Porsche Lightweight Lithium-Ion Starter Battery (LiFePO4)',
      nameAr: 'بطارية ليثيوم أيون خفيفة الوزن الأصلية من بورش',
      icon: 'battery_charging_full',
      intervalKm: 40000,
      intervalMonths: 48,
      oemSpec: '12V 40Ah / 60Ah LiFePO4 with Internal BMS and CAN Wakeup',
      capacityOrSpec: 'Requires Li-Ion compatible charger',
      inspectionChecklist: [
        'Check battery internal BMS cell balance via PIWIS',
        'Verify frunk emergency manual positive terminal release',
      ],
      estimatedLaborHours: 0.5,
      averageCostRange: '$450 - $1,200',
      severity: 'critical',
    },
    Belts: {
      category: 'Belts',
      nameEn: 'Accessory Drive Poly-V Belt',
      nameAr: 'سير المحرك المسنن بورش Poly-V',
      icon: 'all_inclusive',
      intervalKm: 60000,
      intervalMonths: 48,
      oemSpec: 'Porsche OEM Poly-V Belt for dry sump water/alternator drive',
      capacityOrSpec: 'Automatic hydraulic tensioner',
      inspectionChecklist: ['Inspect belt wear from underneath engine carrier bracket'],
      estimatedLaborHours: 1.0,
      averageCostRange: '$140 - $220',
      severity: 'standard',
    },
    Wipers: {
      category: 'Wipers',
      nameEn: 'Porsche OEM Aero Wiper Blades',
      nameAr: 'شفرات مساحات بورش الهوائية المقاومة للسرعات',
      icon: 'water',
      intervalKm: 15000,
      intervalMonths: 12,
      oemSpec: 'High-speed aerodynamic spoiler integrated blades',
      capacityOrSpec: '21" Driver / 21" Passenger',
      inspectionChecklist: ['Inspect aerodynamic spoiler blade stability at high velocities'],
      estimatedLaborHours: 0.2,
      averageCostRange: '$45 - $75',
      severity: 'standard',
    },
    Tires: {
      category: 'Tires',
      nameEn: 'Track / Street Tire Inspection & Center-Lock Torque',
      nameAr: 'فحص إطارات الحلبات وعزم قفل السنتر لوك',
      icon: 'trip_origin',
      intervalKm: 10000,
      intervalMonths: 6,
      oemSpec: 'Michelin Pilot Sport Cup 2 (255/35ZR20 Front / 315/30ZR21 Rear)',
      capacityOrSpec: 'Center-Lock Torque: 600 Nm (443 lb-ft) with Castrol Optimoly TA paste',
      inspectionChecklist: [
        'Apply Castrol Optimoly paste to cone, threads, and safety lock ring',
        'Torque center-lock nut to 600 Nm with 3/4" torque wrench',
        'Verify central locking safety locking pin pops fully flush into position',
        'Measure inner shoulder camber wear from aggressive track alignment',
      ],
      estimatedLaborHours: 1.0,
      averageCostRange: '$90 - $160',
      severity: 'critical',
    },
    Brakes: {
      category: 'Brakes',
      nameEn: 'Porsche Carbon Ceramic (PCCB) / Cast Iron 408mm Discs',
      nameAr: 'فحص منظومة مكابح بورش الكربون سيراميك PCCB',
      icon: 'disc_full',
      intervalKm: 20000,
      intervalMonths: 24,
      oemSpec: 'PCCB 410mm Front 6-Piston Monobloc / 390mm Rear 4-Piston',
      capacityOrSpec: 'Minimum pad thickness: 5.0mm / Discard disc weight stamped on hub',
      inspectionChecklist: [
        'Measure carbon ceramic rotor density with Carboteq optical laser gauge',
        'Never let pad backplate contact ceramic matrix (replace pad at 5mm)',
        'Inspect caliper titanium piston heat shims',
      ],
      estimatedLaborHours: 1.8,
      averageCostRange: '$350 - $900',
      severity: 'critical',
    },
    Suspension: {
      category: 'Suspension',
      nameEn: 'Double Wishbone Front Suspension & Uniball Bearings',
      nameAr: 'نظام التعليق الأمامي المزدوج ومفاصل يوني بول المعدنية',
      icon: 'swap_calls',
      intervalKm: 20000,
      intervalMonths: 24,
      oemSpec: 'Motorsport derived spherical uniball joints & PASM electronic dampers',
      capacityOrSpec: 'Track ride-height & anti-roll bar adjustable links',
      inspectionChecklist: [
        'Inspect spherical uniball rubber dust seals for integrity',
        'Check helper springs on threaded coilover shock bodies',
        'Verify PASM electric damper valve wiring harness connector locks',
      ],
      estimatedLaborHours: 1.2,
      averageCostRange: '$150 - $280',
      severity: 'standard',
    },
    Lights: {
      category: 'Lights',
      nameEn: 'Porsche Dynamic Light System Plus (PDLS+) Matrix LED',
      nameAr: 'مصابيح بورش ماتريكس LED المتكيفة PDLS+',
      icon: 'lightbulb',
      intervalKm: 20000,
      intervalMonths: 12,
      oemSpec: '84-Pixel Matrix LED units with 4-point daytime running light signature',
      capacityOrSpec: 'Camera-based glare-free high beam calibration',
      inspectionChecklist: [
        'Calibrate optical matrix LED light projection angle',
        'Inspect rear light bar LED illumination uniformity across rear decklid',
      ],
      estimatedLaborHours: 0.4,
      averageCostRange: '$40 - $80',
      severity: 'standard',
    },
  },
};

// ==========================================
// CANONICAL TIMELINE INTERVAL MILESTONES
// ==========================================

export const TIMELINE_MILESTONES: TimelineInterval[] = [
  {
    km: 0,
    miles: 0,
    months: 0,
    titleEn: 'Pre-Delivery & Baseline Inspection (PDI)',
    titleAr: 'فحص الاستلام والتهيئة الأساسية (PDI)',
    descriptionEn: 'Factory baseline verification: check all fluid levels, tire pressures, torque fasteners, and zero-point calibration.',
    descriptionAr: 'التحقق الأساسي للمصنع: فحص مستويات جميع السوائل، ضغوط الإطارات، عزوم المسامير، ومعايرة أجهزة الاستشعار.',
    categoriesIncluded: ['Engine Oil', 'Coolant', 'Brake Fluid', 'Tires', 'Lights', 'Battery'],
    isMajorService: false,
    estimatedLaborHours: 1.5,
    estimatedCostRange: '$0 (Factory Warranty)',
  },
  {
    km: 5000,
    miles: 3100,
    months: 6,
    titleEn: '5,000 km / 6 Mo Inspection & Tire Rotation',
    titleAr: 'صيانة 5,000 كم / 6 أشهر: فحص وتدوير الإطارات',
    descriptionEn: 'Tire rotation, front/rear brake pad visual check, fluid top-off, and diagnostic systems scan.',
    descriptionAr: 'تدوير الإطارات، فحص بصري لبطانات الفرامل، استكمال السوائل، ومسح إلكتروني لأنظمة المركبة.',
    categoriesIncluded: ['Tires', 'Brakes', 'Lights'],
    isMajorService: false,
    estimatedLaborHours: 0.8,
    estimatedCostRange: '$45 - $80',
  },
  {
    km: 10000,
    miles: 6200,
    months: 12,
    titleEn: '10,000 km / 12 Mo Full Service (Oil & Filter)',
    titleAr: 'صيانة 10,000 كم / 12 شهراً: تغيير الزيت والفلتر الدوري',
    descriptionEn: 'Full synthetic engine oil change, OEM filter replacement, multi-point chassis safety inspection, and tire rotation.',
    descriptionAr: 'تغيير زيت المحرك التخليقي بالكامل، فلتر أصلي، فحص سلامة الهيكل المتعدد، وتدوير الإطارات.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Tires', 'Wipers', 'Lights'],
    isMajorService: false,
    estimatedLaborHours: 1.2,
    estimatedCostRange: '$90 - $160',
  },
  {
    km: 20000,
    miles: 12400,
    months: 24,
    titleEn: '20,000 km / 24 Mo Cabin & Safety Service',
    titleAr: 'صيانة 20,000 كم / 24 شهراً: فلتر المقصورة والسلامة',
    descriptionEn: 'Second oil change, cabin microfilter renewal, brake pad & rotor micrometer measurement, and wiper blade replacement.',
    descriptionAr: 'تغيير الزيت والفلتر الثاني، تجديد فلتر هواء المقصورة، قياس سماكة أقراص وبطانات الفرامل، وتبديل المساحات.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Cabin Filter', 'Brakes', 'Wipers', 'Tires'],
    isMajorService: false,
    estimatedLaborHours: 1.8,
    estimatedCostRange: '$160 - $240',
  },
  {
    km: 40000,
    miles: 24800,
    months: 36,
    titleEn: '40,000 km / 36 Mo Intermediate Service (Brake Fluid)',
    titleAr: 'صيانة 40,000 كم / 36 شهراً: سائل الفرامل وفلتر الهواء',
    descriptionEn: 'Hydraulic brake fluid pressure flush, engine air cleaner element, 12V battery load test, and suspension ball joint inspection.',
    descriptionAr: 'استبدال سائل الفرامل بالضغط، فلتر هواء المحرك، فحص قدرة بطارية 12V، وفحص مفاصل وأذرع التعليق.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Air Filter', 'Brake Fluid', 'Battery', 'Suspension'],
    isMajorService: true,
    estimatedLaborHours: 2.8,
    estimatedCostRange: '$290 - $480',
  },
  {
    km: 60000,
    miles: 37200,
    months: 48,
    titleEn: '60,000 km / 48 Mo Powertrain & Belts Service',
    titleAr: 'صيانة 60,000 كم / 48 شهراً: منظومة الحركة والسيور',
    descriptionEn: 'Transmission fluid inspection/service, accessory drive belt evaluation, spark plugs (turbo/high-output), and brake fluid flush.',
    descriptionAr: 'فحص/خدمة زيت ناقل الحركة، تقييم سيور المحرك، شمعات الاحتراق (للمحركات التوربينية)، وفحص شامل لمنظومة التوجيه.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Transmission Fluid', 'Belts', 'Brakes', 'Power Steering Fluid'],
    isMajorService: true,
    estimatedLaborHours: 3.5,
    estimatedCostRange: '$420 - $750',
  },
  {
    km: 80000,
    miles: 49700,
    months: 60,
    titleEn: '80,000 km / 60 Mo Cooling & Brake Renewal',
    titleAr: 'صيانة 80,000 كم / 60 شهراً: التبريد والفرامل الشاملة',
    descriptionEn: 'Engine cooling system flush, front & rear brake pad renewal, drive belts replacement, and cabin/air filters.',
    descriptionAr: 'تفريغ وتعبئة سائل التبريد، تجديد أقمشة الفرامل الأمامية والخلفية، استبدال سيور المحرك، وفلاتر الهواء والمقصورة.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Coolant', 'Brakes', 'Belts', 'Cabin Filter', 'Air Filter'],
    isMajorService: true,
    estimatedLaborHours: 4.2,
    estimatedCostRange: '$520 - $880',
  },
  {
    km: 100000,
    miles: 62100,
    months: 72,
    titleEn: '100,000 km / 72 Mo Major Milestone Overhaul',
    titleAr: 'صيانة 100,000 كم / 72 شهراً: الصيانة الكبرى الشاملة',
    descriptionEn: 'Complete major overhaul: Iridium spark plugs, transmission drain & refill, all filters, cooling flush, and suspension bushings.',
    descriptionAr: 'صيانة رئيسية كبرى: شمعات إشعال إيريديوم، تغيير زيت ناقل الحركة، جميع الفلاتر، غسيل دورة التبريد، وجلب المقصات.',
    categoriesIncluded: [
      'Engine Oil',
      'Oil Filter',
      'Air Filter',
      'Cabin Filter',
      'Spark Plugs',
      'Transmission Fluid',
      'Coolant',
      'Brake Fluid',
      'Belts',
      'Battery',
      'Suspension',
      'Tires',
    ],
    isMajorService: true,
    estimatedLaborHours: 6.0,
    estimatedCostRange: '$750 - $1,350',
  },
  {
    km: 120000,
    miles: 74500,
    months: 84,
    titleEn: '120,000 km Extended Lifecycle Service',
    titleAr: 'صيانة 120,000 كم: دورة التشغيل الممتدة',
    descriptionEn: 'Engine oil & filter, brake fluid renewal, suspension strut dampening check, and exhaust catalytic converter inspection.',
    descriptionAr: 'زيت وفلتر المحرك، تجديد سائل الفرامل، فحص كفاءة امتصاص الصدمات للمساعدات، وفحص دبات التلوث والعادم.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Brake Fluid', 'Suspension', 'Tires'],
    isMajorService: false,
    estimatedLaborHours: 2.2,
    estimatedCostRange: '$240 - $410',
  },
  {
    km: 150000,
    miles: 93200,
    months: 96,
    titleEn: '150,000 km Mechanical Longevity Certification',
    titleAr: 'صيانة 150,000 كم: اعتماد واستدامة الأداء الميكانيكي',
    descriptionEn: 'Water pump & thermostat evaluation, transmission fluid change, starter/alternator health, and oxygen sensor response check.',
    descriptionAr: 'تقييم مضخة الماء والبلف، تغيير زيت الجير، فحص الدينامو والسلف، واختبار استجابة حساسات الأكسجين.',
    categoriesIncluded: ['Engine Oil', 'Oil Filter', 'Coolant', 'Transmission Fluid', 'Belts', 'Battery', 'Brakes'],
    isMajorService: true,
    estimatedLaborHours: 4.8,
    estimatedCostRange: '$620 - $1,100',
  },
  {
    km: 200000,
    miles: 124200,
    months: 120,
    titleEn: '200,000 km Double Century Master Renewal',
    titleAr: 'صيانة 200,000 كم: التجديد الشامل لمئتي ألف كيلومتر',
    descriptionEn: 'Full bumper-to-bumper powertrain, chassis, suspension, braking, and electronic sensor renewal certification.',
    descriptionAr: 'فحص وتجديد شامل للمحرك، ناقل الحركة، الشاسيه، نظام التعليق، الفرامل، وحساسات الإدارة الإلكترونية.',
    categoriesIncluded: [
      'Engine Oil',
      'Oil Filter',
      'Air Filter',
      'Cabin Filter',
      'Spark Plugs',
      'Transmission Fluid',
      'Coolant',
      'Brake Fluid',
      'Suspension',
      'Belts',
      'Brakes',
      'Battery',
      'Tires',
      'Lights',
    ],
    isMajorService: true,
    estimatedLaborHours: 7.5,
    estimatedCostRange: '$950 - $1,800',
  },
];

// ==========================================
// DEFAULT SEEDED COMPREHENSIVE SERVICE RECORDS
// ==========================================

export const INITIAL_SERVICE_RECORDS: Record<string, ComprehensiveServiceRecord[]> = {
  'toyota-camry-2018-xv70-2.5l-se-auto': [
    {
      id: 'rec-camry-01',
      vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto',
      date: '2023-05-12',
      odometerKm: 30000,
      title: 'Full Synthetic 0W-16 Oil Change & Multi-Point Inspection',
      categories: ['Engine Oil', 'Oil Filter', 'Tires'],
      technician: 'alaa Mohammed (Lead Developer)',
      notes: 'Replaced oil with Toyota 0W-16 (4.8L). Replaced filter 04152-YZZA1. Torqued drain plug to 40 Nm with new crush washer. Rotated tires.',
      status: 'Completed',
      intervalKmTriggered: 30000,
      invoice: {
        invoiceNumber: 'INV-TY-99214',
        shopName: 'Toyota Certified Technical Center',
        partsCost: 68.5,
        laborCost: 45.0,
        taxAmount: 9.08,
        totalAmount: 122.58,
        paymentMethod: 'Credit Card',
        date: '2023-05-12',
      },
      photos: [
        {
          id: 'p-1',
          url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
          caption: 'Fresh 0W-16 Engine Oil & Filter Installation',
          timestamp: '2023-05-12 10:14 AM',
          category: 'Engine Oil',
        },
      ],
      partsReplaced: [
        { name: 'Toyota 0W-16 Synthetic Oil (5 Qt)', partNumber: '00279-16QTE', quantity: 1, cost: 42.0 },
        { name: 'Oil Filter Element', partNumber: '04152-YZZA1', quantity: 1, cost: 12.5 },
        { name: 'Drain Gasket', partNumber: '90430-12031', quantity: 1, cost: 2.0 },
      ],
    },
    {
      id: 'rec-camry-02',
      vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto',
      date: '2023-11-20',
      odometerKm: 39500,
      title: 'Cabin Microfilter & Brake Fluid Hydrometer Check',
      categories: ['Cabin Filter', 'Brake Fluid', 'Wipers'],
      technician: 'alaa Mohammed (Lead Developer)',
      notes: 'Cabin air microfilter was heavily loaded with autumn debris; replaced with active carbon unit. Brake fluid tested 1.4% moisture (acceptable). Replaced front wiper refills.',
      status: 'Completed',
      intervalKmTriggered: 40000,
      invoice: {
        invoiceNumber: 'INV-TY-10482',
        shopName: 'Toyota Certified Technical Center',
        partsCost: 52.0,
        laborCost: 35.0,
        taxAmount: 6.96,
        totalAmount: 93.96,
        paymentMethod: 'Debit Card',
        date: '2023-11-20',
      },
    },
  ],

  'ford-f150-2021-14gen-3.5l-ecoboost-4x4': [
    {
      id: 'rec-f150-01',
      vehicleId: 'ford-f150-2021-14gen-3.5l-ecoboost-4x4',
      date: '2024-01-20',
      odometerKm: 52000,
      title: 'Spark Plugs & Motorcraft Yellow Coolant Service',
      categories: ['Spark Plugs', 'Coolant', 'Engine Oil', 'Oil Filter'],
      technician: 'alaa Mohammed (Lead Developer)',
      notes: 'Flushed cooling system with Motorcraft Yellow (WSS-M97B57-A1). Installed 6x SP-578 spark plugs gapped to 0.030" for high-boost calibration.',
      status: 'Completed',
      intervalKmTriggered: 60000,
      invoice: {
        invoiceNumber: 'INV-FD-8812',
        shopName: 'Ford Performance Calibration Lab',
        partsCost: 185.0,
        laborCost: 140.0,
        taxAmount: 26.0,
        totalAmount: 351.0,
        paymentMethod: 'Credit Card',
        date: '2024-01-20',
      },
      photos: [
        {
          id: 'p-f1',
          url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
          caption: 'Twin Turbo EcoBoost Plugs Gap Inspection',
          timestamp: '2024-01-20 11:30 AM',
          category: 'Spark Plugs',
        },
      ],
    },
  ],

  'porsche-911-gt3-992-4.0l-pdk': [
    {
      id: 'rec-gt3-01',
      vehicleId: 'porsche-911-gt3-992-4.0l-pdk',
      date: '2024-02-14',
      odometerKm: 12000,
      title: 'Track Inspection & Castrol SRF Brake Fluid Flush',
      categories: ['Brake Fluid', 'Engine Oil', 'Oil Filter', 'Tires'],
      technician: 'alaa Mohammed (Lead Developer)',
      notes: 'Castrol SRF high boiling point brake fluid flushed across all 6 front & 4 rear pistons. Mobil 1 ESP X3 0W-40 dry sump evacuation completed. Center-locks torqued to 600 Nm with Optimoly paste.',
      status: 'Completed',
      intervalKmTriggered: 10000,
      invoice: {
        invoiceNumber: 'INV-P-99204',
        shopName: 'Porsche Motorsport Technical Center',
        partsCost: 310.0,
        laborCost: 260.0,
        taxAmount: 45.6,
        totalAmount: 615.6,
        paymentMethod: 'Credit Card',
        date: '2024-02-14',
      },
    },
  ],
};

// ==========================================
// CALCULATION ENGINES
// ==========================================

export function getVehicleCategorySpecs(vehicleId: string): Record<MaintenanceCategory, MaintenanceCategorySpec> {
  if (VEHICLE_CATEGORY_SPECS[vehicleId]) {
    return VEHICLE_CATEGORY_SPECS[vehicleId];
  }

  // Fallback to Camry verified specs with customized category names
  return VEHICLE_CATEGORY_SPECS['toyota-camry-2018-xv70-2.5l-se-auto'];
}

export function calculateCategoryStatus(
  category: MaintenanceCategory,
  spec: MaintenanceCategorySpec,
  currentOdometerKm: number,
  serviceRecords: ComprehensiveServiceRecord[]
): CategoryStatusResult {
  // Find latest completed service record that includes this category
  const matchingRecords = serviceRecords
    .filter((r) => r.status === 'Completed' && r.categories.includes(category))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const latestRecord = matchingRecords[0];

  const lastServiceDate = latestRecord ? latestRecord.date : null;
  const lastServiceOdometer = latestRecord ? latestRecord.odometerKm : 0;

  const nextServiceOdometer = lastServiceOdometer + spec.intervalKm;

  // Next service date estimation: default 15,000 km/year driving pace (approx 41 km/day)
  let nextServiceDate = '';
  if (lastServiceDate) {
    const lastDate = new Date(lastServiceDate);
    const monthsToAdd = spec.intervalMonths;
    const targetDate = new Date(lastDate);
    targetDate.setMonth(targetDate.getMonth() + monthsToAdd);
    nextServiceDate = targetDate.toISOString().split('T')[0];
  } else {
    // Project based on today
    const now = new Date();
    now.setMonth(now.getMonth() + spec.intervalMonths);
    nextServiceDate = now.toISOString().split('T')[0];
  }

  const kmRemaining = nextServiceOdometer - currentOdometerKm;

  let daysRemaining = 90;
  if (nextServiceDate) {
    const targetTime = new Date(nextServiceDate).getTime();
    const nowTime = new Date().getTime();
    daysRemaining = Math.round((targetTime - nowTime) / (1000 * 60 * 60 * 24));
  }

  // Determine Alert Status
  // Overdue: kmRemaining <= 0 OR daysRemaining <= 0
  // Due: kmRemaining <= 1000 OR daysRemaining <= 30
  // Upcoming: kmRemaining <= 3000 OR daysRemaining <= 60
  // Healthy: otherwise
  let status: 'Overdue' | 'Due' | 'Upcoming' | 'Healthy' = 'Healthy';

  if (kmRemaining <= 0 || daysRemaining <= 0) {
    status = 'Overdue';
  } else if (kmRemaining <= 1000 || daysRemaining <= 30) {
    status = 'Due';
  } else if (kmRemaining <= 3000 || daysRemaining <= 60) {
    status = 'Upcoming';
  } else {
    status = 'Healthy';
  }

  const kmUsed = currentOdometerKm - lastServiceOdometer;
  const progressPercent = Math.min(100, Math.max(0, Math.round((kmUsed / spec.intervalKm) * 100)));

  return {
    category,
    status,
    lastServiceDate,
    lastServiceOdometer,
    nextServiceDate,
    nextServiceOdometer,
    kmRemaining,
    daysRemaining,
    progressPercent,
    spec,
  };
}

export function calculateTimelineIntervalStatuses(
  currentOdometerKm: number,
  serviceRecords: ComprehensiveServiceRecord[]
): TimelineIntervalStatusResult[] {
  return TIMELINE_MILESTONES.map((interval) => {
    // Check if this interval has an explicit completed record near this odometer (+/- 2,500 km)
    // or tagged with intervalKmTriggered
    const completedRecord = serviceRecords.find(
      (r) =>
        r.status === 'Completed' &&
        (r.intervalKmTriggered === interval.km ||
          Math.abs(r.odometerKm - interval.km) <= (interval.km === 0 ? 500 : 2000))
    );

    let status: 'Completed' | 'Overdue' | 'Due' | 'Upcoming' | 'Future' = 'Future';

    if (completedRecord) {
      status = 'Completed';
    } else if (currentOdometerKm >= interval.km + 1500) {
      status = 'Overdue';
    } else if (Math.abs(currentOdometerKm - interval.km) <= 1500 || (currentOdometerKm < interval.km && interval.km - currentOdometerKm <= 2000)) {
      status = 'Due';
    } else if (interval.km - currentOdometerKm <= 5000) {
      status = 'Upcoming';
    } else {
      status = 'Future';
    }

    const categoriesStatus = interval.categoriesIncluded.map((cat) => {
      const isCompleted = serviceRecords.some(
        (r) => r.status === 'Completed' && r.categories.includes(cat) && r.odometerKm >= interval.km - 5000
      );
      return { category: cat, isCompleted };
    });

    return {
      interval,
      status,
      completedDate: completedRecord?.date,
      completedOdometer: completedRecord?.odometerKm,
      categoriesStatus,
    };
  });
}
