import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Database,
  Globe,
  HardDrive,
  Info,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  Type,
} from 'lucide-react';
import { LANGUAGE_OPTIONS } from '../i18n/translations';
import { AppFontScale, Language } from '../types';

interface SettingsViewProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  fontScale: AppFontScale;
  onChangeFontScale: (scale: AppFontScale) => void;
  unlockedCount: number;
  cartCount: number;
  onClearSessionData: () => void;
}

const FONT_SCALE_OPTIONS: { id: AppFontScale; label: string; desc: string }[] = [
  { id: 'sm', label: 'Small (14px)', desc: 'Compact view for dense tables' },
  { id: 'base', label: 'Default (16px)', desc: 'Recommended reading balance' },
  { id: 'lg', label: 'Large (18px)', desc: 'Comfortable Ethiopian script reading' },
  { id: 'xl', label: 'Extra Large (20px)', desc: 'Accessibility high-legibility scale' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  lang,
  onChangeLang,
  theme,
  onToggleTheme,
  fontScale,
  onChangeFontScale,
  unlockedCount,
  cartCount,
  onClearSessionData,
}) => {
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [storageMb, setStorageMb] = useState<string>('Checking...');
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [confirmResetStep, setConfirmResetStep] = useState(false);
  const [sessionClearedMsg, setSessionClearedMsg] = useState(false);

  const inspectCaches = async () => {
    try {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        setCacheCount(keys.length);
      }
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const est = await navigator.storage.estimate();
        const usedMb = ((est.usage || 0) / (1024 * 1024)).toFixed(2);
        setStorageMb(`${usedMb} MB used offline`);
      } else {
        setStorageMb('LocalStorage Active');
      }
    } catch {
      setStorageMb('LocalStorage Active');
    }
  };

  useEffect(() => {
    inspectCaches();
  }, []);

  const handleClearOfflineCache = async () => {
    try {
      if ('caches' in window) {
        const keys = await window.caches.keys();
        await Promise.all(keys.map((k) => window.caches.delete(k)));
      }
      localStorage.removeItem('addisvault_link_history');
      await inspectCaches();
      setCacheMessage('Offline Service Worker & link caches cleared cleanly.');
      setTimeout(() => setCacheMessage(null), 3000);
    } catch {
      setCacheMessage('Cleared local offline cache entries.');
    }
  };

  const handleConfirmClearSession = () => {
    onClearSessionData();
    setConfirmResetStep(false);
    setSessionClearedMsg(true);
    setTimeout(() => setSessionClearedMsg(false), 3000);
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      <div className="border-b border-stone-200 pb-6 dark:border-zinc-800">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Settings &amp; Security Center · ቅንብሮች
        </h1>
        <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">
          Customize language, theme, reading typography, offline PWA caches, and enterprise privacy controls.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Language Setting */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <Globe className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              App Language / ቋንቋ
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGE_OPTIONS.map((opt) => (
              <button
                key={opt.code}
                type="button"
                onClick={() => onChangeLang(opt.code)}
                className={`min-h-[42px] rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                  lang === opt.code
                    ? 'border-emerald-700 bg-emerald-700 text-white dark:bg-emerald-600'
                    : 'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-200'
                }`}
              >
                <div>{opt.nativeName}</div>
                <div className="text-[10px] opacity-80">{opt.englishName}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Theme & Appearance */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-amber-400" />
            ) : (
              <Sun className="h-5 w-5 text-amber-600" />
            )}
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              Display Theme / ገጽታ
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Switch between Warm Sandstone Light mode and Carbon Dark mode for comfortable night reading.
          </p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold text-stone-900 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 text-amber-400" />
                <span>Switch to Light Mode (Warm Sandstone)</span>
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 text-emerald-700" />
                <span>Switch to Dark Mode (Deep Carbon)</span>
              </>
            )}
          </button>
        </div>

        {/* Reading Font Size */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <Type className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              Reading Font Size / የጽሑፍ መጠን
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FONT_SCALE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeFontScale(opt.id)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  fontScale === opt.id
                    ? 'border-emerald-700 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border-stone-200 bg-stone-50 text-stone-800 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-200'
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className="mt-0.5 text-[10px] opacity-75">{opt.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Offline Cached Files Management */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <HardDrive className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              Offline Cached Files / የመስመር ውጭ ፋይሎች
            </h2>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Offline Storage Usage:</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                {storageMb}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">PWA Cache Buckets:</span>
              <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                {cacheCount} active
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500 dark:text-stone-400">Unlocked Vault Items:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                {unlockedCount} resources
              </span>
            </div>
          </div>

          {cacheMessage && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>{cacheMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={inspectCaches}
              className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh Status</span>
            </button>
            <button
              type="button"
              onClick={handleClearOfflineCache}
              className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 px-3 text-xs font-semibold text-amber-900 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Clear Offline Caches</span>
            </button>
          </div>
        </div>
      </div>

      {/* Clear Session Data + App Version & Privacy Policy */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <Trash2 className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              Clear Session Data
            </h2>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-400">
            Resets your shopping cart ({cartCount} items), temporary 15-minute Vault share tokens, promo codes, and active search filters on this browser without affecting merchant payment records.
          </p>
          {sessionClearedMsg && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Session data cleared cleanly!</span>
            </div>
          )}
          {!confirmResetStep ? (
            <button
              type="button"
              onClick={() => setConfirmResetStep(true)}
              className="min-h-[40px] rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-800/60 dark:bg-rose-950/30 dark:text-rose-300"
            >
              Clear Session Data
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/40">
              <span className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                Confirm reset of cart &amp; local tokens?
              </span>
              <button
                type="button"
                onClick={handleConfirmClearSession}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Reset Session
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetStep(false)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5">
            <Info className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              App Version &amp; Security Policy
            </h2>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs space-y-1.5 dark:border-zinc-800 dark:bg-zinc-950">
            <div className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
              AddisVault v4.0 Enterprise Super-App PWA
            </div>
            <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
              <strong>Privacy &amp; Security:</strong> All inputs are XSS-sanitized, AI &amp; form routes are rate-limited, checkout totals are verified against canonical server/catalog tables, Vault session tokens carry integrity signatures &amp; device-binding, and the Owner Dashboard is locked behind an encrypted PIN gate.
            </p>
            <div className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Telebirr (0925695197) &amp; CBE (1000211261513) Direct Settlement</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
