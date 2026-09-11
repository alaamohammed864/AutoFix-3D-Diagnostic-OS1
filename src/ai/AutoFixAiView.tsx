import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { VehicleProfileData } from '../db/vehicleTypes';
import { VEHICLE_PROFILES } from '../db/vehicleDatabase';
import { ChatMessage, AiIntent } from './types';
import { processUserQuery } from './reasoningEngine';
import { ConfidenceBadge, SourceCitationsBox } from './ConfidenceBadge';
import { ArchitectureBreadcrumb } from './ArchitectureBreadcrumb';
import { InteractiveChecklistView } from './InteractiveChecklistView';
import { MechanicReportView } from './MechanicReportView';
import { CauseComparisonView } from './CauseComparisonView';

interface AutoFixAiViewProps {
  lang: Language;
  activeVehicle: VehicleProfileData;
  onSelectVehicleProfile?: (profile: VehicleProfileData) => void;
  onNavigateToProcedure?: () => void;
}

export const AutoFixAiView: React.FC<AutoFixAiViewProps> = ({
  lang,
  activeVehicle,
  onSelectVehicleProfile,
  onNavigateToProcedure,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial welcome message demonstrating the grounded pipeline
    const initialQuery = `Explain code P0301 for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`;
    const initialMsg = processUserQuery(initialQuery, activeVehicle, 'P0301');
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
        text: `### ⚡ Welcome to AutoFix AI\n**Active Rig:** ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (${activeVehicle.engine})\n\nI am your verified automotive diagnostic and workshop intelligence assistant. I operate strictly under a **zero-hallucination mandate**:\n\n* 🔒 **Grounded Data First:** Every specification is retrieved directly from the verified database.\n* 🚫 **No Invented Specs:** I will never guess fluid capacities, fastener torques, or wiring pinouts.\n* 📑 **Explicit Sources:** Every factual vehicle-specific answer displays its exact documentation source.\n* 🚦 **Confidence Tracking:** Displays High, Medium, Low, or Insufficient Data confidence.\n\nSelect a capability below or type any symptom, DTC code, or repair inquiry!`,
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

    // Run grounded reasoning pipeline
    setTimeout(() => {
      const response = processUserQuery(query, activeVehicle);
      setActiveIntent(response.intent);
      setMessages((prev) => [...prev, response]);
      setIsProcessing(false);
    }, 400);
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
        text: `### 🔄 Session Reset\nActive Rig: **${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}**.\n\nHow can AutoFix AI assist with your vehicle diagnostics?`,
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
              <span className="p-2 rounded-lg bg-primary-container/20 text-primary-container border border-primary-container/30">
                <span className="material-symbols-outlined text-[22px]">auto_awesome</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display-lg text-lg lg:text-xl font-black tracking-tight uppercase text-on-surface">
                    AutoFix AI
                  </h1>
                  <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary-container font-code-sm text-[10px] font-bold border border-primary-container/30">
                    DIAGNOSTIC COPILOT
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-code-sm text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Zero Hallucination
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-body-md">
                  Grounded Automotive Intelligence • Verified Factory Procedures • Diagnostic Logic
                </p>
              </div>
            </div>
          </div>

          {/* Active Vehicle Rig Selector */}
          <div className="flex items-center gap-2 bg-surface-container-lowest p-2 rounded-lg border border-white/5">
            <span className="material-symbols-outlined text-secondary text-[18px]">directions_car</span>
            <div className="flex flex-col">
              <span className="text-[9px] font-telemetry-label text-outline uppercase">
                Active Vehicle Rig
              </span>
              <select
                value={activeVehicle.id}
                onChange={(e) => {
                  const prof = VEHICLE_PROFILES.find((p) => p.id === e.target.value);
                  if (prof && onSelectVehicleProfile) {
                    onSelectVehicleProfile(prof);
                  }
                }}
                className="bg-transparent text-xs font-code-sm text-on-surface font-semibold focus:outline-none cursor-pointer"
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
              title="Clear Session"
              className="p-1.5 rounded hover:bg-surface-container-high text-outline hover:text-on-surface transition-colors ms-2"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
            </button>
          </div>
        </div>

        {/* 9 Capabilities Action Ribbon */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <span className="font-telemetry-label text-[10px] text-outline uppercase tracking-wider block mb-2">
            AutoFix AI Engineering Capabilities
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            <button
              onClick={() => handleQuickPrompt(`Explain symptoms of rough idle and engine shaking on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">stethoscope</span>
                <span>Explain Symptoms</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Rough idle, shudder, smoke
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Explain the Mass Air Flow (MAF) sensor and Fuel Injector components on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">settings_input_component</span>
                <span>Explain Components</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Function, location & specs
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Guide diagnostic workflow for code P0301 on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">account_tree</span>
                <span>Diagnostic Workflow</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                4-phase test sequence
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Summarize repair procedure for direct fuel injector replacement on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">build</span>
                <span>Summarize Repair</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Tools, torque & safety
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Explain code P0171 system too lean bank 1 for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">warning</span>
                <span>Explain DTC Codes</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                SAE standard & PIDs
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Explain factory maintenance schedule, fluid capacities, and oil viscosity for ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">event_available</span>
                <span>Maintenance Schedule</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Oil spec & service intervals
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Compare possible causes for cylinder misfire and rough idle on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">balance</span>
                <span>Compare Causes</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Probability matrix %
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Generate diagnostic checklist for cylinder misfire P0301 on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">checklist</span>
                <span>Diagnostic Checklist</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Interactive workshop tasks
              </span>
            </button>

            <button
              onClick={() => handleQuickPrompt(`Generate official mechanic report for work order P0301 on ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model}`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary-container/30 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface group-hover:text-primary-container">
                <span className="material-symbols-outlined text-[16px] text-secondary">description</span>
                <span>Mechanic Report</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Printable RO & parts BOM
              </span>
            </button>

            {/* Test Insufficient Data Guardrail Button */}
            <button
              onClick={() => handleQuickPrompt(`What is the cylinder head bolt torque and oil capacity for a 1982 DeLorean DMC-12 or 2012 Subaru Outback?`)}
              className="p-2 rounded-lg bg-surface-container hover:bg-rose-950/30 border border-white/5 hover:border-rose-500/40 text-start transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <span className="material-symbols-outlined text-[16px]">gpp_maybe</span>
                <span>Test Guardrail</span>
              </div>
              <span className="text-[10px] text-outline block mt-0.5 line-clamp-1">
                Zero hallucination test
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
                          AutoFix AI
                        </span>
                        <span className="text-surface-container-highest">•</span>
                        <ConfidenceBadge confidence={msg.confidence} />
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-code-sm text-outline">
                        {msg.retrievedStats && (
                          <span>
                            DB Hits: {msg.retrievedStats.dtcCount} DTCs, {msg.retrievedStats.procCount} Procs
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Message Content with Markdown-style formatting */}
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
                        // skip raw table lines if structured view is rendered
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
                <span>Executing Grounded Retrieval: Querying DTCs, Repair Procedures, and Factory Specifications...</span>
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
                placeholder={`Ask AutoFix AI about ${activeVehicle.year} ${activeVehicle.make} ${activeVehicle.model} (symptoms, DTCs, torque specs, checklists, reports)...`}
                className="w-full bg-surface-container-lowest text-on-surface text-xs font-code-sm rounded-lg px-4 py-3 border border-white/10 focus:outline-none focus:border-primary-container/60 transition-all placeholder:text-outline"
              />
              <span className="absolute end-3 top-3 text-[10px] font-code-sm text-outline pointer-events-none hidden sm:inline">
                Enter to Submit
              </span>
            </div>

            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="bg-primary-container hover:bg-primary-fixed-dim text-on-primary-container disabled:opacity-40 disabled:cursor-not-allowed px-5 py-3 rounded-lg font-code-sm text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Ask AI</span>
              <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </form>

          {/* Quick Helper Chips */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[11px] font-code-sm text-outline">
            <span className="text-secondary font-semibold">Try asking:</span>
            <button
              type="button"
              onClick={() => handleQuickPrompt(`What is the engine oil capacity and viscosity for 2018 Toyota Camry?`)}
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              0W-16 Oil Spec
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt(`Explain code P0301 Cylinder 1 Misfire Detected`)}
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              Explain P0301
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt(`Generate diagnostic checklist for fuel injector replacement`)}
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              Generate Checklist
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt(`Generate official mechanic report for work order`)}
              className="px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high border border-white/5 hover:text-on-surface transition-colors cursor-pointer"
            >
              Mechanic Report
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

// Helper for formatting bold and backtick codes in markdown text
function formatInlineMarkdown(text: string): string {
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-on-surface font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-on-surface-variant">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.2 rounded bg-surface-container-high text-primary-container font-mono text-[11px]">$1</code>');
  return formatted;
}
