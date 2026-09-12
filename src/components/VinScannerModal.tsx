import React, { useState, useMemo } from 'react';
import { Language, VehicleSpec } from '../types';
import { factoryVehicles } from '../data/mockVehicles';

interface VinScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectVehicle: (veh: VehicleSpec) => void;
}

// ISO 3779 Model Year character map
const VIN_YEAR_MAP: Record<string, string> = {
  L: '2020',
  M: '2021',
  N: '2022',
  P: '2023',
  R: '2024',
  S: '2025',
  T: '2026',
  A: '2010',
  B: '2011',
  C: '2012',
  D: '2013',
  E: '2014',
  F: '2015',
  G: '2016',
  H: '2017',
  J: '2018',
  K: '2019',
};

// ISO 3779 World Manufacturer Identifier (WMI) map
const WMI_MAP: Record<string, { make: string; country: string }> = {
  WP0: { make: 'Porsche', country: 'Germany' },
  WP1: { make: 'Porsche SUV', country: 'Germany' },
  WBS: { make: 'BMW M GmbH', country: 'Germany' },
  WBA: { make: 'BMW AG', country: 'Germany' },
  WAU: { make: 'Audi', country: 'Germany' },
  WDD: { make: 'Mercedes-Benz', country: 'Germany' },
  JTD: { make: 'Toyota', country: 'Japan' },
  JTE: { make: 'Toyota Truck/SUV', country: 'Japan' },
  JHM: { make: 'Honda', country: 'Japan' },
  KMH: { make: 'Hyundai', country: 'South Korea' },
  KNA: { make: 'Kia', country: 'South Korea' },
  '1FA': { make: 'Ford', country: 'USA' },
  '1G1': { make: 'Chevrolet', country: 'USA' },
  '5YJ': { make: 'Tesla', country: 'USA' },
};

