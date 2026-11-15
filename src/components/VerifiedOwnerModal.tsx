import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { OWNER_PAYMENT_ACCOUNTS } from '../constants/payment';
import { OWNER_DEFAULT_PROFILE } from '../constants/pdfAndCommunity';
import { OWNER_SUPPORT_CONTACTS } from '../constants/support';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { Language, OwnerTrustProfile } from '../types';

interface VerifiedOwnerModalProps {
  isOpen: boolean;
  lang: Language;
  ownerProfile: OwnerTrustProfile;
  onClose: () => void;
}

export const VerifiedOwnerModal: React.FC<VerifiedOwnerModalProps> = ({
  isOpen,
  lang,
  ownerProfile,
  onClose,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [copiedKey, setCopiedKey] = useState<'telebirr' | 'cbe' | null>(null);
  const [imgError, setImgError] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async (key: 'telebirr' | 'cbe', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verified-owner-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2
              id="verified-owner-title"
              className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100"
            >
              {t.verifiedOwnerModalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Portrait Card + Verified Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 rounded-2xl border border-stone-200 bg-stone-50 p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="relative shrink-0">
              <div className="h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-full border-4 border-emerald-600 bg-stone-200 shadow-md dark:border-emerald-500">
                {!imgError ? (
                  <img
                    src={ownerProfile.photoUrl || OWNER_DEFAULT_PROFILE.photoUrl}
                    alt={`${ownerProfile.fullName} — Verified AddisVault Owner`}
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-emerald-800 font-display text-2xl font-bold text-white">
                    TM
                  </div>
                )}
              </div>
              <span
                title={t.verifiedOwnerBadge}
                className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white shadow-sm dark:border-zinc-900"
              >
                <CheckCircle2 className="h-4 w-4" />
              </span>
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>{t.verifiedOwnerBadge}</span>
              </div>
              <h3 className="font-display text-xl font-extrabold text-stone-900 dark:text-stone-100">
                {ownerProfile.fullName}
              </h3>
              <p className="text-xs font-semibold text-stone-600 dark:text-stone-300">
                {ownerProfile.roleTitle[lang]}
              </p>
              <div className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <MapPin className="h-3.5 w-3.5" />
                <span>{ownerProfile.cityCountry}</span>
              </div>
              <p className="pt-1 text-xs sm:text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                {ownerProfile.welcomeBio[lang]}
              </p>
            </div>
          </div>

          {/* Privacy-Protected Ethiopian National ID (Fayda) Verification Shield */}
          <div className="rounded-2xl border border-emerald-300 bg-emerald-50/75 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <div className="space-y-1">
                <div className="font-mono text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Fayda Digital ID · {ownerProfile.faydaMaskedCode}
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-emerald-950 dark:text-emerald-200">
                  {ownerProfile.faydaStatement[lang]}
                </p>
              </div>
            </div>
          </div>

          {/* Official Verified Payment Accounts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.verifiedOwnerPaymentsLabel}
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Smartphone className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      Telebirr (ቴሌብር)
                    </div>
                    <div className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100">
                      {OWNER_PAYMENT_ACCOUNTS.telebirr.number}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('telebirr', OWNER_PAYMENT_ACCOUNTS.telebirr.number)}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
                >
                  {copiedKey === 'telebirr' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedKey === 'telebirr' ? t.copiedBtn : t.copyNumberBtn}</span>
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white p-3.5 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Building2 className="h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      CBE (ንግድ ባንክ)
                    </div>
                    <div className="font-mono text-sm font-bold text-stone-900 dark:text-stone-100 truncate">
                      {OWNER_PAYMENT_ACCOUNTS.cbe.number}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('cbe', OWNER_PAYMENT_ACCOUNTS.cbe.number)}
                  className="inline-flex min-h-[34px] items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
                >
                  {copiedKey === 'cbe' ? (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  <span>{copiedKey === 'cbe' ? t.copiedBtn : t.copyNumberBtn}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Direct 24/7 Owner Support Contacts */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
              {t.verifiedOwnerContactsLabel}
            </h4>
            <div className="grid gap-2.5 sm:grid-cols-3">
              <a
                href={OWNER_SUPPORT_CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span className="truncate">{OWNER_SUPPORT_CONTACTS.whatsappDisplay}</span>
              </a>

              <a
                href={OWNER_SUPPORT_CONTACTS.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300"
              >
                <Send className="h-4 w-4 shrink-0" />
                <span className="truncate">Telegram {OWNER_SUPPORT_CONTACTS.telegramUsername}</span>
              </a>

              <a
                href={OWNER_SUPPORT_CONTACTS.emailUrl}
                className="flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
              >
                <Mail className="h-4 w-4 shrink-0" />
                <span className="truncate">{OWNER_SUPPORT_CONTACTS.email}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
