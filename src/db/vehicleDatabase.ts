import { VehicleProfileData } from './vehicleTypes';

export const VEHICLE_PROFILES: VehicleProfileData[] = [
  // 1. TOYOTA CAMRY 2018 (XV70) - User's explicit prompt example
  {
    id: 'toyota-camry-2018-xv70-2.5l-se-auto',
    make: 'Toyota',
    model: 'Camry',
    year: 2018,
    generation: 'XV70 (8th Gen)',
    engine: '2.5L I4 Dynamic Force (A25A-FKS)',
    displacement: '2,487 cc (2.5L)',
    cylinderCount: 4,
    cylinderLayout: 'Inline-4',
    horsepower: 203,
    torqueLbFt: 184,
    trim: 'SE Sport',
    transmission: '8-speed Direct Shift Automatic (UB80E)',
    fuelType: 'Gasoline 87 Octane',
    driveType: 'FWD',
    vinExample: '4T1B11HK5JU128491',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=1200&q=80',
    curbWeightLbs: 3340,
    fluids: [
      {
        name: 'Engine Oil',
        spec: 'Toyota Genuine Motor Oil SAE 0W-16 (API SN Plus / SP / ILSAC GF-6B)',
        capacity: '4.8 Liters (5.1 US Qts) with filter replacement',
        serviceInterval: '10,000 miles / 12 months (5,000 mi for severe driving)',
        notes: '0W-20 is allowed for one oil change interval but must be returned to 0W-16 on subsequent change.',
      },
      {
        name: 'Automatic Transmission Fluid',
        spec: 'Toyota Genuine ATF WS (World Standard)',
        capacity: '6.8 Liters (Total fill) / ~2.6 Liters drain & refill',
        serviceInterval: '60,000 miles inspection / 100,000 miles drain & refill',
        notes: 'Fluid level must be inspected via overflow plug at temperature window 35°C - 45°C.',
      },
      {
        name: 'Engine Coolant',
        spec: 'Toyota Super Long Life Coolant (Pink 50/50 Pre-diluted)',
        capacity: '6.7 Liters (7.1 US Qts)',
        serviceInterval: '100,000 miles / 10 years first interval, then every 50,000 mi',
        notes: 'Silicate-free, non-amine, non-nitrite and non-borate formula with hybrid organic acid technology.',
      },
      {
        name: 'Brake Fluid',
        spec: 'SAE J1703 or FMVSS No. 116 DOT 3 / DOT 4',
        capacity: '1.0 Liter system flush',
        serviceInterval: '30,000 miles / 3 years',
        notes: 'Keep master cylinder reservoir sealed to prevent moisture contamination.',
      },
    ],
    battery: {
      groupSize: 'Group 35 (BCI Size 35)',
      cca: 640,
      chemistry: 'Standard Flooded',
      voltage: '12V',
      reserveCapacityMinutes: 100,
      terminalLocation: 'Top Post',
      partNumberOEM: '00544-24F60-575',
      recommendedReplacementYears: 4,
    },
    tires: {
      standardFront: '235/45R18 94V All-Season',
      standardRear: '235/45R18 94V All-Season',
      pressureColdFrontPsi: 35,
      pressureColdRearPsi: 35,
      boltPattern: '5x114.3 mm (5x4.5 in)',
      wheelLugTorque: '76 lb-ft (103 Nm)',
      speedRating: 'V (149 mph)',
    },
    serviceIntervals: [
      {
        mileage: 5000,
        months: 6,
        title: 'Tire Rotation & Multi-Point Inspection',
        description: 'Rotate tires, inspect brake pads/linings, check wiper fluid and engine oil level.',
        severity: 'standard',
        serviceCategory: 'Engine',
      },
      {
        mileage: 10000,
        months: 12,
        title: 'Full Synthetic 0W-16 Oil & Filter Change',
        description: 'Replace oil filter element and drain plug crush washer. Reset maintenance indicator.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
      {
        mileage: 20000,
        months: 24,
        title: 'Cabin Air Microfilter & Engine Air Cleaner',
        description: 'Inspect and replace active-carbon dust and pollen filter behind glove box.',
        severity: 'standard',
        serviceCategory: 'Filters',
      },
      {
        mileage: 30000,
        months: 36,
        title: 'Brake Fluid Hydraulic Flush & ABS Check',
        description: 'Flush hydraulic brake lines, verify pad friction wear (>3mm), inspect calipers.',
        severity: 'critical',
        serviceCategory: 'Brakes',
      },
      {
        mileage: 60000,
        months: 72,
        title: 'Transmission Drain & Fill Inspection',
        description: 'Inspect ATF WS condition, check drive shaft boots, steering gear linkage.',
        severity: 'standard',
        serviceCategory: 'Transmission',
      },
      {
        mileage: 100000,
        months: 120,
        title: 'Iridium Spark Plugs & Coolant Flush',
        description: 'Replace Denso FC16HR-Q8 Iridium long-life spark plugs (torque 17 Nm). Drain & flush cooling system.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
    ],
    knownMaintenanceTasks: [
      {
        id: 'camry-battery-replacement',
        title: '12V Battery Replacement & ECU Initialization',
        component: 'Group 35 12V Battery & Sensor Terminal',
        system: 'Electrical & Charging',
        estimatedLaborHours: 0.5,
        difficulty: 'Easy',
        commonSymptoms: [
          'Slow engine cranking on cold mornings',
          'Intermittent start-stop failure indicator',
          'Infotainment head unit rebooting upon engine start',
        ],
        recommendedParts: [
          { name: 'Toyota TrueStart Group 35 Battery', oemNumber: '00544-24F60-575', avgCost: '$149.00' },
          { name: 'Corrosion Prevention Felt Washers & Terminal Spray', oemNumber: '00289-00030', avgCost: '$8.50' },
        ],
        factoryProcedureSummary:
          '1. Turn ignition OFF and remove key fob from proximity. 2. Disconnect NEGATIVE (-) 10mm terminal first. 3. Disconnect POSITIVE (+) 10mm terminal. 4. Remove battery hold-down clamp. 5. Install new Group 35 battery with terminals facing rear. 6. Torque clamp to 5.0 Nm. 7. Connect POSITIVE (+) first, then NEGATIVE (-). 8. Initialize power window auto-reverse memory.',
        torqueSpecs: [
          { part: 'Battery Terminal Clamps', spec: '5.4 Nm (48 in-lb)' },
          { part: 'Battery Hold-Down J-Bolt Nut', spec: '5.0 Nm (44 in-lb)' },
        ],
      },
      {
        id: 'camry-thermostat-coolant-bypass',
        title: 'Coolant Bypass Valve & Electronic Thermostat Service',
        component: 'Engine Coolant Bypass Valve',
        system: 'Thermal & Cooling',
        estimatedLaborHours: 2.2,
        difficulty: 'Moderate',
        commonSymptoms: [
          'DTC P268115: Engine Coolant Bypass Valve Control Circuit Open',
          'Check Engine Light on instrument cluster',
          'Slow cabin heat warming in winter',
        ],
        recommendedParts: [
          { name: 'Toyota OEM Coolant Bypass Valve Assembly', oemNumber: '16260-25010', avgCost: '$185.00' },
          { name: 'Toyota Super Long Life Coolant 1 Gallon', oemNumber: '00272-SLLC2', avgCost: '$26.00' },
        ],
        factoryProcedureSummary:
          'Drain engine coolant from radiator petcock. Disconnect electrical harness and vacuum lines from bypass valve near cylinder head rear. Unbolt 3x 10mm retaining bolts. Install new valve with lubricated O-ring. Refill with 50/50 coolant and vacuum bleed air pockets.',
        torqueSpecs: [
          { part: 'Bypass Valve Retaining Bolts', spec: '10 Nm (89 in-lb)' },
          { part: 'Radiator Drain Cock Plug', spec: 'Hand tight + 1/4 turn' },
        ],
      },
      {
        id: 'camry-front-brake-pads-rotors',
        title: 'Front Brake Pads & Vented Rotors Overhaul',
        component: 'Front Disc Brakes & Calipers',
        system: 'Braking System',
        estimatedLaborHours: 1.5,
        difficulty: 'Moderate',
        commonSymptoms: [
          'High-pitch squeal indicator when braking',
          'Steering wheel vibration during high-speed decel (warped rotors)',
          'Friction pad thickness below 2.5 mm',
        ],
        recommendedParts: [
          { name: 'Toyota Ceramic Front Brake Pads Kit', oemNumber: '04465-06100', avgCost: '$78.00' },
          { name: 'Front Vented Brake Rotors (Pair)', oemNumber: '43512-06160', avgCost: '$160.00' },
        ],
        factoryProcedureSummary:
          'Remove 2x 14mm caliper slide pin bolts. Pivot caliper body up and hang with S-hook. Extract old pads and stainless shims. Remove 2x 17mm caliper carrier bracket bolts. Slide rotor off hub. Clean hub face with wire brush, install new rotor, torque carrier to 107 Nm, lube slide pins with silicone paste.',
        torqueSpecs: [
          { part: 'Caliper Carrier Bracket Bolts', spec: '107 Nm (79 lb-ft)' },
          { part: 'Caliper Slide Pin Bolts', spec: '34 Nm (25 lb-ft)' },
          { part: 'Wheel Lug Nuts', spec: '103 Nm (76 lb-ft)' },
        ],
      },
    ],
    history: [
      {
        id: 'srv-101',
        date: '2023-11-14',
        odometer: 39500,
        title: 'Pre-Winter Multi-Point & Tire Rotation',
        category: 'Inspection',
        technician: 'Master Tech Alex Vance',
        notes: 'Tread depth 7/32 all around. Battery CCA measured 580 CCA (Healthy). All fluids topped.',
        status: 'Completed',
      },
      {
        id: 'srv-102',
        date: '2024-04-18',
        odometer: 44200,
        title: 'Full Synthetic 0W-16 Oil & Filter Change',
        category: 'Engine Oil',
        technician: 'Sarah Jenkins',
        notes: 'Replaced oil filter cartridge and drain plug gasket. Torqued to 40 Nm.',
        status: 'Completed',
      },
    ],
  },

  // 2. FORD F-150 2019 (13th Gen) - User's search example "Ford F-150 2019 coolant"
  {
    id: 'ford-f150-2019-13gen-3.5l-lariat-auto',
    make: 'Ford',
    model: 'F-150',
    year: 2019,
    generation: '13th Gen (Aluminum Body)',
    engine: '3.5L EcoBoost Twin-Turbo V6 (D35)',
    displacement: '3,496 cc (3.5L)',
    cylinderCount: 6,
    cylinderLayout: 'V6',
    horsepower: 375,
    torqueLbFt: 470,
    trim: 'Lariat SuperCrew 4WD',
    transmission: '10-speed SelectShift Automatic (10R80)',
    fuelType: 'Gasoline 87 Octane',
    driveType: '4WD',
    vinExample: '1FTFW1E84KFC49182',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    curbWeightLbs: 4890,
    fluids: [
      {
        name: 'Engine Coolant',
        spec: 'Motorcraft Yellow Prediluted Antifreeze/Coolant (WSS-M97B57-A2)',
        capacity: '14.5 Liters (15.3 US Qts)',
        serviceInterval: '100,000 miles / 6 years initial, then every 50,000 mi',
        notes: 'Ford updated spec from Orange (Dexcool) to Yellow OAT/POAT fluid. Do NOT mix with green or conventional coolants.',
      },
      {
        name: 'Engine Oil',
        spec: 'Motorcraft SAE 5W-30 Synthetic Blend (WSS-M2C946-B1)',
        capacity: '5.7 Liters (6.0 US Qts) with filter',
        serviceInterval: '7,500 - 10,000 miles based on Intelligent Oil-Life Monitor',
        notes: 'Twin-Turbo EcoBoost demands high thermal shear stability to protect journal bearings.',
      },
      {
        name: 'Automatic Transmission Fluid',
        spec: 'Motorcraft MERCON ULV (Ultra-Low Viscosity, WSS-M2C949-A)',
        capacity: '12.4 Liters total dry fill / ~5.5 Liters pan drop',
        serviceInterval: '60,000 miles severe towing / 100,000 miles normal',
        notes: 'Requires 10R80 fluid fill pump tool and checking dipstick on passenger side transmission case at 206°F - 215°F.',
      },
      {
        name: 'Front / Rear Differential',
        spec: 'Motorcraft SAE 75W-85 Synthetic Hypoid Gear Oil (WSS-M2C942-A)',
        capacity: 'Front: 1.6L / Rear (9.75" axle): 2.6 Liters + 4 oz friction modifier',
        serviceInterval: '50,000 miles severe / 100,000 miles standard',
        notes: 'Rear electronic locking or limited-slip differentials require XL-3 additive.',
      },
    ],
    battery: {
      groupSize: 'Group 48 / H6 (BCI 48)',
      cca: 760,
      chemistry: 'AGM',
      voltage: '12V',
      reserveCapacityMinutes: 120,
      terminalLocation: 'Top Post',
      partNumberOEM: 'BAGM-48H6-760',
      recommendedReplacementYears: 4,
    },
    tires: {
      standardFront: '275/55R20 113T All-Terrain',
      standardRear: '275/55R20 113T All-Terrain',
      pressureColdFrontPsi: 35,
      pressureColdRearPsi: 35,
      boltPattern: '6x135 mm (6x5.3 in)',
      wheelLugTorque: '150 lb-ft (204 Nm)',
      speedRating: 'T (118 mph)',
    },
    serviceIntervals: [
      {
        mileage: 7500,
        months: 6,
        title: 'Oil Life Monitor & 4WD Chassis Lube',
        description: 'Change oil & filter (Motorcraft FL-500S), inspect U-joints, brake linings.',
        severity: 'standard',
        serviceCategory: 'Engine',
      },
      {
        mileage: 30000,
        months: 24,
        title: 'Transfer Case & Air Filters Service',
        description: 'Drain and refill transfer case (MERCON LV), replace twin engine intake filters.',
        severity: 'standard',
        serviceCategory: 'Fluids',
      },
      {
        mileage: 60000,
        months: 48,
        title: 'Transmission Pan & Spark Plugs (EcoBoost)',
        description: 'Replace CYFS-12Y-PCT spark plugs (gap 0.030") to prevent high-boost misfire.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
      {
        mileage: 100000,
        months: 72,
        title: 'Full Cooling System Flush & Thermostat',
        description: 'Flush cooling loop with Motorcraft Yellow (15.3 Qts), inspect turbo coolant quick-connects.',
        severity: 'critical',
        serviceCategory: 'Cooling',
      },
    ],
    knownMaintenanceTasks: [
      {
        id: 'f150-coolant-flush',
        title: 'Engine Coolant Flush & Turbo Feed O-Ring Inspection',
        component: 'Cooling Radiator & Turbo Coolant Lines',
        system: 'Thermal & Cooling',
        estimatedLaborHours: 2.0,
        difficulty: 'Moderate',
        commonSymptoms: [
          'Sweet maple syrup smell from engine bay',
          'Low coolant reservoir warning',
          'Small coolant drip near turbo exhaust housing quick-connect fittings',
        ],
        recommendedParts: [
          { name: 'Motorcraft Yellow Concentrated Antifreeze', oemNumber: 'VC-13-G', avgCost: '$24.00' },
          { name: 'Turbocharger Coolant Line Quick Connect Fitting', oemNumber: 'BL3Z-6A968-B', avgCost: '$38.00' },
        ],
        factoryProcedureSummary:
          'Allow engine to cool completely. Connect drain hose to radiator petcock. Drain roughly 8L. Refill with 50/50 Motorcraft Yellow OAT coolant. Use vacuum cooling system filler (Airlift) to prevent air locking in heater core and turbo coolant passages. Run engine to 205°F with heater on HIGH.',
        torqueSpecs: [
          { part: 'Radiator Lower Petcock', spec: 'Finger tight until seated' },
          { part: 'Thermostat Housing Bolts', spec: '10 Nm (89 in-lb)' },
        ],
      },
      {
        id: 'f150-cam-phaser-rattle',
        title: 'Variable Cam Timing (VCT) Phaser & Timing Chain Inspection',
        component: 'Intake & Exhaust Cam Phasers',
        system: 'Powertrain & Engine',
        estimatedLaborHours: 9.5,
        difficulty: 'Master Tech',
        commonSymptoms: [
          'Loud 2-5 second metallic rattle upon cold engine start',
          'DTC P0016 / P0018: Camshaft Position Correlation',
          'Rough idle when warm',
        ],
        recommendedParts: [
          { name: 'Updated VCT Intake Phaser Kit', oemNumber: 'ML3Z-6C525-A', avgCost: '$210.00' },
          { name: 'Primary Timing Chain & Guide Tensioners', oemNumber: 'HL3Z-6268-A', avgCost: '$165.00' },
        ],
        factoryProcedureSummary:
          'Follow Ford TSB 21-2119. Evacuate AC, drain cooling system, remove front accessories, valve covers, and front magnesium timing cover. Lock cams using 303-1655 alignment bar. Replace phasers with revised design, torque center bolts.',
        torqueSpecs: [
          { part: 'Camshaft Phaser Center Bolts', spec: '40 Nm + 90 degrees' },
          { part: 'Timing Cover Bolts (M8)', spec: '20 Nm (15 lb-ft)' },
        ],
      },
    ],
    history: [
      {
        id: 'srv-201',
        date: '2024-01-20',
        odometer: 52000,
        title: 'Spark Plugs & Motorcraft Yellow Coolant Service',
        category: 'Cooling / Ignition',
        technician: 'Senior Tech Alex Vance',
        notes: 'Flushed cooling system with Motorcraft Yellow. Installed 6x SP-578 spark plugs gapped to 0.030".',
        status: 'Completed',
      },
    ],
  },

  // 3. HONDA CIVIC 2017 (10th Gen) - User's search example "Honda Civic 2017 brake light"
  {
    id: 'honda-civic-2017-10gen-1.5l-ext-cvt',
    make: 'Honda',
    model: 'Civic',
    year: 2017,
    generation: '10th Gen (FC/FK)',
    engine: '1.5L VTEC Turbo I4 (L15B7)',
    displacement: '1,498 cc (1.5L)',
    cylinderCount: 4,
    cylinderLayout: 'Inline-4',
    horsepower: 174,
    torqueLbFt: 162,
    trim: 'EX-T Sedan',
    transmission: 'Continuously Variable Transmission (CVT LL-CVT)',
    fuelType: 'Gasoline 87 Octane',
    driveType: 'FWD',
    vinExample: '2HGFC1F72HH549102',
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=1200&q=80',
    curbWeightLbs: 2908,
    fluids: [
      {
        name: 'Engine Oil',
        spec: 'Honda Genuine Full Synthetic SAE 0W-20 (API SP / ILSAC GF-6A)',
        capacity: '3.5 Liters (3.7 US Qts) with filter',
        serviceInterval: 'Maintenance Minder Code A / B (~6,500 - 8,000 miles)',
        notes: 'Frequent short-trip cold weather driving requires monitoring for oil dilution; do not extend intervals.',
      },
      {
        name: 'CVT Fluid',
        spec: 'Honda HCF-2 Transmission Fluid',
        capacity: '3.7 Liters (Drain & Refill)',
        serviceInterval: 'Maintenance Minder Sub-item 3 (~25,000 - 30,000 miles)',
        notes: 'CRITICAL: Never use ATF-DW1 or standard automatic transmission fluid in Honda HCF-2 CVTs.',
      },
      {
        name: 'Brake Fluid',
        spec: 'Honda Heavy Duty Brake Fluid DOT 3',
        capacity: '1.0 Liter complete purge',
        serviceInterval: 'Every 36 months regardless of mileage',
        notes: 'Clear fluid prevents corrosion in electronic parking brake (EPB) hydraulic actuators.',
      },
      {
        name: 'Engine Coolant',
        spec: 'Honda Long Life Antifreeze/Coolant Type 2 (Blue)',
        capacity: '5.2 Liters (5.5 US Qts)',
        serviceInterval: '120,000 miles / 10 years first, then every 60,000 mi',
        notes: 'Pre-mixed 50/50 non-silicate formulation.',
      },
    ],
    battery: {
      groupSize: 'Group 51R (BCI 51R)',
      cca: 500,
      chemistry: 'Standard Flooded',
      voltage: '12V',
      reserveCapacityMinutes: 75,
      terminalLocation: 'Top Post (Reversed Terminals)',
      partNumberOEM: '31500-SR1-100M',
      recommendedReplacementYears: 3,
    },
    tires: {
      standardFront: '215/50R17 91H All-Season',
      standardRear: '215/50R17 91H All-Season',
      pressureColdFrontPsi: 32,
      pressureColdRearPsi: 32,
      boltPattern: '5x114.3 mm',
      wheelLugTorque: '80 lb-ft (108 Nm)',
      speedRating: 'H (130 mph)',
    },
    serviceIntervals: [
      {
        mileage: 7500,
        months: 12,
        title: 'Maintenance Minder A: Oil Change',
        description: 'Replace engine oil with Honda 0W-20. Inspect tire wear pattern.',
        severity: 'standard',
        serviceCategory: 'Engine',
      },
      {
        mileage: 15000,
        months: 24,
        title: 'Maintenance Minder B: Oil, Filter & Brake Inspection',
        description: 'Replace oil filter, inspect front/rear pads, calipers, brake lines, tie-rod ends.',
        severity: 'critical',
        serviceCategory: 'Brakes',
      },
      {
        mileage: 30000,
        months: 36,
        title: 'Maintenance Minder 3: HCF-2 CVT Fluid Service',
        description: 'Drain and refill CVT fluid with genuine HCF-2. Inspect transmission pan plug magnet.',
        severity: 'critical',
        serviceCategory: 'Transmission',
      },
      {
        mileage: 60000,
        months: 60,
        title: 'Spark Plugs & Valve Clearance Check',
        description: 'Replace laser iridium plugs (NGK DILKAR8A8) torqued to 22 Nm.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
    ],
    knownMaintenanceTasks: [
      {
        id: 'civic-brake-light-switch',
        title: 'Brake Light Bulb & Stop Light Switch Diagnostics',
        component: 'Tail Lamp Brake Bulb (7443) / Brake Pedal Switch',
        system: 'Lighting & Electrical',
        estimatedLaborHours: 0.4,
        difficulty: 'Easy',
        commonSymptoms: [
          'Rear brake lights stay illuminated constantly with engine running',
          'Rear brake lights fail to illuminate when pedal depressed',
          'Push-button start requires heavy pedal pressure or fails to crank',
          '"Brake System" warning amber icon on cluster',
        ],
        recommendedParts: [
          { name: 'Sylvania LongLife 7443 Dual-Filament Bulb', oemNumber: '33303-SL4-003', avgCost: '$9.99' },
          { name: 'Honda OEM Brake Light Switch (4-pin)', oemNumber: '36750-TBA-A01', avgCost: '$28.50' },
        ],
        factoryProcedureSummary:
          '1. To access rear trunk lid brake bulb, pop outer trim fasteners with plastic clip tool. 2. Twist 7443 bulb socket 45 degrees counterclockwise. 3. Pull bulb straight out; do not touch glass of new bulb with bare fingers. 4. If bulb is intact and both sides fail, inspect brake light switch above brake pedal arm. Twist switch 45 degrees left to unlock. Re-adjust clearance to 0.3mm when pedal is released.',
        torqueSpecs: [{ part: 'Trunk Trim Fasteners', spec: 'Push-in clips' }],
      },
      {
        id: 'civic-ac-condenser-leak',
        title: 'A/C Condenser Leakage & Shaft Seal Warranty Service',
        component: 'Air Conditioning Condenser & R-1234yf System',
        system: 'HVAC & Climate Control',
        estimatedLaborHours: 2.8,
        difficulty: 'Advanced',
        commonSymptoms: [
          'A/C blows warm or room-temperature air on passenger/driver vents',
          'Hissing noise from dashboard vents when A/C is turned ON',
          'Green UV dye staining visible on front lower condenser fins',
        ],
        recommendedParts: [
          { name: 'Honda Updated A/C Condenser Assembly', oemNumber: '80110-TBA-A02', avgCost: '$240.00' },
          { name: 'R-1234yf Refrigerant (425 grams)', oemNumber: '08799-0003', avgCost: '$85.00' },
        ],
        factoryProcedureSummary:
          'Honda Extended Warranty Bulletin 19-091. Recover remaining R-1234yf refrigerant with dedicated recovery machine. Remove front bumper cover. Disconnect high and low pressure lines. Replace condenser with updated stone-shield reinforced core. Pull vacuum for 20 minutes and recharge to 425g ± 25g.',
        torqueSpecs: [
          { part: 'A/C Line Flange Bolts', spec: '9.8 Nm (87 in-lb)' },
          { part: 'Front Bumper Retainers', spec: 'Hand tight' },
        ],
      },
    ],
    history: [
      {
        id: 'srv-301',
        date: '2023-08-12',
        odometer: 48000,
        title: 'HCF-2 CVT Fluid & Brake Fluid Flush',
        category: 'Maintenance',
        technician: 'David Miller',
        notes: 'Drained 3.7L clean fluid, refilled HCF-2. Purged brake fluid to 1% moisture.',
        status: 'Completed',
      },
    ],
  },

  // 4. PORSCHE 911 CARRERA 2022 (992.1) - Primary app vehicle
  {
    id: 'porsche-911-2022-992-3.0l-carrera-pdk',
    make: 'Porsche',
    model: '911 Carrera',
    year: 2022,
    generation: '992.1',
    engine: '3.0L Boxer-6 Twin-Turbo (EA9A2)',
    displacement: '2,981 cc (3.0L)',
    cylinderCount: 6,
    cylinderLayout: 'Boxer-6',
    horsepower: 379,
    torqueLbFt: 331,
    trim: 'Carrera Coupe',
    transmission: '8-speed Dual-Clutch (PDK II DT80)',
    fuelType: 'Gasoline 91+ Premium',
    driveType: 'RWD',
    vinExample: 'WP0AA2A92NS240192',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=1200&q=80',
    curbWeightLbs: 3354,
    fluids: [
      {
        name: 'Engine Oil',
        spec: 'Porsche Approved A40 SAE 0W-40 Full Synthetic (Mobil 1 FS 0W-40)',
        capacity: '8.3 Liters (8.8 US Qts) with filter replacement',
        serviceInterval: '10,000 miles / 1 year',
        notes: 'Dry sump lubrication with multi-stage scavenge pumps. Electronic level sensor readout only.',
      },
      {
        name: 'PDK Clutch & Gear Oil',
        spec: 'Mobilube PTX 75W-90 (Gearbox) & Pentosin FFL-3 (Clutch Hydraulics)',
        capacity: 'Clutch: 5.2 Liters / Gearbox: 3.8 Liters',
        serviceInterval: '60,000 miles / 6 years (clutch) & 120,000 miles (gears)',
        notes: 'Dual chamber system. Requires PIWIS diagnostic tester to fill in fill mode at 30°C - 50°C.',
      },
      {
        name: 'Brake Fluid',
        spec: 'DOT 4 Plus (High Boiling Point > 265°C)',
        capacity: '1.2 Liters full flush',
        serviceInterval: 'Every 24 months / 20,000 miles',
        notes: 'Essential for maintaining caliper piston hydraulic seal integrity and pedal firmness.',
      },
    ],
    battery: {
      groupSize: 'Group 48 / H6 Li-Ion / AGM Optional',
      cca: 800,
      chemistry: 'AGM',
      voltage: '12V',
      reserveCapacityMinutes: 140,
      terminalLocation: 'Top Post',
      partNumberOEM: '992-915-105',
      recommendedReplacementYears: 5,
    },
    tires: {
      standardFront: '235/40ZR19 92Y (NA0 Porsche Spec)',
      standardRear: '295/35ZR20 101Y (NA0 Porsche Spec)',
      pressureColdFrontPsi: 30,
      pressureColdRearPsi: 33,
      boltPattern: '5x130 mm (or optional Centerlock)',
      wheelLugTorque: '118 lb-ft (160 Nm) / Centerlock: 443 lb-ft (600 Nm)',
      speedRating: '(Y) (>186 mph)',
    },
    serviceIntervals: [
      {
        mileage: 10000,
        months: 12,
        title: 'Minor Maintenance: Engine Oil & Multi-Point',
        description: 'Oil change 0W-40, oil filter canister (25 Nm), drain plug (50 Nm), tire condition.',
        severity: 'standard',
        serviceCategory: 'Engine',
      },
      {
        mileage: 20000,
        months: 24,
        title: 'Major Maintenance: Brake Fluid & Pollen Filters',
        description: 'Pressurized brake fluid flush (2.0 Bar), dual cabin microfilters, body drain clears.',
        severity: 'critical',
        serviceCategory: 'Brakes',
      },
      {
        mileage: 30000,
        months: 36,
        title: 'Spark Plugs & AWD Coupling Inspection',
        description: 'Replace 6x Bosch Platinum plugs, check turbo charge air pipes and vacuum hoses.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
    ],
    knownMaintenanceTasks: [
      {
        id: 'porsche-p0171-vacuum-leak',
        title: 'Intake Manifold Vacuum Leak Diagnosis & O-Ring Reseal',
        component: 'Intake Plenum & PCV Breather Valve',
        system: 'Powertrain & Fuel Air Metering',
        estimatedLaborHours: 3.5,
        difficulty: 'Advanced',
        commonSymptoms: [
          'DTC P0171: System Too Lean Bank 1',
          'Hesitation under initial throttle tip-in',
          'Hissing sound from rear intake tract',
        ],
        recommendedParts: [
          { name: 'Porsche Intake Plenum O-Ring Gaskets (Set of 6)', oemNumber: '9A2-110-141-00', avgCost: '$42.00' },
          { name: 'PCV Oil Separator Diaphragm Assembly', oemNumber: '9A2-107-040-01', avgCost: '$135.00' },
        ],
        factoryProcedureSummary:
          'Pressurize intake with smoke machine to 0.8 Bar. Inspect Bank 1 plenum runner joints. Torque plenum screws in cross pattern to 10 Nm.',
        torqueSpecs: [
          { part: 'Intake Plenum Bolts', spec: '10 Nm (89 in-lb)' },
          { part: 'Throttle Body Bolts', spec: '9.5 Nm (84 in-lb)' },
        ],
      },
    ],
    history: [
      {
        id: 'srv-401',
        date: '2024-02-10',
        odometer: 45000,
        title: 'Brake Fluid Flush & DTC Scan',
        category: 'Diagnostic',
        technician: 'Master Tech Alex Vance',
        notes: 'Noted DTC P0171 pending in ECU. Checked freeze frame.',
        status: 'Flagged',
      },
    ],
  },

  // 5. BMW M3 COMPETITION 2023 (G80)
  {
    id: 'bmw-m3-2023-g80-3.0l-competition-auto',
    make: 'BMW',
    model: 'M3 Competition',
    year: 2023,
    generation: 'G80 (6th Gen M3)',
    engine: '3.0L BMW M TwinPower Turbo S58B30T0',
    displacement: '2,993 cc (3.0L)',
    cylinderCount: 6,
    cylinderLayout: 'Inline-6',
    horsepower: 503,
    torqueLbFt: 479,
    trim: 'Competition M xDrive',
    transmission: '8-speed M Steptronic with Drivelogic (ZF 8HP76)',
    fuelType: 'Gasoline 91+ Premium',
    driveType: 'AWD',
    vinExample: 'WBS43AY09PF829103',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80',
    curbWeightLbs: 3990,
    fluids: [
      {
        name: 'Engine Oil',
        spec: 'BMW Longlife-01 FE / LL-12 FE SAE 0W-30 (TwinPower Turbo)',
        capacity: '7.0 Liters with filter',
        serviceInterval: '10,000 miles / 12 months (Condition Based Service CBS)',
        notes: 'High-revving 7,200 RPM engine requires strict viscosity adherence.',
      },
      {
        name: 'Rear M Differential Fluid',
        spec: 'BMW Hypoid Axle Oil G4 (Synthetik 75W-85)',
        capacity: '1.2 Liters',
        serviceInterval: 'Run-in service at 1,200 miles, then every 30,000 miles',
        notes: 'Active M Differential with electronically governed multi-plate clutch.',
      },
      {
        name: 'Brake Fluid',
        spec: 'DOT 4 Low Viscosity (DOT 4 LV / ISO 4925 Class 6)',
        capacity: '1.0 Liter',
        serviceInterval: 'Every 24 months',
        notes: 'Low viscosity critical for high-speed ABS/DSC pulse modulation.',
      },
    ],
    battery: {
      groupSize: 'Group 49 / H8 Li-Ion OEM (or 90Ah AGM)',
      cca: 850,
      chemistry: 'Lithium-Ion',
      voltage: '12V',
      reserveCapacityMinutes: 160,
      terminalLocation: 'Top Post',
      partNumberOEM: '61219376483',
      recommendedReplacementYears: 6,
    },
    tires: {
      standardFront: '275/35ZR19 (100Y) XL Michelin Pilot Sport 4S (Star Spec)',
      standardRear: '285/30ZR20 (99Y) XL Michelin Pilot Sport 4S (Star Spec)',
      pressureColdFrontPsi: 32,
      pressureColdRearPsi: 35,
      boltPattern: '5x112 mm',
      wheelLugTorque: '103 lb-ft (140 Nm)',
      speedRating: '(Y) (>186 mph)',
    },
    serviceIntervals: [
      {
        mileage: 1200,
        months: 2,
        title: 'BMW M Running-in Break-In Service',
        description: 'Engine oil 0W-30, rear differential G4 oil change, unlock factory launch control.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
      {
        mileage: 10000,
        months: 12,
        title: 'CBS Engine Oil & Microfilter',
        description: 'Oil change, engine air filters, brake pad thickness measurement.',
        severity: 'standard',
        serviceCategory: 'Engine',
      },
      {
        mileage: 30000,
        months: 36,
        title: 'Spark Plugs Replacement & Differential Flush',
        description: 'Replace 6x high-heat range spark plugs, flush rear M differential.',
        severity: 'critical',
        serviceCategory: 'Engine',
      },
    ],
    knownMaintenanceTasks: [
      {
        id: 'bmw-g80-brake-pad-replacement',
        title: 'Front 6-Piston M Compound Brake Pad Overhaul',
        component: 'Brembo 6-Piston Calipers & Floating Rotors',
        system: 'Braking System',
        estimatedLaborHours: 1.8,
        difficulty: 'Moderate',
        commonSymptoms: [
          'Brake wear sensor illuminated on digital cockpit',
          'Squealing under low speed light application',
        ],
        recommendedParts: [
          { name: 'BMW M Genuine Front Brake Pads', oemNumber: '34118099308', avgCost: '$345.00' },
          { name: 'Brake Pad Wear Sensor (Front Left)', oemNumber: '34356890788', avgCost: '$32.00' },
        ],
        factoryProcedureSummary:
          'Drive out caliper retaining pins with brass punch. Disengage cross-spring. Retract 6 pistons simultaneously using pad spreader. Install new OEM compound pads with anti-squeal shims.',
        torqueSpecs: [
          { part: 'Caliper Pin Retaining Bolts', spec: '30 Nm (22 lb-ft)' },
          { part: 'Wheel Lug Bolts', spec: '140 Nm (103 lb-ft)' },
        ],
      },
    ],
    history: [
      {
        id: 'srv-501',
        date: '2023-09-05',
        odometer: 1250,
        title: 'M Break-in Service (1,200 mi)',
        category: 'Engine & Diff',
        technician: 'BMW Certified Tech',
        notes: 'Engine oil and rear M differential fluid flushed. Break-in limiters removed.',
        status: 'Completed',
      },
    ],
  },
];

// Complete Step-by-Step Cascading Taxonomy Definition
export interface TaxonomyData {
  manufacturers: {
    id: string;
    name: string;
    country: string;
    models: {
      id: string;
      name: string;
      years: {
        year: number;
        generations: {
          id: string;
          name: string;
          engines: {
            id: string;
            name: string;
            trims: {
              id: string;
              name: string;
              transmissions: {
                id: string;
                name: string;
                profileId: string;
              }[];
            }[];
          }[];
        }[];
      }[];
    }[];
  }[];
}

export const TAXONOMY: TaxonomyData = {
  manufacturers: [
    {
      id: 'toyota',
      name: 'Toyota',
      country: 'Japan',
      models: [
        {
          id: 'camry',
          name: 'Camry',
          years: [
            {
              year: 2018,
              generations: [
                {
                  id: 'xv70',
                  name: 'XV70 (8th Gen)',
                  engines: [
                    {
                      id: '2.5l-i4',
                      name: '2.5L I4 Dynamic Force (A25A-FKS - 203 HP)',
                      trims: [
                        {
                          id: 'se',
                          name: 'SE Sport',
                          transmissions: [
                            {
                              id: 'auto-8sp',
                              name: '8-Speed Direct Shift Automatic (UB80E)',
                              profileId: 'toyota-camry-2018-xv70-2.5l-se-auto',
                            },
                          ],
                        },
                        {
                          id: 'xse',
                          name: 'XSE Luxury Sport',
                          transmissions: [
                            {
                              id: 'auto-8sp',
                              name: '8-Speed Direct Shift Automatic (UB80E)',
                              profileId: 'toyota-camry-2018-xv70-2.5l-se-auto',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'ford',
      name: 'Ford',
      country: 'United States',
      models: [
        {
          id: 'f150',
          name: 'F-150',
          years: [
            {
              year: 2019,
              generations: [
                {
                  id: 'gen13',
                  name: '13th Gen (Aluminum High-Strength Body)',
                  engines: [
                    {
                      id: '3.5l-ecoboost',
                      name: '3.5L EcoBoost Twin-Turbo V6 (375 HP / 470 lb-ft)',
                      trims: [
                        {
                          id: 'lariat',
                          name: 'Lariat SuperCrew 4WD',
                          transmissions: [
                            {
                              id: 'auto-10sp',
                              name: '10-Speed SelectShift Automatic (10R80)',
                              profileId: 'ford-f150-2019-13gen-3.5l-lariat-auto',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'honda',
      name: 'Honda',
      country: 'Japan',
      models: [
        {
          id: 'civic',
          name: 'Civic',
          years: [
            {
              year: 2017,
              generations: [
                {
                  id: 'gen10',
                  name: '10th Gen (FC/FK Global Architecture)',
                  engines: [
                    {
                      id: '1.5l-turbo',
                      name: '1.5L VTEC Turbo I4 (L15B7 - 174 HP)',
                      trims: [
                        {
                          id: 'ext',
                          name: 'EX-T Sedan',
                          transmissions: [
                            {
                              id: 'cvt',
                              name: 'Continuously Variable Transmission (LL-CVT)',
                              profileId: 'honda-civic-2017-10gen-1.5l-ext-cvt',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'porsche',
      name: 'Porsche',
      country: 'Germany',
      models: [
        {
          id: '911',
          name: '911',
          years: [
            {
              year: 2022,
              generations: [
                {
                  id: '992.1',
                  name: '992.1 Carrera Generation',
                  engines: [
                    {
                      id: '3.0l-boxer6',
                      name: '3.0L Boxer-6 Twin-Turbo (379 HP / 331 lb-ft)',
                      trims: [
                        {
                          id: 'carrera',
                          name: 'Carrera Coupe',
                          transmissions: [
                            {
                              id: 'pdk-8sp',
                              name: '8-Speed Dual-Clutch (PDK II DT80)',
                              profileId: 'porsche-911-2022-992-3.0l-carrera-pdk',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'bmw',
      name: 'BMW',
      country: 'Germany',
      models: [
        {
          id: 'm3',
          name: 'M3',
          years: [
            {
              year: 2023,
              generations: [
                {
                  id: 'g80',
                  name: 'G80 Competition Platform',
                  engines: [
                    {
                      id: '3.0l-s58',
                      name: '3.0L BMW M TwinPower S58B30 (503 HP / 479 lb-ft)',
                      trims: [
                        {
                          id: 'comp-xdrive',
                          name: 'Competition M xDrive',
                          transmissions: [
                            {
                              id: 'm-steptronic-8',
                              name: '8-Speed M Steptronic with Drivelogic (ZF 8HP76)',
                              profileId: 'bmw-m3-2023-g80-3.0l-competition-auto',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

// Pure Database Query Helpers (Completely decoupled from React / UI)
export function getVehicleProfileById(id: string): VehicleProfileData | undefined {
  return VEHICLE_PROFILES.find((v) => v.id === id);
}

export function getAllVehicleProfiles(): VehicleProfileData[] {
  return [...VEHICLE_PROFILES];
}
