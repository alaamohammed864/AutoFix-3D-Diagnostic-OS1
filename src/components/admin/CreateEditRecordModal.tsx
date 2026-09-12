// AutoFix 3D - Admin Create / Edit Record Modal with Provenance Enforcement
// Provides section-tailored schema forms with real-time validation

import React, { useState, useEffect } from 'react';
import { AdminSection, BaseAdminRecord } from '../../admin/types';
import { Language } from '../../types';

interface CreateEditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: AdminSection;
  recordToEdit: BaseAdminRecord | null;
  onSave: (formData: Partial<BaseAdminRecord>) => void;
  lang?: Language;
}

export const CreateEditRecordModal: React.FC<CreateEditRecordModalProps> = ({
  isOpen,
  onClose,
  section,
  recordToEdit,
  onSave,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';
  const isEditing = !!recordToEdit;

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [license, setLicense] = useState('');
  const [importerName, setImporterName] = useState('System Security Administrator');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (recordToEdit) {
      setFormData({ ...recordToEdit });
      setSourceName(recordToEdit.provenance?.source || 'OEM Official');
      setSourceUrl(recordToEdit.provenance?.sourceUrl || '');
      setLicense(recordToEdit.provenance?.license || 'Commercial OEM Tier 1');
      setImporterName(recordToEdit.provenance?.importedBy || 'System Security Administrator');
    } else {
      // Defaults for new record
      setFormData({
        title: '',
        status: 'Active',
      });
      setSourceName('OEM Technical Information Portal');
      setSourceUrl('https://api.oem-database.org/specs');
      setLicense('Commercial Technical License');
      setImporterName('System Security Administrator');
    }
    setValidationErrors([]);
  }, [recordToEdit, section, isOpen]);

  if (!isOpen) return null;

  const handleFieldChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const errs: string[] = [];
    if (!formData.title || formData.title.trim() === '') {
      errs.push(isAr ? 'حقل العنوان أو التسمية إلزامي' : 'Title / Identifier is required');
    }

    if (!sourceName.trim()) {
      errs.push(isAr ? 'مصدر السجل (Provenance Source) إلزامي' : 'Provenance source origin is mandatory');
    }

    if (section === 'dtc') {
      const dtcRegex = /^[PBCU][0-9A-Fa-f]{4}$/;
      if (!formData.code || !dtcRegex.test(formData.code)) {
        errs.push('DTC code must match standard format (e.g. P0300, C1201)');
      }
    }

    if (section === 'vehicles' && (!formData.make || !formData.model || !formData.year)) {
      errs.push('Vehicle Make, Model, and Year are required');
    }

    if (section === 'components' && !formData.oemPartNumber) {
      errs.push('OEM Part Number is required for component records');
    }

    setValidationErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<BaseAdminRecord> = {
      ...formData,
      provenance: isEditing
        ? {
            ...recordToEdit.provenance,
            source: sourceName,
            sourceUrl,
            license,
          }
        : undefined, // Let store build initial provenance with metadata
      source: sourceName,
      sourceUrl,
      license,
      importedBy: importerName,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="bg-surface-container-low border border-white/10 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-surface-container-lowest/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">
                {isEditing ? 'edit_note' : 'add_circle'}
              </span>
            </div>
            <div>
              <h3 className="font-headline-md text-base font-bold text-on-surface">
                {isEditing
                  ? `${isAr ? 'تعديل سجل في قسم' : 'Edit Record in'} ${section.toUpperCase()}`
                  : `${isAr ? 'إنشاء سجل جديد في قسم' : 'Create Record in'} ${section.toUpperCase()}`}
              </h3>
              <p className="text-xs text-outline font-code-sm">
                {isEditing ? `ID: ${recordToEdit?.id}` : 'Retains strict source provenance'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Validation Banner */}
          {validationErrors.length > 0 && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-code-sm">
              <div className="font-bold mb-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{isAr ? 'يرجى تصحيح الأخطاء التالية:' : 'Please correct the following errors:'}</span>
              </div>
              <ul className="list-disc ps-5 space-y-0.5">
                {validationErrors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Section 1: General Information */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-secondary uppercase tracking-wider font-telemetry-label flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">info</span>
              <span>{isAr ? 'البيانات الأساسية للسجل' : 'Primary Entity Attributes'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-on-surface mb-1 font-body-sm">
                  {isAr ? 'العنوان التعريفي للسجل *' : 'Record Title / Label *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="e.g. 2024 Porsche 911 GT3 RS / P0300 Misfire"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-on-surface text-xs focus:outline-none focus:border-primary font-code-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1 font-body-sm">
                  {isAr ? 'الحالة التشغيلية' : 'Operational Status'}
                </label>
                <select
                  value={formData.status || 'Active'}
                  onChange={(e) => handleFieldChange('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-on-surface text-xs focus:outline-none focus:border-primary font-code-sm"
                >
                  <option value="Active">Active (Live in OS)</option>
                  <option value="Disabled">Disabled (Soft Deleted)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Fields for Specific Sections */}
            {section === 'vehicles' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-outline mb-1">Make</label>
                  <input
                    type="text"
                    value={formData.make || ''}
                    onChange={(e) => handleFieldChange('make', e.target.value)}
                    placeholder="e.g. Porsche, Toyota"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Model</label>
                  <input
                    type="text"
                    value={formData.model || ''}
                    onChange={(e) => handleFieldChange('model', e.target.value)}
                    placeholder="e.g. 911 Carrera, Camry"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Year</label>
                  <input
                    type="number"
                    value={formData.year || 2024}
                    onChange={(e) => handleFieldChange('year', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">VIN / Chassis</label>
                  <input
                    type="text"
                    value={formData.vin || ''}
                    onChange={(e) => handleFieldChange('vin', e.target.value.toUpperCase())}
                    placeholder="17-character VIN"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Powertrain</label>
                  <input
                    type="text"
                    value={formData.powertrain || ''}
                    onChange={(e) => handleFieldChange('powertrain', e.target.value)}
                    placeholder="e.g. 3.0L Twin-Turbo Flat-6"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Transmission</label>
                  <input
                    type="text"
                    value={formData.transmission || ''}
                    onChange={(e) => handleFieldChange('transmission', e.target.value)}
                    placeholder="e.g. 8-Speed PDK"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
              </div>
            )}

            {section === 'dtc' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-outline mb-1">DTC Fault Code *</label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => handleFieldChange('code', e.target.value.toUpperCase())}
                    placeholder="e.g. P0300"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm font-mono font-bold text-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Standard</label>
                  <select
                    value={formData.standard || 'SAE J2012'}
                    onChange={(e) => handleFieldChange('standard', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  >
                    <option value="SAE J2012">SAE J2012 (Standard)</option>
                    <option value="ISO 14229">ISO 14229 (UDS)</option>
                    <option value="OEM Manufacturer Proprietary">OEM Proprietary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Severity</label>
                  <select
                    value={formData.severity || 'MODERATE'}
                    onChange={(e) => handleFieldChange('severity', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  >
                    <option value="CRITICAL">CRITICAL (Flashing MIL)</option>
                    <option value="MODERATE">MODERATE (Steady MIL)</option>
                    <option value="INFO">INFO (Shadow Code)</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs text-outline mb-1">Recommended Action</label>
                  <textarea
                    rows={2}
                    value={formData.recommendedAction || ''}
                    onChange={(e) => handleFieldChange('recommendedAction', e.target.value)}
                    placeholder="Diagnostic next steps, components to test, pinouts..."
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
              </div>
            )}

            {section === 'components' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-outline mb-1">OEM Part Number *</label>
                  <input
                    type="text"
                    value={formData.oemPartNumber || ''}
                    onChange={(e) => handleFieldChange('oemPartNumber', e.target.value)}
                    placeholder="e.g. 22204-75030"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">System Domain</label>
                  <input
                    type="text"
                    value={formData.system || 'POWERTRAIN'}
                    onChange={(e) => handleFieldChange('system', e.target.value)}
                    placeholder="e.g. POWERTRAIN, BRAKING"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Failure Rate</label>
                  <select
                    value={formData.failureRateCategory || 'Moderate'}
                    onChange={(e) => handleFieldChange('failureRateCategory', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  >
                    <option value="Common">Common Wear Item</option>
                    <option value="Moderate">Moderate Failure</option>
                    <option value="Rare">Rare / Lifetime Unit</option>
                  </select>
                </div>
              </div>
            )}

            {section === 'repairs' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs text-outline mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty || 'Intermediate'}
                    onChange={(e) => handleFieldChange('difficulty', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Master Tech">Master Tech</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Est. Duration (Minutes)</label>
                  <input
                    type="number"
                    value={formData.estimatedMinutes || 60}
                    onChange={(e) => handleFieldChange('estimatedMinutes', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-outline mb-1">Steps Count</label>
                  <input
                    type="number"
                    value={formData.stepsCount || 6}
                    onChange={(e) => handleFieldChange('stepsCount', Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-xs text-outline mb-1">Torque Specs Summary</label>
                  <input
                    type="text"
                    value={formData.torqueSpecsSummary || ''}
                    onChange={(e) => handleFieldChange('torqueSpecsSummary', e.target.value)}
                    placeholder="e.g. Fastener: 25 Nm (18.4 ft-lbs)"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container border border-white/10 text-xs font-code-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: MANDATORY PROVENANCE SECTION */}
          <div className="p-4 rounded-xl bg-surface-container/60 border border-primary/20 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider font-telemetry-label flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">fingerprint</span>
                <span>{isAr ? 'بيانات التتبع والمصدر (Data Provenance)' : 'Data Provenance & Source Lineage'}</span>
              </h4>
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-code-sm font-bold border border-primary/20">
                REQUIRED BY MANDATE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1 font-body-sm">
                  {isAr ? 'جهة المصدر الأصلية *' : 'Origin Source Provider *'}
                </label>
                <input
                  type="text"
                  required
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  placeholder="e.g. OEM Direct Portal, NHTSA, CarCareKiosk, Alldata"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1 font-body-sm">
                  {isAr ? 'رابط المصدر أو التوثيق' : 'Source Document / API Endpoint URL'}
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1 font-body-sm">
                  {isAr ? 'ترخيص البيانات' : 'Data Licensing Terms'}
                </label>
                <input
                  type="text"
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  placeholder="e.g. Commercial OEM License, Open OBD-II Community"
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface mb-1 font-body-sm">
                  {isAr ? 'المستخدم أو الخدمة المسؤولة' : 'Responsible Importer / Admin'}
                </label>
                <input
                  type="text"
                  value={importerName}
                  onChange={(e) => setImporterName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-surface-container-high border border-white/10 text-xs font-code-sm"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold cursor-pointer border border-white/10 transition-colors"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-bold text-xs cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-sm">save</span>
              <span>
                {isEditing
                  ? isAr
                    ? 'حفظ التعديلات'
                    : 'Save Changes'
                  : isAr
                  ? 'إنشاء وتوثيق السجل'
                  : 'Create & Ingest Record'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
