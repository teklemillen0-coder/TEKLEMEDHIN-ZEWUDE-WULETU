import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileCheck2,
  MessageCircle,
  Search,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { OWNER_SUPPORT_CONTACTS } from '../constants/support';
import { ExpediterRequest, Language } from '../types';

interface ExpediterViewProps {
  lang: Language;
  requests: ExpediterRequest[];
  onSubmitRequest: (req: ExpediterRequest) => Promise<void>;
}

const COPY: Record<
  Language,
  {
    badge: string;
    title: string;
    subtitle: string;
    formTitle: string;
    clientName: string;
    phone: string;
    serviceNeeded: string;
    location: string;
    details: string;
    submitBtn: string;
    submittedTitle: string;
    submittedBody: string;
    trackingCodeLabel: string;
    trackerTitle: string;
    trackerSubtitle: string;
    trackerPlaceholder: string;
    noMatches: string;
    ownerQuoteLabel: string;
    ownerReplyLabel: string;
  }
> = {
  en: {
    badge: 'Direct Agent & Expediter Service · ጉዳይ አስፈፃሚ',
    title: 'Need an Expediter? / ጉዳይ አስፈፃሚ ይፈልጋሉ?',
    subtitle:
      'Submit government paperwork, trade license renewal, ERCA tax clearance, vehicle title transfer, document authentication, or legal follow-up requests directly to our Addis Ababa expediter desk.',
    formTitle: 'Submit Expediter Request',
    clientName: 'Your Full Name',
    phone: 'Phone Number (Telegram / WhatsApp)',
    serviceNeeded: 'Service / Document Follow-up Needed',
    location: 'Sub-city / Ministry Office',
    details: 'Details & Urgency',
    submitBtn: 'Submit to Expediter Inbox',
    submittedTitle: 'Request Sent to AddisVault Expediter Desk!',
    submittedBody: 'Save your tracking code below to check real-time status & price quotes anytime, or send documents directly via Telegram (@tekii18) or WhatsApp (0925695197).',
    trackingCodeLabel: 'Your Tracking Code',
    trackerTitle: 'Track Request Status & Owner Quote',
    trackerSubtitle: 'Enter your Tracking Code (e.g. EXP-1042) or Phone Number to view updates from the owner.',
    trackerPlaceholder: 'Search EXP-XXXX or Phone...',
    noMatches: 'Enter your Tracking Code or Phone Number above to inspect live updates.',
    ownerQuoteLabel: 'Facilitation Fee Quote',
    ownerReplyLabel: 'Expediter Update',
  },
  am: {
    badge: 'ቀጥታ የጉዳይ አስፈፃሚ አገልግሎት',
    title: 'ጉዳይ አስፈፃሚ ይፈልጋሉ? (Request an Expediter)',
    subtitle:
      'የንግድ ፈቃድ እድሳት፣ የግብር ክሊራንስ፣ የመኪና ስም ዝውውር፣ የሰነድ ማረጋገጫ (ውልና ማስረጃ) እና የመንግስት መስሪያ ቤት ጉዳዮችን በቀጥታ ለባለቤቱ መልእክት ይላኩ።',
    formTitle: 'የጉዳይ አስፈፃሚ ጥያቄ ይላኩ',
    clientName: 'ሙሉ ስምዎ',
    phone: 'ስልክ ቁጥር (ቴሌግራም / ዋትስአፕ)',
    serviceNeeded: 'የሚፈልጉት ጉዳይ / አገልግሎት',
    location: 'ክፍለ ከተማ / መስሪያ ቤት',
    details: 'ዝርዝር ሁኔታ እና የጊዜ ገደብ',
    submitBtn: 'ጥያቄውን ላክ (Send to Expediter)',
    submittedTitle: 'ጥያቄዎ በተሳካ ሁኔታ ተልኳል!',
    submittedBody: 'ከታች ያለውን የመከታተያ ኮድ ይያዙ፤ ሰነዶችን በቴሌግራም (@tekii18) ወይም በዋትስአፕ (0925695197) መላክ ይችላሉ።',
    trackingCodeLabel: 'የመከታተያ ኮድዎ',
    trackerTitle: 'የጉዳይዎን ሁኔታ እና ዋጋ ይከታተሉ',
    trackerSubtitle: 'የባለቤቱን ምላሽ እና ዋጋ ለማየት የመከታተያ ኮድዎን (EXP-XXXX) ወይም ስልክ ቁጥር ያስገቡ።',
    trackerPlaceholder: 'EXP-1042 ወይም ስልክ ቁጥር...',
    noMatches: 'የጉዳይዎን ሁኔታ ለማየት የመከታተያ ኮድ ወይም ስልክ ቁጥር ይፈልጉ።',
    ownerQuoteLabel: 'የአገልግሎት ዋጋ ግምት',
    ownerReplyLabel: 'የባለቤቱ ምላሽ',
  },
  om: {
    badge: 'Tajaajila Raawwachiisaa Dhimmaa',
    title: 'Raawwachiisaa Dhimmaa Barbaadduu? (ጉዳይ አስፈፃሚ)',
    subtitle:
      'Haaromsa hayyama daldalaa, qulqulleessa gibiraa, jijjiirraa maqaa konkolaataa fi dhimmoota waajjiraalee mootummaa kallattiin nuuf ergaa.',
    formTitle: 'Gaaffii Raawwachiisaa Ergi',
    clientName: 'Maqaa Guutuu',
    phone: 'Lakkoofsa Bilbilaa',
    serviceNeeded: 'Tajaajila Barbaadamu',
    location: 'Kutaa Magaalaa / Waajjira',
    details: 'Ibsa Dabalataa',
    submitBtn: 'Ergi',
    submittedTitle: 'Gaaffiin Keessan Ergameera!',
    submittedBody: 'Koodii hordoffii armaan gadii ol-kaaʼaa; sanadoota Telegram (@tekii18) ykn WhatsApp (0925695197) irratti ergaa.',
    trackingCodeLabel: 'Koodii Hordoffii',
    trackerTitle: 'Haala Gaaffii Hordofi',
    trackerSubtitle: 'Koodii hordoffii ykn lakkoofsa bilbilaa galchaa.',
    trackerPlaceholder: 'EXP-1042 ykn bilbila...',
    noMatches: 'Haala ilaaluuf koodii ykn bilbila galchi.',
    ownerQuoteLabel: 'Gatii Tajaajilaa',
    ownerReplyLabel: 'Deebii Abbaa',
  },
  ti: {
    badge: 'ቀጥታ ኣገልግሎት ጉዳይ ኣፈጻሚ',
    title: 'ጉዳይ ኣፈጻሚ ትደልዩ ዶ? (ጉዳይ አስፈፃሚ)',
    subtitle:
      'ምሕዳስ ፍቓድ ንግዲ፣ ክሊራንስ ግብሪ፣ ምዝውዋር ስም መኪናን ጉዳያት ኣብያተ-ዕዮ መንግስትን ብቐጥታ ልኣኹ።',
    formTitle: 'ሕቶ ጉዳይ ኣፈጻሚ ልኣኽ',
    clientName: 'ሙሉእ ስም',
    phone: 'ቁጽሪ ስልኪ',
    serviceNeeded: 'ዝድለ ኣገልግሎት / ጉዳይ',
    location: 'ክፍለ ከተማ / ቤት ዕዮ',
    details: 'ዝርዝር መብርሂ',
    submitBtn: 'ሕቶ ልኣኽ',
    submittedTitle: 'ሕቶኹም ተላኢኹ ኣሎ!',
    submittedBody: 'ኮድ መከታተሊ ዓቅቡ፤ ሰነዳት ብቴሌግራም (@tekii18) ወይ ዋትስኣፕ (0925695197) ልኣኹ።',
    trackingCodeLabel: 'ኮድ መከታተሊ',
    trackerTitle: 'ኩነታት ጉዳይኩም ተኸታተሉ',
    trackerSubtitle: 'ኮድ EXP-XXXX ወይ ቁጽሪ ስልኪ ኣእትዉ።',
    trackerPlaceholder: 'EXP-1042 ወይ ስልኪ...',
    noMatches: 'ኩነታት ንምርኣይ ኮድ ወይ ስልኪ ድለዩ።',
    ownerQuoteLabel: 'ግምት ዋጋ',
    ownerReplyLabel: 'መልሲ ዋና',
  },
  so: {
    badge: 'Adeegga Fududeeyaha Tooska ah (ጉዳይ አስፈፃሚ)',
    title: 'Ma U Baahan Tahay Fududeeye? (ጉዳይ አስፈፃሚ)',
    subtitle:
      'U dir codsiyada cusboonaysiinta shatiga ganacsiga, cashuurta, wareejinta gaadhiga iyo hawlaha xafiisyada dawladda si toos ah.',
    formTitle: 'Dir Codsiga Fududeeyaha',
    clientName: 'Magacaaga oo Buuxa',
    phone: 'Telefoonkaaga',
    serviceNeeded: 'Adeegga Aad U Baahan Tahay',
    location: 'Degmada / Xafiiska',
    details: 'Faahfaahin Dheeraad ah',
    submitBtn: 'Dir Codsiga',
    submittedTitle: 'Codsigaaga Waa La Diray!',
    submittedBody: 'Kaydi koodhka raadraaca hoose ama noogu soo dir dukumiintiyada Telegram (@tekii18) / WhatsApp (0925695197).',
    trackingCodeLabel: 'Koodhka Raadraaca',
    trackerTitle: 'La Soco Xaaladda Codsiga',
    trackerSubtitle: 'Geli Koodhka Raadraaca ama Telefoonka si aad u aragto jawaabta.',
    trackerPlaceholder: 'EXP-1042 ama Telefoon...',
    noMatches: 'Geli koodhka raadraaca ama telefoonka si aad u aragto xaaladda.',
    ownerQuoteLabel: 'Qiimaha Adeegga',
    ownerReplyLabel: 'Jawaabta Milkiilaha',
  },
};

