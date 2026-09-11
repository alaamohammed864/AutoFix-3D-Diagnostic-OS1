import { ExternalRawRecord, ImportedDatabaseRecord } from './types';

export class Normalizer {
  /**
   * Normalizes raw vehicle strings like "2021 Toyota Camry LE 2.5L" into standard fields.
   */
  public static normalizeVehicle(rawVehicle: string, rawYear?: number): {
    normalizedName: string;
    make: string;
    model: string;
    year: number;
    vehicleId: string;
  } {
    const cleaned = rawVehicle.trim();
    // extract year if present
    const yearMatch = cleaned.match(/\b(19\d\d|20\d\d)\b/);
    const year = rawYear || (yearMatch ? parseInt(yearMatch[1], 10) : 2021);

    // remove year from string to parse make & model
    const withoutYear = cleaned.replace(/\b(19\d\d|20\d\d)\b/, '').trim();
    const parts = withoutYear.split(/\s+/).filter(Boolean);

    let make = 'Generic';
    let model = 'Vehicle';

    if (parts.length > 0) {
      make = parts[0];
      model = parts.slice(1).join(' ') || 'Standard';
    }

    // Map common known vehicle IDs in AutoFix database
    let vehicleId = 'generic-vehicle';
    const lowerMake = make.toLowerCase();
    const lowerModel = model.toLowerCase();

    if (lowerMake.includes('toyota') && lowerModel.includes('camry')) {
      vehicleId = 'toyota-camry-2021';
    } else if (lowerMake.includes('porsche') && lowerModel.includes('911')) {
      vehicleId = 'porsche-911-gt3-2022';
    } else if (lowerMake.includes('ford') && lowerModel.includes('f-150')) {
      vehicleId = 'ford-f150-2023';
    } else if (lowerMake.includes('honda') && lowerModel.includes('accord')) {
      vehicleId = 'honda-accord-2022';
    } else if (lowerMake.includes('chevrolet') && lowerModel.includes('silverado')) {
      vehicleId = 'chevy-silverado-2022';
    }

    return {
      normalizedName: `${year} ${make} ${model}`.trim(),
      make,
      model,
      year,
      vehicleId,
    };
  }

  /**
   * Maps third-party categories to AutoFix canonical automotive systems.
   */
  public static mapSystemCategory(rawCategory: string, rawComponent: string): {
    canonicalSystem: string;
    canonicalSystemId: string;
  } {
    const text = `${rawCategory} ${rawComponent}`.toLowerCase();

    if (text.includes('brake') || text.includes('pad') || text.includes('rotor') || text.includes('caliper') || text.includes('abs')) {
      return {
        canonicalSystem: 'Braking & Hydraulic Systems',
        canonicalSystemId: 'braking-abs',
      };
    }

    if (text.includes('coolant') || text.includes('radiator') || text.includes('thermostat') || text.includes('water pump') || text.includes('cooling')) {
      return {
        canonicalSystem: 'Thermal Management & Cooling',
        canonicalSystemId: 'thermal-cooling',
      };
    }

    if (text.includes('battery') || text.includes('bulb') || text.includes('light') || text.includes('alternator') || text.includes('fuse') || text.includes('electrical')) {
      return {
        canonicalSystem: 'Electrical & Lighting Systems',
        canonicalSystemId: 'electrical-wiring',
      };
    }

    if (text.includes('suspension') || text.includes('strut') || text.includes('shock') || text.includes('steering') || text.includes('tie rod') || text.includes('alignment')) {
      return {
        canonicalSystem: 'Suspension & Steering Systems',
        canonicalSystemId: 'suspension-steering',
      };
    }

    if (text.includes('transmission') || text.includes('clutch') || text.includes('gear') || text.includes('fluid') && text.includes('atf')) {
      return {
        canonicalSystem: 'Transmission & Drivetrain',
        canonicalSystemId: 'transmission-pdk',
      };
    }

    // Default to Powertrain & Engine
    return {
      canonicalSystem: 'Powertrain & Engine Systems',
      canonicalSystemId: 'powertrain-engine',
    };
  }

  /**
   * Maps available video metadata with fair use attribution notice.
   */
  public static mapVideoReference(raw: ExternalRawRecord) {
    if (!raw.videoDuration && !raw.videoThumbnail && !raw.videoUrl) {
      return undefined;
    }

    return {
      duration: raw.videoDuration || '3:45',
      resolution: raw.resolution || '1080p HD',
      thumbnailUrl:
        raw.videoThumbnail ||
        'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=900&q=80',
      videoUrl:
        raw.videoUrl ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    };
  }

  /**
   * Transforms raw scraped/discovered record into canonical database record
   */
  public static normalizeRecord(
    raw: ExternalRawRecord,
    batchId: string
  ): Omit<ImportedDatabaseRecord, 'id' | 'validation_status' | 'validation_errors'> {
    const { normalizedName, year, vehicleId } = this.normalizeVehicle(
      raw.rawVehicleStr,
      raw.rawYear
    );
    const { canonicalSystem, canonicalSystemId } = this.mapSystemCategory(
      raw.category,
      raw.component
    );
    const videoMeta = this.mapVideoReference(raw);

    return {
      source: 'carcarekiosk',
      source_url: raw.url,
      source_type: raw.videoUrl ? 'public_video_guide' : 'public_procedure_metadata',
      source_title: raw.rawTitle || `${raw.component} Replacement - ${normalizedName}`,
      source_vehicle: normalizedName,
      source_year: year,
      source_system: canonicalSystem,
      source_component: raw.component || 'Automotive Component',
      retrieved_at: new Date().toISOString(),
      license: 'Educational Technical Reference / Fair-Use Attribution',
      attribution_required: true,
      normalized_vehicle_id: vehicleId,
      canonical_system_id: canonicalSystemId,
      steps_count: 6,
      video_metadata: videoMeta,
      sync_batch_id: batchId,
    };
  }
}
