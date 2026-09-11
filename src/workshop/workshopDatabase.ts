import { JobCard, JobStatus } from './workshopTypes';

const STORAGE_KEY = 'autofix_workshop_jobcards_v1';
const ACTIVE_JOB_KEY = 'autofix_workshop_active_job_id_v1';

export const INITIAL_JOB_CARDS: JobCard[] = [
  {
    id: 'JOB-2026-0842',
    createdAt: '2026-09-10T08:30:00Z',
    updatedAt: '2026-09-11T09:15:00Z',
    customer: {
      name: 'Marcus Vance',
      phone: '+1 (555) 382-9102',
      email: 'm.vance@vancetech.io',
      address: '842 Industrial Blvd, Bay 4',
      accountType: 'Private',
    },
    vehicle: {
      make: 'Toyota',
      model: 'Camry',
      year: 2021,
      engine: '2.5L Dynamic Force I4 (A25A-FKS D-4S)',
      transmission: '8-Speed Direct-Shift Automatic',
      trim: 'XSE Sedan',
      licensePlate: '7XYZ892',
      color: 'Midnight Black Metallic',
      driveType: 'Front-Wheel Drive',
      fuelType: 'Gasoline (Unleaded 87+)',
    },
    vin: '4T1B11HK5MU192834',
    mileage: 48250,
    mileageUnit: 'km',
    complaint:
      'Customer states engine runs roughly with noticeable shaking at idle and during light acceleration. Check Engine Light is illuminated. Also notes a high-pitched squeal and vibration through the brake pedal when braking at highway speeds (80-100 km/h).',
    inspection: {
      summary:
        'Initial intake inspection reveals active MIL on dashboard. Visual inspection shows worn front brake pad friction material down to approx 3.2mm and lateral runout grooves on front left rotor. Battery health test indicates nominal 12.6V resting. Engine bay is clean with no external fluid leaks.',
      visualCondition: 'Requires Attention',
      safetyPassed: false,
      batteryStatus: '12.62V (Good, 595 CCA measured of 600 CCA rated)',
      tiresCondition: 'Front: 5.5mm (Good), Rear: 6.2mm (Good), even tread wear',
      brakesCondition: 'Front pads at 3.2mm (Near Wear Indicator). Rotors grooved.',
      fluidLevels: 'Engine oil clean at max mark; brake fluid moisture at 2.8% (Borderline)',
      leaksObserved: 'No active fluid leaks detected in engine bay or underbody',
    },
    diagnosis: {
      rootCause:
        'Cylinder 1 Fuel Injector internal solenoid resistance out of specification causing intermittent fuel delivery failure and misfire (P0301). Front brake rotor excessive lateral runout (>0.06mm) causing brake pulsation.',
      dtcCodes: ['P0301', 'P0171'],
      symptoms: [
        'Intermittent Cylinder 1 Misfire',
        'System Too Lean (Bank 1)',
        'Rough Idle at 650 RPM',
        'Brake Pedal Pulsation Under Load',
      ],
      freezeFrameSummary:
        'RPM: 1850 | Engine Load: 44% | STFT B1: +18.4% | LTFT B1: +12.1% | Fuel Rail: 145 Bar | Coolant: 91°C',
      leadTechnician: 'Alex Thorne (ASE Master Certified Tech #4821)',
      confirmedDate: '2026-09-10T11:45:00Z',
    },
    repair: {
      procedureTitle: 'Cylinder 1 Fuel Injector & Front Ceramic Brake Pad / Rotor Replacement',
      procedureSummary:
        'Depressurize direct injection fuel rail, replace Cylinder 1 OEM D-4S injector with new combustion chamber Teflon seal ring. Install new front brake rotors and ceramic pads, torquing guide pins to 34 Nm and wheel lug nuts to 103 Nm.',
      estimatedHours: 3.5,
      actualHours: 2.75,
      difficulty: 'Intermediate',
      completionDate: '2026-09-11T14:00:00Z',
      steps: [
        {
          id: 'step-1',
          text: 'Depressurize 20 MPa direct injection fuel rail and disconnect 12V negative battery cable',
          completed: true,
          specialTool: 'EFI 20A fuse puller & fuel pressure relief hose',
        },
        {
          id: 'step-2',
          text: 'Remove intake air ducting and cylinder head acoustic engine beauty cover',
          completed: true,
        },
        {
          id: 'step-3',
          text: 'Unbolt fuel rail delivery pipe and extract Cylinder 1 injector using SST puller tool',
          completed: true,
          torque: 'Rail mounting bolts: 21 Nm',
          specialTool: 'Toyota SST 09268-31014',
        },
        {
          id: 'step-4',
          text: 'Install new OEM direct injector (23209-25010) with pre-sized Teflon combustion seal',
          completed: true,
          torque: 'High pressure line union: 33 Nm',
        },
        {
          id: 'step-5',
          text: 'Remove front caliper guide pins, caliper bracket, and slide off worn rotors',
          completed: false,
          torque: 'Bracket bolts: 107 Nm | Pin bolts: 34 Nm',
        },
        {
          id: 'step-6',
          text: 'Clean hub surface, install new coated rotors and OEM ceramic pads with high-temp moly lube',
          completed: false,
        },
        {
          id: 'step-7',
          text: 'Re-torque wheel lug nuts in star pattern to manufacturer spec and verify pedal firmness',
          completed: false,
          torque: 'Wheel lug nuts: 103 Nm (76 lb-ft)',
        },
        {
          id: 'step-8',
          text: 'Perform DTC clear and 5-mile dynamic road test verifying fuel trim normalization',
          completed: false,
        },
      ],
    },
    parts: [
      {
        id: 'prt-01',
        partNumber: '23209-25010',
        description: 'Toyota OEM Direct Fuel Injector (Cylinder 1)',
        quantity: 1,
        unitPrice: 184.5,
        supplier: 'Toyota OEM Direct Distribution',
        status: 'In Stock',
      },
      {
        id: 'prt-02',
        partNumber: '23291-25010',
        description: 'Combustion Chamber Teflon Seal Ring Set',
        quantity: 1,
        unitPrice: 16.25,
        supplier: 'Toyota OEM Direct Distribution',
        status: 'In Stock',
      },
      {
        id: 'prt-03',
        partNumber: '04465-33480',
        description: 'Front Ceramic Brake Pad Kit with Hardware & Shims',
        quantity: 1,
        unitPrice: 89.0,
        supplier: 'Akebono Brake Systems OEM',
        status: 'Arrived',
      },
      {
        id: 'prt-04',
        partNumber: '43512-33150',
        description: 'Front Disc Brake Rotor (Geomet Anti-Corrosion Coated)',
        quantity: 2,
        unitPrice: 94.0,
        supplier: 'Brembo Aftermarket Supply',
        status: 'In Stock',
      },
      {
        id: 'prt-05',
        partNumber: '08823-80112',
        description: 'Toyota High-Temp Disc Brake Moly Caliper Grease',
        quantity: 1,
        unitPrice: 12.0,
        supplier: 'Toyota Genuine Chemical Line',
        status: 'In Stock',
      },
    ],
    labor: [
      {
        id: 'lbr-01',
        description: 'High-Pressure Direct Injector Replacement & Fuel Rail Service',
        technician: 'Alex Thorne',
        hours: 1.75,
        hourlyRate: 140.0,
      },
      {
        id: 'lbr-02',
        description: 'Front Axle Brake Rotor & Ceramic Pad Replacement with Hardware Clean',
        technician: 'Alex Thorne',
        hours: 1.25,
        hourlyRate: 140.0,
      },
      {
        id: 'lbr-03',
        description: 'OBD-II Deep Computer Diagnostic & Road Test Validation',
        technician: 'Alex Thorne',
        hours: 0.5,
        hourlyRate: 140.0,
      },
    ],
    notes: [
      {
        id: 'nt-01',
        timestamp: '2026-09-10T09:00:00Z',
        author: 'Sarah Chen',
        role: 'Service Advisor',
        content:
          'Customer reported misfire began 3 days ago after fueling. Advised customer on diagnostic procedure and received authorization for intake scan.',
        isCustomerVisible: true,
      },
      {
        id: 'nt-02',
        timestamp: '2026-09-10T11:50:00Z',
        author: 'Alex Thorne',
        role: 'Lead Technician',
        content:
          'Swapped Cylinder 1 injector harness and spark coil with Cylinder 2. Misfire stayed on Cylinder 1. Measured injector coil resistance: 4.8 ohms (spec: 11.6-12.4 ohms). Definite internal winding short. Quoted customer.',
        isCustomerVisible: false,
      },
      {
        id: 'nt-03',
        timestamp: '2026-09-10T14:15:00Z',
        author: 'Sarah Chen',
        role: 'Service Advisor',
        content:
          'Customer Marcus Vance verbally approved fuel injector repair + front brake service via phone at 14:10. Parts staged in Bay 3.',
        isCustomerVisible: true,
      },
      {
        id: 'nt-04',
        timestamp: '2026-09-11T09:10:00Z',
        author: 'Alex Thorne',
        role: 'Lead Technician',
        content:
          'Injector installed smoothly. Ran engine at idle for 15 mins. Fuel trims dropped to +1.2% STFT. Proceeding to front brake installation on lift 2.',
        isCustomerVisible: false,
      },
    ],
    status: 'Repairing',
    measurements: {
      frontLeftRotorMm: 26.2,
      frontRightRotorMm: 26.5,
      rearLeftRotorMm: 11.8,
      rearRightRotorMm: 11.9,
      rotorMinThicknessMm: 25.0,
      frontLeftPadMm: 3.2,
      frontRightPadMm: 3.4,
      rearLeftPadMm: 7.5,
      rearRightPadMm: 7.8,
      padMinThicknessMm: 3.0,
      tireFL_mm: 5.5,
      tireFR_mm: 5.6,
      tireRL_mm: 6.2,
      tireRR_mm: 6.3,
      tireMinTreadMm: 3.0,
      tirePressurePsi: { fl: 34, fr: 34, rl: 33, rr: 33 },
      batteryVoltage: 12.62,
      batteryCcaActual: 595,
      batteryCcaRated: 600,
      batteryHealthPct: 98,
      brakeFluidMoisturePct: 2.8,
      coolantFreezePointC: -37,
    },
    photos: [
      {
        id: 'pht-01',
        url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
        caption: 'Front Left Brake Rotor Surface Showing Significant Scoring and Heat Rings',
        category: 'Inspection',
        timestamp: '2026-09-10T10:15:00Z',
      },
      {
        id: 'pht-02',
        url: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=800&q=80',
        caption: 'Cylinder 1 Direct Injection Rail Staged for SST Extraction',
        category: 'Repair Progress',
        timestamp: '2026-09-11T08:45:00Z',
      },
      {
        id: 'pht-03',
        url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
        caption: 'New Coated Rotor and Ceramic Pad Assembly Comparison',
        category: 'Damaged Component',
        timestamp: '2026-09-11T09:05:00Z',
      },
    ],
    history: [
      {
        id: 'hst-01',
        date: '2026-03-12',
        mileage: 38400,
        jobId: 'JOB-2026-0219',
        serviceSummary: '38,000 km Factory Service: 0W-16 Synthetic Oil & Filter, Cabin Air Filter, Tire Rotation',
        technician: 'Alex Thorne',
        totalCost: 145.0,
        status: 'Completed',
      },
      {
        id: 'hst-02',
        date: '2025-09-04',
        mileage: 27150,
        jobId: 'JOB-2025-1104',
        serviceSummary: 'Engine Oil Service, Multi-point Safety Inspection, Battery Terminal Cleaning',
        technician: 'David Miller',
        totalCost: 110.0,
        status: 'Completed',
      },
      {
        id: 'hst-03',
        date: '2025-02-18',
        mileage: 15200,
        jobId: 'JOB-2025-0341',
        serviceSummary: 'First Minor Factory Inspection, Wheel Alignment Verification, Software Calibration Update',
        technician: 'Alex Thorne',
        totalCost: 0.0,
        status: 'Warranty Claim',
      },
    ],
    priority: 'Urgent',
    bay: 'Bay 3 - Lift 2',
    serviceAdvisor: 'Sarah Chen',
  },
  {
    id: 'JOB-2026-0843',
    createdAt: '2026-09-11T07:45:00Z',
    updatedAt: '2026-09-11T10:00:00Z',
    customer: {
      name: 'Elena Rostova',
      phone: '+1 (555) 914-7721',
      email: 'e.rostova@velocitycorp.de',
      accountType: 'Private',
    },
    vehicle: {
      make: 'Porsche',
      model: '911 Carrera S (992)',
      year: 2022,
      engine: '3.0L Twin-Turbo Flat-6 (9A2 Evo)',
      transmission: '8-Speed Porsche Doppelkupplung (PDK)',
      trim: 'Coupe Sport Chrono',
      licensePlate: 'P992-GT',
      color: 'Gentian Blue Metallic',
      driveType: 'Rear-Wheel Drive (RWD)',
      fuelType: 'Gasoline (Premium 93+ OCT)',
    },
    vin: 'WP0AB2A97NS249811',
    mileage: 18450,
    mileageUnit: 'km',
    complaint:
      'Annual factory maintenance milestone due (20,000 km service). Customer requests oil change with Porsche A40/C20 approved Mobil 1 ESP X2 0W-20, brake fluid flush, and thorough inspection of rear differential and PDK clutch hydraulic actuation.',
    inspection: {
      summary:
        'Comprehensive 111-point Porsche factory inspection underway. Vehicle chassis and undertray aerodynamics in pristine shape. PCCB ceramic brake rotors verified at zero lip wear. Battery tender logged 13.1V.',
      visualCondition: 'Good',
      safetyPassed: true,
      batteryStatus: '13.10V (Lithium-ion starter battery, 100% SOH)',
      tiresCondition: 'Pirelli P Zero (NA1 Porsche Spec) - FL: 6.8mm, FR: 6.7mm, RL: 5.9mm, RR: 5.8mm',
      brakesCondition: 'Porsche Carbon Ceramic (PCCB) pads at 9.2mm (Excellent condition)',
      fluidLevels: 'Mobil 1 ESP level nominal, coolant freeze point -40°C',
      leaksObserved: 'None',
    },
    diagnosis: {
      rootCause: 'No active faults or warning lights. Scheduled preventative maintenance service only.',
      dtcCodes: [],
      symptoms: ['Scheduled Maintenance Due', 'Pre-Track Day Fluid Flush'],
      freezeFrameSummary: 'No fault triggers logged in DME or PDK transmission control unit',
      leadTechnician: 'Stefan K.',
      confirmedDate: '2026-09-11T08:30:00Z',
    },
    repair: {
      procedureTitle: 'Porsche 992 20,000 km Minor Maintenance & Motul RBF 660 Fluid Flush',
      procedureSummary:
        'Drain and refill 8.2L Porsche C20 synthetic oil, replace oil filter element with new viton O-ring torqued to 25 Nm. Pressure bleed brake system with racing high-temp fluid.',
      estimatedHours: 2.0,
      actualHours: 0.8,
      difficulty: 'Intermediate',
      steps: [
        {
          id: 'p992-1',
          text: 'Lift vehicle on rubber chassis lift pucks to prevent rocker panel damage',
          completed: true,
        },
        {
          id: 'p992-2',
          text: 'Remove rear underbody aerodynamic diffusers and heat shield',
          completed: true,
          torque: 'Torx T25 fasteners: 4.5 Nm',
        },
        {
          id: 'p992-3',
          text: 'Drain oil sump and replace composite drain plug with new factory seal',
          completed: true,
          torque: 'Drain plug: 25 Nm (Composite plastic key)',
        },
        {
          id: 'p992-4',
          text: 'Install OEM Mahle oil filter cartridge and torque cap to 25 Nm',
          completed: false,
          torque: 'Filter cap: 25 Nm',
        },
        {
          id: 'p992-5',
          text: 'Refill with 8.2 Liters Mobil 1 ESP X2 0W-20 (Porsche C20 approval)',
          completed: false,
        },
        {
          id: 'p992-6',
          text: 'Pressure bleed all 4 calipers in sequence (RR, RL, FR, FL) at 2.0 bar',
          completed: false,
        },
      ],
    },
    parts: [
      {
        id: 'p-p992-01',
        partNumber: '9A2-107-225-00',
        description: 'Porsche OEM Engine Oil Filter Cartridge & O-Ring',
        quantity: 1,
        unitPrice: 48.0,
        supplier: 'Porsche Motorsport North America',
        status: 'In Stock',
      },
      {
        id: 'p-p992-02',
        partNumber: 'MOB-ESP-0W20',
        description: 'Mobil 1 ESP X2 0W-20 (Porsche C20 Spec) - 1L Canister',
        quantity: 9,
        unitPrice: 18.5,
        supplier: 'ExxonMobil Commercial',
        status: 'In Stock',
      },
      {
        id: 'p-p992-03',
        partNumber: 'MOT-RBF660',
        description: 'Motul RBF 660 High Boiling Point DOT 4 Racing Brake Fluid',
        quantity: 2,
        unitPrice: 26.0,
        supplier: 'Performance Parts Express',
        status: 'In Stock',
      },
    ],
    labor: [
      {
        id: 'l-p992-01',
        description: 'Porsche 992 20K Major Oil Service & Microfilter Replacement',
        technician: 'Stefan K.',
        hours: 1.5,
        hourlyRate: 185.0,
      },
      {
        id: 'l-p992-02',
        description: 'Hydraulic Pressure Bleed with Racing DOT 4 Fluid',
        technician: 'Stefan K.',
        hours: 1.0,
        hourlyRate: 185.0,
      },
    ],
    notes: [
      {
        id: 'p992-nt-1',
        timestamp: '2026-09-11T08:00:00Z',
        author: 'Sarah Chen',
        role: 'Service Advisor',
        content: 'Customer is attending a track event at Laguna Seca next weekend. Requested strict adherence to Porsche torque specs and alignment measurement printout.',
        isCustomerVisible: true,
      },
    ],
    status: 'Inspection',
    measurements: {
      frontLeftRotorMm: 38.0,
      frontRightRotorMm: 38.0,
      rearLeftRotorMm: 34.0,
      rearRightRotorMm: 34.0,
      rotorMinThicknessMm: 36.5,
      frontLeftPadMm: 9.2,
      frontRightPadMm: 9.1,
      rearLeftPadMm: 8.8,
      rearRightPadMm: 8.9,
      padMinThicknessMm: 4.0,
      tireFL_mm: 6.8,
      tireFR_mm: 6.7,
      tireRL_mm: 5.9,
      tireRR_mm: 5.8,
      tireMinTreadMm: 2.5,
      tirePressurePsi: { fl: 31, fr: 31, rl: 34, rr: 34 },
      batteryVoltage: 13.12,
      batteryCcaActual: 780,
      batteryCcaRated: 800,
      batteryHealthPct: 100,
      brakeFluidMoisturePct: 1.1,
      coolantFreezePointC: -40,
    },
    photos: [
      {
        id: 'p-pht-1',
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        caption: 'Porsche 992 Carrera S Staged on Precision Alignment Bay 1',
        category: 'Intake',
        timestamp: '2026-09-11T07:55:00Z',
      },
    ],
    history: [
      {
        id: 'p-hst-1',
        date: '2025-08-14',
        mileage: 9200,
        jobId: 'JOB-2025-0782',
        serviceSummary: 'First 10,000 km Factory Break-In Oil Service & Multi-Point Inspection',
        technician: 'Stefan K.',
        totalCost: 380.0,
        status: 'Completed',
      },
    ],
    priority: 'Standard',
    bay: 'Bay 1 - Alignment & Supercar Rack',
    serviceAdvisor: 'Sarah Chen',
  },
  {
    id: 'JOB-2026-0844',
    createdAt: '2026-09-11T08:15:00Z',
    updatedAt: '2026-09-11T09:30:00Z',
    customer: {
      name: 'Apex Fleet Logistics',
      phone: '+1 (555) 203-8844',
      email: 'fleet@apextrans.com',
      company: 'Apex Transport LLC',
      accountType: 'Fleet',
    },
    vehicle: {
      make: 'Ford',
      model: 'F-150 SuperCrew',
      year: 2020,
      engine: '3.5L EcoBoost Twin-Turbo V6',
      transmission: '10-Speed SelectShift Automatic',
      trim: 'Lariat FX4 Off-Road',
      licensePlate: 'COMM-9412',
      color: 'Oxford White',
      driveType: 'Four-Wheel Drive (4WD)',
      fuelType: 'Gasoline',
    },
    vin: '1FTFW1E44LFA83910',
    mileage: 112400,
    mileageUnit: 'km',
    complaint:
      'Driver reports clunking and knocking noise from front right suspension when traversing speed bumps or driving on rough gravel. Also periodic rough shifts when shifting from 3rd to 4th gear under towing load.',
    inspection: {
      summary:
        'Front right suspension inspection identifies torn dust boot on front right sway bar end link with excessive radial play (>4mm). Ball joint play within acceptable limits. Transmission fluid sampled shows slight darkening but no metallic particulates.',
      visualCondition: 'Requires Attention',
      safetyPassed: false,
      batteryStatus: '12.45V (Good)',
      tiresCondition: 'All-Terrain 275/65R18 - 4.2mm average tread remaining',
      brakesCondition: 'Front pads 5.1mm, Rear pads 4.8mm (Pass)',
      fluidLevels: 'Engine oil full; coolant nominal; transmission fluid requires filter replacement',
      leaksObserved: 'Minor sweat around front differential pinion seal',
    },
    diagnosis: {
      rootCause: 'Failed Front Right Sway Bar Stabilizer End Link Ball Joint (excessive play). Front Differential Pinion Seal minor weeping.',
      dtcCodes: ['P0734'],
      symptoms: ['Front Axle Clunking Over Bumps', 'Gear 4 Incorrect Ratio (Stored DTC)'],
      freezeFrameSummary: 'Transmission Temp: 94°C | Output Shaft Speed: 1420 RPM | Slip: 48 RPM',
      leadTechnician: 'Jack Reynolds',
      confirmedDate: '2026-09-11T09:00:00Z',
    },
    repair: {
      procedureTitle: 'Front Sway Bar End Link Assembly Replacement & Pinion Seal Reseal',
      procedureSummary:
        'Replace both front stabilizer links with heavy-duty greaseable units, torquing nuts to 80 Nm. Flush 10R80 transmission fluid and replace internal sump filter.',
      estimatedHours: 4.0,
      actualHours: 0.5,
      difficulty: 'Intermediate',
      steps: [
        { id: 'f150-1', text: 'Support front axle on heavy-duty jack stands', completed: true },
        { id: 'f150-2', text: 'Remove front wheels and unbolt worn sway bar link nuts', completed: true, torque: '80 Nm' },
        { id: 'f150-3', text: 'Install new Moog Problem Solver heavy-duty end links and grease fittings', completed: false },
        { id: 'f150-4', text: 'Drop transmission pan, clean magnet, and replace fluid filter (FT-202)', completed: false },
      ],
    },
    parts: [
      {
        id: 'p-f150-1',
        partNumber: 'K750362',
        description: 'Moog Heavy Duty Front Stabilizer Bar Link (Pair)',
        quantity: 2,
        unitPrice: 42.0,
        supplier: 'NAPA Auto Parts Commercial',
        status: 'Ordered',
      },
      {
        id: 'p-f150-2',
        partNumber: 'FT-202',
        description: 'Motorcraft 10R80 Transmission Filter & Gasket',
        quantity: 1,
        unitPrice: 58.0,
        supplier: 'Ford OEM Parts Direct',
        status: 'Ordered',
      },
    ],
    labor: [
      {
        id: 'l-f150-1',
        description: 'Front Sway Bar End Links Replacement (Both Sides)',
        technician: 'Jack Reynolds',
        hours: 1.5,
        hourlyRate: 135.0,
      },
      {
        id: 'l-f150-2',
        description: '10-Speed Transmission Pan Drop, Filter Replacement & Fluid Level Check',
        technician: 'Jack Reynolds',
        hours: 2.0,
        hourlyRate: 135.0,
      },
    ],
    notes: [
      {
        id: 'f150-nt-1',
        timestamp: '2026-09-11T08:30:00Z',
        author: 'Jack Reynolds',
        role: 'Technician',
        content: 'End links ordered from NAPA, expected delivery at 13:30 today. Staging truck in Bay 4.',
        isCustomerVisible: false,
      },
    ],
    status: 'Waiting Parts',
    measurements: {
      frontLeftRotorMm: 31.8,
      frontRightRotorMm: 31.7,
      rearLeftRotorMm: 23.5,
      rearRightRotorMm: 23.4,
      rotorMinThicknessMm: 30.0,
      frontLeftPadMm: 5.1,
      frontRightPadMm: 5.0,
      rearLeftPadMm: 4.8,
      rearRightPadMm: 4.9,
      padMinThicknessMm: 3.0,
      tireFL_mm: 4.2,
      tireFR_mm: 4.3,
      tireRL_mm: 4.5,
      tireRR_mm: 4.4,
      tireMinTreadMm: 3.0,
      tirePressurePsi: { fl: 38, fr: 38, rl: 40, rr: 40 },
      batteryVoltage: 12.45,
      batteryCcaActual: 620,
      batteryCcaRated: 750,
      batteryHealthPct: 83,
      brakeFluidMoisturePct: 3.2,
      coolantFreezePointC: -35,
    },
    photos: [],
    history: [],
    priority: 'Standard',
    bay: 'Bay 4 - Heavy Duty Lift',
    serviceAdvisor: 'Sarah Chen',
  },
];