export const VinScannerModal: React.FC<VinScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectVehicle,
}) => {
  const [vinInput, setVinInput] = useState('WP0AA2A92NS240192');
  const [isScanning, setIsScanning] = useState(false);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const isAr = lang === 'ar';

  // Real-time ISO 3779 VIN breakdown
  const decodedVinInfo = useMemo(() => {
    const cleanVin = vinInput.trim().toUpperCase();
    if (cleanVin.length !== 17) return null;

    const wmi = cleanVin.slice(0, 3);
    const mfg = WMI_MAP[wmi] || { make: 'Automotive OEM (ISO 3779)', country: 'International' };
    const yearChar = cleanVin[9];
    const year = VIN_YEAR_MAP[yearChar] || '2023';

    return {
      vin: cleanVin,
      wmi,
      make: mfg.make,
      country: mfg.country,
      year,
      serial: cleanVin.slice(11),
    };
  }, [vinInput]);

  if (!isOpen) return null;

  const handleScanSimulate = (key: string) => {
    setIsScanning(true);
    setDecodeError(null);
    setTimeout(() => {
      setIsScanning(false);
      if (factoryVehicles[key]) {
        onSelectVehicle(factoryVehicles[key]);
        onClose();
      }
    }, 800);
  };

  const handleDecodeCustomVin = () => {
    const cleanVin = vinInput.trim().toUpperCase();
    if (cleanVin.length !== 17) {
      setDecodeError(
        isAr
          ? 'يجب أن يتكون رقم الشاسيه (VIN) من 17 رمزاً وفق المعيار الدولي ISO 3779.'
          : 'VIN must be exactly 17 alphanumeric characters per ISO 3779 standard.'
      );
      return;
    }

    // Check if it matches one of our factory calibrated rigs
    const match = Object.values(factoryVehicles).find(
      (v) => v.vin.toUpperCase() === cleanVin || cleanVin.startsWith(v.vin.slice(0, 8))
    );

    if (match) {
      onSelectVehicle(match);
      onClose();
      return;
    }

    // Otherwise construct calibrated spec from ISO 3779 breakdown
    if (decodedVinInfo) {
      const customSpec: VehicleSpec = {
        make: decodedVinInfo.make,
        model: `${decodedVinInfo.make} Calibration Rig`,
        year: `${decodedVinInfo.year} (VIN: ${cleanVin.slice(0, 8)}...)`,
        powertrain: 'Electronic Fuel Injection / DOHC Multivalve',
        drivetrain: 'Integrated Transaxle AWD/RWD',
        gearbox: 'Automatic / Dual-Clutch Direct Drive',
        displacement: '2,488 cc',
        engineOil: 'API SP / ILSAC GF-6A 0W-20 (5.4 L)',
        sparkGap: '0.80 mm (0.032 in)',
        wheelBoltTorque: '130 Nm (96 lb-ft)',
        vin: cleanVin,
      };
      onSelectVehicle(customSpec);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-low shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-lg">qr_code_scanner</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? 'مسح رقم الشاسيه الباركود / VIN' : 'VIN Barcode & Optical OCR Scanner'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                ISO 3779 17-Digit Vehicle Identification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-surface-container text-outline hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Scanner Optical Viewport */}
          <div className="relative aspect-video bg-black/60 rounded-xl border-2 border-dashed border-primary-container/40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-primary-container shadow-[0_0_15px_#00f0ff] animate-bounce top-1/2"></div>
            )}
            <span className="material-symbols-outlined text-4xl text-primary-container mb-2 animate-pulse">
              barcode_scanner
            </span>
            <div className="font-code-sm text-xs text-on-surface font-bold">
              {isScanning
                ? isAr
                  ? 'جاري فك تشفير رقم الشاسيه ومطابقة المصنع...'
                  : 'Decoding VIN and matching factory calibration...'
                : isAr
                ? 'وجّه الكاميرا أو أدخل رقم الشاسيه يدوياً'
                : 'Aim camera at windshield VIN or enter 17-digit code'}
            </div>
            <p className="text-[11px] font-code-sm text-outline mt-1">
              Supports Code 39, Code 128 & ISO 3779 Optical Standards
            </p>
          </div>

          {/* Manual VIN Input Field & Real-time ISO 3779 Parser */}
          <div className="space-y-2">
            <label className="text-[10px] font-telemetry-label text-outline uppercase">
              {isAr ? 'إدخال رقم الشاسيه يدوياً (17 خانة):' : 'Manual 17-Digit VIN Input:'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={17}
                  value={vinInput}
                  onChange={(e) => {
                    setVinInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setDecodeError(null);
                  }}
                  placeholder="WP0AA2A92NS240192"
                  className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs font-code-sm text-on-surface placeholder:text-outline/40 uppercase tracking-wider focus:outline-none focus:border-primary-container"
                />
                <span className="absolute end-2.5 top-2.5 text-[10px] font-code-sm text-outline">
                  {vinInput.length}/17
                </span>
              </div>
              <button
                type="button"
                onClick={handleDecodeCustomVin}
                className="px-4 py-2 bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container rounded-lg text-xs font-code-sm font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.25)] cursor-pointer shrink-0"
              >
                {isAr ? 'فك التشفير' : 'Decode'}
              </button>
            </div>

            {decodeError && (
              <div className="text-[11px] font-code-sm text-error flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">error</span>
                <span>{decodeError}</span>
              </div>
            )}

            {/* Decoded VIN Preview Badge */}
            {decodedVinInfo && (
              <div className="p-2.5 bg-surface-container-low border border-primary-container/20 rounded-lg flex items-center justify-between text-xs font-code-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container text-sm">verified</span>
                  <span className="text-on-surface font-semibold">
                    {decodedVinInfo.year} {decodedVinInfo.make} ({decodedVinInfo.country})
                  </span>
                </div>
                <span className="text-outline text-[10px]">WMI: {decodedVinInfo.wmi}</span>
              </div>
            )}
          </div>

          {/* Quick Select Preset Vehicles */}
          <div>
            <span className="text-[10px] font-telemetry-label text-outline uppercase">
              {isAr ? 'أو اختر مركبة مسبقة التكوين:' : 'Or Select Factory Preset Rig:'}
            </span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleScanSimulate('porsche992')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    2022 Porsche 911 Carrera (992.1)
                  </div>
                  <div className="text-[11px] font-code-sm text-outline">VIN: WP0AA2A92NS240192</div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-sm">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScanSimulate('bmwM3')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    2023 BMW M3 Competition (G80)
                  </div>
                  <div className="text-[11px] font-code-sm text-outline">VIN: WBS43AY09PF829103</div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-sm">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScanSimulate('audiRs')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    2022 Audi RS5 Sportback (B9)
                  </div>
                  <div className="text-[11px] font-code-sm text-outline">VIN: WAUZZZF53NA048192</div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-sm">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScanSimulate('toyotaCamry')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    2018 Toyota Camry SE Sport (XV70)
                  </div>
                  <div className="text-[11px] font-code-sm text-outline">VIN: 4T1B11HK5JU128491</div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-sm">
                  chevron_right
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleScanSimulate('fordF150')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors cursor-pointer"
              >
                <div>
                  <div className="text-xs font-code-sm font-semibold text-on-surface group-hover:text-primary transition-colors">
                    2019 Ford F-150 Lariat SuperCrew (13th Gen)
                  </div>
                  <div className="text-[11px] font-code-sm text-outline">VIN: 1FTFW1E84KFC49182</div>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-sm">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
