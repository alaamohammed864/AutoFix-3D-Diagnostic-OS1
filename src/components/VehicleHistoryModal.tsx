import React, { useState } from 'react';
import { Language } from '../types';
import { VehicleProfileData, ServiceHistoryRecord } from '../db/vehicleTypes';

interface VehicleHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  vehicle: VehicleProfileData;
  onAddRecord?: (record: ServiceHistoryRecord) => void;
}

export const VehicleHistoryModal: React.FC<VehicleHistoryModalProps> = ({
  isOpen,
  onClose,
  lang,
  vehicle,
  onAddRecord,
}) => {
  const isAr = lang === 'ar';
  const [historyList, setHistoryList] = useState<ServiceHistoryRecord[]>(vehicle.history || []);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Engine Oil');
  const [newOdometer, setNewOdometer] = useState('45500');
  const [newTech, setNewTech] = useState('Alex Vance (Master Tech)');
  const [newNotes, setNewNotes] = useState('');

  if (!isOpen) return null;

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const record: ServiceHistoryRecord = {
      id: `srv-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      odometer: parseInt(newOdometer, 10) || 45000,
      title: newTitle,
      category: newCategory,
      technician: newTech,
      notes: newNotes || 'Routine inspection completed with no abnormal wear.',
      status: 'Completed',
    };

    const updated = [record, ...historyList];
    setHistoryList(updated);
    onAddRecord?.(record);
    setShowAddForm(false);
    setNewTitle('');
    setNewNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-xl">history_edu</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr ? 'سجل الصيانة والخدمة للمركبة' : 'Vehicle Service & Maintenance History'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                {vehicle.year} {vehicle.make} {vehicle.model} • VIN: {vehicle.vinExample}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <div className="text-[10px] font-telemetry-label text-outline uppercase">
                {isAr ? 'إجمالي السجلات' : 'Total Records'}
              </div>
              <div className="font-telemetry-value-md text-telemetry-value-md text-on-surface mt-1">
                {historyList.length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <div className="text-[10px] font-telemetry-label text-outline uppercase">
                {isAr ? 'آخر قراءة عداد' : 'Last Odometer'}
              </div>
              <div className="font-telemetry-value-md text-telemetry-value-md text-secondary mt-1">
                {historyList[0]?.odometer ? `${historyList[0].odometer.toLocaleString()} mi` : '45,000 mi'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-white/5">
              <div className="text-[10px] font-telemetry-label text-outline uppercase">
                {isAr ? 'حالة الضمان' : 'Warranty Status'}
              </div>
              <div className="font-telemetry-value-md text-telemetry-value-md text-primary-container mt-1">
                Active Powertrain
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-telemetry-label text-outline uppercase tracking-wider">
              {isAr ? 'سجلات الصيانة المؤرشفة' : 'Service Event Timeline'}
            </h4>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-code-sm text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">{showAddForm ? 'close' : 'add'}</span>
              <span>{showAddForm ? (isAr ? 'إلغاء' : 'Cancel') : (isAr ? 'إضافة سجل صيانة' : 'Log New Service')}</span>
            </button>
          </div>

          {/* Add Service Entry Form */}
          {showAddForm && (
            <form
              onSubmit={handleSaveRecord}
              className="p-4 rounded-xl bg-surface-container-low border border-primary-container/30 space-y-3"
            >
              <div className="text-xs font-bold text-primary-container">
                {isAr ? 'تسجيل صيانة جديدة في سجل المركبة' : 'Log New Workshop Service Record'}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-code-sm">
                <div>
                  <label className="text-outline text-[11px] block mb-1">
                    {isAr ? 'عنوان الخدمة / الإجراء' : 'Service Title'}
                  </label>
                  <input
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 0W-16 Oil Change & Cabin Filter"
                    className="w-full bg-surface-container text-on-surface p-2 rounded border border-white/10 focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="text-outline text-[11px] block mb-1">
                    {isAr ? 'تصنيف الصيانة' : 'Service Category'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-container text-on-surface p-2 rounded border border-white/10 focus:outline-none focus:border-primary-container"
                  >
                    <option value="Engine Oil">Engine Oil & Filter</option>
                    <option value="Braking">Braking & Hydraulic</option>
                    <option value="Transmission">Transmission / Fluid</option>
                    <option value="Cooling">Cooling & Thermostat</option>
                    <option value="Battery">Battery & Electrical</option>
                    <option value="Inspection">Multi-Point Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="text-outline text-[11px] block mb-1">
                    {isAr ? 'قراءة العداد (Odometer mi)' : 'Current Odometer (Miles)'}
                  </label>
                  <input
                    type="number"
                    value={newOdometer}
                    onChange={(e) => setNewOdometer(e.target.value)}
                    className="w-full bg-surface-container text-on-surface p-2 rounded border border-white/10 focus:outline-none focus:border-primary-container"
                  />
                </div>
                <div>
                  <label className="text-outline text-[11px] block mb-1">
                    {isAr ? 'الفني المسؤول' : 'Lead Technician'}
                  </label>
                  <input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-surface-container text-on-surface p-2 rounded border border-white/10 focus:outline-none focus:border-primary-container"
                  />
                </div>
              </div>

              <div>
                <label className="text-outline text-[11px] block mb-1">
                  {isAr ? 'الملاحظات الفنية وقطع الغيار' : 'Technician Notes & Parts Installed'}
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Replaced OEM filter, tightened drain plug to spec, verified no leaks."
                  className="w-full bg-surface-container text-on-surface p-2 rounded border border-white/10 focus:outline-none focus:border-primary-container text-xs font-code-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-code-sm text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  {isAr ? 'حفظ السجل في قاعدة البيانات' : 'Commit to Vehicle History Log'}
                </button>
              </div>
            </form>
          )}

          {/* Records Timeline */}
          <div className="space-y-3">
            {historyList.map((record) => (
              <div
                key={record.id}
                className="p-4 rounded-xl bg-surface-container-low border border-white/5 space-y-2 hover:border-white/10 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-code-sm font-bold uppercase ${
                        record.status === 'Completed'
                          ? 'bg-secondary/15 text-secondary'
                          : record.status === 'Flagged'
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-tertiary-container/20 text-tertiary-container'
                      }`}
                    >
                      {record.status}
                    </span>
                    <h5 className="font-headline-md text-sm font-bold text-on-surface">{record.title}</h5>
                  </div>
                  <div className="text-xs font-code-sm text-outline flex items-center gap-2">
                    <span>{record.date}</span>
                    <span>•</span>
                    <span className="text-on-surface font-semibold">{record.odometer.toLocaleString()} mi</span>
                  </div>
                </div>

                <p className="text-xs font-body-sm text-on-surface-variant leading-relaxed">{record.notes}</p>

                <div className="flex items-center justify-between text-[11px] font-code-sm text-outline pt-1 border-t border-white/5">
                  <span>Category: {record.category}</span>
                  <span>Tech: {record.technician}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-container-low border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-surface-container-high hover:bg-surface-bright text-on-surface px-5 py-2 rounded-lg font-code-sm text-xs font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق السجل' : 'Close History'}
          </button>
        </div>
      </div>
    </div>
  );
};
