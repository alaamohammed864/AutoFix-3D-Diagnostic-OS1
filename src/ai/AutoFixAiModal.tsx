import React from 'react';
import { Language } from '../types';
import { VehicleProfileData } from '../db/vehicleTypes';
import { AutoFixAiView } from './AutoFixAiView';

interface AutoFixAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  activeVehicle: VehicleProfileData;
  onSelectVehicleProfile?: (profile: VehicleProfileData) => void;
  onNavigateToProcedure?: () => void;
}

export const AutoFixAiModal: React.FC<AutoFixAiModalProps> = ({
  isOpen,
  onClose,
  lang,
  activeVehicle,
  onSelectVehicleProfile,
  onNavigateToProcedure,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-surface rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-container-lowest">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-lg bg-primary-container/20 text-primary-container border border-primary-container/30">
              <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-md font-bold text-sm text-on-surface">AutoFix AI</span>
                <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-code-sm text-[10px] font-bold border border-primary-container/30">
                  ASSISTANT MODAL
                </span>
              </div>
              <span className="text-[11px] font-code-sm text-outline">
                Rig: {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <AutoFixAiView
            lang={lang}
            activeVehicle={activeVehicle}
            onSelectVehicleProfile={onSelectVehicleProfile}
            onNavigateToProcedure={() => {
              onClose();
              if (onNavigateToProcedure) onNavigateToProcedure();
            }}
          />
        </div>
      </div>
    </div>
  );
};
