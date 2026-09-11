import React, { useState, useRef, useEffect } from 'react';
import { RepairVideoReference } from '../../db/repairTypes';
import { Language } from '../../types';
import { isDeviceOnline } from '../../offline/offlineStorage';

interface ControlledVideoPlayerProps {
  video: RepairVideoReference;
  lang: Language;
}

export const ControlledVideoPlayer: React.FC<ControlledVideoPlayerProps> = ({ video, lang }) => {
  const isAr = lang === 'ar';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [online, setOnline] = useState<boolean>(isDeviceOnline());

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleStartLoadAndPlay = () => {
    if (!online) return;
    setIsLoaded(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 50);
  };

  const togglePlay = () => {
    if (!isLoaded) {
      handleStartLoadAndPlay();
      return;
    }
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-white/10 bg-surface-container-lowest overflow-hidden shadow-2xl space-y-3"
    >
      {/* Video Viewport Container with Lazy Loading & Offline Fallback */}
      <div className="relative aspect-video w-full bg-black group overflow-hidden flex items-center justify-center">
        {!isLoaded ? (
          // Lazy Loaded Poster Shell - zero network bandwidth consumed prior to interaction
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container-lowest via-black to-surface-container">
            {video.thumbnailUrl && (
              <img
                src={video.thumbnailUrl}
                alt={isAr ? video.titleAr : video.titleEn}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xs transition-opacity duration-300"
              />
            )}

            {/* Offline state notice */}
            {!online ? (
              <div className="relative z-10 max-w-md p-6 text-center space-y-3 bg-surface-container-low/90 backdrop-blur-md rounded-2xl border border-amber-500/30 m-4">
                <span className="material-symbols-outlined text-amber-400 text-3xl">cloud_off</span>
                <div>
                  <h4 className="text-xs font-code-sm font-bold text-amber-300 uppercase">
                    {isAr ? 'الفيديو غير متاح دون اتصال' : 'Video Streaming Suspended in Offline Mode'}
                  </h4>
                  <p className="text-[11px] font-code-sm text-outline mt-1 leading-relaxed">
                    {isAr
                      ? 'أنت تعمل حالياً في وضع عدم الاتصال (Verified Offline). إجراءات الإصلاح الفنية والخطوات المعتمدة متوفرة بالكامل نصياً بالأسفل.'
                      : 'Streaming external media requires broadband internet. All verified 6-step factory procedures and torque specs are permanently cached offline.'}
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 text-[10px] font-code-sm font-bold">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  <span>{isAr ? 'المواصفات الفنية محفوظة محلياً' : 'Verified Offline Protocol Available'}</span>
                </div>
              </div>
            ) : (
              // Online Lazy-load trigger
              <div className="relative z-10 flex flex-col items-center gap-3 p-4 text-center">
                <button
                  onClick={handleStartLoadAndPlay}
                  className="h-16 w-16 rounded-full bg-primary-container/90 hover:bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.7)] hover:scale-110 transition-all cursor-pointer group"
                  type="button"
                  aria-label="Stream verified video"
                >
                  <span className="material-symbols-outlined text-4xl group-hover:scale-105 transition-transform">
                    play_arrow
                  </span>
                </button>
                <div className="space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary-container/20 border border-primary-container/40 text-primary-container text-[11px] font-code-sm font-bold">
                    <span className="material-symbols-outlined text-xs">speed</span>
                    <span>{isAr ? 'تحميل كسول محسّن للسرعة' : 'Lazy-Loaded On-Demand'} ({video.duration})</span>
                  </span>
                  <p className="text-[11px] font-code-sm text-outline">
                    {isAr ? 'اضغط لبدء تشغيل الفيديو عالي الدقة' : 'Click to stream authorized OEM guide'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Active Lazy Video Player with preload="none"
          <>
            <video
              ref={videoRef}
              src={video.videoUrl}
              poster={video.thumbnailUrl}
              preload="metadata"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              playsInline
            />

            {/* Big Center Play Overlay when paused */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute inset-0 m-auto h-16 w-16 rounded-full bg-primary-container/85 text-on-primary-container flex items-center justify-center shadow-[0_0_30px_rgba(0,240,255,0.6)] hover:scale-110 transition-transform cursor-pointer"
                type="button"
                aria-label="Play video"
              >
                <span className="material-symbols-outlined text-4xl">play_arrow</span>
              </button>
            )}

            {/* Custom Controlled Player Controls Bar */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
              {/* Progress Slider */}
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary-container"
              />

              {/* Controls Row */}
              <div className="flex items-center justify-between text-xs text-on-surface">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-1 rounded text-primary-container hover:text-white transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1 rounded text-outline hover:text-white transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isMuted ? 'volume_off' : 'volume_up'}
                    </span>
                  </button>

                  <span className="font-code-sm text-[11px] text-outline">
                    {formatTime(currentTime)} / {formatTime(duration || 0) || video.duration}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-code-sm font-bold text-secondary">
                    {video.resolution}
                  </span>

                  <button
                    onClick={toggleFullscreen}
                    className="p-1 rounded text-outline hover:text-white transition-colors cursor-pointer"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Mandatory Source Attribution & Legal License Footer */}
      <div className="p-4 bg-surface-container-low/70 border-t border-white/5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-base">
              verified
            </span>
            <span className="font-headline-sm font-bold text-xs text-on-surface">
              {isAr ? video.titleAr : video.titleEn}
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-primary-container/10 border border-primary-container/30 text-[10px] font-code-sm text-primary-container font-semibold">
            {video.licenseInfo}
          </span>
        </div>

        {/* Source Attribution Notice */}
        <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-white/5 flex items-start gap-2">
          <span className="material-symbols-outlined text-outline text-sm mt-0.5">info</span>
          <p className="font-code-sm text-[10px] text-outline leading-relaxed">
            <span className="text-on-surface font-semibold">
              {isAr ? 'إسناد المصدر المعتمد:' : 'Source Attribution:'}{' '}
            </span>
            {video.sourceAttribution}.{' '}
            <span className="italic">
              {isAr
                ? 'يتم عرض الفيديو مباشرة من مصدره التعليمي الموثق والمرخص دون إعادة استضافة أو تعديل للحقوق.'
                : 'Displayed inside a controlled reference component under authorized educational fair-use without copying or re-hosting copyrighted media.'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
