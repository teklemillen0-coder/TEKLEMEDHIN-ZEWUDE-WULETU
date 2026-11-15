import React, { useEffect, useRef, useState } from 'react';
import { Globe, Pause, Play, Video } from 'lucide-react';
import { Language } from '../types';
import { LANGUAGE_OPTIONS, UI_TRANSLATIONS } from '../i18n/translations';

interface VideoPreviewPlayerProps {
  title: string;
  chapters?: string[];
  lang: Language;
  availableLanguages?: Language[];
}

const TOTAL_SECONDS = 30;

export const VideoPreviewPlayer: React.FC<VideoPreviewPlayerProps> = ({
  title,
  chapters = ['01. Introduction & Key Concepts', '02. Step-by-Step Walkthrough', '03. Practical Tips'],
  lang,
  availableLanguages = ['am', 'en', 'om', 'ti', 'so'],
}) => {
  const t = UI_TRANSLATIONS[lang];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSec, setCurrentSec] = useState(0);
  const [activeChapterIdx, setActiveChapterIdx] = useState(0);
  const [trackLang, setTrackLang] = useState<Language>(
    availableLanguages.includes(lang) ? lang : availableLanguages[0] || 'am'
  );

  useEffect(() => {
    if (availableLanguages.includes(lang)) {
      setTrackLang(lang);
    }
  }, [lang, availableLanguages]);

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentSec((prev) => {
        if (prev + 0.1 >= TOTAL_SECONDS) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 0.1;
      });
    }, 100);
    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const progress = currentSec / TOTAL_SECONDS;
    const activeTrackMeta =
      LANGUAGE_OPTIONS.find((opt) => opt.code === trackLang) || LANGUAGE_OPTIONS[0];

    // Deep studio chalkboard background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#022c22');
    grad.addColorStop(1, '#09090b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle geometric lattice
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.12)';
    ctx.lineWidth = 1;
    for (let x = 24; x < w; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 24; y < h; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Animated step-wave diagram
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 32; px <= w - 32; px += 8) {
      const norm = (px - 32) / (w - 64);
      const wave =
        Math.sin(norm * Math.PI * 3 + progress * Math.PI * 4 + activeChapterIdx) * 26;
      const py = h * 0.56 + wave;
      if (px === 32) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Chapter & audio track label on canvas
    const chapterText = chapters[activeChapterIdx] || chapters[0];
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(
      `ADDISVAULT STUDIO · CH 0${activeChapterIdx + 1} · AUDIO: ${activeTrackMeta.englishName.toUpperCase()} (${activeTrackMeta.nativeName})`,
      24,
      34
    );

    ctx.fillStyle = '#f5f5f4';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(chapterText.slice(0, 48), 24, 66);

    ctx.fillStyle = 'rgba(214, 211, 209, 0.85)';
    ctx.font = '13px sans-serif';
    ctx.fillText(title.slice(0, 62), 24, h - 22);
  }, [currentSec, activeChapterIdx, chapters, title, trackLang]);

  const formatSec = (s: number) => {
    const whole = Math.floor(s);
    return `00:${whole.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-emerald-900/20 bg-zinc-950 p-3.5 text-stone-100 dark:border-zinc-800">
      <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <Video className="h-4 w-4" />
          <span>{t.videoPreviewTitle}</span>
        </div>
        <span className="font-mono text-xs text-stone-400 tabular-nums">
          {formatSec(currentSec)} / {formatSec(TOTAL_SECONDS)}
        </span>
      </div>

      {/* Audio / Caption Language Track Switcher */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-400 mr-1">
          <Globe className="h-3 w-3 text-emerald-400" />
          <span>Audio / Captions:</span>
        </span>
        {LANGUAGE_OPTIONS.filter((opt) => availableLanguages.includes(opt.code)).map((opt) => (
          <button
            key={opt.code}
            type="button"
            onClick={() => setTrackLang(opt.code)}
            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition-colors ${
              trackLang === opt.code
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-900 text-stone-300 hover:bg-zinc-800'
            }`}
          >
            {opt.nativeName}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-black">
        <canvas ref={canvasRef} width={640} height={240} className="block h-40 w-full object-cover sm:h-48" />
        <button
          type="button"
          onClick={() => setIsPlaying((prev) => !prev)}
          aria-label={isPlaying ? t.videoPauseBtn : t.videoPlayBtn}
          className="absolute bottom-3 right-3 inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-emerald-500"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isPlaying ? t.videoPauseBtn : t.videoPlayBtn}</span>
        </button>
      </div>

      {/* Scrubber */}
      <input
        type="range"
        min={0}
        max={TOTAL_SECONDS}
        step={0.5}
        value={currentSec}
        aria-label="Video preview timeline"
        onChange={(e) => setCurrentSec(Number(e.target.value))}
        className="mt-2.5 h-1.5 w-full cursor-pointer accent-emerald-500"
      />

      {/* Chapter selector */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {chapters.map((ch, idx) => (
          <button
            key={ch}
            type="button"
            onClick={() => {
              setActiveChapterIdx(idx);
              setCurrentSec(0);
              setIsPlaying(true);
            }}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
              activeChapterIdx === idx
                ? 'bg-amber-500 text-zinc-950 font-semibold'
                : 'bg-zinc-900 text-stone-300 hover:bg-zinc-800'
            }`}
          >
            {ch}
          </button>
        ))}
      </div>
    </div>
  );
};
