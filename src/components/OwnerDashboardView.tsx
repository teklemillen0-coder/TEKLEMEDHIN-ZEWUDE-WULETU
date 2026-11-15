import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  KeyRound,
  Lock,
  LockOpen,
  Megaphone,
  MessageCircle,
  Scale,
  Send,
  ShieldCheck,
  TrendingUp,
  Upload,
  UserCheck,
} from 'lucide-react';
import { OWNER_DEFAULT_PROFILE } from '../constants/pdfAndCommunity';
import {
  AdConfig,
  CategoryId,
  ExpediterRequest,
  ExpediterStatus,
  Language,
  LegalConsultationBooking,
  OwnerTrustProfile,
  PurchaseOrder,
} from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { downloadSalesCsv } from '../utils/fileGenerator';
import { hashOwnerPin, sanitizeUserInput, verifyOwnerPin } from '../utils/appSecurity';
import { AdManagerPanel } from './AdManagerPanel';

interface OwnerDashboardViewProps {
  lang: Language;
  orders: PurchaseOrder[];
  adConfig: AdConfig;
  onUpdateAdConfig: (next: AdConfig) => void;
  expediterRequests: ExpediterRequest[];
  consultBookings?: LegalConsultationBooking[];
  onUpdateExpediterRequest: (
    id: string,
    patch: { status: ExpediterStatus; ownerReply?: string; quoteEtb?: number }
  ) => Promise<void>;
  ownerProfile: OwnerTrustProfile;
  onUpdateOwnerProfile: (next: OwnerTrustProfile) => void;
}

const ALL_CATEGORIES: CategoryId[] = [
  'education',
  'national_exams',
  'law_academy',
  'video_arts',
  'culinary',
  'medical',
  'research_history',
  'business_diaspora',
  'childrens_books',
  'gov_manuals',
  'repair_kits',
  'livestock',
  'business_ideas',
  'taxpayer_ed',
  'electronics_manuals',
  'architecture_plans',
  'auto_mechanic',
];

