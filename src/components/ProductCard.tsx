import React, { useState } from 'react';
import { Check, Eye, ShieldCheck, ShoppingBag, Video } from 'lucide-react';
import { DigitalProduct, Language } from '../types';
import { REGION_NAME_BY_ID } from '../constants/educationRegions';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface ProductCardProps {
  product: DigitalProduct;
  lang: Language;
  inCart: boolean;
  isUnlocked: boolean;
  onAddToCart: (productId: string) => void;
  onPreview: (product: DigitalProduct) => void;
  onDownloadFull: (product: DigitalProduct) => void;
}

const PatternOverlay: React.FC<{ pattern: DigitalProduct['accentPattern'] }> = ({ pattern }) => {
  switch (pattern) {
    case 'diamond':
      return (
        <svg className="h-12 w-12 text-amber-300/60" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M24 4L44 24L24 44L4 24L24 4Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M24 12L36 24L24 36L12 24L24 12Z" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'lattice':
      return (
        <svg className="h-12 w-12 text-emerald-300/60" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <rect x="8" y="8" width="32" height="32" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 24H40M24 8V40" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case 'prism':
      return (
        <svg className="h-12 w-12 text-amber-300/60" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <polygon points="24,6 42,38 6,38" stroke="currentColor" strokeWidth="1.5" />
          <polygon points="24,16 34,34 14,34" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 'horizon':
      return (
        <svg className="h-12 w-12 text-emerald-300/60" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 24H40M12 16H36M12 32H36" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case 'weave':
      return (
        <svg className="h-12 w-12 text-amber-300/60" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M8 16L16 8L24 16L32 8L40 16" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 32L16 24L24 32L32 24L40 32" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg className="h-12 w-12 text-emerald-300/60" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <path d="M10 40V22C10 14.268 16.268 8 24 8C31.732 8 38 14.268 38 22V40" stroke="currentColor" strokeWidth="1.5" />
          <path d="M18 40V24C18 20.686 20.686 18 24 18C27.314 18 30 20.686 30 24V40" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
  }
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  lang,
  inCart,
  isUnlocked,
  onAddToCart,
  onPreview,
  onDownloadFull,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-transform duration-200 hover:-translate-y-0.5 dark:border-zinc-800 dark:bg-zinc-900">
      {/* 4:3 Cover Visual Frame */}
      <button
        type="button"
        onClick={() => onPreview(product)}
        className="relative aspect-[4/3] w-full overflow-hidden bg-stone-200 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:bg-zinc-800"
      >
        {!imgFailed ? (
          <img
            src={product.coverImage}
            alt={product.title[lang]}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-950 via-emerald-900 to-zinc-900 p-6">
            <span className="font-display text-sm font-semibold text-emerald-100">
              {product.title[lang]}
            </span>
          </div>
        )}

        {/* Measured Scrim & Ethiopian Motif Edition Mark */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
        <div className="absolute right-3 top-3 opacity-90">
          <PatternOverlay pattern={product.accentPattern} />
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2 text-xs text-stone-200">
          <span className="font-mono tracking-wide text-amber-300">{product.sku}</span>
          <span className="font-mono text-stone-300">{product.fileSize}</span>
        </div>
      </button>

      {/* Card Content */}
      <div className="flex flex-1 flex-col p-5">
        {/* Clean Unboxed Metadata */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs font-medium text-stone-500 dark:text-stone-400">
          <span className="truncate">{t.categories[product.category]}</span>
          {(product.regionId ||
            product.instructionLanguage ||
            product.gradeBand ||
            product.subject ||
            product.bookRole ||
            product.curriculumYearLabel ||
            product.examYear ||
            product.carBrand ||
            product.modelYear ||
            product.track ||
            product.audience) && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-800 dark:text-emerald-400">
                {[
                  product.regionId ? REGION_NAME_BY_ID[product.regionId]?.shortTag : undefined,
                  product.instructionLanguage,
                  product.gradeBand,
                  product.subject,
                  product.bookRole,
                  product.curriculumYearLabel,
                  product.examYear,
                  product.carBrand,
                  product.modelYear,
                  product.track,
                  product.audience,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span className="whitespace-nowrap shrink-0">{product.format}</span>
          {product.availableLanguages && product.availableLanguages.length > 0 && (
            <>
              <span aria-hidden="true">·</span>
              <span className="whitespace-nowrap shrink-0 text-stone-600 dark:text-stone-300">
                {product.availableLanguages.includes('am') ? 'አማ/' : ''}
                {product.availableLanguages.length} Lang
              </span>
            </>
          )}
          {product.hasVideoPreview && (
            <>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 whitespace-nowrap shrink-0">
                <Video className="h-3 w-3" />
                <span>Video</span>
              </span>
            </>
          )}
        </div>

        <h3 className="mt-2 font-display text-base font-bold leading-snug text-stone-900 dark:text-stone-100">
          <button
            type="button"
            onClick={() => onPreview(product)}
            className="text-left hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none"
          >
            {product.title[lang]}
          </button>
        </h3>

        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
          {product.description[lang]}
        </p>

        {/* Price + Actions */}
        <div className="mt-auto pt-5">
          <div className="flex items-baseline justify-between border-t border-stone-100 pt-4 dark:border-zinc-800">
            <span className="font-mono text-lg font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
              {product.priceEtb.toLocaleString()} ETB
            </span>
            {isUnlocked && (
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {t.unlockedLabel}
              </span>
            )}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => onPreview(product)}
              className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-semibold text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 whitespace-nowrap dark:border-zinc-700 dark:bg-zinc-800/70 dark:text-stone-200 dark:hover:bg-zinc-800"
            >
              <Eye className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{t.sampleBtn}</span>
            </button>

            {isUnlocked ? (
              <button
                type="button"
                onClick={() => onDownloadFull(product)}
                className="flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 whitespace-nowrap"
              >
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.downloadFullBtn}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onAddToCart(product.id)}
                className={`flex min-h-[42px] items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 whitespace-nowrap ${
                  inCart
                    ? 'border border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                }`}
              >
                {inCart ? (
                  <Check className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
                )}
                <span className="truncate">{inCart ? t.addedToCartBtn : t.addToCartBtn}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