export class WorkshopDatabase {
  static getAllJobCards(): JobCard[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored job cards, using defaults', e);
    }
    // Initialize default job cards
    this.saveAllJobCards(INITIAL_JOB_CARDS);
    return INITIAL_JOB_CARDS;
  }

  static getJobCardById(id: string): JobCard | null {
    const cards = this.getAllJobCards();
    return cards.find((c) => c.id === id) || null;
  }

  static saveAllJobCards(cards: JobCard[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.error('Failed to save job cards to localStorage', e);
    }
  }

  static saveJobCard(jobCard: JobCard): void {
    const cards = this.getAllJobCards();
    const index = cards.findIndex((c) => c.id === jobCard.id);
    jobCard.updatedAt = new Date().toISOString();
    if (index >= 0) {
      cards[index] = jobCard;
    } else {
      cards.unshift(jobCard);
    }
    this.saveAllJobCards(cards);
  }

  static createJobCard(data: Partial<JobCard>): JobCard {
    const existing = this.getAllJobCards();
    const newSeq = existing.length + 845;
    const year = new Date().getFullYear();
    const id = data.id || `JOB-${year}-${String(newSeq).padStart(4, '0')}`;

    const newCard: JobCard = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: data.customer || {
        name: 'New Customer',
        phone: '',
        email: '',
        accountType: 'Private',
      },
      vehicle: data.vehicle || {
        make: 'Toyota',
        model: 'Camry',
        year: 2021,
        engine: '2.5L I4',
        transmission: 'Automatic',
      },
      vin: data.vin || '',
      mileage: data.mileage || 45000,
      mileageUnit: data.mileageUnit || 'km',
      complaint: data.complaint || 'Customer requested vehicle inspection and service.',
      inspection: data.inspection || {
        summary: 'Initial intake safety check performed.',
        visualCondition: 'Good',
        safetyPassed: true,
        batteryStatus: '12.6V (Good)',
        tiresCondition: '5.0mm (Pass)',
        brakesCondition: '6.0mm (Pass)',
        fluidLevels: 'Nominal',
        leaksObserved: 'None',
      },
      diagnosis: data.diagnosis || {
        rootCause: 'Pending technician diagnostic scan.',
        dtcCodes: [],
        symptoms: [],
        leadTechnician: 'Master Tech',
        confirmedDate: new Date().toISOString(),
      },
      repair: data.repair || {
        procedureTitle: 'Standard Workshop Service',
        procedureSummary: 'General inspection and component service.',
        steps: [
          { id: 's-1', text: 'Initial multi-point vehicle safety inspection', completed: true },
          { id: 's-2', text: 'Component inspection and torque check', completed: false },
          { id: 's-3', text: 'Final road test and quality sign-off', completed: false },
        ],
        estimatedHours: 1.5,
        actualHours: 0,
        difficulty: 'Beginner',
      },
      parts: data.parts || [],
      labor: data.labor || [
        {
          id: 'lab-def-1',
          description: 'Standard Vehicle Diagnostic & Inspection Fee',
          technician: 'Lead Technician',
          hours: 1.0,
          hourlyRate: 135.0,
        },
      ],
      notes: data.notes || [
        {
          id: 'note-init',
          timestamp: new Date().toISOString(),
          author: 'Intake Staff',
          role: 'Service Advisor',
          content: 'Job card created and vehicle staged for bay assignment.',
          isCustomerVisible: true,
        },
      ],
      status: data.status || 'New',
      measurements: data.measurements || {
        frontLeftRotorMm: 26.0,
        frontRightRotorMm: 26.0,
        rearLeftRotorMm: 12.0,
        rearRightRotorMm: 12.0,
        rotorMinThicknessMm: 25.0,
        frontLeftPadMm: 6.0,
        frontRightPadMm: 6.0,
        rearLeftPadMm: 7.0,
        rearRightPadMm: 7.0,
        padMinThicknessMm: 3.0,
        tireFL_mm: 5.5,
        tireFR_mm: 5.5,
        tireRL_mm: 6.0,
        tireRR_mm: 6.0,
        tireMinTreadMm: 3.0,
        tirePressurePsi: { fl: 35, fr: 35, rl: 35, rr: 35 },
        batteryVoltage: 12.6,
        batteryCcaActual: 600,
        batteryCcaRated: 600,
        batteryHealthPct: 100,
        brakeFluidMoisturePct: 1.5,
        coolantFreezePointC: -37,
      },
      photos: data.photos || [],
      history: data.history || [],
      priority: data.priority || 'Standard',
      bay: data.bay || 'Bay 2',
      serviceAdvisor: data.serviceAdvisor || 'Service Advisor',
    };

    this.saveJobCard(newCard);
    this.setActiveJobCardId(newCard.id);
    return newCard;
  }

  static updateJobCardStatus(id: string, newStatus: JobStatus): JobCard | null {
    const card = this.getJobCardById(id);
    if (!card) return null;
    card.status = newStatus;
    card.updatedAt = new Date().toISOString();
    this.saveJobCard(card);
    return card;
  }

  static getActiveJobCardId(): string {
    try {
      const stored = localStorage.getItem(ACTIVE_JOB_KEY);
      if (stored) return stored;
    } catch (e) {
      // ignore
    }
    const all = this.getAllJobCards();
    return all[0]?.id || 'JOB-2026-0842';
  }

  static setActiveJobCardId(id: string): void {
    try {
      localStorage.setItem(ACTIVE_JOB_KEY, id);
    } catch (e) {
      // ignore
    }
  }

  static resetToSampleDatabase(): JobCard[] {
    this.saveAllJobCards(INITIAL_JOB_CARDS);
    this.setActiveJobCardId(INITIAL_JOB_CARDS[0].id);
    return INITIAL_JOB_CARDS;
  }
}
