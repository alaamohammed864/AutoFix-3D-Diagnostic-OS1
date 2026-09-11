import { VerifiedVehicleElectricalProfile } from './types';
import { TOYOTA_CAMRY_COMPONENTS } from './verifiedDataToyota';

export const VERIFIED_ELECTRICAL_REGISTRY: Record<string, VerifiedVehicleElectricalProfile> = {
  'toyota-camry-2018-xv70-2.5l-se-auto': {
    vehicleId: 'toyota-camry-2018-xv70-2.5l-se-auto',
    make: 'Toyota',
    model: 'Camry',
    year: 2018,
    generation: 'XV70 (8th Gen)',
    oemDiagramRef: 'Toyota OEM Service Publication EWD-CAM18-A25A (Toyota Motor Corp)',
    wiringStandards: 'JIS C3406',
    isVerified: true,
    systems: TOYOTA_CAMRY_COMPONENTS,
  },
};

export function getVerifiedElectricalData(vehicleId: string): VerifiedVehicleElectricalProfile | null {
  const profile = VERIFIED_ELECTRICAL_REGISTRY[vehicleId];
  if (!profile || !profile.isVerified) {
    return null;
  }
  return profile;
}

export function isVehicleWiringVerified(vehicleId: string): boolean {
  return !!VERIFIED_ELECTRICAL_REGISTRY[vehicleId]?.isVerified;
}
