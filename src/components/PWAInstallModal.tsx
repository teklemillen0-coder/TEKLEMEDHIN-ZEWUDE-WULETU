import React from 'react';
import { Download, Monitor, Share, Smartphone, X } from 'lucide-react';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface PWAInstallModalProps {
  isOpen: boolean;
  lang: Language;
  canPromptNatively: boolean;
  isIOS: boolean;
  onPromptNative: () => void;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  lang,
  canPromptNatively,
  isIOS,
  onPromptNative,
  onClose,
}) => {
  if (!isOpen) return null;
  const t = UI_TRANSLATIONS[lang];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <h2
            id="pwa-modal-title"
            className="font-display text-lg font-bold text-stone-900 dark:text-stone-100"
          >
            {t.pwaModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {canPromptNatively && (
            <button
              type="button"
              onClick={onPromptNative}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Download className="h-4 w-4" />
              <span>{t.pwaPromptNowBtn}</span>
            </button>
          )}

          <div className="space-y-3">
            <div
              className={`rounded-xl border p-4 ${
                isIOS
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/25'
                  : 'border-stone-200 bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Share className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t.pwaIOSTitle}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {t.pwaIOSSteps}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>{t.pwaAndroidTitle}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {t.pwaAndroidSteps}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-900 dark:text-stone-100">
                <Monitor className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                <span>{t.pwaDesktopTitle}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-300">
                {t.pwaDesktopSteps}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-xl border border-stone-200 bg-white text-sm font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100 dark:hover:bg-zinc-800"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
};
