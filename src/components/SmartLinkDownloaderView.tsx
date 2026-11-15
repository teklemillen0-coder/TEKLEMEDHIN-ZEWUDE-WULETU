import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Crown,
  Download,
  ExternalLink,
  FileArchive,
  FileCheck2,
  FileText,
  Globe,
  Link2,
  Loader2,
  Lock,
  Music,
  Trash2,
  Video,
  Youtube,
} from 'lucide-react';
import {
  detectPlatformFromUrl,
  getLinkPricingLabel,
  PlatformDetectionResult,
} from '../constants/linkDownloader';
import {
  AdConfig,
  Language,
  LinkDownloadHistoryItem,
  LinkFormatOption,
  LinkPlatformId,
  PendingLinkDownload,
} from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { sanitizeUserInput } from '../utils/appSecurity';
import { AdSlot } from './AdSlot';

interface SmartLinkDownloaderViewProps {
  lang: Language;
  adConfig: AdConfig;
  vipActive: boolean;
  unlockedLinkIds: Set<string>;
  lastConfirmedLinkDownload: PendingLinkDownload | null;
  onConsumeConfirmedLinkDownload: () => void;
  onRequestCheckout: (item: PendingLinkDownload) => void;
  onOpenVipModal: () => void;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

interface InspectedLink {
  url: string;
  filename: string;
  detectedTitle?: string;
  contentType: string;
  fileKind: string;
  isWebPage: boolean;
  sizeBytes: number | null;
}

const SAMPLE_URLS = [
  {
    label: 'YouTube Video / MP3',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    label: 'TikTok HD (No Watermark)',
    url: 'https://www.tiktok.com/@ethiopia_edu/video/7284920194821',
  },
  {
    label: 'Facebook / IG Reel',
    url: 'https://www.facebook.com/watch/?v=10158842910293',
  },
  {
    label: 'Direct PDF Document',
    url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  },
  {
    label: 'Wikipedia Article → PDF',
    url: 'https://en.wikipedia.org/wiki/Ethiopia',
  },
];

function formatBytes(bytes: number | null, fallback: string): string {
  if (!bytes || Number.isNaN(bytes)) return fallback;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function PlatformIcon({ platform }: { platform: LinkPlatformId }) {
  switch (platform) {
    case 'youtube':
      return <Youtube className="h-5 w-5 text-rose-600 dark:text-rose-400" />;
    case 'tiktok':
    case 'facebook':
    case 'instagram':
    case 'twitter':
      return <Video className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />;
    case 'audio':
      return <Music className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    case 'archive':
      return <FileArchive className="h-5 w-5 text-sky-700 dark:text-sky-400" />;
    case 'pdf':
    case 'document':
      return <FileText className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />;
    default:
      return <Globe className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />;
  }
}

export function buildLinkDownloadKey(url: string, formatId: string): string {
  return `LNK:${formatId}:${url.trim()}`;
}

export const SmartLinkDownloaderView: React.FC<SmartLinkDownloaderViewProps> = ({
  lang,
  adConfig,
  vipActive,
  unlockedLinkIds,
  lastConfirmedLinkDownload,
  onConsumeConfirmedLinkDownload,
  onRequestCheckout,
  onOpenVipModal,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inspected, setInspected] = useState<InspectedLink | null>(null);
  const [selectedFormatId, setSelectedFormatId] = useState<string>('');
  const [history, setHistory] = useState<LinkDownloadHistoryItem[]>(() => {
    try {
      const raw = localStorage.getItem('addisvault_link_history');
      return raw ? (JSON.parse(raw) as LinkDownloadHistoryItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_link_history', JSON.stringify(history));
    } catch {
      // Ignore storage errors
    }
  }, [history]);

  // Automatic instant client-side platform detection whenever URL changes
  const liveDetection: PlatformDetectionResult | null = useMemo(
    () => detectPlatformFromUrl(urlInput),
    [urlInput]
  );

  // Keep selectedFormatId synchronized with detected platform options
  useEffect(() => {
    if (liveDetection && liveDetection.formats.length > 0) {
      if (!liveDetection.formats.some((f) => f.id === selectedFormatId)) {
        setSelectedFormatId(liveDetection.formats[0].id);
      }
    } else {
      setSelectedFormatId('');
    }
  }, [liveDetection, selectedFormatId]);

  const activeFormat: LinkFormatOption | null = useMemo(() => {
    if (!liveDetection) return null;
    return (
      liveDetection.formats.find((f) => f.id === selectedFormatId) || liveDetection.formats[0] || null
    );
  }, [liveDetection, selectedFormatId]);

  const triggerProxyDownload = (
    targetUrl: string,
    title: string,
    fmt: LinkFormatOption,
    platformName: string
  ) => {
    const mode = fmt.mode;
    const downloadUrl = `/api/link/download?url=${encodeURIComponent(
      targetUrl
    )}&mode=${mode}&formatLabel=${encodeURIComponent(fmt.label[lang])}&title=${encodeURIComponent(
      title
    )}`;

    const a = document.createElement('a');
    a.href = downloadUrl;
    const baseClean = title.replace(/[^\w\s-]/g, '').trim().slice(0, 48) || 'addisvault-file';
    a.download = mode === 'reader' ? `${baseClean}-offline-reader.html` : `${baseClean}.${fmt.fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    const record: LinkDownloadHistoryItem = {
      id: `LNK-${Date.now().toString().slice(-6)}`,
      url: targetUrl,
      filename: `${title} (${fmt.label[lang]})`,
      fileKind: `${platformName} · ${fmt.priceEtb} ETB`,
      downloadedAt: new Date().toISOString(),
    };
    setHistory((prev) => [record, ...prev].slice(0, 15));
  };

  // Auto-trigger download if returning immediately after checkout confirmation
  useEffect(() => {
    if (!lastConfirmedLinkDownload) return;
    triggerProxyDownload(
      lastConfirmedLinkDownload.url,
      lastConfirmedLinkDownload.title,
      lastConfirmedLinkDownload.formatOption,
      lastConfirmedLinkDownload.platformName
    );
    onConsumeConfirmedLinkDownload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastConfirmedLinkDownload]);

  const handleInspect = async (targetUrl?: string) => {
    const raw = sanitizeUserInput((targetUrl ?? urlInput).trim(), 1000);
    if (!raw) return;

    setLoading(true);
    setErrorMsg(null);
    setInspected(null);

    try {
      const res = await fetch('/api/link/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: raw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Could not inspect this URL.');
        return;
      }
      setInspected(data as InspectedLink);
    } catch {
      setErrorMsg('Network error reaching AddisVault link resolver.');
    } finally {
      setLoading(false);
    }
  };

  const resolvedTitle =
    inspected?.detectedTitle || inspected?.filename || liveDetection?.inferredTitle || 'Media / File';
  const currentDownloadKey =
    liveDetection && activeFormat ? buildLinkDownloadKey(urlInput, activeFormat.id) : '';
  const isAlreadyUnlocked = vipActive || (currentDownloadKey ? unlockedLinkIds.has(currentDownloadKey) : false);

  const handleDownloadAction = () => {
    if (!liveDetection || !activeFormat) return;
    const cleanUrl = sanitizeUserInput(urlInput.trim(), 1000);
    if (!cleanUrl) return;

    if (isAlreadyUnlocked) {
      triggerProxyDownload(cleanUrl, resolvedTitle, activeFormat, liveDetection.platformName);
      return;
    }

    onRequestCheckout({
      id: buildLinkDownloadKey(cleanUrl, activeFormat.id),
      url: cleanUrl,
      platform: liveDetection.platform,
      platformName: liveDetection.platformName,
      title: resolvedTitle,
      formatOption: activeFormat,
    });
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header & Input Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-amber-400">
              <Link2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
                {t.linkToolTitle}
              </h1>
              <p className="mt-2 max-w-3xl text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-400">
                {t.linkToolSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenVipModal}
            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300"
          >
            <Crown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{getLinkPricingLabel(lang)}</span>
          </button>
        </div>

        {/* Tiered Micro-Pricing Guide */}
        <p className="mt-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs font-medium text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-300">
          {t.linkPricingTierNote}
        </p>

        {/* URL Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleInspect();
          }}
          className="mt-5 flex flex-col gap-3 sm:flex-row"
        >
          <input
            type="url"
            required
            value={urlInput}
            onChange={(e) => {
              setUrlInput(sanitizeUserInput(e.target.value, 1000));
              setErrorMsg(null);
            }}
            placeholder={t.linkInputPlaceholder}
            aria-label={t.linkInputPlaceholder}
            className="h-12 flex-1 rounded-xl border border-stone-300 bg-stone-50 px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
          />
          <button
            type="submit"
            disabled={loading || !urlInput.trim()}
            className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap shrink-0 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t.linkInspecting}</span>
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                <span>{t.linkInspectBtn}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Sample Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {t.linkQuickExamples}
          </span>
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample.url}
              type="button"
              onClick={() => {
                setUrlInput(sample.url);
                handleInspect(sample.url);
              }}
              className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium text-stone-700 transition-colors hover:border-emerald-600 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
            >
              {sample.label}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Live Preview & Format/Quality Tier Selector Card (Appears immediately upon pasting URL) */}
      {liveDetection && activeFormat && (
        <div className="rounded-2xl border-2 border-emerald-700/35 bg-white p-6 shadow-sm space-y-5 dark:border-emerald-500/35 dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-stone-100 pb-4 dark:border-zinc-800">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
                <PlatformIcon platform={liveDetection.platform} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>
                    {t.linkDetectedLabel}: {liveDetection.platformName}
                  </span>
                  {inspected?.sizeBytes && (
                    <span className="font-mono text-stone-500 dark:text-stone-400">
                      · {formatBytes(inspected.sizeBytes, t.linkSizeUnknown)}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-display text-lg font-bold text-stone-900 break-words dark:text-stone-100">
                  {resolvedTitle}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 break-all dark:text-stone-400">
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span>{urlInput}</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {vipActive ? 'VIP Pass' : 'Fee'}
              </div>
              <div className="font-mono text-2xl font-extrabold tabular-nums text-emerald-800 dark:text-emerald-400">
                {vipActive ? '0 ETB' : `${activeFormat.priceEtb} ETB`}
              </div>
            </div>
          </div>

          {/* Selectable Format / Quality Tier Options */}
          <div>
            <div className="text-xs font-semibold text-stone-700 dark:text-stone-300 mb-2.5">
              {t.linkSelectFormatLabel}
            </div>
            <div className="grid gap-2.5 sm:grid-cols-3">
              {liveDetection.formats.map((opt) => {
                const selected = opt.id === activeFormat.id;
                const unlockedOpt = vipActive || unlockedLinkIds.has(buildLinkDownloadKey(urlInput, opt.id));
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedFormatId(opt.id)}
                    className={`rounded-xl border p-3.5 text-left transition-colors ${
                      selected
                        ? 'border-emerald-700 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/30'
                        : 'border-stone-200 bg-stone-50/60 hover:border-stone-300 dark:border-zinc-800 dark:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono uppercase font-bold text-stone-500 dark:text-stone-400">
                        .{opt.fileExt}
                      </span>
                      <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-400">
                        {unlockedOpt ? '0 ETB / Free' : `${opt.priceEtb} ETB`}
                      </span>
                    </div>
                    <div className="mt-1 text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100">
                      {opt.label[lang]}
                    </div>
                    <div className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                      {opt.qualityNote}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Checkout / Instant Download CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-400">
              {isAlreadyUnlocked ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Ready for instant download on this device</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Pay via Telebirr (0925695197) or CBE (1000211261513) to unlock</span>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleDownloadAction}
              className={`inline-flex min-h-[46px] items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-colors ${
                isAlreadyUnlocked
                  ? 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600'
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Download className="h-4 w-4" />
              <span>
                {vipActive
                  ? t.linkFreeVipBtn
                  : isAlreadyUnlocked
                  ? t.linkUnlockedBtn
                  : `${t.linkPayAndDownloadBtn} (${activeFormat.priceEtb} ETB)`}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Download Banner Ad Zone */}
      <AdSlot
        slot="download_page"
        adConfig={adConfig}
        lang={lang}
        onTrackImpression={onTrackAdImpression}
        onTrackClick={onTrackAdClick}
      />

      {/* Recent Download History */}
      {history.length > 0 && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-4 dark:border-zinc-800">
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              {t.linkHistoryTitle}
            </h2>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-rose-600 dark:text-stone-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.linkClearHistory}</span>
            </button>
          </div>
          <ul className="mt-4 divide-y divide-stone-100 dark:divide-zinc-800">
            {history.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-stone-900 truncate dark:text-stone-100">
                    {item.filename}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {item.fileKind} · {new Date(item.downloadedAt).toLocaleString()}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <FileCheck2 className="h-3.5 w-3.5" />
                  <span>Saved</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
