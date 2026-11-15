import React from 'react';
import { Crown, Lock, PackageCheck, ShieldCheck, Smartphone, Store } from 'lucide-react';
import { AdConfig, DigitalProduct, Language, PurchaseOrder, VipSubscription } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  getOrCreateDeviceId,
  getShortDeviceTag,
  isOrderBoundToCurrentDevice,
  isVipActiveOnCurrentDevice,
} from '../utils/vaultSecurity';
import { AdSlot } from './AdSlot';

interface DownloadsViewProps {
  lang: Language;
  orders: PurchaseOrder[];
  productsById: Record<string, DigitalProduct>;
  allProducts: DigitalProduct[];
  vipSubscription: VipSubscription | null;
  onOpenInVault: (product: DigitalProduct, order: PurchaseOrder | null) => void;
  onBrowseMarketplace: () => void;
  onOpenVipModal: () => void;
  adConfig: AdConfig;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

export const DownloadsView: React.FC<DownloadsViewProps> = ({
  lang,
  orders,
  productsById,
  allProducts,
  vipSubscription,
  onOpenInVault,
  onBrowseMarketplace,
  onOpenVipModal,
  adConfig,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const deviceId = getOrCreateDeviceId();
  const vipActive = isVipActiveOnCurrentDevice(vipSubscription, deviceId);
  const deviceTag = getShortDeviceTag(deviceId);

  // Collect device-bound unlocked items from verified orders
  const unlockedEntries: {
    product: DigitalProduct;
    order: PurchaseOrder | null;
  }[] = [];
  const seen = new Set<string>();

  for (const order of orders) {
    if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
    for (const item of order.items) {
      const product = productsById[item.productId];
      if (product && !seen.has(product.id)) {
        seen.add(product.id);
        unlockedEntries.push({ product, order });
      }
    }
  }

  // If VIP Pass is active on this device, include all remaining library items
  if (vipActive) {
    for (const product of allProducts) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        unlockedEntries.push({ product, order: null });
      }
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t.downloadsTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600 dark:text-stone-400">
            {t.downloadsSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-medium text-stone-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300">
          <Smartphone className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t.vaultSingleDeviceLock}:</span>
          <strong className="font-mono text-stone-900 dark:text-stone-100">{deviceTag}</strong>
        </div>
      </div>

      {/* Anti-Piracy Content Protection Notice */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/25">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
          <div>
            <div className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-200">
              {t.vaultBannerTitle}
            </div>
            <p className="mt-0.5 text-xs text-emerald-900/80 dark:text-emerald-300/85 leading-relaxed">
              {t.vaultBannerBody}
            </p>
          </div>
        </div>
      </div>

      {/* VIP Status Banner */}
      {vipActive && vipSubscription ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/80 bg-amber-50/60 px-5 py-4 dark:border-amber-700/50 dark:bg-amber-950/20">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                {t.vipActiveTitle}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-300">
                {t.vipExpiresLabel}:{' '}
                <strong className="font-mono">
                  {new Date(vipSubscription.expiresAt).toLocaleDateString()}
                </strong>{' '}
                · Ref <strong className="font-mono">{vipSubscription.refNumber}</strong>
              </div>
            </div>
          </div>
          <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">
            {unlockedEntries.length} / {allProducts.length} Unlocked
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span className="text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300">
              {t.vipModalTitle} — 1,000 ETB/mo · 2,500 ETB/yr · {allProducts.length}+ Items
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenVipModal}
            className="min-h-[38px] rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
          >
            {t.vipBtnLabel}
          </button>
        </div>
      )}

      {unlockedEntries.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <PackageCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            {t.downloadsEmptyTitle}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-stone-600 dark:text-stone-400">
            {t.downloadsEmptyBody}
          </p>
          <button
            type="button"
            onClick={onBrowseMarketplace}
            className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Store className="h-4 w-4" />
            <span>{t.browseStoreBtn}</span>
          </button>
        </div>
      ) : (
        <>
          <div>
            <AdSlot
              slot="download_page"
              adConfig={adConfig}
              lang={lang}
              onTrackImpression={onTrackAdImpression}
              onTrackClick={onTrackAdClick}
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {unlockedEntries.map(({ product, order }) => (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-zinc-900">
                  <img
                    src={product.coverImage}
                    alt={product.title[lang]}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-stone-200">
                    <span className="font-mono text-amber-300">{product.sku}</span>
                    <span className="font-mono">{product.fileSize}</span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {t.categories[product.category]} · {product.format}
                  </div>
                  <h3 className="mt-1.5 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    {product.title[lang]}
                  </h3>

                  <div className="mt-4 space-y-1 border-t border-stone-100 pt-3 text-xs text-stone-600 dark:border-zinc-800 dark:text-stone-400">
                    <div className="flex justify-between">
                      <span>{t.paidVia}</span>
                      <span className="font-semibold text-stone-800 dark:text-stone-200">
                        {order
                          ? order.paymentMethod === 'telebirr'
                            ? 'Telebirr'
                            : 'CBE'
                          : 'VIP All-Access'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.refIdLabel}</span>
                      <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">
                        {order ? order.refNumber : vipSubscription?.refNumber || 'VIP'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.purchasedOn}</span>
                      <span className="tabular-nums">
                        {order
                          ? new Date(order.createdAt).toLocaleDateString()
                          : vipSubscription
                          ? new Date(vipSubscription.activatedAt).toLocaleDateString()
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenInVault(product, order)}
                    className="mt-5 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{t.vaultOpenBtn}</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
};