const EXPEDITER_STATUSES: ExpediterStatus[] = ['Pending', 'In Progress', 'Quoted', 'Completed'];

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  lang,
  orders,
  adConfig,
  onUpdateAdConfig,
  expediterRequests,
  consultBookings = [],
  onUpdateExpediterRequest,
  ownerProfile,
  onUpdateOwnerProfile,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [subTab, setSubTab] = useState<'sales' | 'ads' | 'expediter' | 'consults' | 'owner_profile'>('sales');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);
  const [storedPinHash, setStoredPinHash] = useState<string | null>(() => {
    try {
      return localStorage.getItem('addisvault_owner_pin');
    } catch {
      return null;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isDashboardUnlocked, setIsDashboardUnlocked] = useState(false);
  const [newPinInput, setNewPinInput] = useState('');
  const [pinSavedMsg, setPinSavedMsg] = useState(false);

  const [draftEdits, setDraftEdits] = useState<
    Record<string, { status: ExpediterStatus; ownerReply: string; quoteEtb: string }>
  >({});
  const [savedReqId, setSavedReqId] = useState<string | null>(null);

  const totalEarned = orders.reduce((sum, o) => sum + o.totalEtb, 0);
  const telebirrEarned = orders
    .filter((o) => o.paymentMethod === 'telebirr')
    .reduce((sum, o) => sum + o.totalEtb, 0);
  const cbeEarned = orders
    .filter((o) => o.paymentMethod === 'cbe')
    .reduce((sum, o) => sum + o.totalEtb, 0);
  const unitsSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((iSum, item) => iSum + item.quantity, 0),
    0
  );
  const avgOrderValue = orders.length > 0 ? Math.round(totalEarned / orders.length) : 0;

  const categoryTotals: Record<CategoryId, number> = {
    education: 0,
    national_exams: 0,
    law_academy: 0,
    video_arts: 0,
    culinary: 0,
    medical: 0,
    research_history: 0,
    business_diaspora: 0,
    childrens_books: 0,
    gov_manuals: 0,
    repair_kits: 0,
    livestock: 0,
    business_ideas: 0,
    taxpayer_ed: 0,
    electronics_manuals: 0,
    architecture_plans: 0,
    auto_mechanic: 0,
  };

  const handleUnlockDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyOwnerPin(pinInput, storedPinHash)) {
      setIsDashboardUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleChangeOwnerPin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = sanitizeUserInput(newPinInput, 24).trim();
    if (trimmed.length < 4) return;
    const nextStored = `HASH:${hashOwnerPin(trimmed)}`;
    setStoredPinHash(nextStored);
    try {
      localStorage.setItem('addisvault_owner_pin', nextStored);
    } catch {
      // Ignore
    }
    setNewPinInput('');
    setPinSavedMsg(true);
    setTimeout(() => setPinSavedMsg(false), 2500);
  };

  for (const order of orders) {
    const orderRawSubtotal = order.subtotalEtb || 1;
    const ratio = order.totalEtb / orderRawSubtotal;
    for (const item of order.items) {
      if (item.category in categoryTotals) {
        categoryTotals[item.category] += Math.round(item.priceEtb * item.quantity * ratio);
      }
    }
  }

  const maxCatRevenue = Math.max(1, ...Object.values(categoryTotals));

  if (!isDashboardUnlocked) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-7 text-center space-y-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Enterprise Security Gate</span>
            </div>
            <h1 className="mt-1.5 font-display text-xl font-bold text-stone-900 dark:text-stone-100">
              Owner Dashboard PIN Required
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-stone-600 dark:text-stone-400">
              Revenue ledgers, Telebirr/CBE order records, Ad Manager scripts, Legal Consultations, and Expediter Inbox are protected. Default Owner PIN:{' '}
              <strong className="font-mono text-stone-900 dark:text-stone-100">0925</strong>
            </p>
          </div>
          <form onSubmit={handleUnlockDashboard} className="space-y-3">
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="Enter Owner PIN (0925)"
              className="h-12 w-full rounded-xl border border-stone-300 bg-stone-50 px-4 text-center font-mono text-lg tracking-widest focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
            {pinError && (
              <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Incorrect Owner PIN. Default is 0925.
              </p>
            )}
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
            >
              <KeyRound className="h-4 w-4" />
              <span>Unlock Owner Dashboard</span>
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t.dashboardTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm sm:text-base text-stone-600 dark:text-stone-400">
            {t.dashboardSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sub-navigation tabs */}
          <div
            className="flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-zinc-800 dark:bg-zinc-900"
            role="tablist"
            aria-label="Owner Dashboard Sections"
          >
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'sales'}
              onClick={() => setSubTab('sales')}
              className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'sales'
                  ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-800 dark:text-stone-100'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              {t.salesLedgerTab}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'ads'}
              onClick={() => setSubTab('ads')}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'ads'
                  ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span>{t.adManagerTab}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'expediter'}
              onClick={() => setSubTab('expediter')}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'expediter'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Expediter ({expediterRequests.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'consults'}
              onClick={() => setSubTab('consults')}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'consults'
                  ? 'bg-sky-700 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Legal Consults ({consultBookings.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={subTab === 'owner_profile'}
              onClick={() => setSubTab('owner_profile')}
              className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                subTab === 'owner_profile'
                  ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                  : 'text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Owner Profile</span>
            </button>
          </div>

          {subTab === 'sales' && (
            <button
              type="button"
              onClick={() => downloadSalesCsv(orders)}
              disabled={orders.length === 0}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100 dark:hover:bg-zinc-800"
            >
              <Download className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <span>{t.exportCsvBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDashboardUnlocked(false)}
            className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
          >
            <LockOpen className="h-3.5 w-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Security PIN Update Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Owner Dashboard Authenticated · Update PIN anytime</span>
        </div>
        <form onSubmit={handleChangeOwnerPin} className="flex flex-wrap items-center gap-2">
          <input
            type="password"
            value={newPinInput}
            onChange={(e) => setNewPinInput(e.target.value)}
            placeholder="New PIN (4+ chars)"
            className="h-9 rounded-lg border border-stone-200 bg-stone-50 px-3 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
          />
          <button
            type="submit"
            className="h-9 rounded-lg border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
          >
            Update PIN
          </button>
          {pinSavedMsg && (
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              PIN updated &amp; hashed!
            </span>
          )}
        </form>
      </div>

      {subTab === 'ads' ? (
        <AdManagerPanel
          lang={lang}
          adConfig={adConfig}
          onUpdateAdConfig={onUpdateAdConfig}
        />
      ) : subTab === 'owner_profile' ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4 dark:border-zinc-800">
            <div>
              <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                {t.verifiedOwnerBioUpdateTitle}
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Upload a custom portrait photo or update your Verified Owner profile shown to customers.
              </p>
            </div>
            {profileSavedMsg && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Saved Live</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <img
              src={ownerProfile.photoUrl}
              alt={ownerProfile.fullName}
              className="h-24 w-24 rounded-full border-4 border-emerald-600 object-cover shadow-sm"
            />
            <div className="space-y-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600">
                <Upload className="h-4 w-4" />
                <span>Upload / Change Portrait Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file || !file.type.startsWith('image/')) return;
                    const reader = new FileReader();
                    reader.onload = () => {
                      if (typeof reader.result === 'string') {
                        onUpdateOwnerProfile({ ...ownerProfile, photoUrl: reader.result });
                        setProfileSavedMsg(true);
                        setTimeout(() => setProfileSavedMsg(false), 2500);
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateOwnerProfile({
                      ...ownerProfile,
                      photoUrl: OWNER_DEFAULT_PROFILE.photoUrl,
                    });
                    setProfileSavedMsg(true);
                    setTimeout(() => setProfileSavedMsg(false), 2500);
                  }}
                  className="text-xs font-semibold text-stone-600 hover:underline dark:text-stone-400"
                >
                  Restore Verified Default Photo
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Owner Full Name
              </label>
              <input
                type="text"
                value={ownerProfile.fullName}
                onChange={(e) =>
                  onUpdateOwnerProfile({
                    ...ownerProfile,
                    fullName: sanitizeUserInput(e.target.value, 100),
                  })
                }
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                City &amp; Country
              </label>
              <input
                type="text"
                value={ownerProfile.cityCountry}
                onChange={(e) =>
                  onUpdateOwnerProfile({
                    ...ownerProfile,
                    cityCountry: sanitizeUserInput(e.target.value, 100),
                  })
                }
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Masked Fayda ID Label
              </label>
              <input
                type="text"
                value={ownerProfile.faydaMaskedCode}
                onChange={(e) =>
                  onUpdateOwnerProfile({
                    ...ownerProfile,
                    faydaMaskedCode: sanitizeUserInput(e.target.value, 40),
                  })
                }
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 font-mono text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Welcome Bio ({lang.toUpperCase()})
            </label>
            <textarea
              rows={3}
              value={ownerProfile.welcomeBio[lang]}
              onChange={(e) =>
                onUpdateOwnerProfile({
                  ...ownerProfile,
                  welcomeBio: {
                    ...ownerProfile.welcomeBio,
                    [lang]: sanitizeUserInput(e.target.value, 600),
                  },
                })
              }
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>
        </div>
      ) : subTab === 'consults' ? (
        <div className="space-y-4">
          {consultBookings.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-400">
              No paid Legal Consultation bookings yet. Confirmed bookings via Telebirr/CBE appear here with client case summaries.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {consultBookings.map((b) => {
                const cleanWa = b.phone.replace(/[^0-9]/g, '').replace(/^0/, '251');
                return (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2.5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {b.bookingCode} · Ref {b.refNumber}
                      </span>
                      <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                        {b.priceEtb.toLocaleString()} ETB
                      </span>
                    </div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {b.tierTitle} — {b.branch}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-400">
                      Client: {b.clientName} · {b.phone}
                    </div>
                    <p className="rounded-xl bg-stone-50 p-3 text-xs text-stone-700 dark:bg-zinc-950 dark:text-stone-300">
                      {b.caseSummary}
                    </p>
                    <a
                      href={`https://wa.me/${cleanWa}?text=${encodeURIComponent(
                        `Hello ${b.clientName}, confirming your AddisVault Legal Consultation (${b.bookingCode}) for "${b.tierTitle}".`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Message Client on WhatsApp</span>
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : subTab === 'expediter' ? (
        <div className="space-y-5">
          <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
            Expediter Inbox · {expediterRequests.length} Request(s)
          </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {expediterRequests.map((req) => {
                const draft = draftEdits[req.id] || {
                  status: req.status,
                  ownerReply: req.ownerReply || '',
                  quoteEtb: req.quoteEtb ? String(req.quoteEtb) : '',
                };
                const cleanWaPhone = req.phone.replace(/[^0-9]/g, '').replace(/^0/, '251');
                const replySummary = `Hello ${req.clientName} (${req.trackingCode}), regarding "${req.serviceNeeded}": Status = ${draft.status}${
                  draft.quoteEtb ? `, Fee Quote = ${draft.quoteEtb} ETB` : ''
                }. ${draft.ownerReply}`;

                return (
                  <div
                    key={req.id}
                    className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3.5 dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {req.trackingCode} · {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="font-mono text-stone-600 dark:text-stone-300">
                        {req.clientName} · {req.phone}
                      </span>
                    </div>

                    <div>
                      <div className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                        {req.serviceNeeded}
                      </div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">{req.location}</div>
                      <p className="mt-1.5 text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                        {req.details}
                      </p>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2 border-t border-stone-100 pt-3 dark:border-zinc-800">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                          Status
                        </label>
                        <select
                          value={draft.status}
                          onChange={(e) =>
                            setDraftEdits((prev) => ({
                              ...prev,
                              [req.id]: { ...draft, status: e.target.value as ExpediterStatus },
                            }))
                          }
                          className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                        >
                          {EXPEDITER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                          Fee Quote (ETB)
                        </label>
                        <input
                          type="number"
                          value={draft.quoteEtb}
                          onChange={(e) =>
                            setDraftEdits((prev) => ({
                              ...prev,
                              [req.id]: { ...draft, quoteEtb: e.target.value },
                            }))
                          }
                          placeholder="e.g. 1500"
                          className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-500 dark:text-stone-400">
                        Owner Reply to Client (Visible via Tracker)
                      </label>
                      <textarea
                        rows={2}
                        value={draft.ownerReply}
                        onChange={(e) =>
                          setDraftEdits((prev) => ({
                            ...prev,
                            [req.id]: { ...draft, ownerReply: e.target.value },
                          }))
                        }
                        placeholder="Write instructions, required documents, or meeting time..."
                        className="mt-1 w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          await onUpdateExpediterRequest(req.id, {
                            status: draft.status,
                            ownerReply: draft.ownerReply,
                            quoteEtb: draft.quoteEtb ? Number(draft.quoteEtb) : undefined,
                          });
                          setSavedReqId(req.id);
                          setTimeout(() => setSavedReqId(null), 2000);
                        }}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                      >
                        {savedReqId === req.id ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Saved Live</span>
                          </>
                        ) : (
                          <span>Save Status &amp; Reply</span>
                        )}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(replySummary)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-emerald-600/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>WhatsApp Client</span>
                        </a>
                        <a
                          href={`https://t.me/tekii18?text=${encodeURIComponent(replySummary)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-sky-600/30 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-800 dark:bg-sky-950/30 dark:text-sky-300"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Telegram</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
      ) : (
        <>
      {/* KPI Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {t.totalRevenueLabel}
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold tabular-nums text-emerald-800 dark:text-emerald-400">
            {totalEarned.toLocaleString()} ETB
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 tabular-nums">
            {t.avgOrderLabel}: {avgOrderValue.toLocaleString()} ETB
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {t.telebirrRevenueLabel}
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
            {telebirrEarned.toLocaleString()} ETB
          </div>
          <div className="mt-2 font-mono text-xs text-stone-500 dark:text-stone-400">
            0925695197
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {t.cbeRevenueLabel}
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold tabular-nums text-amber-700 dark:text-amber-400">
            {cbeEarned.toLocaleString()} ETB
          </div>
          <div className="mt-2 font-mono text-xs text-stone-500 dark:text-stone-400">
            1000211261513
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="text-xs font-medium text-stone-500 dark:text-stone-400">
            {t.totalOrdersLabel}
          </div>
          <div className="mt-2 font-mono text-2xl sm:text-3xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
            {orders.length}
          </div>
          <div className="mt-2 text-xs text-stone-500 dark:text-stone-400 tabular-nums">
            {t.unitsSoldLabel}: {unitsSold}
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white px-6 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
            <TrendingUp className="h-7 w-7" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-stone-900 dark:text-stone-100">
            {t.dashboardEmptyTitle}
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-stone-600 dark:text-stone-400">
            {t.dashboardEmptyBody}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Category Breakdown */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
              {t.categoryBreakdownTitle}
            </h2>
            <div className="mt-5 space-y-4">
              {ALL_CATEGORIES.map((cat) => {
                const value = categoryTotals[cat];
                const pct = Math.round((value / maxCatRevenue) * 100);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-stone-700 dark:text-stone-300 truncate pr-2">
                        {t.categories[cat]}
                      </span>
                      <span className="font-mono font-semibold tabular-nums text-stone-900 dark:text-stone-100 shrink-0">
                        {value.toLocaleString()} ETB
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-stone-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Verified Payment Ledger Table */}
          <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white overflow-hidden dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  {t.recentOrdersTitle}
                </h2>
              </div>
              <span className="font-mono text-xs text-stone-500 tabular-nums dark:text-stone-400">
                {orders.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-stone-200 bg-stone-50 text-xs text-stone-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-stone-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t.tableOrder}</th>
                    <th className="px-4 py-3 font-semibold">{t.tableDate}</th>
                    <th className="px-4 py-3 font-semibold">{t.tableMethod}</th>
                    <th className="px-4 py-3 font-semibold">{t.tableRef}</th>
                    <th className="px-4 py-3 font-semibold">{t.tableItems}</th>
                    <th className="px-4 py-3 font-semibold text-right">{t.tableAmount}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-stone-50/70 dark:hover:bg-zinc-800/40"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-stone-900 dark:text-stone-100 whitespace-nowrap">
                        {order.id}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-500 tabular-nums whitespace-nowrap dark:text-stone-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold whitespace-nowrap">
                        <span
                          className={
                            order.paymentMethod === 'telebirr'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }
                        >
                          {order.paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {order.refNumber}
                      </td>
                      <td className="px-4 py-3 text-xs text-stone-700 dark:text-stone-300 max-w-[200px] truncate">
                        {order.items.map((i) => `${i.titleSnapshot} (×${i.quantity})`).join(', ')}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs sm:text-sm font-bold text-right tabular-nums text-emerald-800 dark:text-emerald-400 whitespace-nowrap">
                        {order.totalEtb.toLocaleString()} ETB
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </section>
  );
};
