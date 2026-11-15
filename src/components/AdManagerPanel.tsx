import React, { useState } from 'react';
import {
  Check,
  Code2,
  Eye,
  ImagePlus,
  Megaphone,
  MousePointerClick,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from 'lucide-react';
import { DEMO_SPONSOR_BANNERS } from '../constants/ads';
import {
  ActiveAdSource,
  AdConfig,
  AdSlotId,
  DirectSponsorBanner,
  Language,
  ThirdPartyNetwork,
} from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface AdManagerPanelProps {
  lang: Language;
  adConfig: AdConfig;
  onUpdateAdConfig: (next: AdConfig) => void;
}

const SLOT_LIST: AdSlotId[] = ['top_banner', 'in_feed', 'download_page', 'footer_banner'];

export const AdManagerPanel: React.FC<AdManagerPanelProps> = ({
  lang,
  adConfig,
  onUpdateAdConfig,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [draft, setDraft] = useState<AdConfig>(adConfig);
  const [savedNotice, setSavedNotice] = useState(false);

  // New Direct Sponsor form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCta, setNewCta] = useState('Visit Offer');
  const [newUrl, setNewUrl] = useState('https://');
  const [newSlot, setNewSlot] = useState<AdSlotId | 'all'>('all');
  const [newImageDataUrl, setNewImageDataUrl] = useState<string>('');

  const slotLabel = (slot: AdSlotId) => {
    switch (slot) {
      case 'top_banner':
        return t.slotTopBanner;
      case 'in_feed':
        return t.slotInFeed;
      case 'download_page':
        return t.slotDownloadPage;
      case 'footer_banner':
        return t.slotFooterBanner;
    }
  };

  const commitConfig = (updated: AdConfig) => {
    setDraft(updated);
    onUpdateAdConfig(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleToggleMaster = () => {
    const next = { ...draft, adsEnabled: !draft.adsEnabled };
    commitConfig(next);
  };

  const handleToggleDemo = () => {
    const next = { ...draft, showDemoBanners: !draft.showDemoBanners };
    commitConfig(next);
  };

  const handleToggleSlot = (slot: AdSlotId) => {
    const next = {
      ...draft,
      enabledSlots: {
        ...draft.enabledSlots,
        [slot]: !draft.enabledSlots[slot],
      },
    };
    commitConfig(next);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setNewImageDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const banner: DirectSponsorBanner = {
      id: `sponsor-${Date.now()}`,
      title: newTitle.trim(),
      subtitle: newSubtitle.trim() || 'Ethiopian Digital Marketplace Partner',
      ctaLabel: newCta.trim() || 'Learn More',
      targetUrl: newUrl.trim() || '#catalog',
      imageDataUrl: newImageDataUrl || undefined,
      slot: newSlot,
      active: true,
      isDemo: false,
    };

    const next: AdConfig = {
      ...draft,
      directSponsors: [banner, ...draft.directSponsors],
    };
    commitConfig(next);
    setNewTitle('');
    setNewSubtitle('');
    setNewCta('Visit Offer');
    setNewUrl('https://');
    setNewImageDataUrl('');
  };

  const handleToggleSponsor = (id: string) => {
    const next: AdConfig = {
      ...draft,
      directSponsors: draft.directSponsors.map((s) =>
        s.id === id ? { ...s, active: !s.active } : s
      ),
    };
    commitConfig(next);
  };

  const handleDeleteSponsor = (id: string) => {
    const next: AdConfig = {
      ...draft,
      directSponsors: draft.directSponsors.filter((s) => s.id !== id),
    };
    commitConfig(next);
  };

  const handleRestoreDemos = () => {
    const customOnly = draft.directSponsors.filter((s) => !s.isDemo);
    const next: AdConfig = {
      ...draft,
      showDemoBanners: true,
      directSponsors: [...customOnly, ...DEMO_SPONSOR_BANNERS],
    };
    commitConfig(next);
  };

  return (
    <div className="space-y-6">
      {/* Top Control Bar + Metrics */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                {t.adManagerTitle}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                {t.adManagerSubtitle}
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleMaster}
              className={`min-h-[44px] rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                draft.adsEnabled
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600'
                  : 'border border-stone-300 bg-stone-100 text-stone-700 hover:bg-stone-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200'
              }`}
            >
              {draft.adsEnabled ? t.adsMasterOn : t.adsMasterOff}
            </button>
          </div>

          <div className="mt-5 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                {t.activeSourceLabel}
              </label>
              <select
                value={draft.activeSource}
                onChange={(e) =>
                  commitConfig({ ...draft, activeSource: e.target.value as ActiveAdSource })
                }
                className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs sm:text-sm font-medium text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              >
                <option value="auto">{t.sourceAuto}</option>
                <option value="adsense">{t.sourceAdsense}</option>
                <option value="third_party">{t.sourceThirdParty}</option>
                <option value="direct_sponsor">{t.sourceDirect}</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex min-h-[44px] w-full cursor-pointer items-center gap-3 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-300">
                <input
                  type="checkbox"
                  checked={draft.showDemoBanners}
                  onChange={handleToggleDemo}
                  className="h-4 w-4 accent-emerald-700"
                />
                <span>{t.demoBannersLabel}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Ad Performance Counters */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              <Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.adImpressionsLabel}</span>
            </div>
            <div className="mt-3 font-mono text-2xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
              {adConfig.stats.impressions.toLocaleString()}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              <MousePointerClick className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
              <span>{t.adClicksLabel}</span>
            </div>
            <div className="mt-3 font-mono text-2xl font-extrabold tabular-nums text-amber-700 dark:text-amber-400">
              {adConfig.stats.clicks.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Placement Zone Toggles */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
          {t.adSlotsTitle}
        </h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SLOT_LIST.map((slot) => {
            const active = draft.enabledSlots[slot];
            return (
              <button
                key={slot}
                type="button"
                onClick={() => handleToggleSlot(slot)}
                className={`flex min-h-[48px] items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                  active
                    ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/30 dark:text-emerald-300'
                    : 'border-stone-200 bg-stone-50 text-stone-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-400'
                }`}
              >
                <span className="truncate">{slotLabel(slot)}</span>
                <span className="font-mono text-[11px] uppercase shrink-0">
                  {active ? 'ON' : 'OFF'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Network Code Inputs: Google AdSense + Adsterra / Monetag / PopAds */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Google AdSense */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              {t.adsenseSectionTitle}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.adsensePublisherLabel}
            </label>
            <input
              type="text"
              value={draft.adsense.publisherId}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  adsense: { ...draft.adsense, publisherId: e.target.value },
                })
              }
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 font-mono text-xs text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.adsenseUnitCodeLabel}
            </label>
            <textarea
              rows={3}
              value={draft.adsense.unitCode}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  adsense: { ...draft.adsense, unitCode: e.target.value },
                })
              }
              placeholder="1234567890 or paste <ins class='adsbygoogle' ...>"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {SLOT_LIST.map((slot) => (
              <div key={slot}>
                <label className="block text-[11px] font-medium text-stone-500 dark:text-stone-400 truncate">
                  {slotLabel(slot)} Slot ID
                </label>
                <input
                  type="text"
                  value={draft.adsense.slotIds[slot]}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      adsense: {
                        ...draft.adsense,
                        slotIds: { ...draft.adsense.slotIds, [slot]: e.target.value },
                      },
                    })
                  }
                  placeholder="Optional override"
                  className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 font-mono text-xs text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Adsterra / Monetag / PopAds */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              {t.thirdPartySectionTitle}
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.thirdPartyNetworkLabel}
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {(['adsterra', 'monetag', 'popads'] as ThirdPartyNetwork[]).map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      thirdParty: { ...draft.thirdParty, network: net },
                    })
                  }
                  className={`min-h-[40px] rounded-xl border px-3 text-xs font-semibold capitalize transition-colors ${
                    draft.thirdParty.network === net
                      ? 'border-amber-600 bg-amber-600 text-white'
                      : 'border-stone-200 bg-stone-50 text-stone-700 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-300'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.thirdPartyBannerScriptLabel}
            </label>
            <textarea
              rows={3}
              value={draft.thirdParty.bannerScript}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  thirdParty: { ...draft.thirdParty, bannerScript: e.target.value },
                })
              }
              placeholder="<script type='text/javascript' src='//...'></script>"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.thirdPartyNativeScriptLabel}
            </label>
            <textarea
              rows={3}
              value={draft.thirdParty.nativeScript}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  thirdParty: { ...draft.thirdParty, nativeScript: e.target.value },
                })
              }
              placeholder="<script async src='//...'></script><div id='container-...'></div>"
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>
        </div>
      </div>

      {/* Save Scripts Button */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        {savedNotice && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Check className="h-4 w-4" />
            <span>{t.adSettingsSaved}</span>
          </span>
        )}
        <button
          type="button"
          onClick={() => commitConfig(draft)}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          <Save className="h-4 w-4" />
          <span>{t.saveAdSettingsBtn}</span>
        </button>
      </div>

      {/* Direct Local Ethiopian Sponsors Manager */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-zinc-800">
          <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
            {t.directSponsorSectionTitle}
          </h3>
          <button
            type="button"
            onClick={handleRestoreDemos}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>{t.resetDemoBtn}</span>
          </button>
        </div>

        {/* Add Custom Sponsor Form */}
        <form onSubmit={handleAddSponsor} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.sponsorTitleLabel} *
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Abyssinia Coffee Roasters"
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.sponsorSubtitleLabel}
            </label>
            <input
              type="text"
              value={newSubtitle}
              onChange={(e) => setNewSubtitle(e.target.value)}
              placeholder="e.g. 20% off wholesale orders in Addis"
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.sponsorUrlLabel}
            </label>
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.et"
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.sponsorCtaLabel}
            </label>
            <input
              type="text"
              value={newCta}
              onChange={(e) => setNewCta(e.target.value)}
              placeholder="Order Now"
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.sponsorSlotLabel}
            </label>
            <select
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value as AdSlotId | 'all')}
              className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            >
              <option value="all">{t.slotAll}</option>
              {SLOT_LIST.map((s) => (
                <option key={s} value={s}>
                  {slotLabel(s)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              {t.sponsorImageUploadLabel}
            </label>
            <label className="mt-1.5 flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-3 text-xs font-medium text-stone-700 hover:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-300">
              <ImagePlus className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
              <span className="truncate">
                {newImageDataUrl ? 'Image ready' : t.sponsorImageUploadLabel}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700"
            >
              <Plus className="h-4 w-4" />
              <span>{t.addSponsorBtn}</span>
            </button>
          </div>
        </form>

        {/* Active Sponsor Banners List */}
        <div className="divide-y divide-stone-100 border-t border-stone-100 pt-2 dark:divide-zinc-800 dark:border-zinc-800">
          {draft.directSponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {sponsor.imageDataUrl && (
                  <img
                    src={sponsor.imageDataUrl}
                    alt={sponsor.title}
                    className="h-11 w-16 shrink-0 rounded-lg border border-stone-200 object-cover dark:border-zinc-700"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-stone-100">
                    <span className="truncate">{sponsor.title}</span>
                    {sponsor.isDemo && (
                      <span className="font-mono text-[10px] text-amber-700 dark:text-amber-400 shrink-0">
                        DEMO
                      </span>
                    )}
                  </div>
                  <div className="truncate text-xs text-stone-500 dark:text-stone-400">
                    {sponsor.slot === 'all' ? t.slotAll : slotLabel(sponsor.slot)} · {sponsor.targetUrl}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleSponsor(sponsor.id)}
                  className={`min-h-[36px] rounded-lg px-3 py-1 text-xs font-semibold ${
                    sponsor.active
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-stone-400'
                  }`}
                >
                  {sponsor.active ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSponsor(sponsor.id)}
                  aria-label={t.removeLabel}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
