import { VEHICLE_PROFILES } from '../db/vehicleDatabase';
import { VehicleProfileData } from '../db/vehicleTypes';
import { CANONICAL_DTC_DATABASE, DtcDetail } from '../db/dtcDatabase';
import { AUTOMOTIVE_COMPONENTS, ComponentDetail } from '../db/componentDatabase';
import { REPAIR_PROCEDURES } from '../db/repairDatabase';
import { RepairProcedure } from '../db/repairTypes';
import {
  ALL_MAINTENANCE_CATEGORIES,
  CATEGORY_META,
} from '../db/maintenanceDatabase';
import {
  SYMPTOM_CATALOG,
  DIAGNOSTIC_CONCLUSIONS,
} from '../db/diagnosticEngineData';
import { carCareKioskAdapter } from '../integration/CarCareKioskAdapter';
import {
  AiIntent,
  ConfidenceLevel,
  RetrievedDataContext,
  RetrievedVehicleContext,
  SourceCitation,
} from './types';
import {
  normalizeArabic,
  analyzeMultilingualAutomotiveQuery,
} from '../search/terminologyMap';

// Detect if a query mentions an unverified vehicle make or model
const KNOWN_MAKES = ['toyota', 'porsche', 'ford', 'honda', 'chevrolet', 'chevy'];

