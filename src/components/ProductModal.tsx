import React from 'react';
import { CheckCircle2, Download, FileText, ShieldCheck, ShoppingBag, X } from 'lucide-react';
import { DigitalProduct, Language } from '../types';
import { REGION_NAME_BY_ID } from '../constants/educationRegions';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { VideoPreviewPlayer } from './VideoPreviewPlayer';

interface ProductModalProps {
  product: DigitalProduct | null;
  lang: Language;
  isUnlocked: boolean;
  inCart: boolean;
  onClose: () => void;
  onAddToCart: (productId: string) => void;
  onBuyNow: (productId: string) => void;
  onDownloadSample: (product: DigitalProduct) => void;
  onDownloadFull: (product: DigitalProduct) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  lang,
  isUnlocked,
  inCart,
  onClose,
  onAddToCart,
  onBuyNow,
  onDownloadSample,
  onDownloadFull,
}) => {
  if (!product) return null;
  const t = UI_TRANSLATIONS[lang];
  const subMeta = [
    product.regionId ? REGION_NAME_BY_ID[product.regionId]?.name[lang] : undefined,
    product.instructionLanguage,
    product.gradeBand,
    product.subject,
    product.bookRole,
    product.curriculumEdition,
    product.curriculumYearLabel,
    product.examYear,
    product.carBrand,
    product.modelYear,
    product.track,
    product.audience,
  ]
    .filter(Boolean)
    .join(' • ');

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
        {/* Top Cover Banner */}
        <div className="relative h-48 sm:h-56 w-full shrink-0 overflow-hidden bg-zinc-900">
          <img
            src={product.coverImage}
            alt={product.title[lang]}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-amber-300">
              <span className="font-mono">{product.sku}</span>
              <span aria-hidden="true">·</span>
              <span>{t.categories[product.category]}</span>
              {subMeta && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-emerald-300">{subMeta}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{product.format}</span>
            </div>
            <h2
              id="product-modal-title"
              className="mt-1 font-display text-xl sm:text-2xl font-bold text-white"
            >
              {product.title[lang]}
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <p className="text-sm sm:text-base leading-relaxed text-stone-700 dark:text-stone-300">
            {product.description[lang]}
          </p>

          {/* Interactive Video Lesson Preview */}
          {product.hasVideoPreview && (
            <VideoPreviewPlayer
              title={product.title[lang]}
              chapters={product.videoChapters}
              lang={lang}
              availableLanguages={product.availableLanguages}
            />
          )}

          {/* Included Highlights */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              {t.whatsIncluded}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {product.highlights[lang].map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-stone-800 dark:text-stone-200"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Excerpt Preview */}
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-950/60">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                <FileText className="h-4 w-4" />
                <span>{t.samplePreviewTitle}</span>
              </div>
              <button
                type="button"
                onClick={() => onDownloadSample(product)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-emerald-700/30 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 dark:border-emerald-500/30 dark:bg-zinc-900 dark:text-emerald-300 dark:hover:bg-zinc-800"
              >
                <Download className="h-3.5 w-3.5" />
                <span>{t.downloadSampleBtn}</span>
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {product.sampleExcerpt[lang]}
            </p>
          </div>
        </div>

        {/* Sticky Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950/80">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">{product.fileSize} · {product.format}</div>
            <div className="font-mono text-xl font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
              {product.priceEtb.toLocaleString()} ETB
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isUnlocked ? (
              <button
                type="button"
                onClick={() => onDownloadFull(product)}
                className="flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{t.vaultOpenBtn}</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onAddToCart(product.id)}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100 dark:hover:bg-zinc-700"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{inCart ? t.addedToCartBtn : t.addToCartBtn}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onBuyNow(product.id)}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <span>{t.buyNowBtn}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