export const ExpediterView: React.FC<ExpediterViewProps> = ({
  lang,
  requests,
  onSubmitRequest,
}) => {
  const c = COPY[lang];
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [location, setLocation] = useState('');
  const [details, setDetails] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState<ExpediterRequest | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [lookupQuery, setLookupQuery] = useState('EXP-1042');

  const matchingRequests = useMemo(() => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return [];
    return requests.filter(
      (r) =>
        r.trackingCode.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
    );
  }, [requests, lookupQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !phone.trim() || !serviceNeeded.trim()) return;
    const code = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const newReq: ExpediterRequest = {
      id: `exp-${Date.now()}`,
      trackingCode: code,
      clientName: clientName.trim(),
      phone: phone.trim(),
      serviceNeeded: serviceNeeded.trim(),
      location: location.trim() || 'Addis Ababa',
      details: details.trim() || 'Please contact me to review requirements and fee quote.',
      status: 'Pending',
      createdAt: now,
      updatedAt: now,
    };
    await onSubmitRequest(newReq);
    setLastSubmitted(newReq);
    setLookupQuery(code);
    setClientName('');
    setPhone('');
    setServiceNeeded('');
    setLocation('');
    setDetails('');
  };

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Ignore
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1800);
  };

  const prefilledFollowupMsg = lastSubmitted
    ? `AddisVault Expediter Request (${lastSubmitted.trackingCode})\nName: ${lastSubmitted.clientName}\nPhone: ${lastSubmitted.phone}\nService: ${lastSubmitted.serviceNeeded}\nLocation: ${lastSubmitted.location}`
    : '';

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <div className="border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
          <FileCheck2 className="h-4 w-4" />
          <span>{c.badge}</span>
        </div>
        <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          {c.title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
          {c.subtitle}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Request Submission Portal */}
        <div className="lg:col-span-7 space-y-5">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-2 font-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
              <ClipboardCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
              <span>{c.formTitle}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.clientName} *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Dawit Bekele"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.phone} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911XXXXXX"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.serviceNeeded} *
                </label>
                <input
                  type="text"
                  required
                  value={serviceNeeded}
                  onChange={(e) => setServiceNeeded(e.target.value)}
                  placeholder="e.g. Trade License Renewal / Vehicle Title Transfer"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.location}
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bole Sub-city / Dembel"
                  className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                {c.details}
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe documents you already have and target timeline..."
                className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{c.submitBtn}</span>
            </button>
          </form>

          {lastSubmitted && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 space-y-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <div>
                  <h3 className="font-display text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-200">
                    {c.submittedTitle}
                  </h3>
                  <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-300/90 leading-relaxed">
                    {c.submittedBody}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-white px-4 py-3 dark:border-emerald-900/40 dark:bg-zinc-950">
                <div>
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                    {c.trackingCodeLabel}
                  </div>
                  <div className="font-mono text-lg font-extrabold text-emerald-800 dark:text-emerald-400">
                    {lastSubmitted.trackingCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyCode(lastSubmitted.trackingCode)}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                >
                  {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <a
                  href={`${OWNER_SUPPORT_CONTACTS.telegramUrl}?text=${encodeURIComponent(prefilledFollowupMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Telegram (@tekii18)</span>
                </a>
                <a
                  href={`https://wa.me/251925695197?text=${encodeURIComponent(prefilledFollowupMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>WhatsApp (0925695197)</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Request Tracker */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100">
                {c.trackerTitle}
              </h2>
              <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                {c.trackerSubtitle}
              </p>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                placeholder={c.trackerPlaceholder}
                className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>

            {matchingRequests.length === 0 ? (
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 text-center text-xs text-stone-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-400">
                {c.noMatches}
              </div>
            ) : (
              <div className="space-y-3">
                {matchingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-2.5 dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono font-bold text-emerald-800 dark:text-emerald-400">
                        {req.trackingCode}
                      </span>
                      <span
                        className={`font-semibold ${
                          req.status === 'Completed'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : req.status === 'Quoted' || req.status === 'In Progress'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-stone-600 dark:text-stone-300'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {req.serviceNeeded}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {req.clientName} · {req.location}
                    </div>

                    {typeof req.quoteEtb === 'number' && req.quoteEtb > 0 && (
                      <div className="flex items-center justify-between border-t border-stone-200 pt-2 text-xs dark:border-zinc-800">
                        <span className="text-stone-500 dark:text-stone-400">{c.ownerQuoteLabel}:</span>
                        <strong className="font-mono text-emerald-800 dark:text-emerald-400">
                          {req.quoteEtb.toLocaleString()} ETB
                        </strong>
                      </div>
                    )}

                    {req.ownerReply && (
                      <div className="rounded-lg border border-emerald-200/80 bg-white p-3 text-xs text-stone-700 dark:border-emerald-900/40 dark:bg-zinc-900 dark:text-stone-300">
                        <div className="font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
                          {c.ownerReplyLabel}:
                        </div>
                        <p>{req.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
