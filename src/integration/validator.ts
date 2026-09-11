import { ImportedDatabaseRecord, ValidationResult } from './types';

// Robots.txt simulation & compliance rules for carcarekiosk.com
const ROBOTS_DISALLOWED_PREFIXES = [
  '/admin',
  '/user',
  '/auth',
  '/login',
  '/account',
  '/checkout',
  '/api/private',
  '/internal',
];

export class RecordValidator {
  /**
   * Validates a candidate record before committing to the local database.
   */
  public static validate(
    candidate: Omit<ImportedDatabaseRecord, 'id' | 'validation_status' | 'validation_errors'>
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 1. Source verification
    if (!candidate.source || candidate.source.toLowerCase() !== 'carcarekiosk') {
      errors.push(`Invalid source identifier: "${candidate.source}". Expected "carcarekiosk".`);
    }

    // 2. Source URL & Domain verification
    if (!candidate.source_url) {
      errors.push('Missing mandatory "source_url" field.');
    } else {
      try {
        const url = new URL(candidate.source_url);
        if (url.protocol !== 'https:') {
          errors.push(`Insecure protocol "${url.protocol}". HTTPS is strictly required.`);
        }
        if (!url.hostname.includes('carcarekiosk.com')) {
          errors.push(
            `Unauthorized external domain "${url.hostname}". Expected "www.carcarekiosk.com".`
          );
        }

        // 3. Robots.txt Compliance Check
        const pathname = url.pathname.toLowerCase();
        for (const disallowed of ROBOTS_DISALLOWED_PREFIXES) {
          if (pathname.startsWith(disallowed)) {
            errors.push(
              `Robots.txt Policy Violation: Path "${url.pathname}" is disallowed by external robots.txt.`
            );
            break;
          }
        }
      } catch {
        errors.push(`Malformed source_url: "${candidate.source_url}".`);
      }
    }

    // 4. Vehicle metadata verification
    if (!candidate.source_vehicle || candidate.source_vehicle.trim().length < 3) {
      errors.push('Vehicle name is empty or lacks minimum required length.');
    }

    const currentYear = new Date().getFullYear();
    if (
      !candidate.source_year ||
      candidate.source_year < 1980 ||
      candidate.source_year > currentYear + 2
    ) {
      errors.push(
        `Automotive year ${candidate.source_year} is out of allowable bounds (1980 - ${currentYear + 2}).`
      );
    }

    // 5. System & Component verification
    if (!candidate.source_component || candidate.source_component.trim().length < 2) {
      errors.push('Mandatory "source_component" is missing or too short.');
    }

    if (!candidate.source_system || candidate.source_system.trim().length < 3) {
      errors.push('Mandatory "source_system" is missing or unmapped.');
    }

    // 6. Legal & Attribution constraints
    if (candidate.attribution_required !== true) {
      errors.push('Attribution requirement violation: "attribution_required" must be true.');
    }

    if (!candidate.license || candidate.license.trim().length < 5) {
      errors.push('Missing or incomplete legal license declaration.');
    }

    // 7. Video metadata warnings (non-fatal)
    if (!candidate.video_metadata) {
      warnings.push('Record has no associated video reference media.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
