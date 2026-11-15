import React, { useEffect, useState } from 'react';
import {
  Check,
  Clock,
  Copy,
  Lock,
  Printer,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { DigitalProduct, Language, PurchaseOrder, VaultAccessToken } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  buildExpiringVaultShareLink,
  getOrCreateDeviceId,
  getShortDeviceTag,
} from '../utils/vaultSecurity';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';

interface SecureVaultReaderModalProps {
  product: DigitalProduct | null;
  order: PurchaseOrder | null;
  token: VaultAccessToken | null;
  lang: Language;
  onClose: () => void;
  onRenewSession: (product: DigitalProduct) => void;
}

function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const SecureVaultReaderModal: React.FC<SecureVaultReaderModalProps> = ({
  product,
  order,
  token,
  lang,
  onClose,
  onRenewSession,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [msLeft, setMsLeft] = useState<number>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsLeft(0);
      return;
    }
    const update = () => {
      setMsLeft(Math.max(0, token.expiresAt - Date.now()));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [token]);

  if (!product || !token) return null;

  const isExpired = msLeft <= 0;
  const deviceShort = getShortDeviceTag(getOrCreateDeviceId());
  const buyerLabel =
    token.buyerLabel || order?.buyerContact || order?.refNumber || 'VIP Member';
  const refTag = order?.refNumber || 'VIP-PASS';
  const watermarkString = `${t.vaultWatermarkLabel}: ${buyerLabel} · Ref ${refTag} · Device ${deviceShort} · AddisVault`;

  const preventPiracyAction = (e: React.SyntheticEvent) => {
    e.preventDefault();
  };

  const handleCopySessionLink = async () => {
    const shareUrl = buildExpiringVaultShareLink(token.tokenId);
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vault-reader-title"
      onContextMenu={preventPiracyAction}
      onCopy={preventPiracyAction}
      onCut={preventPiracyAction}
      onDragStart={preventPiracyAction}
    >
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl select-none dark:border-zinc-800 dark:bg-zinc-950">
        {/* Top Security Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-stone-50 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <div className="min-w-0">
              <div className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-400 truncate">
                {product.sku} · {t.vaultSingleDeviceLock} ({deviceShort})
              </div>
              <h2
                id="vault-reader-title"
                className="font-display text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100 truncate"
              >
                {product.title[lang]}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg border border-amber-300/80 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/40 dark:text-amber-300">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.vaultTokenExpiresIn}:</span>
              <span className="font-mono font-bold tabular-nums">{formatMs(msLeft)}</span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={t.closeBtn}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-200/70 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-zinc-800 dark:hover:text-stone-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Protected Reader Content with Repeating Diagonal Watermark Overlay */}
        <div className="relative flex-1 overflow-y-auto p-5 sm:p-8">
          {/* Dynamic Diagonal Watermark Grid */}
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-20 flex flex-col justify-around overflow-hidden opacity-[0.11] print:opacity-30"
          >
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="flex -rotate-12 justify-around whitespace-nowrap font-mono text-xs sm:text-sm font-bold tracking-wider text-stone-900 dark:text-stone-100"
              >
                <span>{watermarkString}</span>
                <span>{watermarkString}</span>
              </div>
            ))}
          </div>

          {isExpired ? (
            <div className="relative z-10 flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                <Lock className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {t.vaultTokenErrorBanner}
              </h3>
              <button
                type="button"
                onClick={() => onRenewSession(product)}
                className="mt-5 inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
              >
                {t.vaultOpenBtn}
              </button>
            </div>
          ) : (
            <div className="relative z-10 space-y-6">
              {/* Protection Notice Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs text-stone-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300">
                <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                  {t.vaultCopyProtectionActive}
                </span>
                <span className="font-mono text-[11px]">{watermarkString}</span>
              </div>

              {/* Interactive Video Player */}
              {product.hasVideoPreview && (
                <div className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-zinc-800">
                  <VideoPreviewPlayer
                    title={product.title[lang]}
                    chapters={product.videoChapters}
                    lang={lang}
                  />
                </div>
              )}

              {/* Full Licensed Edition Content */}
              <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-7 dark:border-zinc-800 dark:bg-zinc-900/60">
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {t.categories[product.category]} · {product.format} · {product.fileSize}
                  </div>
                  <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {product.title[lang]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    {product.description[lang]}
                  </p>
                </div>

                <div className="border-t border-stone-200 pt-5 dark:border-zinc-800">
                  <h4 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                    1. {t.whatsIncluded}
                  </h4>
                  <ul className="mt-3 space-y-2 text-sm text-stone-700 dark:text-stone-300">
                    {product.highlights[lang].map((line, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          0{i + 1}.
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-stone-200 pt-5 dark:border-zinc-800">
                  <h4 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                    2. Complete Licensed Edition Notes &amp; Answer Explanations
                  </h4>
                  <div className="mt-3 space-y-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
                    <p>{product.sampleExcerpt[lang]}</p>
                    <p>
                      Licensed Edition Summary ({product.sku}): Structured for offline reading on
                      Ethiopian mobile and desktop devices. Every unit concludes with step-by-step
                      worked examples, key terminology, and verified self-check review questions for
                      rapid mastery.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span className="font-mono">{token.tokenId}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopySessionLink}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">{t.copiedBtn}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.vaultShareLinkBtn}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>{t.vaultPrintWatermarkedBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