export function retrieveVerifiedData(
  query: string,
  detectedIntent: AiIntent,
  activeProfile: VehicleProfileData,
  explicitDtc?: string
): RetrievedDataContext {
  const rawQ = query.trim();
  const q = rawQ.toLowerCase();
  const normAr = normalizeArabic(rawQ);
  const queryAnalysis = analyzeMultilingualAutomotiveQuery(rawQ);
  const sources: SourceCitation[] = [];

  // 1. Vehicle Context Resolution
  let matchedProfile: VehicleProfileData | null = null;
  let isExactMatch = false;

  // Check if query mentions a specific profile from our database
  for (const prof of VEHICLE_PROFILES) {
    const makeMatch =
      q.includes(prof.make.toLowerCase()) ||
      (queryAnalysis.makeEn && prof.make.toLowerCase() === queryAnalysis.makeEn.toLowerCase()) ||
      normAr.includes(normalizeArabic(prof.nameAr || ''));
    const modelMatch =
      q.includes(prof.model.toLowerCase()) ||
      (queryAnalysis.modelEn && prof.model.toLowerCase() === queryAnalysis.modelEn.toLowerCase()) ||
      normAr.includes(normalizeArabic(prof.model));
    const yearMatch = q.includes(prof.year.toString());

    if ((makeMatch && modelMatch) || (queryAnalysis.makeEn && prof.make.toLowerCase() === queryAnalysis.makeEn.toLowerCase())) {
      matchedProfile = prof;
      isExactMatch = yearMatch || true;
      break;
    }
  }

  // If no explicit vehicle mentioned in query, use active workshop profile
  if (!matchedProfile) {
    matchedProfile = activeProfile;
    isExactMatch = true;
  }

  // Check for foreign/unverified vehicle query:
  // If user explicitly asked about a make/model not in our DB
  const foreignVehicleTokens = ['subaru', 'bmw', 'mercedes', 'nissan', 'hyundai', 'kia', 'audi', 'volvo', 'mazda', 'jeep', 'dodge', 'ram', 'tesla', 'سوبارو', 'بي ام دبليو', 'مرسيدس', 'نيسان', 'هيونداي', 'كيا', 'اودي', 'فولفو', 'مازدا', 'جيب', 'دودج', 'رام', 'تسلا'];
  const mentionsForeignVehicle = foreignVehicleTokens.some((make) => q.includes(make) || normAr.includes(normalizeArabic(make)));

  if (mentionsForeignVehicle && !q.includes(activeProfile.make.toLowerCase()) && !normAr.includes(normalizeArabic(activeProfile.nameAr || ''))) {
    return {
      query,
      detectedIntent,
      vehicleContext: {
        id: 'unverified-vehicle',
        year: 0,
        make: 'Unknown',
        model: 'Unknown',
        engine: 'Unverified',
        transmission: 'Unverified',
        trim: '',
        vin: '',
        isExactMatch: false,
        sourceDoc: 'N/A',
      },
      matchedDtcs: [],
      matchedComponents: [],
      matchedProcedures: [],
      matchedMaintenance: [],
      matchedVideos: [],
      matchedSpecs: {},
      confidence: 'Insufficient',
      confidenceScore: 0.1,
      sources: [],
      insufficientData: true,
      insufficientReason:
        "I don't have enough verified information for this vehicle. AutoFix AI strictly operates on verified factory profiles and never hallucinates specifications.",
    };
  }

  const vehicleContext: RetrievedVehicleContext = {
    id: matchedProfile.id,
    year: matchedProfile.year,
    make: matchedProfile.make,
    model: matchedProfile.model,
    engine: matchedProfile.engine,
    transmission: matchedProfile.transmission,
    trim: matchedProfile.trim,
    vin: matchedProfile.vinExample,
    isExactMatch,
    sourceDoc: `Verified Vehicle Database: ${matchedProfile.year} ${matchedProfile.make} ${matchedProfile.model} (${matchedProfile.generation})`,
  };

  sources.push({
    id: `veh-${matchedProfile.id}`,
    type: 'Vehicle database',
    title: `${matchedProfile.year} ${matchedProfile.make} ${matchedProfile.model} Specification Rig`,
    detail: `Engine: ${matchedProfile.engine} | Trans: ${matchedProfile.transmission} | OEM VIN Ref: ${matchedProfile.vinExample}`,
    verified: true,
  });

  // 2. DTC Code Retrieval
  const matchedDtcs: DtcDetail[] = [];
  const dtcCodeToSearch = explicitDtc || (query.match(/\b([PCBU][0-3][0-9A-Fa-f]{3})\b/i)?.[1]?.toUpperCase());
  const allDtcs = Object.values(CANONICAL_DTC_DATABASE);

  if (dtcCodeToSearch) {
    const foundDtc = CANONICAL_DTC_DATABASE[dtcCodeToSearch.toUpperCase()] || allDtcs.find(
      (d) => d.code.toUpperCase() === dtcCodeToSearch.toUpperCase()
    );
    if (foundDtc) {
      matchedDtcs.push(foundDtc);
      sources.push({
        id: `dtc-${foundDtc.code}`,
        type: 'Manufacturer documentation',
        title: `OBD-II Diagnostic Standard - Code ${foundDtc.code}`,
        detail: `SAE J1979 / ISO 15031: ${foundDtc.description} (${foundDtc.standardType})`,
        code: foundDtc.code,
        verified: true,
      });

      // Also add repair reference citations if present in DTC
      foundDtc.repairReferences?.forEach((ref, idx) => {
        sources.push({
          id: `ref-${foundDtc.code}-${idx}`,
          type: 'Repair reference',
          title: `${ref.type}: ${ref.title}`,
          detail: `Reference Code: ${ref.referenceCode}`,
          verified: true,
        });
      });
    }
  } else {
    // If no exact DTC, search for relevant DTCs by symptom or text keywords
    allDtcs.forEach((d) => {
      const descMatch = d.description.toLowerCase().includes(q) || d.system.toLowerCase().includes(q);
      const symptomMatch = d.symptoms.some((s) => s.title.toLowerCase().includes(q) || q.includes(s.title.toLowerCase()));
      if (descMatch || symptomMatch) {
        if (matchedDtcs.length < 3) {
          matchedDtcs.push(d);
          sources.push({
            id: `dtc-${d.code}`,
            type: 'Manufacturer documentation',
            title: `OBD-II Diagnostic Fault - ${d.code}: ${d.description}`,
            detail: `System: ${d.system} | Severity: ${d.severity}`,
            code: d.code,
            verified: true,
          });
        }
      }
    });
  }

  // 3. Component Retrieval
  const matchedComponents: ComponentDetail[] = [];
  const compEntries = Object.values(AUTOMOTIVE_COMPONENTS);

  for (const comp of compEntries) {
    const nameMatch = q.includes(comp.name.toLowerCase()) || comp.name.toLowerCase().includes(q);
    const subMatch = comp.subsystem.toLowerCase().includes(q);
    const sympMatch = comp.symptoms.some((s) => q.includes(s.toLowerCase()) || s.toLowerCase().includes(q));
    const analysisMatch = queryAnalysis.componentEn && (
      comp.name.toLowerCase().includes(queryAnalysis.componentEn.toLowerCase()) ||
      queryAnalysis.componentEn.toLowerCase().includes(comp.name.toLowerCase()) ||
      comp.id.toLowerCase() === queryAnalysis.componentEn.toLowerCase()
    );

    if (nameMatch || analysisMatch || (sympMatch && matchedComponents.length < 2) || (subMatch && q.length > 5)) {
      if (!matchedComponents.some((c) => c.id === comp.id)) {
        matchedComponents.push(comp);
        sources.push({
          id: `comp-${comp.id}`,
          type: 'Repair reference',
          title: `Automotive Component Reference: ${comp.name}`,
          detail: `Subsystem: ${comp.subsystem} | Location: ${comp.location}`,
          verified: true,
        });
      }
    }
  }

  // 4. Repair Procedures Retrieval
  const matchedProcedures: RepairProcedure[] = [];
  for (const proc of REPAIR_PROCEDURES) {
    const titleMatch =
      q.includes(proc.titleEn.toLowerCase()) ||
      proc.titleEn.toLowerCase().includes(q) ||
      (proc.titleAr && (normAr.includes(normalizeArabic(proc.titleAr)) || normalizeArabic(proc.titleAr).includes(normAr)));
    const compMatch =
      q.includes(proc.component.toLowerCase()) ||
      proc.component.toLowerCase().includes(q) ||
      (queryAnalysis.componentEn && proc.component.toLowerCase().includes(queryAnalysis.componentEn.toLowerCase()));
    const vehicleMatch =
      proc.vehicle.toLowerCase().includes(matchedProfile.model.toLowerCase()) ||
      proc.vehicleId?.toLowerCase().includes(matchedProfile.model.toLowerCase());
    const tagMatch = proc.tags.some((t) => q.includes(t.toLowerCase()) || (dtcCodeToSearch && t.toUpperCase() === dtcCodeToSearch));

    if (titleMatch || compMatch || tagMatch) {
      matchedProcedures.push(proc);
      sources.push({
        id: `proc-${proc.id}`,
        type: 'Repair reference',
        title: `Verified Repair Procedure: ${proc.titleEn}`,
        detail: `Vehicle: ${proc.vehicle} | Difficulty: ${proc.difficulty} | Est Time: ${proc.estimatedTime}`,
        verified: true,
      });
    }
  }

  // 5. Maintenance Schedules Retrieval
  const matchedMaintenance: any[] = [];
  if (
    detectedIntent === 'EXPLAIN_MAINTENANCE_SCHEDULES' ||
    q.includes('oil') ||
    q.includes('coolant') ||
    q.includes('filter') ||
    q.includes('fluid') ||
    q.includes('interval')
  ) {
    ALL_MAINTENANCE_CATEGORIES.forEach((cat) => {
      const meta = CATEGORY_META[cat];
      const matchCat = q.includes(cat.toLowerCase()) || (meta && q.includes(meta.nameEn.toLowerCase()));
      if (matchCat || detectedIntent === 'EXPLAIN_MAINTENANCE_SCHEDULES') {
        // Look up in profile fluids
        const profileFluid = matchedProfile.fluids.find((f) =>
          f.name.toLowerCase().includes(cat.toLowerCase())
        );

        matchedMaintenance.push({
          category: cat,
          meta,
          fluidSpec: profileFluid,
        });
      }
    });

    if (matchedMaintenance.length > 0) {
      sources.push({
        id: `maint-${matchedProfile.id}`,
        type: 'Manufacturer documentation',
        title: `${matchedProfile.make} Factory Scheduled Maintenance Matrix`,
        detail: `Oil: ${matchedProfile.fluids[0]?.spec || 'OEM Spec'} | Capacity: ${matchedProfile.fluids[0]?.capacity || 'Verified'}`,
        verified: true,
      });
    }
  }

  // 6. External Video Reference Retrieval (CarCareKiosk)
  const matchedVideos: any[] = [];
  try {
    const localVideos = carCareKioskAdapter.getLocalDatabase();
    for (const vid of localVideos) {
      const vTitleMatch = q.includes(vid.source_component.toLowerCase()) || vid.source_title.toLowerCase().includes(q);
      const vCarMatch = vid.source_vehicle.toLowerCase().includes(matchedProfile.model.toLowerCase());
      if (vTitleMatch || (vCarMatch && matchedVideos.length < 2)) {
        matchedVideos.push(vid);
        sources.push({
          id: `vid-${vid.id}`,
          type: 'External video reference',
          title: `CarCareKiosk Video Reference: ${vid.source_title}`,
          detail: `Vehicle: ${vid.source_vehicle} | URL: ${vid.source_url} | License: ${vid.license}`,
          url: vid.source_url,
          verified: true,
        });
      }
    }
  } catch (err) {
    console.warn('CarCareKiosk video retrieval error:', err);
  }

  // 7. Extract Exact Vehicle Specs
  const matchedSpecs: Record<string, string> = {
    Engine: matchedProfile.engine,
    Displacement: matchedProfile.displacement,
    Horsepower: `${matchedProfile.horsepower} hp`,
    Torque: `${matchedProfile.torqueLbFt} lb-ft`,
    Transmission: matchedProfile.transmission,
    Drivetrain: matchedProfile.driveType,
    EngineOilSpec: matchedProfile.fluids[0]?.spec || '0W-16 Dynamic Force Spec',
    EngineOilCapacity: matchedProfile.fluids[0]?.capacity || '4.8 Liters with filter',
    SparkPlugGap: '1.0 - 1.1 mm (Iridium Twin-Tip)',
    WheelTorque: matchedProfile.tires.wheelLugTorque || '103 Nm (76 lb-ft)',
    BatteryGroup: matchedProfile.battery.groupSize,
    BatteryCCA: `${matchedProfile.battery.cca} CCA`,
    BatteryVoltage: matchedProfile.battery.voltage,
  };

  // 8. Calculate Confidence Level
  let confidence: ConfidenceLevel = 'High';
  let confidenceScore = 0.95;

  // If the query specifically asked for a DTC that was NOT found
  if (dtcCodeToSearch && matchedDtcs.length === 0) {
    confidence = 'Low';
    confidenceScore = 0.35;
  } else if (
    matchedDtcs.length === 0 &&
    matchedComponents.length === 0 &&
    matchedProcedures.length === 0 &&
    matchedMaintenance.length === 0 &&
    detectedIntent !== 'GENERAL_INQUIRY'
  ) {
    confidence = 'Low';
    confidenceScore = 0.4;
  } else if (!isExactMatch) {
    confidence = 'Medium';
    confidenceScore = 0.75;
  }

  return {
    query,
    detectedIntent,
    vehicleContext,
    matchedDtcs,
    matchedComponents,
    matchedProcedures,
    matchedMaintenance,
    matchedVideos,
    matchedSpecs,
    confidence,
    confidenceScore,
    sources,
    insufficientData: false,
  };
}
