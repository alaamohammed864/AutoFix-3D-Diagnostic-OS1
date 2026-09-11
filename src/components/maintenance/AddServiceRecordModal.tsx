import React, { useState } from 'react';
import {
  MaintenanceCategory,
  ComprehensiveServiceRecord,
  ServicePhoto,
  ServiceInvoice,
} from '../../db/maintenanceTypes';
import { ALL_MAINTENANCE_CATEGORIES, CATEGORY_META } from '../../db/maintenanceDatabase';
import { Language } from '../../types';

interface AddServiceRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  vehicleId: string;
  vehicleName: string;
  currentOdometerKm: number;
  prefillCategory?: MaintenanceCategory;
  prefillIntervalKm?: number;
  prefillTitle?: string;
  onSaveRecord: (record: ComprehensiveServiceRecord) => void;
}

export const AddServiceRecordModal: React.FC<AddServiceRecordModalProps> = ({
  isOpen,
  onClose,
  lang,
  vehicleId,
  vehicleName,
  currentOdometerKm,
  prefillCategory,
  prefillIntervalKm,
  prefillTitle,
  onSaveRecord,
}) => {
  const isAr = lang === 'ar';

  const [title, setTitle] = useState(
    prefillTitle ||
      (prefillCategory ? `${prefillCategory} Service & Inspection` : 'Scheduled Periodic Maintenance')
  );
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(prefillIntervalKm || currentOdometerKm || 45000);
  const [technician, setTechnician] = useState('alaa Mohammed (Lead Developer)');
  const [status, setStatus] = useState<'Completed' | 'Pending'>('Completed');
  const [notes, setNotes] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<MaintenanceCategory[]>(
    prefillCategory ? [prefillCategory] : ['Engine Oil', 'Oil Filter']
  );

  // Invoice Fields
  const [hasInvoice, setHasInvoice] = useState(true);
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [shopName, setShopName] = useState('Certified AutoFix Technical Center');
  const [partsCost, setPartsCost] = useState<number>(65);
  const [laborCost, setLaborCost] = useState<number>(45);
  const [taxRate, setTaxRate] = useState<number>(8.5); // %
  const [paymentMethod, setPaymentMethod] = useState<
    'Credit Card' | 'Debit Card' | 'Cash' | 'Fleet Account' | 'Warranty'
  >('Credit Card');

  // Photos
  const [photos, setPhotos] = useState<ServicePhoto[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  if (!isOpen) return null;

  const toggleCategory = (cat: MaintenanceCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const calculatedTax = parseFloat(((partsCost + laborCost) * (taxRate / 100)).toFixed(2));
  const calculatedTotal = parseFloat((partsCost + laborCost + calculatedTax).toFixed(2));

  const handleAddSamplePhoto = (url: string, caption: string) => {
    const photo: ServicePhoto = {
      id: `photo-${Date.now()}-${Math.random()}`,
      url,
      caption,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: selectedCategories[0] || 'Engine Oil',
    };
    setPhotos((prev) => [...prev, photo]);
  };

  const handleCustomPhotoAdd = () => {
    if (!newPhotoUrl.trim()) return;
    const photo: ServicePhoto = {
      id: `photo-${Date.now()}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || (isAr ? 'صورة فحص الخدمة' : 'Service Inspection Photo'),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: selectedCategories[0],
    };
    setPhotos((prev) => [...prev, photo]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const photo: ServicePhoto = {
            id: `photo-${Date.now()}`,
            url: reader.result,
            caption: file.name,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            category: selectedCategories[0],
          };
          setPhotos((prev) => [...prev, photo]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const invoice: ServiceInvoice | undefined = hasInvoice
      ? {
          invoiceNumber,
          shopName,
          partsCost,
          laborCost,
          taxAmount: calculatedTax,
          totalAmount: calculatedTotal,
          paymentMethod,
          date,
        }
      : undefined;

    const newRecord: ComprehensiveServiceRecord = {
      id: `srv-${Date.now()}`,
      vehicleId,
      date,
      odometerKm: Number(odometer) || currentOdometerKm,
      title: title.trim(),
      categories: selectedCategories.length > 0 ? selectedCategories : ['Engine Oil'],
      technician: technician.trim() || 'alaa Mohammed (Lead Developer)',
      notes: notes.trim() || (isAr ? 'تمت الصيانة بنجاح وفق معايير المصنع.' : 'Completed according to factory standards.'),
      status,
      intervalKmTriggered: prefillIntervalKm,
      invoice,
      photos: photos.length > 0 ? photos : undefined,
    };

    onSaveRecord(newRecord);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-surface-container-lowest rounded-2xl border border-white/10 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-surface-container-low/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-container/20 text-primary-container border border-primary-container/30">
              <span className="material-symbols-outlined text-2xl">post_add</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                {isAr ? 'إضافة سجل صيانة معتمد' : 'Record Verified Maintenance Event'}
              </h3>
              <p className="text-xs text-outline font-code-sm">
                {vehicleName} • {isAr ? 'العداد الحالي:' : 'Current Odometer:'} {odometer.toLocaleString()} km
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Quick Presets & Service Title */}
          <div className="space-y-2">
            <label className="font-telemetry-label uppercase tracking-wider text-outline block">
              {isAr ? 'عنوان الصيانة / الخدمة' : 'Service Title'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={isAr ? 'مثال: تغيير زيت المحرك وفحص الفرامل' : 'e.g. Full Synthetic Oil & Filter Service'}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3.5 py-2.5 text-on-surface focus:outline-none focus:border-primary-container text-sm font-semibold"
            />
          </div>

          {/* Categories Multi-Select (All 16 Categories) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-telemetry-label uppercase tracking-wider text-outline block">
                {isAr ? 'الفئات المشمولة بالصيانة (اختر الفئات المنجزة)' : 'Maintenance Categories Covered (16 Available)'}
              </label>
              <span className="text-[11px] text-primary-container font-code-sm">
                {selectedCategories.length} {isAr ? 'محددة' : 'Selected'}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-2">
              {ALL_MAINTENANCE_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                const meta = CATEGORY_META[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-start transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary-container/20 border-primary-container text-on-surface shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-surface-container-low border-white/5 text-outline hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base ${
                        isSelected ? 'text-primary-container' : 'text-outline'
                      }`}
                    >
                      {meta.icon}
                    </span>
                    <span className="truncate font-body-sm text-[11px] font-medium">
                      {isAr ? meta.nameAr : cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Odometer, Date, Technician, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="font-telemetry-label uppercase tracking-wider text-outline block">
                {isAr ? 'قراءة العداد (كم)' : 'Odometer (km)'}
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(Number(e.target.value))}
                required
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="space-y-1">
              <label className="font-telemetry-label uppercase tracking-wider text-outline block">
                {isAr ? 'تاريخ الخدمة' : 'Service Date'}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="space-y-1">
              <label className="font-telemetry-label uppercase tracking-wider text-outline block">
                {isAr ? 'الفني المعتمد' : 'Technician'}
              </label>
              <input
                type="text"
                value={technician}
                onChange={(e) => setTechnician(e.target.value)}
                required
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm focus:outline-none focus:border-primary-container"
              />
            </div>

            <div className="space-y-1">
              <label className="font-telemetry-label uppercase tracking-wider text-outline block">
                {isAr ? 'حالة الاعتماد' : 'Status'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Completed' | 'Pending')}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl px-3 py-2 text-on-surface font-code-sm focus:outline-none focus:border-primary-container cursor-pointer"
              >
                <option value="Completed">{isAr ? 'مكتمل (Completed)' : 'Completed'}</option>
                <option value="Pending">{isAr ? 'قيد الانتظار (Pending)' : 'Pending'}</option>
              </select>
            </div>
          </div>

          {/* Detailed Inspection Notes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-telemetry-label uppercase tracking-wider text-outline block">
                {isAr ? 'ملاحظات الفحص والتركيب الفنية' : 'Technician Inspection Notes'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setNotes(
                      (prev) =>
                        prev +
                        (prev ? '\n' : '') +
                        'Replaced oil filter canister, new crush gasket installed, torqued drain plug to spec.'
                    )
                  }
                  className="text-[10px] text-secondary hover:underline cursor-pointer"
                >
                  + {isAr ? 'قالب الزيت' : 'Oil Preset'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNotes(
                      (prev) =>
                        prev +
                        (prev ? '\n' : '') +
                        'Brake pad thickness: Front 8.5mm, Rear 7.0mm. Fluid boiling point tested healthy.'
                    )
                  }
                  className="text-[10px] text-secondary hover:underline cursor-pointer"
                >
                  + {isAr ? 'قالب الفرامل' : 'Brake Preset'}
                </button>
              </div>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب ملاحظات الفحص، سماكة الأقمشة، عزوم الشد المطبقة، وأي توصيات إضافية...'
                  : 'Enter torque specs applied, parts serials, wear measurements, or recommendations...'
              }
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-on-surface focus:outline-none focus:border-primary-container font-body-sm leading-relaxed"
            />
          </div>

          {/* Invoice & Financial Breakdown Section */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-lg">receipt_long</span>
                <span className="font-headline-sm font-semibold text-on-surface text-sm">
                  {isAr ? 'الفاتورة والتكلفة المالية' : 'Invoice & Financial Breakdown'}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasInvoice}
                  onChange={(e) => setHasInvoice(e.target.checked)}
                  className="rounded border-white/20 bg-surface-container-high text-primary-container focus:ring-0"
                />
                <span className="text-xs text-outline">{isAr ? 'إرفاق فاتورة رسمية' : 'Include Invoice'}</span>
              </label>
            </div>

            {hasInvoice && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-outline uppercase block mb-1">
                    {isAr ? 'رقم الفاتورة' : 'Invoice Number'}
                  </label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg px-2.5 py-1.5 text-on-surface font-code-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-outline uppercase block mb-1">
                    {isAr ? 'اسم المركز / الورشة' : 'Service Facility'}
                  </label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg px-2.5 py-1.5 text-on-surface"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-outline uppercase block mb-1">
                    {isAr ? 'تكلفة قطع الغيار ($)' : 'Parts Cost ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={partsCost}
                    onChange={(e) => setPartsCost(Number(e.target.value))}
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg px-2.5 py-1.5 text-on-surface font-code-sm text-right"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-outline uppercase block mb-1">
                    {isAr ? 'أجور اليد والعمالة ($)' : 'Labor Cost ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg px-2.5 py-1.5 text-on-surface font-code-sm text-right"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center gap-3">
                  <label className="text-[10px] text-outline uppercase whitespace-nowrap">
                    {isAr ? 'طريقة الدفع:' : 'Payment:'}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="flex-1 bg-surface-container-high border border-white/10 rounded-lg px-2.5 py-1.5 text-on-surface font-code-sm cursor-pointer"
                  >
                    <option value="Credit Card">Credit Card (Visa/Mastercard)</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Fleet Account">Fleet Corporate Account</option>
                    <option value="Warranty">Manufacturer Warranty</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-3 p-2 bg-surface-container-high/60 rounded-lg border border-white/5">
                  <span className="text-outline text-[11px]">
                    {isAr ? `الضريبة (${taxRate}%): $${calculatedTax.toFixed(2)}` : `Tax (${taxRate}%): $${calculatedTax.toFixed(2)}`}
                  </span>
                  <span className="font-bold text-primary-container text-sm">
                    {isAr ? 'الإجمالي: ' : 'Total: '}${calculatedTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Attached Inspection Photos */}
          <div className="p-4 rounded-xl bg-surface-container-low border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">add_a_photo</span>
                <span className="font-headline-sm font-semibold text-on-surface text-sm">
                  {isAr ? 'صور الفحص وقطع الغيار المرفقة' : 'Inspection & Replaced Parts Photos'}
                </span>
              </div>
              <span className="text-xs text-outline font-code-sm">
                {photos.length} {isAr ? 'صور مرفقة' : 'Attached'}
              </span>
            </div>

            {/* Gallery of current photos */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {photos.map((p) => (
                  <div
                    key={p.id}
                    className="relative group rounded-xl overflow-hidden border border-white/10 bg-surface-container-high"
                  >
                    <img
                      src={p.url}
                      alt={p.caption}
                      className="w-full h-24 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="p-1.5 text-[10px] truncate text-on-surface">{p.caption}</div>
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.filter((x) => x.id !== p.id))}
                      className="absolute top-1 right-1 h-5 w-5 rounded-full bg-error text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Photo Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
              <label className="flex items-center gap-1.5 px-3 py-2 bg-surface-container-high hover:bg-surface-bright rounded-xl text-on-surface cursor-pointer border border-white/10 text-xs shrink-0 transition-colors">
                <span className="material-symbols-outlined text-base text-primary">upload_file</span>
                <span>{isAr ? 'رفع صورة من الجهاز' : 'Upload Image'}</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>

              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  placeholder={isAr ? 'أو رابط صورة URL...' : 'Or enter Image URL...'}
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  className="flex-1 bg-surface-container-high border border-white/10 rounded-xl px-3 py-1.5 text-on-surface text-xs"
                />
                <button
                  type="button"
                  onClick={handleCustomPhotoAdd}
                  className="px-3 py-1.5 bg-surface-container-highest hover:bg-surface-bright text-on-surface rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                >
                  {isAr ? 'إرفاق' : 'Attach'}
                </button>
              </div>
            </div>

            {/* Quick Sample Photos Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[10px] text-outline">{isAr ? 'صور نموذجية سريعة:' : 'Quick Presets:'}</span>
              <button
                type="button"
                onClick={() =>
                  handleAddSamplePhoto(
                    'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
                    'Fresh Engine Oil & Filter Change'
                  )
                }
                className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] text-outline hover:text-on-surface cursor-pointer"
              >
                + {isAr ? 'تغيير الزيت' : 'Engine Oil'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddSamplePhoto(
                    'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
                    'Brake Pad Thickness Micrometer Measurement'
                  )
                }
                className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] text-outline hover:text-on-surface cursor-pointer"
              >
                + {isAr ? 'سماكة الفرامل' : 'Brake Pads'}
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddSamplePhoto(
                    'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
                    'Tire Tread Depth & Sidewall Inspection'
                  )
                }
                className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] text-outline hover:text-on-surface cursor-pointer"
              >
                + {isAr ? 'عمق نقشة الإطار' : 'Tire Tread'}
              </button>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-outline hover:text-on-surface font-semibold text-xs transition-colors cursor-pointer"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)] transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{isAr ? 'اعتماد وحفظ سجل الصيانة' : 'Save & Record Maintenance Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
