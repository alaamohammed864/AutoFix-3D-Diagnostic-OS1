// AutoFix 3D - Batch Import Modal with Compulsory Provenance Tracking
// Allows ingestion from JSON / CSV / External Feeds with automatic lineage tagging

import React, { useState } from 'react';
import { AdminSection } from '../../admin/types';
import { Language } from '../../types';

interface ImportBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: AdminSection;
  onImport: (
    records: any[],
    sourceMetadata: {
      source: string;
      sourceUrl?: string;
      license?: string;
      importedBy: string;
    }
  ) => void;
  lang?: Language;
}

export const ImportBatchModal: React.FC<ImportBatchModalProps> = ({
  isOpen,
  onClose,
  section,
  onImport,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';

  const [sourceName, setSourceName] = useState('NHTSA Technical Service Bulletins');
  const [sourceUrl, setSourceUrl] = useState('https://vpic.nhtsa.dot.gov/api');
  const [license, setLicense] = useState('US Government Public Domain & OEM Tech Sharing');
  const [importedBy, setImportedBy] = useState('System Security Administrator');
  const [jsonText, setJsonText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Quick Presets
  const loadPreset = (type: 'nhtsa' | 'denso' | 'sae') => {
    setParseError(null);
    if (type === 'nhtsa') {
      setSourceName('NHTSA Safety & Recalls Database');
      setSourceUrl('https://api.nhtsa.gov/recalls');
      setLicense('NHTSA Open Data Gov');
      setJsonText(
        JSON.stringify(
          [
            {
              title: 'NHTSA Recall 24V-091: High-Pressure Fuel Rail Sealing',
              make: 'Porsche',
              model: '911 Carrera',
              year: 2023,
              severity: 'CRITICAL',
              recommendedAction: 'Inspect torque on rail union bolts (replace O-rings)',
            },
            {
              title: 'TSB 23-NA-189: Cold Start Camshaft Phaser Rattle',
              make: 'Toyota',
              model: 'Camry',
              year: 2021,
              severity: 'MODERATE',
              recommendedAction: 'Reprogram ECM calibration logic with updated VVT-iE strategy',
            },
          ],
          null,
          2
        )
      );
    } else if (type === 'denso') {
      setSourceName('Denso Aftermarket Technical Catalog');
      setSourceUrl('https://densoaftermarket.com/specs');
      setLicense('Denso Authorized Aftermarket Partner');
      setJsonText(
        JSON.stringify(
          [
            {
              title: 'Denso Direct Ignition Coil Stick 12V',
              componentName: 'Ignition Coil Assembly',
              oemPartNumber: '673-1309',
              system: 'POWERTRAIN',
              subsystem: 'Ignition Secondary',
              voltageRating: '12V Primary / 35kV Secondary',
              failureRateCategory: 'Moderate',
            },
            {
              title: 'Denso Planar Oxygen Sensor (Downstream)',
              componentName: 'Heated O2 Sensor',
              oemPartNumber: '234-4509',
              system: 'POWERTRAIN',
              subsystem: 'Emissions Catalyst Monitor',
              voltageRating: '12V Heater / 0.1-0.9V Signal',
              failureRateCategory: 'Common',
            },
          ],
          null,
          2
        )
      );
    } else {
      setSourceName('SAE J2012 Technical Committee');
      setSourceUrl('https://sae.org/standards/j2012');
      setLicense('SAE Technical Documentation Standard');
      setJsonText(
        JSON.stringify(
          [
            {
              title: 'P0420: Catalyst System Efficiency Below Threshold (Bank 1)',
              code: 'P0420',
              standard: 'SAE J2012',
              system: 'POWERTRAIN',
              severity: 'MODERATE',
              recommendedAction: 'Verify downstream O2 sensor activity and catalytic substrate integrity',
            },
            {
              title: 'P0113: Intake Air Temperature Sensor 1 Circuit High Input',
              code: 'P0113',
              standard: 'SAE J2012',
              system: 'POWERTRAIN',
              severity: 'MODERATE',
              recommendedAction: 'Check 5V reference and ground integrity on IAT pin 1 & 2',
            },
          ],
          null,
          2
        )
      );
    }
  };

  const handleExecuteImport = () => {
    setParseError(null);
    if (!sourceName.trim()) {
      setParseError('Source origin is mandatory for all imported records.');
      return;
    }

    if (!jsonText.trim()) {
      setParseError('Please supply JSON record array or choose a preset.');
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const recordsArray = Array.isArray(parsed) ? parsed : [parsed];
      if (recordsArray.length === 0) {
        setParseError('Array is empty. Supply at least 1 record.');
        return;
      }

      onImport(recordsArray, {
        source: sourceName,
        sourceUrl,
        license,
        importedBy,
      });
      onClose();
    } catch (err: any) {
      setParseError(`JSON Syntax Error: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-surface-container-lowest/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">file_download</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                {isAr
                  ? `استيراد دفعة سجلات لقسم ${section.toUpperCase()}`
                  : `Batch Ingest Records into ${section.toUpperCase()}`}
              </h3>
              <p className="text-xs text-outline font-code-sm">
                Every imported record automatically retains origin provenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Quick Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-on-surface block mb-2 font-body-sm">
              {isAr ? 'قوالب ونماذج بيانات جاهزة للاستيراد:' : 'Quick Sample Datasets & Presets:'}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => loadPreset('nhtsa')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs text-on-surface flex items-center gap-1.5 cursor-pointer font-code-sm"
              >
                <span className="material-symbols-outlined text-sm text-secondary">security</span>
                <span>NHTSA Bulletins</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('denso')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs text-on-surface flex items-center gap-1.5 cursor-pointer font-code-sm"
              >
                <span className="material-symbols-outlined text-sm text-primary">memory</span>
                <span>Denso OEM Sensors</span>
              </button>
              <button
                type="button"
                onClick={() => loadPreset('sae')}
                className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/10 text-xs text-on-surface flex items-center gap-1.5 cursor-pointer font-code-sm"
              >
                <span className="material-symbols-outlined text-sm text-amber-400">terminal</span>
                <span>SAE J2012 Fault Codes</span>
              </button>
            </div>
          </div>

          {/* Mandatory Provenance Card */}
          <div className="p-4 rounded-xl bg-surface-container border border-primary/20 space-y-3">
            <span className="text-[11px] font-bold text-primary uppercase font-telemetry-label block">
              {isAr ? 'بيانات مصدر الاستيراد (إلزامية للتوثيق)' : 'Source Provenance Metadata (Compulsory)'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-outline mb-1">Source Name *</label>
                <input
                  type="text"
                  required
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-outline mb-1">Source Endpoint / Documentation URL</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-outline mb-1">License</label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] text-outline mb-1">Importer Identity</label>
                <input
                  type="text"
                  value={importedBy}
                  onChange={(e) => setImportedBy(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-on-surface">
                {isAr ? 'بيانات السجلات بتنسيق JSON (مصفوفة كائنات):' : 'Records Payload (JSON Array of Objects):'}
              </label>
              <span className="text-[10px] text-outline font-code-sm">Standard UTF-8 JSON</span>
            </div>
            <textarea
              rows={8}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setParseError(null);
              }}
              placeholder={`[\n  {\n    "title": "Example Record",\n    "make": "Porsche",\n    "year": 2024\n  }\n]`}
              className="w-full p-3 rounded-xl bg-surface-container-lowest border border-white/10 text-xs font-mono font-code-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Parse Error Banner */}
          {parseError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-code-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{parseError}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-surface-container-lowest/60 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleExecuteImport}
            className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs cursor-pointer shadow-lg shadow-primary/25 flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-sm">cloud_upload</span>
            <span>{isAr ? 'بدء استيراد الدفعة' : 'Start Batch Ingestion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
