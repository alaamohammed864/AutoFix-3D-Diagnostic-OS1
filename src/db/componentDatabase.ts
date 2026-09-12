export type AutomotiveSystem =
  | 'Engine'
  | 'Transmission'
  | 'Cooling'
  | 'Brakes'
  | 'Suspension'
  | 'Electrical'
  | 'Fuel'
  | 'HVAC'
  | 'Exterior'
  | 'Interior'
  | 'Exhaust';

export interface ComponentDetail {
  id: string;
  name: string;
  system: AutomotiveSystem;
  subsystem: string;
  location: string;
  functionDesc: string;
  symptoms: string[];
  commonFailures: string[];
  diagnosticProcedures: string[];
  maintenance: string;
  repairProcedures: string[];
  safetyWarnings: string[];
  requiredTools: string[];
  relatedParts: { name: string; oemNumber: string; avgCost: string }[];
  relatedComponentIds: string[]; // for secondary highlight
  specs?: { label: string; value: string }[];
  meshPosition: [number, number, number]; // [x, y, z] default center in 3D
  explodedOffset: [number, number, number]; // [x, y, z] displacement in exploded view
}

export const AUTOMOTIVE_COMPONENTS: Record<string, ComponentDetail> = {
  battery: {
    id: 'battery',
    name: '12V AGM Starter Battery (IBS Terminal)',
    system: 'Electrical',
    subsystem: 'Energy Storage & Power Distribution',
    location: 'Engine Bay / Front Right Cowl (or Rear Trunk Floor)',
    functionDesc:
      'Provides high cold-cranking current (CCA) to turn the starter motor, stabilizes electrical bus voltage, and powers vehicle electronics when the engine is off.',
    symptoms: [
      'Slow engine cranking or clicking solenoid sound',
      'Dashboard battery warning lamp illuminated',
      'Intermittent Start-Stop function deactivation',
      'Electronic accessories reset (clock, presets, memory seats)',
      'Sulfur / rotten egg odor from off-gassing',
    ],
    commonFailures: [
      'Internal lead-plate sulfation from deep discharge',
      'Shorted internal cell dropping terminal voltage below 10.5V',
      'Intelligent Battery Sensor (IBS) micro-shunt failure',
      'Corroded positive/ground terminal clamps causing high resistance',
    ],
    diagnosticProcedures: [
      'Digital Conductance Analyzer test measuring internal conductance and Cold Cranking Amps (CCA).',
      'Resting Open-Circuit Voltage check: 12.6V+ (100%), 12.4V (75%), <12.0V (Discharged).',
      'Starting voltage drop test: voltage during cranking must remain > 9.6V at 20°C.',
      'Parasitic draw test using clamp-on milliammeter: normal sleeping bus draw is < 50 mA.',
    ],
    maintenance:
      'Inspect terminal tight connections every 12 months (torque to 6 Nm). Clean acid oxidation with neutralizing spray. Register new battery in Gateway/DME upon replacement.',
    repairProcedures: [
      'Connect OBD-II memory keeper to save ECU adaptations and radio codes.',
      'Disconnect NEGATIVE (-) ground terminal first to eliminate accidental short circuits.',
      'Disconnect POSITIVE (+) terminal and unbolt bottom hold-down clamp (13mm socket).',
      'Extract battery vertically using integrated lifting handles.',
      'Install new battery, secure hold-down clamp to 18 Nm, connect POSITIVE first, NEGATIVE last (6 Nm).',
      'Perform battery registration in the diagnostic scanner (recalibrates alternator charging curve).',
    ],
    safetyWarnings: [
      'DANGER: Lead-acid batteries generate explosive hydrogen gas during charging.',
      'Always disconnect the negative terminal first to avoid arc-welding tools to chassis ground.',
      'Wear safety glasses and acid-resistant gloves when handling corroded terminals.',
    ],
    requiredTools: [
      '10mm & 13mm Insulated Sockets',
      'Torque Wrench (5 - 25 Nm)',
      'Digital Battery Conductance Analyzer',
      'OBD-II Memory Saver Unit',
      'Terminal Cleaning Brush',
    ],
    relatedParts: [
      { name: 'OEM AGM Group 48/H6 Battery', oemNumber: '992-915-105-B', avgCost: '$285.00' },
      { name: 'Intelligent Battery Sensor (IBS)', oemNumber: '61-12-9-217-031', avgCost: '$118.00' },
      { name: 'Ground Cable with Micro-Shunt', oemNumber: '8K0-915-181-E', avgCost: '$64.00' },
    ],
    relatedComponentIds: ['alternator', 'starter', 'electrical'],
    specs: [
      { label: 'BCI Group Size', value: 'H6 / Group 48 AGM' },
      { label: 'Cold Cranking Amps', value: '850 CCA' },
      { label: 'Resting Voltage', value: '12.68 VDC' },
      { label: 'Reserve Capacity', value: '140 Minutes' },
    ],
    meshPosition: [0.75, 0.45, 1.2],
    explodedOffset: [1.2, 1.2, 0.8],
  },

  alternator: {
    id: 'alternator',
    name: '14V 180A Brushless Alternator',
    system: 'Electrical',
    subsystem: 'Charging & Power Generation',
    location: 'Front Accessory Drive (Passenger Lower/Mid)',
    functionDesc:
      'Converts mechanical rotational energy from the crankshaft into regulated direct current (DC) power to recharge the battery and run the vehicle electrical loads.',
    symptoms: [
      'Battery dashboard indicator light flashes during acceleration',
      'Headlights dimming or flickering at idle',
      'High-pitched bearing whining noise proportional to engine RPM',
      'Burning electrical smell from overheated stator windings',
    ],
    commonFailures: [
      'Worn carbon brushes or slip ring grooves after 120,000 miles',
      'Blown diode pack creating AC ripple voltage exceeding 0.5V',
      'Seized overruning alternator decoupler (OAD) pulley',
      'Internal LIN-bus voltage regulator communication failure',
    ],
    diagnosticProcedures: [
      'Output Voltage Test: with engine at 2,000 RPM and lights/fans ON, measure 13.8V - 14.5V across battery.',
      'AC Voltage Ripple Test: switch multimeter to AC; reading above 500 mV indicates bad rectifier diodes.',
      'Decoupler Pulley Test: spin rotor by hand; one-way clutch must lock in drive direction and freewheel smoothly.',
    ],
    maintenance:
      'Inspect serpentine belt tensioner and drive belt ribs every 30,000 miles. Check alternator mounting bolts for torque retention.',
    repairProcedures: [
      'Disconnect battery negative terminal.',
      'Relieve serpentine belt tensioner with 16mm breaker bar and slip belt off alternator pulley.',
      'Unplug LIN-bus connector and unbolt B+ output cable (13mm nut).',
      'Remove 2x E14 Torx mounting bolts, wiggle alternator out from accessory bracket.',
      'Torque new alternator bolts to 45 Nm and B+ nut to 15 Nm.',
    ],
    safetyWarnings: [
      'Always disconnect the battery before wrenching near the B+ stud; unfused battery direct line will arc weld!',
      'Ensure the drive belt is routed in the exact factory groove sequence.',
    ],
    requiredTools: [
      '16mm Serpentine Belt Tool',
      'E14 External Torx Socket',
      'True-RMS Digital Multimeter',
      'Torque Wrench (10 - 60 Nm)',
    ],
    relatedParts: [
      { name: '180A High-Output Alternator', oemNumber: '06K-903-023-F', avgCost: '$440.00' },
      { name: 'Overrunning Decoupler Pulley', oemNumber: 'F-556174.02', avgCost: '$68.00' },
      { name: 'Micro-V Serpentine Drive Belt', oemNumber: '6PK1120', avgCost: '$32.00' },
    ],
    relatedComponentIds: ['battery', 'engine'],
    specs: [
      { label: 'Rated Output', value: '180 Amperes @ 14.2V' },
      { label: 'Regulator Type', value: 'LIN-bus Controlled Smart Charging' },
      { label: 'Pulley Type', value: '6-Rib Overrunning Clutch (OAD)' },
    ],
    meshPosition: [0.6, 0.2, 1.45],
    explodedOffset: [1.4, 0.5, 1.2],
  },

  starter: {
    id: 'starter',
    name: 'High-Torque Reduction Starter Motor',
    system: 'Electrical',
    subsystem: 'Starting System',
    location: 'Lower Transmission Bellhousing (Driver/Passenger Side)',
    functionDesc:
      'Engages a pinion gear into the flywheel ring gear to crank the internal combustion engine to the minimum required starting speed (250-350 RPM).',
    symptoms: [
      'Single loud metallic click when turning key / pressing start button',
      'Grinding noise from worn pinion or flywheel ring gear teeth',
      'Starter spins freely at high pitch without cranking the engine (freewheeling bendix)',
      'Smoke or heavy voltage drop accompanied by no movement',
    ],
    commonFailures: [
      'Solenoid copper contact pitting from electrical arcing',
      'Worn bendix one-way roller clutch slipping under compression',
      'Carbon brush wear and commutator contamination',
    ],
    diagnosticProcedures: [
      'Terminal 50 Ignition Signal Check: test for 12V at small solenoid trigger wire while pressing start button.',
      'Starter Current Draw Test: normal inline draw is 120-180 Amps during initial crank peak.',
      'Solenoid Voltage Drop: measure voltage between battery positive and starter B+ terminal under load (<0.5V drop).',
    ],
    maintenance:
      'Inspect flywheel ring gear teeth through bellhousing inspection port whenever transmission or starter is serviced.',
    repairProcedures: [
      'Disconnect battery negative terminal.',
      'Raise vehicle on lift and remove underbody aerodynamic belly pan.',
      'Disconnect main battery feed (13mm nut) and push-on solenoid connector.',
      'Remove 2x mounting bolts securing starter to bellhousing flange.',
      'Seat new starter flush against dowel pins and torque bolts to 65 Nm.',
    ],
    safetyWarnings: [
      'Disconnect battery power before servicing starter. The heavy gauge line carries un-fused battery power.',
    ],
    requiredTools: ['13mm & 15mm Sockets', 'Torque Wrench (20 - 100 Nm)', 'DC Current Clamp Meter'],
    relatedParts: [
      { name: 'Planetary Gear Reduction Starter', oemNumber: '02M-911-024-A', avgCost: '$290.00' },
      { name: 'Starter Relay Module', oemNumber: '4H0-951-253-A', avgCost: '$24.00' },
    ],
    relatedComponentIds: ['battery', 'engine', 'transmission'],
    specs: [
      { label: 'Power Output', value: '1.4 kW (1.9 HP)' },
      { label: 'Pinion Teeth', value: '10 Tooth Helical' },
      { label: 'Rotation', value: 'Clockwise (CW)' },
    ],
    meshPosition: [-0.45, -0.15, 0.4],
    explodedOffset: [-1.2, -0.6, 0.4],
  },

  engine: {
    id: 'engine',
    name: 'Powertrain Engine Assembly',
    system: 'Engine',
    subsystem: 'Internal Combustion Core',
    location: 'Engine Compartment (Front / Mid-Rear)',
    functionDesc:
      'High-efficiency thermal power unit featuring variable camshaft timing, direct multi-hole fuel injection, and integrated balanced counter-shafts.',
    symptoms: [
      'Check engine light with misfire codes (P0300 - P0304)',
      'Excessive valve train ticking or cam phaser rattle on cold start',
      'Loss of horsepower under wide-open throttle (WOT)',
      'Exhaust smoke (blue = oil burning, black = rich fuel, white = coolant)',
    ],
    commonFailures: [
      'Carbon buildup on intake valves from direct injection lack of fuel wash',
      'Worn timing chain guides causing phase correlation faults (P0016)',
      'Blown head gasket between cylinder fire rings',
    ],
    diagnosticProcedures: [
      'Cylinder compression test (standard 175 - 210 PSI with <10% variance across cylinders).',
      'Cylinder leakdown test at 100 PSI (listen at exhaust, oil filler, and intake plenum).',
      'Live ECU Camshaft Phase Adaptation telemetry scan via CAN bus.',
    ],
    maintenance:
      'Replace synthetic engine oil every 7,500 miles. Replace spark plugs every 40,000 miles. Valve walnut shell blasting every 60,000 miles.',
    repairProcedures: [
      'Drain engine oil and cooling circuit.',
      'Remove coil packs, disconnect engine wiring harness looms, and remove intake plenum.',
      'Follow factory torque sequences for cylinder head bolts: 40 Nm + 90° + 90° angle torque.',
    ],
    safetyWarnings: [
      'Allow engine to cool completely before opening high-pressure fuel lines (up to 250 Bar residual).',
    ],
    requiredTools: ['Digital Compression Gauge', 'Torque Wrench + Angle Gauge', 'Borescope Camera'],
    relatedParts: [
      { name: 'NGK Laser Iridium Spark Plugs (Set of 4)', oemNumber: 'SILFER8C7ES', avgCost: '$68.00' },
      { name: 'OEM Intake Manifold Gasket Set', oemNumber: '06L-129-717-E', avgCost: '$42.00' },
    ],
    relatedComponentIds: ['cooling', 'fuel', 'transmission', 'exhaust'],
    specs: [
      { label: 'Displacement', value: '2.5L / 3.0L Bi-Turbo' },
      { label: 'Compression Ratio', value: '10.5 : 1' },
      { label: 'Max Engine Speed', value: '7,500 RPM' },
    ],
    meshPosition: [0.0, 0.25, 0.95],
    explodedOffset: [0.0, 1.4, 0.95],
  },

  transmission: {
    id: 'transmission',
    name: 'Dual-Clutch / Direct-Shift Transmission',
    system: 'Transmission',
    subsystem: 'Drivetrain & Electro-Hydraulics',
    location: 'Directly behind / adjacent to Engine',
    functionDesc:
      'Transfers torque from engine to differential with electro-hydraulically shifted pre-selected concentric gear sets for sub-100ms shift speeds.',
    symptoms: [
      'Hesitation or shudder during low-speed creep or reverse engagement',
      'Transmission temperature warning message on cluster',
      'Delayed gear engagement or refusal to engage even/odd gears',
    ],
    commonFailures: [
      'Mechatronic valve body solenoid debris accumulation',
      'Clutch pack glazing from high launch control usage',
      'Output shaft speed sensor Hall signal degradation',
    ],
    diagnosticProcedures: [
      'Scan Mechatronic TCU for clutch pressure deviation and fill time adaptations.',
      'Check transmission fluid level at 40°C fluid temperature with vehicle level on hoist.',
      'Run automatic clutch kiss-point recalibration cycle.',
    ],
    maintenance:
      'Drain and refill dual-clutch fluid and replace internal pressure filter every 40,000 miles.',
    repairProcedures: [
      'Support transmission on heavy-duty powertrain jack.',
      'Unbolt drive axle flanges and propeller shaft guibo joint.',
      'Unbolt bellhousing Torx bolts and drop gearbox cleanly off locating dowels.',
    ],
    safetyWarnings: ['Hot transmission fluid can exceed 100°C; do not drain immediately after driving.'],
    requiredTools: ['Transmission Fluid Filling Adapter', 'VAG/OBD-II Bi-Directional Scanner', 'Triple-Square Bits'],
    relatedParts: [
      { name: 'DCT Dual Clutch Fluid (6 Liters)', oemNumber: 'G-052-182-A2', avgCost: '$135.00' },
      { name: 'High-Pressure Cartridge Filter', oemNumber: '02E-305-051-C', avgCost: '$38.00' },
    ],
    relatedComponentIds: ['engine', 'wheels'],
    specs: [
      { label: 'Gears', value: '8-Speed DCT + Reverse' },
      { label: 'Max Torque Capacity', value: '650 Nm (480 lb-ft)' },
      { label: 'Fluid Capacity', value: '6.8 Liters' },
    ],
    meshPosition: [0.0, 0.1, -0.2],
    explodedOffset: [0.0, 0.8, -1.2],
  },

  cooling: {
    id: 'cooling',
    name: 'Thermal Management Cooling System',
    system: 'Cooling',
    subsystem: 'Radiator & Water Pump Circuit',
    location: 'Front Bumper Core & Engine Passages',
    functionDesc:
      'Circulates glycol-water coolant through engine jacket passages, turbocharger bearings, and transmission heat exchangers to maintain optimum 90-105°C operating range.',
    symptoms: [
      'Engine coolant temperature gauge spiking into red zone',
      'Sweet maple syrup smell from HVAC vents (heater core leak)',
      'Puddle of pink/yellow coolant under front bumper',
      'Cooling fan running at 100% full jet-engine volume continuously',
    ],
    commonFailures: [
      'Cracked plastic radiator end-tank crimp seams',
      'Electric water pump impeller fracture or comms fault',
      'Thermostat mapped heating element failure (DTC P2681)',
    ],
    diagnosticProcedures: [
      'Cooling system pressure test at 1.5 Bar (observe needle for 15 minutes for leaks).',
      'Combustion gas block tester checking for exhaust gases in coolant expansion reservoir.',
      'Borescope inspection of water pump weep hole.',
    ],
    maintenance:
      'Flush and vacuum refill with OEM silicate/OAT coolant every 60,000 miles or 5 years.',
    repairProcedures: [
      'Connect vacuum bleeder to coolant tank neck.',
      'Pull 25 in-Hg vacuum to collapse hoses and ensure no leaks.',
      'Open valve to draw premixed coolant into the system with zero air pockets.',
    ],
    safetyWarnings: [
      'NEVER open expansion reservoir cap on a hot engine; pressurized boiling steam will cause severe burns!',
    ],
    requiredTools: ['Airlift Pneumatic Vacuum Coolant Refiller', 'Cooling System Pressure Tester Kit'],
    relatedParts: [
      { name: 'All-Aluminum Dual-Pass Radiator', oemNumber: '992-121-251-C', avgCost: '$320.00' },
      { name: 'Map-Controlled Thermostat Housing', oemNumber: '06L-121-111-H', avgCost: '$210.00' },
    ],
    relatedComponentIds: ['engine', 'hvac'],
    specs: [
      { label: 'Operating Pressure', value: '1.4 - 1.6 Bar' },
      { label: 'Cooling Capacity', value: '10.5 Liters' },
      { label: 'Fan Configuration', value: 'Dual 400W Brushless PWM Fans' },
    ],
    meshPosition: [0.0, 0.25, 2.05],
    explodedOffset: [0.0, 0.3, 1.8],
  },

  brakes: {
    id: 'brakes',
    name: 'High-Performance Braking & ABS System',
    system: 'Brakes',
    subsystem: 'Hydraulic Disc Braking',
    location: 'All 4 Wheel Hubs & Engine Firewall ABS Modulator',
    functionDesc:
      'Multi-piston monobloc calipers clamp ventilated rotors to convert kinetic energy into thermal dissipation, coordinated with high-speed 4-channel ABS modulation.',
    symptoms: [
      'High-pitched squealing from ceramic brake pad acoustic wear indicators',
      'Pulsation or vibration felt through brake pedal during deceleration',
      'Soft or spongy pedal travel sinking to floor',
      'ABS / ESC stability control warning lamp triggered',
    ],
    commonFailures: [
      'Uneven pad friction deposition causing rotor thickness variation (RTV)',
      'Stuck caliper slide pins causing tapered pad wear',
      'Degraded DOT 4 fluid containing >3% moisture content lowering boiling point',
    ],
    diagnosticProcedures: [
      'Digital micrometer check of rotor thickness (compare against cast minimum thickness spec).',
      'Dial indicator runout measurement (lateral runout must be < 0.05 mm).',
      'Brake fluid boiling point refractometer / optical test.',
    ],
    maintenance:
      'Flush brake fluid every 2 years with DOT 4 Low Viscosity fluid. Inspect pad thickness every 10,000 miles (replace under 3mm).',
    repairProcedures: [
      'Remove wheel and push back caliper pistons with spreading tool (watch reservoir level).',
      'Extract pad retaining pins, clean caliper abutment hardware, apply ceramic lubricant.',
      'Torque caliper carrier bolts to 140 Nm with blue threadlocker.',
    ],
    safetyWarnings: [
      'Brake dust contains particulate irritants; use brake wash solvent, never compressed air.',
    ],
    requiredTools: ['Brake Caliper Piston Spreader', 'Digital Rotor Micrometer', 'Dial Indicator Gauge with Magnetic Base'],
    relatedParts: [
      { name: 'Front Semi-Metallic Brake Pads', oemNumber: '992-698-151-C', avgCost: '$215.00' },
      { name: 'Drilled 350mm Brake Rotors (Pair)', oemNumber: '992-615-301-B', avgCost: '$410.00' },
    ],
    relatedComponentIds: ['suspension', 'wheels'],
    specs: [
      { label: 'Front Calipers', value: '6-Piston Monobloc Aluminum' },
      { label: 'Front Disc Diameter', value: '350 mm x 34 mm Drilled' },
      { label: 'Fluid Type', value: 'DOT 4 LV (Low Viscosity)' },
    ],
    meshPosition: [0.85, -0.1, 1.35],
    explodedOffset: [1.3, -0.1, 1.35],
  },

  suspension: {
    id: 'suspension',
    name: 'Multi-Link Adaptive Suspension',
    system: 'Suspension',
    subsystem: 'Chassis & Damping Control',
    location: 'Four Corners Between Hubs and Unibody Subframes',
    functionDesc:
      'Maintains tire contact patch, isolates road irregularities, and controls body roll/pitch using electronic continuously variable damping valves.',
    symptoms: [
      'Clunking or knocking noise when driving over sharp road bumps',
      'Vehicle wandering or pulling to one side requiring constant steering correction',
      'Hydraulic oil weeping or coating shock absorber body',
      'Uneven tire tread cupping or inside shoulder feathering',
    ],
    commonFailures: [
      'Torn rubber suspension control arm hydro-bushings',
      'Blown shock strut internal seal losing nitrogen gas precharge',
      'Worn sway bar end links developing ball joint play',
    ],
    diagnosticProcedures: [
      'Pry bar articulation check on lower control arm ball joints and bushings.',
      'Bounce test: vehicle should settle immediately within 1.5 oscillations.',
      '4-Wheel computerized alignment check (Camber, Caster, Toe-in).',
    ],
    maintenance:
      'Inspect ball joint dust boots and damper seals at each service. Perform alignment every 15,000 miles or after curb impact.',
    repairProcedures: [
      'Support control arm with under-hoist screw jack to maintain curb height during torquing.',
      'Replace torque-to-yield stretch bolts with new factory hardware.',
      'Torque suspension arm bushings ONLY when suspension is loaded at normal ride height.',
    ],
    safetyWarnings: [
      'Coil springs store tremendous kinetic energy; always use commercial spring compressors with safety locks.',
    ],
    requiredTools: ['Strut Spring Compressor', 'Ball Joint Separator Tool', 'Torque Angle Gauge'],
    relatedParts: [
      { name: 'Electronic Damper Strut Assembly', oemNumber: '992-413-031-H', avgCost: '$580.00' },
      { name: 'Heavy-Duty Sway Bar End Link Set', oemNumber: '992-411-317-A', avgCost: '$78.00' },
    ],
    relatedComponentIds: ['wheels', 'brakes'],
    specs: [
      { label: 'Front Suspension', value: 'MacPherson Strut with Hydro-Mounts' },
      { label: 'Rear Suspension', value: '5-Link Lightweight Aluminum' },
      { label: 'Damping', value: 'Active PASM 2-Valve Continuous' },
    ],
    meshPosition: [0.75, 0.05, 1.35],
    explodedOffset: [1.2, 0.4, 1.35],
  },

  fuel: {
    id: 'fuel',
    name: 'Direct Injection & High-Pressure Fuel Rail',
    system: 'Fuel',
    subsystem: 'High Pressure Delivery & Injection',
    location: 'Engine Cylinder Head & Saddle Underbody Tank',
    functionDesc:
      'Draws fuel from the fuel cell via low-pressure in-tank pump (6 Bar) and compresses it up to 250 Bar via engine-driven cam pump for precise micro-second cylinder injection.',
    symptoms: [
      'Long crank time after sitting overnight (loss of fuel residual pressure)',
      'Engine stuttering or fuel cut under high engine load / boost',
      'Strong gasoline smell inside engine bay or cabin',
      'Fuel pressure rail error codes (P0087 Fuel Rail Pressure Too Low)',
    ],
    commonFailures: [
      'High-Pressure Fuel Pump (HPFP) follower wear on camshaft lobe',
      'Leaking piezo-electric injector washing cylinder oil film',
      'Clogged high-pressure micro-filter basket',
    ],
    diagnosticProcedures: [
      'Compare Fuel Rail Actual vs. Specified Pressure in live ECU scan (6 Bar idle, 200+ Bar WOT).',
      'Residual pressure decay test: fuel rail pressure must remain elevated 30 mins after engine shutoff.',
      'Examine HPFP roller tappet for surface scoring or flat spots.',
    ],
    maintenance:
      'Replace low-pressure fuel filter every 50,000 miles. Use high-detergent Top Tier gasoline to prevent injector tip deposits.',
    repairProcedures: [
      'Pull fuel pump fuse and crank engine for 5 seconds to depressurize fuel rail.',
      'Place lint-free absorbent towels around fuel rail fittings before loosening flared line.',
      'Replace Teflon seal on injector tip using resizing cone tool before reinstalling.',
    ],
    safetyWarnings: [
      'DANGER: High pressure gasoline spray at 200 Bar will penetrate skin and cause tissue necrosis!',
    ],
    requiredTools: ['Fuel Pressure Gauge Kit', 'Teflon Injector Seal Tool Set', 'Flare Nut Wrenches'],
    relatedParts: [
      { name: 'Cam-Driven High-Pressure Pump (HPFP)', oemNumber: '06L-127-025-N', avgCost: '$360.00' },
      { name: 'OEM Direct Injector (Individual)', oemNumber: '06L-906-036-K', avgCost: '$120.00' },
    ],
    relatedComponentIds: ['engine', 'electrical'],
    specs: [
      { label: 'Low Pressure Side', value: '5.5 - 6.5 Bar (In-Tank Electric)' },
      { label: 'High Pressure Side', value: '200 - 250 Bar (Direct Cam Driven)' },
      { label: 'Injector Type', value: 'Multi-Hole Solenoid High Precision' },
    ],
    meshPosition: [0.0, 0.35, 0.7],
    explodedOffset: [0.0, 1.1, 0.7],
  },

  hvac: {
    id: 'hvac',
    name: 'Dual-Zone Climate Control & A/C Compressor',
    system: 'HVAC',
    subsystem: 'Refrigerant Circuit & Air Distribution',
    location: 'Engine Bay Accessory Loop & Dashboard Plenum',
    functionDesc:
      'Compresses and condenses R1234yf refrigerant to absorb cabin thermal energy and dehumidify interior air for passenger comfort and defogging.',
    symptoms: [
      'Air vents blowing warm air despite A/C max setting',
      'Musty, mildew smell upon switching blower fan on',
      'Whirring or screeching noise when A/C button is pressed',
      'Hissing sound behind dashboard indicating low refrigerant gas charge',
    ],
    commonFailures: [
      'Punctured front A/C condenser from road rock stone impact',
      'Compressor variable displacement swash plate control valve sticking',
      'Clogged cabin air pollen filter restricting airflow volume',
    ],
    diagnosticProcedures: [
      'Connect R1234yf manifold gauge set: High Side should read 150-220 PSI, Low Side 25-35 PSI at 25°C ambient.',
      'Ultraviolet (UV) dye leak inspection of condenser and compressor shaft seal.',
      'Vent temperature thermometer test: output air should drop below 6°C (43°F).',
    ],
    maintenance:
      'Replace dual-layer activated charcoal cabin microfilter every 15,000 miles or 12 months.',
    repairProcedures: [
      'Evacuate refrigerant using EPA Section 609 certified recovery machine.',
      'Unbolt suction and discharge lines; immediately cap open ports to prevent moisture contamination.',
      'Add specified PAG oil volume to new compressor before bolting in (25 Nm).',
      'Perform 30-minute vacuum hold before recharging with exact factory gram weight.',
    ],
    safetyWarnings: [
      'R1234yf is mildly flammable; avoid open flames and never vent refrigerant into atmosphere.',
    ],
    requiredTools: ['R1234yf Manifold Gauges', 'Certified R1234yf Recovery/Recharge Machine', 'UV Leak Detection Light'],
    relatedParts: [
      { name: 'Variable Displacement A/C Compressor', oemNumber: '8W0-260-805-E', avgCost: '$490.00' },
      { name: 'Micro-Channel Aluminum Condenser', oemNumber: '8W0-260-401-A', avgCost: '$180.00' },
      { name: 'Activated Carbon Cabin Air Filter', oemNumber: '4M0-819-439-B', avgCost: '$34.00' },
    ],
    relatedComponentIds: ['engine', 'cooling', 'electrical'],
    specs: [
      { label: 'Refrigerant Type', value: 'HFO-1234yf Eco-Friendly' },
      { label: 'Factory Charge Weight', value: '550 ± 15 grams' },
      { label: 'Compressor Type', value: 'External Control Swash-Plate' },
    ],
    meshPosition: [0.35, 0.1, 1.6],
    explodedOffset: [1.1, 0.2, 1.6],
  },

  exhaust: {
    id: 'exhaust',
    name: 'Stainless Steel Exhaust & Catalytic Assembly',
    system: 'Exhaust',
    subsystem: 'Emissions & Backpressure Control',
    location: 'Engine Underside to Rear Diffuser Tips',
    functionDesc:
      'Channels hot combustion exhaust gases away from the engine, reduces harmful emissions (CO, HC, NOx) via precious metal catalytic wash-coats, and muffles acoustic resonance.',
    symptoms: [
      'Loud roaring exhaust sound or drone under floorboards',
      'Check engine light with code P0420 (Catalyst Efficiency Below Threshold)',
      'Rattling noise from underside indicating broken ceramic honeycomb matrix',
    ],
    commonFailures: [
      'Cracked flex pipe braid from excessive engine movement',
      'Seized active exhaust flap actuator valve',
      'Failed oxygen sensor (pre/post cat) heating circuit',
    ],
    diagnosticProcedures: [
      'Thermal imaging pyrometer test: converter outlet must be 50-100°C hotter than inlet if actively working.',
      'Exhaust backpressure test via O2 sensor bung (<1.5 PSI at 2,500 RPM).',
    ],
    maintenance:
      'Inspect rubber exhaust hanger isolators and flange gaskets during regular service.',
    repairProcedures: [
      'Spray flange studs with penetrating oil hours before disassembly.',
      'Support exhaust piping with stands to prevent strain on catalytic manifold studs.',
      'Always install new copper crush gaskets and torque copper nuts to 25 Nm.',
    ],
    safetyWarnings: ['Exhaust components reach >700°C under load. Allow 2 hours cooling time.'],
    requiredTools: ['O2 Sensor Socket', 'Exhaust Hanger Removal Pliers', 'Infrared Thermometer'],
    relatedParts: [
      { name: 'Direct-Fit High-Flow Catalytic Downpipe', oemNumber: '992-251-053-C', avgCost: '$680.00' },
      { name: 'Wideband Oxygen Sensor (Pre-Cat)', oemNumber: '06K-906-262-S', avgCost: '$135.00' },
    ],
    relatedComponentIds: ['engine'],
    specs: [
      { label: 'Material', value: 'T304 Stainless Steel' },
      { label: 'Catalyst Matrix', value: '600 CPSI Ceramic Monolith' },
      { label: 'Valved Flaps', value: 'Dual Electronic Servo 0-90°' },
    ],
    meshPosition: [0.0, -0.15, -1.1],
    explodedOffset: [0.0, -0.6, -1.8],
  },

  wheels: {
    id: 'wheels',
    name: 'Forged Monobloc Wheels & High-Grip Tires',
    system: 'Exterior',
    subsystem: 'Wheel Assembly & Hubs',
    location: 'Four Vehicle Corners',
    functionDesc:
      'Transfers powertrain driving torque and braking friction to the tarmac while sustaining lateral cornering forces up to 1.2G.',
    symptoms: [
      'Steering wheel vibration at highway speeds (65-75 MPH) indicating dynamic balance imbalance',
      'Low tire pressure warning (TPMS lamp illuminated)',
      'Tire tread depth below legal wear bars (2/32" or 1.6mm)',
    ],
    commonFailures: [
      'Bent inner rim barrel from pothole impact',
      'Tire sidewall bubble from curb pinching',
      'Dead TPMS sensor internal lithium battery',
    ],
    diagnosticProcedures: [
      'Road Force balancing runout test on wheel balancer machine.',
      'Tire tread depth gauge measurement at inner, center, and outer tread ribs.',
    ],
    maintenance:
      'Check tire cold inflation pressures monthly. Torque wheel lug nuts to exact factory spec in star pattern.',
    repairProcedures: [
      'Hand-thread all lug bolts to prevent cross-threading.',
      'Lower vehicle until tires touch ground lightly.',
      'Torque in criss-cross star sequence with calibrated clicker wrench.',
    ],
    safetyWarnings: ['Never use impact guns for final lug torque; overtightening warps brake rotors!'],
    requiredTools: ['Calibrated Torque Wrench (20-200 Nm)', 'Tread Depth Gauge', 'Tire Pressure Gauge'],
    relatedParts: [
      { name: 'Michelin Pilot Sport 4S 245/35ZR20', oemNumber: 'TYR-245-35-20', avgCost: '$290.00' },
      { name: 'OEM 433MHz TPMS Sensor Valve', oemNumber: '9A7-907-275-02', avgCost: '$65.00' },
    ],
    relatedComponentIds: ['brakes', 'suspension'],
    specs: [
      { label: 'Wheel Lug Torque', value: '118 lb-ft (160 Nm)' },
      { label: 'Bolt Pattern', value: '5 x 130 mm (Center-lock option)' },
      { label: 'Front / Rear Size', value: '245/35ZR20 (F) / 305/30ZR21 (R)' },
    ],
    meshPosition: [0.9, -0.15, 1.35],
    explodedOffset: [1.7, -0.15, 1.35],
  },

  exterior: {
    id: 'exterior',
    name: 'Aerodynamic Lightweight Unibody Shell',
    system: 'Exterior',
    subsystem: 'Body & Aerodynamics',
    location: 'Complete Vehicle Exterior Structure',
    functionDesc:
      'Rigid aluminum-steel composite safety shell featuring integrated crash crumple zones and optimized Cd 0.28 aerodynamic efficiency.',
    symptoms: [
      'Wind whistling noise from misaligned door seal at speed',
      'Panel gap unevenness exceeding 2.5 mm factory tolerance',
    ],
    commonFailures: ['Clearcoat stone chips on hood and front bumper', 'Active aero front flap motor bind'],
    diagnosticProcedures: ['Digital panel gap gauge measurement across shut lines.'],
    maintenance: 'Wash with pH-neutral soap, apply hydrophobic ceramic coating every 12 months.',
    repairProcedures: ['Align hinge shims and striker latch pins to factory reference markers.'],
    safetyWarnings: ['Ensure hood safety latch engages secondary lock before road testing.'],
    requiredTools: ['Panel Gap Stepped Feeler Tool', 'Torx Bit Set'],
    relatedParts: [{ name: 'Aero Front Splitter Blade', oemNumber: '992-807-061-B', avgCost: '$380.00' }],
    relatedComponentIds: ['wheels'],
    specs: [
      { label: 'Drag Coefficient (Cd)', value: '0.28' },
      { label: 'Chassis Torsional Rigidity', value: '39,000 Nm/degree' },
    ],
    meshPosition: [0.0, 0.35, 0.0],
    explodedOffset: [0.0, 1.8, 0.0],
  },

  interior: {
    id: 'interior',
    name: 'Digital Cockpit & CAN Comfort Gateway',
    system: 'Interior',
    subsystem: 'Cockpit Electronics & Ergonomics',
    location: 'Vehicle Passenger Cabin',
    functionDesc:
      'Human-machine interface (HMI) housing twin high-resolution digital displays, tactile drive mode selectors, and optical airbag supplemental restraint modules.',
    symptoms: [
      'Instrument cluster screen flickering or failing to boot',
      'Steering wheel multifunction buttons unresponsive',
    ],
    commonFailures: ['Steering clockspring ribbon cable fracture', 'Center console haptic touch module crash'],
    diagnosticProcedures: ['Run CAN-bus Gateway optical loop test and cluster self-test routine.'],
    maintenance: 'Clean LCD glass with specialized antistatic microfiber cloth only.',
    repairProcedures: ['Disconnect battery and wait 15 minutes before disconnecting SRS airbag connectors.'],
    safetyWarnings: ['DANGER: Explosive pyrotechnic airbag squib charges must be handled with static grounding.'],
    requiredTools: ['Nylon Trim Pry Tools', 'Antistatic Wrist Ground Strap'],
    relatedParts: [{ name: 'Steering Column Clockspring Switch', oemNumber: '971-953-568-H', avgCost: '$260.00' }],
    relatedComponentIds: ['electrical'],
    specs: [
      { label: 'Displays', value: 'Twin 7-Inch TFT + 10.9-Inch Touchscreen' },
      { label: 'Airbag Count', value: '8 Supplemental Restraint Airbags' },
    ],
    meshPosition: [0.0, 0.35, -0.3],
    explodedOffset: [0.0, 1.4, -0.3],
  },

  electrical: {
    id: 'electrical',
    name: 'Main CAN-FD Wiring Harness & Gateway',
    system: 'Electrical',
    subsystem: 'Central Multiplexed Bus Network',
    location: 'Throughout Chassis Unibody & Cockpit',
    functionDesc:
      'Interconnects up to 80 distributed electronic control units (ECUs) exchanging telemetry packets at 2.0 to 5.0 Mbps over twisted-pair differential signaling.',
    symptoms: [
      'Multiple simultaneous unrelated DTC communication faults (U0100, U0121)',
      'Vehicle failing to enter low-power sleep mode after ignition off',
    ],
    commonFailures: ['Water ingress in footwell Body Control Module (BCM)', 'Rodent chewed engine bay harness wiring'],
    diagnosticProcedures: [
      'Digital storage oscilloscope test on CAN-High (2.5 - 3.5V) and CAN-Low (1.5 - 2.5V) lines.',
      'Check split termination resistance (must read 60 Ohms across pins 6 & 14 with battery disconnected).',
    ],
    maintenance: 'Ensure weather-pack grommets and firewall pass-through seals remain supple.',
    repairProcedures: ['Repair damaged wiring using heat-shrink crimp sleeves; never twist and tape.'],
    safetyWarnings: ['Avoid piercing insulation with multimeter probes; moisture will wick through copper strand.'],
    requiredTools: ['Digital Storage Oscilloscope', 'Breakout Box OBD-II Adapter', 'Micro-Crimp Pliers'],
    relatedParts: [{ name: 'Gateway ECU Controller Module', oemNumber: '4N0-907-468-H', avgCost: '$410.00' }],
    relatedComponentIds: ['battery', 'alternator', 'starter'],
    specs: [
      { label: 'Bus Protocols', value: 'CAN-FD (5 Mbps) & Ethernet (100BASE-T1)' },
      { label: 'Termination Resistance', value: '60.2 Ohms (2x 120 Ohm parallel)' },
    ],
    meshPosition: [0.0, 0.1, 0.5],
    explodedOffset: [0.0, 0.7, 0.5],
  },
};

export type VehicleComponent = ComponentDetail;
export const COMPONENT_DATABASE = AUTOMOTIVE_COMPONENTS;
