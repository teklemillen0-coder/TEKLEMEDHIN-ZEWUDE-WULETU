import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { AdConfig, AdSlotId, DirectSponsorBanner, Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface AdSlotProps {
  slot: AdSlotId;
  adConfig: AdConfig;
  lang: Language;
  variantIndex?: number;
  onTrackImpression?: () => void;
  onTrackClick?: () => void;
  className?: string;
}

const SLOT_HEIGHT_CLASSES: Record<AdSlotId, string> = {
  top_banner: 'h-[108px] sm:h-[112px]',
  in_feed: 'h-[136px] sm:h-[124px]',
  download_page: 'h-[104px] sm:h-[108px]',
  footer_banner: 'h-[104px] sm:h-[108px]',
};

let adsenseScriptInjected = false;

export const AdSlot: React.FC<AdSlotProps> = ({
  slot,
  adConfig,
  lang,
  variantIndex = 0,
  onTrackImpression,
  onTrackClick,
  className = '',
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [asyncReady, setAsyncReady] = useState(false);
  const trackedRef = useRef(false);

  const isSlotEnabled = adConfig.adsEnabled && adConfig.enabledSlots[slot];

  // Defer third-party network script hydration so catalog & checkout remain instant on slow mobile data
  useEffect(() => {
    if (!isSlotEnabled) return;
    const timer = window.setTimeout(() => {
      setAsyncReady(true);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [isSlotEnabled]);

  // Pick best direct sponsor (custom first, then demo if enabled)
  const resolvedSponsor: DirectSponsorBanner | null = useMemo(() => {
    const customMatches = adConfig.directSponsors.filter(
      (b) => b.active && !b.isDemo && (b.slot === slot || b.slot === 'all')
    );
    if (customMatches.length > 0) {
      return customMatches[variantIndex % customMatches.length];
    }
    if (adConfig.showDemoBanners) {
      const demoMatches = adConfig.directSponsors.filter(
        (b) => b.active && b.isDemo && (b.slot === slot || b.slot === 'all')
      );
      const allActiveDemos = adConfig.directSponsors.filter((b) => b.active && b.isDemo);
      if (slot === 'in_feed' && allActiveDemos.length > 0) {
        return allActiveDemos[(variantIndex + 1) % allActiveDemos.length];
      }
      if (demoMatches.length > 0) {
        return demoMatches[variantIndex % demoMatches.length];
      }
    }
    return null;
  }, [adConfig.directSponsors, adConfig.showDemoBanners, slot, variantIndex]);

  const hasAdsense = Boolean(
    adConfig.adsense.publisherId.trim() &&
      (adConfig.adsense.slotIds[slot]?.trim() || adConfig.adsense.unitCode.trim())
  );

  const thirdPartyCode = useMemo(() => {
    if (slot === 'in_feed' && adConfig.thirdParty.nativeScript.trim()) {
      return adConfig.thirdParty.nativeScript.trim();
    }
    return adConfig.thirdParty.bannerScript.trim();
  }, [adConfig.thirdParty.bannerScript, adConfig.thirdParty.nativeScript, slot]);

  const hasThirdParty = Boolean(thirdPartyCode);

  const resolvedMode = useMemo(() => {
    const hasCustomSponsor = Boolean(resolvedSponsor && !resolvedSponsor.isDemo);
    if (adConfig.activeSource === 'adsense' && hasAdsense) return 'adsense';
    if (adConfig.activeSource === 'third_party' && hasThirdParty) return 'third_party';
    if (adConfig.activeSource === 'direct_sponsor' && resolvedSponsor) return 'sponsor';

    // Smart Auto priority: Custom Ethiopian Sponsor -> Live AdSense -> Live 3P Script -> Demo Banner
    if (hasCustomSponsor) return 'sponsor';
    if (hasAdsense) return 'adsense';
    if (hasThirdParty) return 'third_party';
    if (resolvedSponsor) return 'sponsor';
    return 'none';
  }, [adConfig.activeSource, hasAdsense, hasThirdParty, resolvedSponsor]);

  // Asynchronously inject AdSense library once if AdSense mode is active
  useEffect(() => {
    if (!isSlotEnabled || !asyncReady || resolvedMode !== 'adsense') return;
    const pubId = adConfig.adsense.publisherId.trim();
    if (!pubId) return;

    if (!adsenseScriptInjected && typeof document !== 'undefined') {
      adsenseScriptInjected = true;
      const script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        pubId
      )}`;
      document.head.appendChild(script);
    }

    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      // Ignore if blocked by ad-blocker
    }
  }, [isSlotEnabled, asyncReady, resolvedMode, adConfig.adsense.publisherId]);

  useEffect(() => {
    if (isSlotEnabled && resolvedMode !== 'none' && !trackedRef.current) {
      trackedRef.current = true;
      onTrackImpression?.();
    }
  }, [isSlotEnabled, resolvedMode, onTrackImpression]);

  if (!isSlotEnabled || resolvedMode === 'none') {
    return null;
  }

  const heightClass = SLOT_HEIGHT_CLASSES[slot];

  const thirdPartySrcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;overflow:hidden;background:transparent;font-family:system-ui,sans-serif;}</style></head><body>${thirdPartyCode}</body></html>`;

  return (
    <aside
      aria-label={t.sponsoredLabel}
      className={`w-full overflow-hidden rounded-2xl border border-stone-200/90 bg-white dark:border-zinc-800 dark:bg-zinc-900/90 ${heightClass} ${className}`}
    >
      <div className="flex h-full flex-col justify-between px-3.5 py-2 sm:px-5 sm:py-2.5">
        {/* Clean Unboxed Sponsored Label */}
        <div className="flex items-center justify-between text-[11px] font-medium text-stone-500 dark:text-stone-400">
          <span>{t.sponsoredLabel}</span>
          {resolvedMode === 'sponsor' && resolvedSponsor?.isDemo && (
            <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400">
              Demo Preview
            </span>
          )}
        </div>

        {/* Fixed-Height Content Area */}
        <div className="flex flex-1 items-center overflow-hidden pt-1">
          {resolvedMode === 'adsense' && (
            <div className="flex h-full w-full items-center justify-center overflow-hidden">
              {asyncReady ? (
                <ins
                  className="adsbygoogle block w-full h-full"
                  style={{ display: 'block', width: '100%', height: '100%' }}
                  data-ad-client={adConfig.adsense.publisherId.trim()}
                  data-ad-slot={adConfig.adsense.slotIds[slot]?.trim() || adConfig.adsense.unitCode.trim()}
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                />
              ) : (
                <div className="h-full w-full rounded-lg bg-stone-100 dark:bg-zinc-800/60" />
              )}
            </div>
          )}

          {resolvedMode === 'third_party' && (
            <div className="h-full w-full overflow-hidden rounded-lg">
              {asyncReady ? (
                <iframe
                  title={`${adConfig.thirdParty.network} ${slot}`}
                  srcDoc={thirdPartySrcDoc}
                  loading="lazy"
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                  className="h-full w-full border-0 overflow-hidden"
                />
              ) : (
                <div className="h-full w-full rounded-lg bg-stone-100 dark:bg-zinc-800/60" />
              )}
            </div>
          )}

          {resolvedMode === 'sponsor' && resolvedSponsor && (
            <a
              href={resolvedSponsor.targetUrl || '#catalog'}
              target={resolvedSponsor.targetUrl.startsWith('http') ? '_blank' : undefined}
              rel={resolvedSponsor.targetUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              onClick={() => onTrackClick?.()}
              className="group flex h-full w-full items-center justify-between gap-3 sm:gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                {resolvedSponsor.imageDataUrl ? (
                  <img
                    src={resolvedSponsor.imageDataUrl}
                    alt={resolvedSponsor.title}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-14 w-24 sm:h-16 sm:w-32 shrink-0 rounded-xl border border-stone-200 object-cover dark:border-zinc-700"
                  />
                ) : (
                  <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-400">
                    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
                      <path d="M16 4L28 16L16 28L4 16L16 4Z" stroke="currentColor" strokeWidth="2" />
                      <circle cx="16" cy="16" r="3.5" fill="#10B981" />
                    </svg>
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-sm sm:text-base font-bold text-stone-900 group-hover:text-emerald-700 dark:text-stone-100 dark:group-hover:text-emerald-400">
                    {resolvedSponsor.title}
                  </div>
                  <p className="truncate text-xs text-stone-600 dark:text-stone-400">
                    {resolvedSponsor.subtitle}
                  </p>
                </div>
              </div>

              <span className="inline-flex min-h-[36px] shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors group-hover:bg-emerald-800 whitespace-nowrap dark:bg-emerald-600 dark:group-hover:bg-emerald-500">
                <span>{resolvedSponsor.ctaLabel || 'Learn More'}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </a>
          )}
        </div>
      </div>
    </aside>
  );
};
