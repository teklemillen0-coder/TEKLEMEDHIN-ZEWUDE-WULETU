import React, { useState } from 'react';
import { FileQuestion, Mail, MessageCircle, Send, X } from 'lucide-react';
import {
  buildEmailPrefillUrl,
  buildTelegramPrefillUrl,
  buildWhatsAppPrefillUrl,
} from '../constants/support';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface MissingFileModalProps {
  isOpen: boolean;
  lang: Language;
  onClose: () => void;
}

const REQUEST_CATEGORIES = [
  'Grade 1–8 Textbook / Ministry Exam',
  'Grade 9–12 Textbook / EUEE Matric Exam',
  'University Module / Exit Exam Prep',
  'Video Tutoring / Arts & Crafts',
  'Medical & Health Research',
  'Business / Diaspora / Gov Manual',
  'Computer & Mobile Repair Kit',
  'Culinary Recipe / Children Book / Livestock',
];

export const MissingFileModal: React.FC<MissingFileModalProps> = ({
  isOpen,
  lang,
  onClose,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [itemName, setItemName] = useState('');
  const [categoryLabel, setCategoryLabel] = useState(REQUEST_CATEGORIES[1]);
  const [notes, setNotes] = useState('');
  const [showValidationError, setShowValidationError] = useState(false);

  if (!isOpen) return null;

  const isReady = itemName.trim().length >= 2;
  const formattedBody = [
    'AddisVault Missing File Request',
    `Item: ${itemName.trim() || '(Not specified)'}`,
    `Grade / Category: ${categoryLabel}`,
    notes.trim() ? `Notes: ${notes.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const emailSubject = `[AddisVault Request] ${itemName.trim() || 'Missing File'}`;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isReady) {
      e.preventDefault();
      setShowValidationError(true);
    } else {
      setShowValidationError(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="missing-file-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <FileQuestion className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2
              id="missing-file-modal-title"
              className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100"
            >
              {t.missingModalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-zinc-800 dark:hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
            {t.missingModalSubtitle}
          </p>

          <div>
            <label
              htmlFor="missing-item-name"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              {t.missingItemLabel} *
            </label>
            <input
              id="missing-item-name"
              type="text"
              value={itemName}
              onChange={(e) => {
                setItemName(e.target.value);
                if (e.target.value.trim().length >= 2) setShowValidationError(false);
              }}
              placeholder={t.missingItemPlaceholder}
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
            />
            {showValidationError && (
              <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                {t.missingValidationError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="missing-item-category"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              {t.missingCategoryLabel}
            </label>
            <select
              id="missing-item-category"
              value={categoryLabel}
              onChange={(e) => setCategoryLabel(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-300 bg-white px-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
            >
              {REQUEST_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="missing-item-notes"
              className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              {t.missingNotesLabel}
            </label>
            <textarea
              id="missing-item-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t.missingNotesPlaceholder}
              className="mt-1.5 w-full rounded-xl border border-stone-300 bg-white px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
            />
          </div>

          <div className="space-y-2.5 border-t border-stone-200 pt-4 dark:border-zinc-800">
            <a
              href={buildTelegramPrefillUrl(formattedBody)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-sky-700"
            >
              <Send className="h-4 w-4 shrink-0" />
              <span>{t.missingSendTelegram} (@tekii18)</span>
            </a>

            <a
              href={buildWhatsAppPrefillUrl(formattedBody)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleLinkClick}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <MessageCircle className="h-4 w-4 shrink-0" />
              <span>{t.missingSendWhatsapp} (+251 925 695 197)</span>
            </a>

            <a
              href={buildEmailPrefillUrl(emailSubject, formattedBody)}
              onClick={handleLinkClick}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-stone-300 bg-stone-50 px-4 py-2.5 text-xs sm:text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100 dark:hover:bg-zinc-800"
            >
              <Mail className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{t.missingSendEmail} (teklemillen0@gmail.com)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
