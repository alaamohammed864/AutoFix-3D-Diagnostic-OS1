import React, { useState } from 'react';
import { Language } from '../types';

interface VideoGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const VideoGuideModal: React.FC<VideoGuideModalProps> = ({ isOpen, onClose, lang }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const isAr = lang === 'ar';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-surface-container-lowest border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-container/10 text-primary-container">
              <span className="material-symbols-outlined text-lg">play_circle</span>
            </div>
            <div>
              <h3 className="font-headline-md text-base text-on-surface font-semibold">
                {isAr
                  ? 'دليل الفيديو الفني: فحص تسريبات الفاكيوم ومجمع السحب'
                  : 'OEM Video Guide: Porsche 992 Vacuum Leak Inspection'}
              </h3>
              <p className="font-code-sm text-xs text-outline">
                Porsche Technical Service Bulletin TSB-992-0171 • 1080p 60fps
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

        {/* Video simulation viewport */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group">
          {/* Visual video background graphic */}
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-950/40 via-slate-900 to-slate-950 flex items-center justify-center">
            {/* Holographic grid and vehicle engine wireframe */}
            <div className="text-center p-6 space-y-3">
              <span className="material-symbols-outlined text-6xl text-primary-container/60 animate-pulse">
                precision_manufacturing
              </span>
              <div className="font-code-sm text-xs text-primary font-semibold">
                CAMERA FEED: BAY 4 HIGH-SPEED OPTICAL PROBE
              </div>
              <p className="font-code-sm text-[11px] text-outline max-w-sm mx-auto">
                {isAr
                  ? 'تسجيل إجراء إدخال الدخان في مجمع سحب أسطوانات البنك 1 ورصد انبعاث الدخان عند حلقة العزل المطاطية.'
                  : 'Real-time optical capture: Smoke injection on Bank 1 intake plenum gasket. Defective O-ring seal detected.'}
              </p>
            </div>
          </div>

          {/* Video controls overlay */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col gap-2">
            {/* Scrubber bar */}
            <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden cursor-pointer">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '42%' }}></div>
            </div>

            <div className="flex items-center justify-between text-xs font-code-sm text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-base">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <span>02:18 / 05:32</span>
              </div>
              <div className="flex items-center gap-2 text-outline">
                <span>TSB Step 3: Bank 1 Plenum Smoke Pinpoint</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters list */}
        <div className="p-4 bg-surface-container-low border-t border-white/5 space-y-2">
          <span className="text-[10px] font-telemetry-label text-outline uppercase">
            {isAr ? 'فصول الفيديو الفني:' : 'Diagnostic Video Chapters:'}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-code-sm">
            <div className="p-2 rounded bg-surface-container-lowest border border-white/5">
              <div className="text-secondary font-semibold">01:00 • Preparation</div>
              <div className="text-outline text-[11px]">Underbody shroud removal</div>
            </div>
            <div className="p-2 rounded bg-surface-container-high border border-primary-container/40">
              <div className="text-primary-container font-semibold">02:15 • Smoke Injection</div>
              <div className="text-on-surface text-[11px]">Plenum pressure at 0.8 Bar</div>
            </div>
            <div className="p-2 rounded bg-surface-container-lowest border border-white/5">
              <div className="text-secondary font-semibold">04:10 • Seal Replacement</div>
              <div className="text-outline text-[11px]">25 Nm plenum torquing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
