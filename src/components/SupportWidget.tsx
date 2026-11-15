import React, { useState } from 'react';
import { FileQuestion, Mail, MessageCircle, Send, ShieldCheck, X } from 'lucide-react';
import { OWNER_SUPPORT_CONTACTS } from '../constants/support';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface SupportWidgetProps {
  lang: Language;
  isHidden?: boolean;
  onOpenMissingFile: () => void;
  onOpenVerifiedOwner?: () => void;
}

export const SupportWidget: React.FC<SupportWidgetProps> = ({
  lang,
  isHidden = false,
  onOpenMissingFile,
  onOpenVerifiedOwner,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [isOpen, setIsOpen] = useState(false);

  if (isHidden) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
      {isOpen && (
        <div
          className="mb-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
          role="dialog"
          aria-label={t.supportMenuTitle}
        >
          <div className="flex items-start justify-between border-b border-stone-200 bg-emerald-800 px-4 py-3.5 text-white dark:border-zinc-800 dark:bg-emerald-950">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>AddisVault Direct Desk</span>
              </div>
              <h3 className="mt-0.5 font-display text-sm font-bold">{t.supportMenuTitle}</h3>
              <p className="mt-0.5 text-xs text-emerald-100/90 leading-snug">
                {t.supportMenuSubtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t.closeBtn}
              className="rounded-lg p-1 text-emerald-100 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 space-y-2">
            <a
              href={OWNER_SUPPORT_CONTACTS.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:border-sky-500 hover:bg-sky-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100 dark:hover:bg-zinc-800"
            >
              <Send className="h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
              <span className="truncate">{t.supportTelegramBtn}</span>
            </a>

            <a
              href={OWNER_SUPPORT_CONTACTS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:border-emerald-600 hover:bg-emerald-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100 dark:hover:bg-zinc-800"
            >
              <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="truncate">{t.supportWhatsappBtn}</span>
            </a>

            <a
              href={OWNER_SUPPORT_CONTACTS.emailUrl}
              className="flex min-h-[44px] items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs font-semibold text-stone-800 transition-colors hover:border-amber-600 hover:bg-amber-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100 dark:hover:bg-zinc-800"
            >
              <Mail className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="truncate">{t.supportEmailBtn}</span>
            </a>

            {onOpenVerifiedOwner && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenVerifiedOwner();
                }}
                className="flex min-h-[42px] w-full items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <span className="truncate">{t.verifiedOwnerNavLabel}</span>
              </button>
            )}

            <div className="border-t border-stone-200 pt-2 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenMissingFile();
                }}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <FileQuestion className="h-4 w-4 shrink-0" />
                <span className="truncate">{t.requestMissingBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={t.supportFabLabel}
        className="flex min-h-[46px] items-center gap-2 rounded-xl border border-emerald-700/20 bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 dark:border-emerald-500/30 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      >
        <MessageCircle className="h-4 w-4 shrink-0" />
        <span className="whitespace-nowrap">{t.supportFabLabel}</span>
      </button>
    </div>
  );
};
