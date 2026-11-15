import React, { useState } from 'react';
import {
  CheckCircle2,
  Crown,
  Download,
  FileText,
  Gavel,
  Lock,
  MessageCircle,
  Scale,
  Send,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LEGAL_CONSULT_TIERS, LEGAL_DOC_TEMPLATES } from '../constants/careerAndLegal';
import { OWNER_SUPPORT_CONTACTS } from '../constants/support';
import {
  Language,
  LegalBranch,
  LegalConsultTier,
  LegalConsultationBooking,
  LegalDocTemplate,
} from '../types';
import { checkClientRateLimit, sanitizePhone, sanitizeUserInput } from '../utils/appSecurity';

interface LegalSuiteViewProps {
  lang: Language;
  unlockedLegalDocIds: Set<string>;
  unlockedConsultTierIds: Set<string>;
  consultBookings: LegalConsultationBooking[];
  vipActive: boolean;
  onRequestDocCheckout: (doc: LegalDocTemplate) => void;
  onRequestConsultCheckout: (
    tier: LegalConsultTier,
    intake: { clientName: string; phone: string; branch: string; caseSummary: string }
  ) => void;
  onOpenVipModal: () => void;
}

function triggerLegalDownload(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

export const LegalSuiteView: React.FC<LegalSuiteViewProps> = ({
  lang,
  unlockedLegalDocIds,
  unlockedConsultTierIds,
  consultBookings,
  vipActive,
  onRequestDocCheckout,
  onRequestConsultCheckout,
  onOpenVipModal,
}) => {
  const [suiteMode, setSuiteMode] = useState<'pleadings' | 'consultation'>('pleadings');

  // --- Pleading Drafter State (Civil vs Criminal strict separation) ---
  const [branch, setBranch] = useState<LegalBranch>('civil');
  const branchTemplates = LEGAL_DOC_TEMPLATES.filter((d) => d.branch === branch);
  const [selectedDocId, setSelectedDocId] = useState<string>(LEGAL_DOC_TEMPLATES[0].id);

  const activeDoc =
    branchTemplates.find((d) => d.id === selectedDocId) || branchTemplates[0];
  const isDocUnlocked = vipActive || unlockedLegalDocIds.has(activeDoc.id);

  const [courtName, setCourtName] = useState('Federal First Instance Court, Bole Division');
  const [caseNumber, setCaseNumber] = useState('New Filing / መዝገብ ቁጥር ____');
  const [partyOne, setPartyOne] = useState('Plaintiff / Applicant: Ato Dawit Bekele');
  const [partyTwo, setPartyTwo] = useState('Defendant / Respondent: Selam Trading PLC');
  const [factsText, setFactsText] = useState('');
  const [reliefText, setReliefText] = useState('');
  const [draftedPleading, setDraftedPleading] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // --- Legal Consultation App State ---
  const [selectedTierId, setSelectedTierId] = useState<string>(LEGAL_CONSULT_TIERS[0].id);
  const activeTier =
    LEGAL_CONSULT_TIERS.find((t) => t.id === selectedTierId) || LEGAL_CONSULT_TIERS[0];
  const [consultName, setConsultName] = useState('');
  const [consultPhone, setConsultPhone] = useState('');
  const [consultBranch, setConsultBranch] = useState('Civil & Contract Law (የፍትሐ ብሔር)');
  const [consultSummary, setConsultSummary] = useState('');
  const [consultError, setConsultError] = useState<string | null>(null);

  const handleSelectBranch = (nextBranch: LegalBranch) => {
    setBranch(nextBranch);
    const first = LEGAL_DOC_TEMPLATES.find((d) => d.branch === nextBranch);
    if (first) setSelectedDocId(first.id);
    setDraftedPleading('');
    setDraftError(null);
  };

  const handleGenerateDraft = async () => {
    if (!checkClientRateLimit('legal_ai', 10)) {
      setDraftError('Rate limit reached. Please wait 60 seconds before drafting another pleading.');
      return;
    }
    setIsDrafting(true);
    setDraftError(null);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolTitle: `${activeDoc.branch.toUpperCase()} COURT DOCUMENT — ${activeDoc.title.en}`,
          language: lang,
          systemInstruction: `You are a senior Ethiopian Advocate practicing in Federal and Regional Courts. Draft a complete, formal court filing strictly under Ethiopian ${
            activeDoc.branch === 'civil'
              ? 'Civil Procedure Code & Civil Code'
              : 'Criminal Procedure Code, FDRE Criminal Code & Constitution'
          } (${activeDoc.legalBasisHint}). Include Court Heading, Parties, Statement of Jurisdiction, Numbered Factual Paragraphs, Legal Grounds, Evidence/Witness Schedule, Prayer for Relief, and Verification Clause ready for court submission.`,
          inputs: {
            Branch: activeDoc.branch.toUpperCase(),
            DocumentType: activeDoc.title.en,
            Court: sanitizeUserInput(courtName, 200),
            FileNumber: sanitizeUserInput(caseNumber, 120),
            PartyOne: sanitizeUserInput(partyOne, 200),
            PartyTwo: sanitizeUserInput(partyTwo, 200),
            MaterialFacts: sanitizeUserInput(factsText || activeDoc.defaultFactsPlaceholder, 2400),
            ReliefSought: sanitizeUserInput(reliefText || activeDoc.defaultReliefPlaceholder, 1000),
          },
        }),
      });
      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok || !data.content) {
        setDraftError(data.error || 'Failed to draft pleading. Please try again.');
        return;
      }
      setDraftedPleading(data.content);
    } catch {
      setDraftError('Network error while contacting legal drafting server.');
    } finally {
      setIsDrafting(false);
    }
  };

  const buildFormattedCourtHtml = () => {
    const bodyHtml = draftedPleading
      .split('\n')
      .map((line) =>
        line.trim()
          ? `<p style="margin:6px 0;">${sanitizeUserInput(line, 1000)}</p>`
          : '<br/>'
      )
      .join('');
    return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${activeDoc.title.en} — AddisVault Court Filing</title>
  <style>
    body { font-family: 'Times New Roman', 'Noto Sans Ethiopic', Georgia, serif; max-width: 780px; margin: 44px auto; padding: 0 28px; color: #111827; line-height: 1.75; font-size: 13.5pt; }
    .court-top { text-align: center; font-weight: bold; border-bottom: 2px solid #111827; padding-bottom: 12px; margin-bottom: 20px; }
    .meta { font-size: 11pt; color: #374151; margin-bottom: 18px; }
    @media print { body { margin: 20mm 22mm; } }
  </style>
</head>
<body>
  <div class="court-top">
    <div>${sanitizeUserInput(courtName, 200)}</div>
    <div style="font-size:12pt;margin-top:4px;">${activeDoc.title.en}</div>
  </div>
  <div class="meta">
    <strong>File No:</strong> ${sanitizeUserInput(caseNumber, 120)}<br/>
    <strong>${sanitizeUserInput(partyOne, 200)}</strong><br/>
    <strong>vs.</strong><br/>
    <strong>${sanitizeUserInput(partyTwo, 200)}</strong>
  </div>
  <div>${bodyHtml}</div>
</body>
</html>`;
  };

  const handleExportLegalWord = () => {
    if (!draftedPleading.trim()) return;
    if (!isDocUnlocked) {
      onRequestDocCheckout(activeDoc);
      return;
    }
    triggerLegalDownload(
      `${activeDoc.id}-court-filing.doc`,
      '\ufeff' + buildFormattedCourtHtml(),
      'application/msword;charset=utf-8'
    );
  };

  const handleExportLegalPdf = () => {
    if (!draftedPleading.trim()) return;
    if (!isDocUnlocked) {
      onRequestDocCheckout(activeDoc);
      return;
    }
    triggerLegalDownload(
      `${activeDoc.id}-print-ready-pdf.html`,
      buildFormattedCourtHtml(),
      'text/html;charset=utf-8'
    );
  };

  const handleBookConsultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = sanitizeUserInput(consultName, 120).trim();
    const cleanPhone = sanitizePhone(consultPhone).trim();
    const cleanSummary = sanitizeUserInput(consultSummary, 1600).trim();
    if (!cleanName || cleanPhone.length < 7 || !cleanSummary) {
      setConsultError('Please enter your name, valid phone number, and a brief summary of your legal issue.');
      return;
    }
    setConsultError(null);
    onRequestConsultCheckout(activeTier, {
      clientName: cleanName,
      phone: cleanPhone,
      branch: consultBranch,
      caseSummary: cleanSummary,
    });
  };

  const latestBooking = consultBookings[0] || null;
  const hasAnyConsultUnlocked = vipActive || unlockedConsultTierIds.size > 0 || consultBookings.length > 0;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header + Mode Switch */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Scale className="h-4 w-4" />
            <span>Legal Drafting &amp; Consultation Suite · የፍርድ ቤት ሰነድ እና የሕግ ምክር</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Court Pleading Drafter &amp; Legal Consultation
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-stone-600 dark:text-stone-400">
            Draft Civil &amp; Criminal pleadings and edit them in full before paying upon completion, or book a 1-on-1 Ethiopian legal consultation session.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-zinc-800 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => setSuiteMode('pleadings')}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              suiteMode === 'pleadings'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
            }`}
          >
            Court Pleading Drafter (Pay After Completion)
          </button>
          <button
            type="button"
            onClick={() => setSuiteMode('consultation')}
            className={`min-h-[40px] rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              suiteMode === 'consultation'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900 dark:text-stone-300'
            }`}
          >
            Legal Consultation (የሕግ ምክር)
          </button>
        </div>
      </div>

      {suiteMode === 'pleadings' ? (
        <div className="space-y-6">
          {/* Strict Branch Split: Civil Law vs Criminal Law */}
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleSelectBranch('civil')}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                branch === 'civil'
                  ? 'border-emerald-700 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/30'
                  : 'border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div>
                <div className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  1. Civil Law Branch (የፍትሐ ብሔር ጉዳዮች)
                </div>
                <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  Statement of Claim, Defense, Appeal, Contract, Power of Attorney, Injunction
                </div>
              </div>
              <Scale className="h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-400" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectBranch('criminal')}
              className={`flex items-center justify-between rounded-2xl border p-4 text-left transition-all ${
                branch === 'criminal'
                  ? 'border-amber-600 bg-amber-50/70 dark:border-amber-500 dark:bg-amber-950/30'
                  : 'border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div>
                <div className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  2. Criminal Law Branch (የወንጀል ጉዳዮች)
                </div>
                <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  Criminal Defense Brief, Bail Application, Appeal Memo, Witness &amp; Evidence Form
                </div>
              </div>
              <Gavel className="h-6 w-6 shrink-0 text-amber-700 dark:text-amber-400" />
            </button>
          </div>

          {/* Document Template Selector */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {branchTemplates.map((doc) => {
              const selected = doc.id === activeDoc.id;
              const unlocked = vipActive || unlockedLegalDocIds.has(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? 'border-emerald-700 bg-emerald-50/50 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/20'
                      : 'border-stone-200 bg-white hover:border-stone-300 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                      {doc.branch} Law
                    </span>
                    <span className="font-mono font-extrabold text-emerald-800 dark:text-emerald-400">
                      {unlocked ? 'Unlocked' : `${doc.priceEtb} ETB`}
                    </span>
                  </div>
                  <div className="mt-1.5 font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                    {doc.title[lang]}
                  </div>
                  <div className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                    {doc.subtitle[lang]}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive Case Input + Full Editable Pay-After-Completion Draft */}
          <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <div className="text-xs font-mono text-emerald-700 dark:text-emerald-400">
                  Step 1 · Enter Case Facts (Free AI Draft)
                </div>
                <h2 className="mt-1 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  {activeDoc.title[lang]}
                </h2>
                <p className="mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                  Legal Basis: {activeDoc.legalBasisHint}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Court / Authority Name
                </label>
                <input
                  type="text"
                  value={courtName}
                  onChange={(e) => setCourtName(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Court File / Case Number
                </label>
                <input
                  type="text"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Plaintiff / Applicant / Accused
                  </label>
                  <input
                    type="text"
                    value={partyOne}
                    onChange={(e) => setPartyOne(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Defendant / Prosecutor
                  </label>
                  <input
                    type="text"
                    value={partyTwo}
                    onChange={(e) => setPartyTwo(e.target.value)}
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Material Facts &amp; Chronology
                </label>
                <textarea
                  rows={4}
                  value={factsText}
                  onChange={(e) => setFactsText(e.target.value)}
                  placeholder={activeDoc.defaultFactsPlaceholder}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Relief / Judgment Requested (የዳኝነት ጥያቄ)
                </label>
                <textarea
                  rows={2}
                  value={reliefText}
                  onChange={(e) => setReliefText(e.target.value)}
                  placeholder={activeDoc.defaultReliefPlaceholder}
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              {draftError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {draftError}
                </div>
              )}

              <button
                type="button"
                disabled={isDrafting}
                onClick={handleGenerateDraft}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
              >
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>
                  {isDrafting
                    ? 'Drafting Court Pleading...'
                    : 'Generate Full Draft (Review & Edit Free Before Paying)'}
                </span>
              </button>
            </div>

            {/* Interactive Legal Editor + Pay-After-Completion Export */}
            <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono text-amber-700 dark:text-amber-400">
                    Step 2 · Pay-After-Completion Review &amp; Edit
                  </div>
                  <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                    Interactive Court Pleading Editor
                  </h3>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {isDocUnlocked ? 'EXPORT UNLOCKED' : `Completion Fee: ${activeDoc.priceEtb} ETB`}
                </span>
              </div>

              <textarea
                rows={16}
                value={draftedPleading}
                onChange={(e) => setDraftedPleading(e.target.value)}
                onCopy={(e) => {
                  if (!isDocUnlocked) e.preventDefault();
                }}
                placeholder="Click 'Generate Full Draft' on the left to produce a complete Ethiopian court pleading that you can review, verify, and freely edit right here before paying..."
                className="w-full rounded-xl border border-stone-200 bg-stone-50 p-4 font-sans text-xs sm:text-sm leading-relaxed text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />

              {draftedPleading.trim() && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  {!isDocUnlocked ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
                        <Lock className="h-4 w-4 text-amber-600" />
                        <span>
                          Satisfied with your completed court pleading? Pay {activeDoc.priceEtb} ETB via Telebirr/CBE to unlock clean Word &amp; Print-PDF export.
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          type="button"
                          onClick={() => onRequestDocCheckout(activeDoc)}
                          className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                        >
                          <Download className="h-4 w-4" />
                          <span>Unlock Final Document ({activeDoc.priceEtb} ETB)</span>
                        </button>
                        <button
                          type="button"
                          onClick={onOpenVipModal}
                          className="min-h-[42px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                        >
                          <Crown className="h-3.5 w-3.5" />
                          <span>VIP Unlock</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={handleExportLegalPdf}
                        className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download Court Print-Ready PDF (.html)</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportLegalWord}
                        className="flex-1 min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                      >
                        <FileText className="h-4 w-4 text-sky-700 dark:text-sky-400" />
                        <span>Download Court Filing Word (.doc)</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Legal Consultation App View */
        <div className="space-y-8">
          {/* Tier Cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {LEGAL_CONSULT_TIERS.map((tier) => {
              const selected = tier.id === selectedTierId;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`flex flex-col justify-between rounded-2xl border p-5 text-left transition-all ${
                    selected
                      ? 'border-emerald-700 bg-emerald-50/70 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30'
                      : 'border-stone-200 bg-white hover:border-emerald-600/50 dark:border-zinc-800 dark:bg-zinc-900'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                        {tier.durationLabel}
                      </span>
                      <span className="font-mono text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
                        {tier.priceEtb.toLocaleString()} ETB
                      </span>
                    </div>
                    <h3 className="mt-2 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                      {tier.title[lang]}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                      {tier.subtitle[lang]}
                    </p>
                    <ul className="mt-3 space-y-1.5 border-t border-stone-200/70 pt-3 text-xs text-stone-700 dark:border-zinc-800 dark:text-stone-300">
                      {tier.deliverables[lang].map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-12">
            {/* Case Intake Form */}
            <form
              onSubmit={handleBookConsultSubmit}
              className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-6 space-y-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                Book {activeTier.title[lang]} ({activeTier.priceEtb.toLocaleString()} ETB)
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={consultName}
                    onChange={(e) => setConsultName(e.target.value)}
                    placeholder="e.g. Mekdes Alemu"
                    className="mt-1 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={consultPhone}
                    onChange={(e) => setConsultPhone(e.target.value)}
                    placeholder="0911XXXXXX"
                    className="mt-1 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Area of Ethiopian Law
                </label>
                <select
                  value={consultBranch}
                  onChange={(e) => setConsultBranch(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                >
                  <option>Civil &amp; Contract Law (የፍትሐ ብሔር)</option>
                  <option>Criminal Defense &amp; Bail (የወንጀል ሕግ)</option>
                  <option>Family, Divorce &amp; Succession (የቤተሰብ እና ውርስ)</option>
                  <option>Labor &amp; Employment (የአሠሪና ሠራተኛ)</option>
                  <option>Real Estate, Lease &amp; Tax Disputes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Case Summary / Questions *
                </label>
                <textarea
                  rows={4}
                  required
                  value={consultSummary}
                  onChange={(e) => setConsultSummary(e.target.value)}
                  placeholder="Describe the dispute, dates, documents you have, and your main legal question..."
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              {consultError && (
                <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {consultError}
                </div>
              )}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-xs sm:text-sm font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>
                  Pay {activeTier.priceEtb.toLocaleString()} ETB via Telebirr / CBE &amp; Unlock Direct Consultation
                </span>
              </button>
            </form>

            {/* Active / Confirmed Direct Consultation Launch Panel */}
            <div className="lg:col-span-5 rounded-2xl border border-stone-200 bg-white p-6 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex items-center gap-2">
                {hasAnyConsultUnlocked ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                ) : (
                  <Lock className="h-5 w-5 text-amber-600" />
                )}
                <h3 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                  {hasAnyConsultUnlocked
                    ? 'Consultation Unlocked — Connect Immediately'
                    : 'Direct Telegram / WhatsApp Session Locked'}
                </h3>
              </div>

              {latestBooking ? (
                <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <div className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    Booking Code: {latestBooking.bookingCode} · Ref: {latestBooking.refNumber}
                  </div>
                  <div className="font-semibold text-stone-900 dark:text-stone-100">
                    {latestBooking.tierTitle} ({latestBooking.priceEtb.toLocaleString()} ETB)
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">
                    Client: {latestBooking.clientName} ({latestBooking.phone}) · {latestBooking.branch}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <a
                      href={`https://t.me/tekii18?text=${encodeURIComponent(
                        `AddisVault Legal Consultation (${latestBooking.bookingCode})\nPackage: ${latestBooking.tierTitle}\nPaid Ref: ${latestBooking.refNumber}\nClient: ${latestBooking.clientName} (${latestBooking.phone})\nBranch: ${latestBooking.branch}\nSummary: ${latestBooking.caseSummary}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-sky-600 px-3 py-2 font-bold text-white hover:bg-sky-700"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Start Telegram ({OWNER_SUPPORT_CONTACTS.telegramUsername})</span>
                    </a>
                    <a
                      href={`https://wa.me/251925695197?text=${encodeURIComponent(
                        `AddisVault Legal Consultation (${latestBooking.bookingCode})\nPackage: ${latestBooking.tierTitle}\nPaid Ref: ${latestBooking.refNumber}\nClient: ${latestBooking.clientName} (${latestBooking.phone})\nSummary: ${latestBooking.caseSummary}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-h-[40px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 font-bold text-white hover:bg-emerald-800"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Start WhatsApp ({OWNER_SUPPORT_CONTACTS.whatsappDisplay})</span>
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs leading-relaxed text-stone-600 dark:text-stone-400">
                  Complete the booking form on the left and confirm your Telebirr (0925695197) or CBE (1000211261513) transfer. Your Booking Code and one-click pre-filled Telegram/WhatsApp legal session links unlock immediately upon confirmation.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
