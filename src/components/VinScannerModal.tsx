import React, { useState } from 'react';
import { Language, VehicleSpec } from '../types';
import { mockVehicles } from '../data/mockVehicles';

interface VinScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectVehicle: (veh: VehicleSpec) => void;
}

export const VinScannerModal: React.FC<VinScannerModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectVehicle,
}) => {
  const [vinInput, setVinInput] = useState('WP0AA2A92NS240192');
  const [isScanning, setIsScanning] = useState(false);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  const handleScanSimulate = (key: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (mockVehicles[key]) {
        onSelectVehicle(mockVehicles[key]);
        onClose();
      }
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
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

        <div className="p-5 space-y-4">
          {/* Scanner Optical Viewport */}
          <div className="relative aspect-video bg-black/60 rounded-xl border-2 border-dashed border-primary-container/40 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-primary-container shadow-[0_0_15px_#00f0ff] animate-bounce top-1/2"></div>
            )}
            <span className="material-symbols-outlined text-4xl text-primary-container mb-2 animate-pulse">
              barcode_scanner
            </span>
            <div className="font-code-sm text-xs text-on-surface font-bold">
              {isScanning ? (isAr ? 'جاري قراءة رقم الشاسيه...' : 'Scanning Optical Barcode...') : (isAr ? 'وجّه الكاميرا أو اختر مركبة تجريبية' : 'Aim camera at windshield VIN or door jamb barcode')}
            </div>
            <p className="text-[11px] font-code-sm text-outline mt-1">
              Supports Code 39, Code 128 & ISO 3779 VIN Optical Standards
            </p>
          </div>

          {/* Quick Select Preset Vehicles */}
          <div>
            <span className="text-[10px] font-telemetry-label text-outline uppercase">
              {isAr ? 'اختر مركبة مسبقة التكوين:' : 'Quick Select Preset Workshop Rigs:'}
            </span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <button
                onClick={() => handleScanSimulate('porsche992')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors"
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
                onClick={() => handleScanSimulate('bmwM3')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors"
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
                onClick={() => handleScanSimulate('audiRs')}
                className="p-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high border border-white/5 text-start flex items-center justify-between group transition-colors"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
