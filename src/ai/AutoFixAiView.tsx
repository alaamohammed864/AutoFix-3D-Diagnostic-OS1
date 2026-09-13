import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { VehicleProfileData } from '../db/vehicleTypes';
import { VEHICLE_PROFILES } from '../db/vehicleDatabase';
import {
  AiIntent,
  AiMessage,
  CauseComparison,
  ConfidenceLevel,
  DiagnosticChecklist,
  MechanicReport,
  SourceCitation,
} from './types';
import { processUserQuery } from './reasoningEngine';
import { SourceCitationsBox } from './ConfidenceBadge';
import { InteractiveChecklistView } from './InteractiveChecklistView';
import { MechanicReportView } from './MechanicReportView';
import { CauseComparisonView } from './CauseComparisonView';

interface AutoFixAiViewProps {
  lang: Language;
  activeVehicle: VehicleProfileData;
  onSelectVehicleProfile?: (profile: VehicleProfileData) => void;
  onNavigateToProcedure?: () => void;
}

type ChatMessage = AiMessage;

export const AutoFixAiView: React.FC<AutoFixAiViewProps> = ({
  lang,
  activeVehicle,
  onSelectVehicleProfile,
  onNavigateToProcedure,
}) => {
  const isAr = lang === 'ar';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message demonstrating the grounded pipeline
    const initialQuery = isAr
      ? `شرح كود P0301 لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
      : `Explain code P0301 for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`;
    const initialMsg = processUserQuery(initialQuery, activeVehicle, 'P0301', lang);

    const welcomeText = isAr
      ? `### ⚡ مرحباً بك في مساعد AutoFix AI الذكي\n**مركبة الورشة النشطة:** ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.engine})\n\nأنا مساعدك الهندسي التخصصي في تشخيص وصيانة السيارات، أعمل وفق مبدأ **انعدام الهلوسة الصارم (Zero Hallucination)**:\n\n* 🔒 **بيانات معتمدة أولاً:** جميع المواصفات مسترجعة مباشرة من قاعدة بيانات المصنع الموثقة.\n* 🚫 **لا اختلاق للأرقام:** لا تخمين لسعات السوائل أو عزوم الربط أو مخططات الأسلاك.\n* 📑 **توثيق مصدري دقيق:** كل معلومة مدعومة بمرجعها الفني الدقيق.\n* 🚦 **مؤشر ثقة حي:** يعرض مستوى الثقة (مرتفع، متوسط، منخفض، أو بيانات غير كافية).\n\nاختر إحدى القدرات الهندسية بالأسفل أو اكتب أي استفسار تشخيصي!`
      : `### ⚡ Welcome to AutoFix AI\n**Active Rig:** ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.engine})\n\nI am your verified automotive diagnostic and workshop intelligence assistant. I operate strictly under a **zero-hallucination mandate**:\n\n* 🔒 **Grounded Data First:** Every specification is retrieved directly from the verified database.\n* 🚫 **No Invented Specs:** I will never guess fluid capacities, fastener torques, or wiring pinouts.\n* 📑 **Explicit Sources:** Every factual vehicle-specific answer displays its exact documentation source.\n* 🚦 **Confidence Tracking:** Displays High, Medium, Low, or Insufficient Data confidence.\n\nSelect a capability below or type any symptom, DTC code, or repair inquiry!`;

    return [
      {
        id: 'welcome-1',
        sender: 'assistant',
        timestamp: Date.now() - 60000,
        intent: 'GENERAL_INQUIRY',
        confidence: 'High',
        sources: [
          {
            id: 'init-db',
            type: 'Vehicle database',
            title: `${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.generation})`,
            detail: `Active Workshop Powertrain: ${activeVehicle.engine} | VIN: ${activeVehicle.vinExample}`,
            verified: true,
          },
          {
            id: 'init-doc',
            type: 'Manufacturer documentation',
            title: 'SAE J1979 / ISO 15031 Diagnostic Standard Specifications',
            detail: 'OBD-II Powertrain Calibration & Factory Verification Matrix',
            verified: true,
          },
        ],
        insufficientData: false,
        text: welcomeText,
      },
      initialMsg,
    ];
  });

  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeIntent, setActiveIntent] = useState<AiIntent | undefined>('EXPLAIN_DTC_CODES');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: Date.now(),
      text: query,
      intent: 'GENERAL_INQUIRY',
      confidence: 'High',
      sources: [],
      insufficientData: false,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);

    // Run grounded reasoning pipeline with language awareness
    setTimeout(() => {
      const response = processUserQuery(query, activeVehicle, undefined, lang);
      setActiveIntent(response.intent);
      setMessages((prev) => [...prev, response]);
      setIsProcessing(false);
    }, 350);
  };

  const handleQuickPrompt = (promptText: string) => {
    handleSendMessage(promptText);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `clear-${Date.now()}`,
        sender: 'assistant',
        timestamp: Date.now(),
        intent: 'GENERAL_INQUIRY',
        confidence: 'High',
        sources: [],
        insufficientData: false,
        text: isAr
          ? `### 🔄 تم تصفير الجلسة\nمركبة الورشة النشطة: **${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}**.\n\nكيف يمكن لمساعد AutoFix AI مساعدتك في تشخيص الأعطال الآن؟`
          : `### 🔄 Session Reset\nActive Rig: **${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}**.\n\nHow can AutoFix AI assist with your vehicle diagnostics?`,
      },
    ]);
  };

  return (
    <div className="flex flex-col space-y-4">
      {/* Top Banner & Vehicle Rig Bar */}
      <section className="bg-surface-container-low rounded-xl p-5 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-secondary-container/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-lg bg-primary-container/20 text-primary-container border border-primary-container/30 shrink-0">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-display-lg text-lg lg:text-xl font-black tracking-tight uppercase text-on-surface">
                    {isAr ? 'مساعد AutoFix AI الذكي' : 'AutoFix AI'}
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-code-sm text-[10px] font-bold border border-primary-container/30">
                    {isAr ? 'مساعد الورشة والتشخيص' : 'DIAGNOSTIC COPILOT'}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-code-sm text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    {isAr ? 'انعدام الهلوسة' : 'Zero Hallucination'}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-body-md mt-0.5">
                  {isAr
                    ? 'ذكاء اصطناعي سيارات موثق • إجراءات مصنعية معتمدة • منطق تشخيصي دقيق'
                    : 'Grounded Automotive Intelligence • Verified Factory Procedures • Diagnostic Logic'}
                </p>
              </div>
            </div>
          </div>

          {/* Active Vehicle Rig Selector */}
          <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-white/5 shrink-0">
            <span className="material-symbols-outlined text-secondary text-[18px]">directions_car</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-telemetry-label text-outline uppercase">
                {isAr ? 'مركبة الورشة النشطة' : 'Active Vehicle Rig'}
              </span>
              <select
                value={activeVehicle.id}
                onChange={(e) => {
                  const prof = VEHICLE_PROFILES.find((p) => p.id === e.target.value);
                  if (prof && onSelectVehicleProfile) {
                    onSelectVehicleProfile(prof);
                  }
                }}
                className="bg-transparent text-xs font-code-sm text-on-surface font-semibold focus:outline-none cursor-pointer max-w-[220px] truncate"
              >
                {VEHICLE_PROFILES.map((p) => (
                  <option key={p.id} value={p.id} className="bg-surface-container text-on-surface">
                    {p.year} {p.make} {p.model} ({p.engine})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleClearHistory}
              title={isAr ? 'إعادة ضبط الجلسة' : 'Clear Session'}
              className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors ms-2 cursor-pointer"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        {/* 10 Capabilities Action Ribbon */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider block mb-2">
            {isAr ? 'قدرات AutoFix AI الهندسية المعتمدة' : 'AutoFix AI Engineering Capabilities'}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {/* 1. Explain Symptoms */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `شرح وتحليل أعراض التفتفة واهتزاز المحرك عند السلانسيه لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Explain symptoms of rough idle and engine shaking on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">stethoscope</span>
                <span>{isAr ? 'شرح الأعراض' : 'Explain Symptoms'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'تفتفة، رِجة، دخان' : 'Rough idle, shudder, smoke'}
              </span>
            </button>

            {/* 2. Explain Components */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `شرح وظيفة وموقع حساس تدفق الهواء MAF وبخاخ الوقود لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Explain the Mass Air Flow (MAF) sensor and Fuel Injector components on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">settings_input_component</span>
                <span>{isAr ? 'شرح المكونات' : 'Explain Components'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'الوظيفة، الموقع والمواصفات' : 'Function, location & specs'}
              </span>
            </button>

            {/* 3. Diagnostic Workflow */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `دليل مسار التشخيص المتسلسل لكود P0301 لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Guide diagnostic workflow for code P0301 on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">account_tree</span>
                <span>{isAr ? 'مسار التشخيص' : 'Diagnostic Workflow'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'تسلسل فحص من 4 مراحل' : '4-phase test sequence'}
              </span>
            </button>

            {/* 4. Summarize Repair */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `ملخص إجراء الإصلاح المصنعي لاستبدال بخاخ الوقود لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Summarize repair procedure for direct fuel injector replacement on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">build</span>
                <span>{isAr ? 'ملخص الإصلاح' : 'Summarize Repair'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'الأدوات، العزوم والسلامة' : 'Tools, torque & safety'}
              </span>
            </button>

            {/* 5. Explain DTC Codes */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `شرح كود P0171 نظام خليط الوقود فقير بنك 1 لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Explain code P0171 system too lean bank 1 for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">warning</span>
                <span>{isAr ? 'شرح كود العطل' : 'Explain DTC Codes'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'معايير SAE وبيانات الحساسات' : 'SAE standard & PIDs'}
              </span>
            </button>

            {/* 6. Maintenance Schedule */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `جدول الصيانة الدورية وسعات السوائل ولزوجة الزيت لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Explain factory maintenance schedule, fluid capacities, and oil viscosity for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">event_available</span>
                <span>{isAr ? 'جدول الصيانة' : 'Maintenance Schedule'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'لزوجة الزيت وفترات الخدمة' : 'Oil spec & service intervals'}
              </span>
            </button>

            {/* 7. Compare Causes */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `مقارنة الأسباب المحتملة لتفتفة المحرك والرجة لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Compare possible causes for cylinder misfire and rough idle on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">balance</span>
                <span>{isAr ? 'مقارنة الأسباب' : 'Compare Causes'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'مصفوفة ترجيح الاحتمالات %' : 'Probability matrix %'}
              </span>
            </button>

            {/* 8. Diagnostic Checklist */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `قائمة فحص تشخيصي لتفتفة الأسطوانة كود P0301 لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Generate diagnostic checklist for cylinder misfire P0301 on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">checklist</span>
                <span>{isAr ? 'قائمة الفحص' : 'Diagnostic Checklist'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'مهام تفاعلية لصالة الورشة' : 'Interactive workshop tasks'}
              </span>
            </button>

            {/* 9. Mechanic Report */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `تقرير فحص ميكانيكي وأمر عمل معتمد لكود P0301 لمركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                    : `Generate official mechanic report for work order P0301 on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">description</span>
                <span>{isAr ? 'تقرير الورشة' : 'Mechanic Report'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'أمر عمل RO وجدول القطع' : 'Printable RO & parts BOM'}
              </span>
            </button>

            {/* 10. Test Guardrail */}
            <button
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `ما هو عزم شد براغي رأس المحرك وسعة الزيت لمركبة 1982 DeLorean DMC-12 أو 2012 سوبارو أوت باك؟`
                    : `What is the cylinder head bolt torque and oil capacity for a 1982 DeLorean DMC-12 or 2012 Subaru Outback?`
                )
              }
              className="p-2 rounded-lg bg-surface-container hover:bg-rose-950/30 border border-white/5 hover:border-rose-500/40 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <span className="material-symbols-outlined text-[16px]">gpp_maybe</span>
                <span>{isAr ? 'اختبار الأمان' : 'Test Guardrail'}</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                {isAr ? 'فحص انعدام الهلوسة' : 'Zero hallucination test'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Real-Time Architecture Pipeline Visualizer */}
      <ArchitectureBreadcrumb
        currentIntent={activeIntent}
        vehicleName={`${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`}
        isProcessing={isProcessing}
        lang={lang}
      />

      {/* Main Conversation Stream */}
      <section className="bg-surface-container-low rounded-xl p-4 lg:p-6 border border-white/5 shadow-xl min-h-[500px] flex flex-col justify-between">
        {/* Messages List */}
        <div className="space-y-6 flex-1 overflow-y-auto max-h-[620px] pe-2">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center shrink-0 text-primary-container shadow-sm mt-1">
                    <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  </div>
                )}

                <div
                  className={`max-w-3xl rounded-xl p-4 transition-all text-xs ${
                    isUser
                      ? 'bg-primary-container text-on-primary-container font-medium'
                      : 'bg-surface-container text-on-surface border border-white/5 shadow-md w-full'
                  }`}
                >
                  {/* Assistant Message Header with Confidence Indicator */}
                  {!isUser && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="font-headline-md font-bold text-xs uppercase tracking-wider text-primary-container">
                          {isAr ? 'مساعد AutoFix الذكي' : 'AutoFix AI'}
                        </span>
                        <span className="text-surface-container-highest">•</span>
                        <ConfidenceBadge confidence={msg.confidence} lang={lang} />
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-code-sm text-outline">
                        {msg.retrievedStats && (
                          <span>
                            {isAr
                              ? `قاعدة البيانات: ${msg.retrievedStats.dtcCount} كود، ${msg.retrievedStats.procCount} إجراء`
                              : `DB Hits: ${msg.retrievedStats.dtcCount} DTCs, ${msg.retrievedStats.procCount} Procs`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Content with Markdown formatting */}
                  <div className="space-y-2 leading-relaxed whitespace-pre-wrap font-body-md text-xs">
                    {msg.text.split('\n').map((line, idx) => {
                      if (line.startsWith('### ')) {
                        return (
                          <h3 key={idx} className="font-headline-md text-sm font-bold text-primary-container mt-2 mb-1">
                            {line.replace('### ', '')}
                          </h3>
                        );
                      }
                      if (line.startsWith('#### ')) {
                        return (
                          <h4 key={idx} className="font-headline-md text-xs font-bold text-secondary mt-2 mb-0.5">
                            {line.replace('#### ', '')}
                          </h4>
                        );
                      }
                      if (line.startsWith('* ')) {
                        return (
                          <div key={idx} className="ps-2 flex items-start gap-1.5 my-0.5">
                            <span className="text-primary-container">•</span>
                            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line.substring(2)) }} />
                          </div>
                        );
                      }
                      if (line.startsWith('|')) {
                        return null;
                      }
                      return (
                        <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(line) }} />
                      );
                    })}
                  </div>

                  {/* Structured Output 1: Interactive Checklist */}
                  {msg.checklist && (
                    <InteractiveChecklistView checklist={msg.checklist} />
                  )}

                  {/* Structured Output 2: Mechanic Report */}
                  {msg.mechanicReport && (
                    <MechanicReportView report={msg.mechanicReport} />
                  )}

                  {/* Structured Output 3: Cause Comparison */}
                  {msg.causeComparison && (
                    <CauseComparisonView comparison={msg.causeComparison} />
                  )}

                  {/* Verified Sources & Citations Box */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <SourceCitationsBox
                      sources={msg.sources}
                      onOpenProcedure={onNavigateToProcedure}
                    />
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0 text-on-surface shadow-sm mt-1">
                    <span className="material-symbols-outlined text-[18px]">person</span>
                  </div>
                )}
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-container/20 border border-primary-container/40 flex items-center justify-center shrink-0 text-primary-container shadow-sm animate-pulse">
                <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              </div>
              <div className="p-4 rounded-xl bg-surface-container border border-white/5 text-xs font-code-sm text-outline flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-primary-container animate-ping"></span>
                <span>
                  {isAr
                    ? 'جاري استرجاع البيانات الموثقة: فحص أكواد الأعطال، إجراءات الإصلاح، والمواصفات المصنعية...'
                    : 'Executing Grounded Retrieval: Querying DTCs, Repair Procedures, and Factory Specifications...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Query Input Box */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isAr
                    ? `اسأل مساعد AutoFix AI عن مركبة ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (الأعراض، الأكواد، عزم الربط، قوائم الفحص، تقارير الورشة)...`
                    : `Ask AutoFix AI about ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (symptoms, DTCs, torque specs, checklists, reports)...`
                }
                className="w-full bg-surface-container-lowest text-on-surface text-xs font-code-sm rounded-lg px-4 py-3 border border-white/10 focus:outline-none focus:border-primary-container/60 transition-all placeholder:text-outline"
              />
              <span className="absolute end-3 top-3 text-[10px] font-code-sm text-outline pointer-events-none hidden sm:inline">
                {isAr ? 'اضغط Enter للإرسال' : 'Enter to Submit'}
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 rounded-lg font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>{isAr ? 'اسأل الذكاء الاصطناعي' : 'Ask AI'}</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>

          {/* Quick Helper Chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-code-sm text-outline">
            <span className="text-secondary font-semibold">
              {isAr ? 'جرب أن تسأل:' : 'Try asking:'}
            </span>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `ما هي سعة ولزوجة زيت المحرك لسيارة 2018 تويوتا كامري؟`
                    : `What is the engine oil capacity and viscosity for 2018 Toyota Camry?`
                )
              }
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              {isAr ? 'عيار زيت 0W-16' : '0W-16 Oil Spec'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `شرح كود P0301 تفتفة في الأسطوانة رقم 1`
                    : `Explain code P0301 Cylinder 1 Misfire Detected`
                )
              }
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              {isAr ? 'شرح كود P0301' : 'Explain P0301'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `ما هو نظام CAN-BUS وكيف يعمل في السيارات؟`
                    : `What is the CAN-BUS network and how does it operate in vehicles?`
                )
              }
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              {isAr ? 'نظام CAN-BUS' : 'CAN-BUS Protocol'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `إنشاء قائمة فحص تشخيصي لاستبدال بخاخات الوقود`
                    : `Generate diagnostic checklist for fuel injector replacement`
                )
              }
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              {isAr ? 'قائمة فحص البخاخات' : 'Generate Checklist'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickPrompt(
                  isAr
                    ? `إصدار تقرير فحص ميكانيكي وأمر عمل رسمي`
                    : `Generate official mechanic report for work order`
                )
              }
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              {isAr ? 'تقرير وأمر عمل RO' : 'Mechanic Report'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Architecture Breadcrumb Pipeline Visualizer Component
const ArchitectureBreadcrumb: React.FC<{
  currentIntent?: AiIntent;
  vehicleName: string;
  isProcessing: boolean;
  lang?: Language;
}> = ({ currentIntent, vehicleName, isProcessing, lang = 'en' }) => {
  const isAr = lang === 'ar';

  const steps = [
    { label: isAr ? 'استعلام المستخدم' : 'User Query', icon: 'chat' },
    { label: isAr ? 'تحليل النية' : 'Intent Detection', icon: 'psychology' },
    { label: isAr ? 'استرجاع البيانات الموثقة' : 'Verified Retrieval', icon: 'storage' },
    { label: isAr ? 'تأكيد انعدام الهلوسة' : 'Zero Hallucination Gate', icon: 'verified_user' },
    { label: isAr ? 'الاستجابة المصنعية' : 'Grounded Response', icon: 'check_circle' },
  ];

  return (
    <div className="bg-surface-container-lowest/90 px-4 py-2.5 rounded-lg border border-white/5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-code-sm">
      <div className="flex items-center gap-2 text-outline">
        <span className="material-symbols-outlined text-primary-container text-[16px]">account_tree</span>
        <span className="font-semibold text-on-surface">
          {isAr ? 'مسار الاستدلال الهندسي:' : 'Reasoning Pipeline:'}
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-1">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded transition-colors whitespace-nowrap ${
                isProcessing && idx === 2
                  ? 'bg-primary-container/30 text-primary-container animate-pulse border border-primary-container/40'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] text-secondary">{step.icon}</span>
              <span>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <span className="text-outline/40">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// Helper for Confidence Badge
const ConfidenceBadge: React.FC<{ confidence: ConfidenceLevel; lang?: Language }> = ({
  confidence,
  lang = 'en',
}) => {
  const isAr = lang === 'ar';

  const config: Record<
    ConfidenceLevel,
    { labelEn: string; labelAr: string; color: string; icon: string }
  > = {
    High: {
      labelEn: 'High Confidence (Verified OEM)',
      labelAr: 'ثقة مرتفعة (بيانات مصنعية معتمدة)',
      color: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
      icon: 'verified',
    },
    Medium: {
      labelEn: 'Medium Confidence (Cross-Referenced)',
      labelAr: 'ثقة متوسطة (مراجع متطابقة)',
      color: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
      icon: 'rule',
    },
    Low: {
      labelEn: 'Low Confidence (Limited Parameters)',
      labelAr: 'ثقة منخفضة (معايير محدودة)',
      color: 'bg-orange-950/60 text-orange-400 border-orange-500/40',
      icon: 'info',
    },
    Insufficient: {
      labelEn: 'Insufficient Data (Zero Guesswork)',
      labelAr: 'بيانات غير كافية (انعدام التخمين)',
      color: 'bg-rose-950/60 text-rose-400 border-rose-500/40',
      icon: 'gpp_maybe',
    },
  };

  const c = config[confidence] || config.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-code-sm font-semibold border ${c.color}`}
    >
      <span className="material-symbols-outlined text-[13px]">{c.icon}</span>
      <span>{isAr ? c.labelAr : c.labelEn}</span>
    </span>
  );
};

// Helper for formatting bold and backtick codes in markdown text
function formatInlineMarkdown(text: string): string {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-on-surface-variant">$1</em>')
    .replace(
      /`([^`]+)`/g,
      '<code class="px-1.5 py-0.2 rounded bg-surface-container-high text-primary-container font-mono text-[11px]">$1</code>'
    );
  return formatted;
}
