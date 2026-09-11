import React, { useState, useRef } from 'react';
import { RepairVideoReference } from '../../db/repairTypes';
import { Language } from '../../types';

interface ControlledVideoPlayerProps {
  video: RepairVideoReference;
  lang: Language;
}

export const ControlledVideoPlayer: React.FC<ControlledVideoPlayerProps> = ({ video, lang }) => {
  const isAr = lang === 'ar';
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
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
    const container = videoRef.current?.parentElement;
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
    <div className="rounded-2xl border border-white/10 bg-surface-container-lowest overflow-hidden shadow-2xl space-y-3">
      {/* Video Viewport Container */}
      <div className="relative aspect-video w-full bg-black group overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
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
