import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Crown,
  Download,
  FileText,
  Globe2,
  Lock,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { CV_COUNTRY_STANDARDS } from '../constants/careerAndLegal';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { CvCountryId, CvCountryStandard, Language } from '../types';
import { checkClientRateLimit, sanitizeUserInput } from '../utils/appSecurity';
import { buildRealPdfBytes, triggerUint8Download } from '../utils/documentExport';

interface CvBuilderViewProps {
  lang: Language;
  unlockedCvCountryIds: Set<string>;
  vipActive: boolean;
  onRequestCheckout: (standard: CvCountryStandard) => void;
  onOpenVipModal: () => void;
}

function triggerBlobDownload(filename: string, content: string, mimeType: string) {
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

export const CvBuilderView: React.FC<CvBuilderViewProps> = ({
  lang,
  unlockedCvCountryIds,
  vipActive,
  onRequestCheckout,
  onOpenVipModal,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [selectedCountryId, setSelectedCountryId] = useState<CvCountryId>('usa_canada');
  const [showGuide, setShowGuide] = useState(true);
  const [docView, setDocView] = useState<'cv' | 'cover'>('cv');
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const [fullName, setFullName] = useState('Abebe Kebede Tadesse');
  const [targetRole, setTargetRole] = useState('Senior Project Coordinator / Operations Analyst');
  const [cityCountry, setCityCountry] = useState('Addis Ababa, Ethiopia');
  const [email, setEmail] = useState('abebe.kebede@example.com');
  const [phone, setPhone] = useState('+251 911 223 344');
  const [linkedinUrl, setLinkedinUrl] = useState('linkedin.com/in/abebe-kebede');
  const [nationality, setNationality] = useState('Ethiopian');
  const [visaStatus, setVisaStatus] = useState('Visit Visa / Ready to Relocate Immediately');
  const [summaryText, setSummaryText] = useState(
    'Results-driven operations & project specialist with 6+ years leading cross-functional logistics, budgeting, and compliance teams across East Africa.'
  );
  const [experienceText, setExperienceText] = useState(
    'Operations Coordinator — Nile Logistics PLC (2021–Present)\n• Coordinated 35+ weekly fleet dispatches, cutting fuel variance by 22%.\n• Managed 18M ETB annual procurement budget with 100% audit compliance.\n\nProject Officer — Horn Development Initiative (2018–2021)\n• Delivered 12 donor-funded community infrastructure projects on schedule.'
  );
  const [educationText, setEducationText] = useState(
    'B.A. in Business Management — Addis Ababa University (2018) · GPA 3.62/4.00\nCertificate in Project Management (PMP Prep)'
  );
  const [skillsText, setSkillsText] = useState(
    'Project Scheduling, Financial Budgeting, Supply Chain ERP, Stakeholder Reporting, MS Excel (Advanced), Amharic (Native), English (Fluent C1)'
  );
  const [refereesText, setRefereesText] = useState(
    'Available upon request (or provide 2 direct supervisor contacts for Ethiopian/NGO portals).'
  );
  const [photoDataUrl, setPhotoDataUrl] = useState<string>('');
  const [coverLetterDraft, setCoverLetterDraft] = useState<string>(
    'Dear Hiring Committee,\n\nI am writing to express my strong interest in the target role. With over six years of progressive operations, budget control, and stakeholder management experience, I am confident in my ability to deliver immediate measurable impact.\n\nIn my current leadership capacity, I streamlined weekly scheduling workflows and achieved a 22% cost reduction while maintaining 100% audit accuracy. I welcome the opportunity to contribute this same discipline to your team.\n\nSincerely,\nAbebe Kebede Tadesse'
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiEnhancedNotes, setAiEnhancedNotes] = useState<string | null>(null);

  const standard =
    CV_COUNTRY_STANDARDS.find((c) => c.id === selectedCountryId) || CV_COUNTRY_STANDARDS[0];
  const isUnlocked = vipActive || unlockedCvCountryIds.has(standard.id);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateAiBullets = async () => {
    if (!checkClientRateLimit('cv_ai', 10)) {
      setAiError('Rate limit reached. Please wait a minute before generating again.');
      return;
    }
    setIsGenerating(true);
    setAiError(null);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolTitle: `Global CV & Cover Letter Studio — ${standard.countryName.en}`,
          language: lang === 'am' ? 'en' : lang,
          systemInstruction: `You are an elite international HR & ATS resume writer specializing in ${standard.countryName.en} standards (${standard.formatLabel.en}). Enforce every legal/HR rule: ${standard.rules.en.join(
            ' | '
          )}. Return TWO cleanly separated sections: [IMPROVED CV BULLETS] and [TAILORED COVER LETTER].`,
          inputs: {
            TargetCountryFormat: standard.formatLabel.en,
            ApplicantName: sanitizeUserInput(fullName, 120),
            TargetJobTitle: sanitizeUserInput(targetRole, 160),
            Location: sanitizeUserInput(cityCountry, 120),
            CurrentSummary: sanitizeUserInput(summaryText, 800),
            ExperienceHistory: sanitizeUserInput(experienceText, 2200),
            Skills: sanitizeUserInput(skillsText, 600),
            NationalityAndVisa: standard.requiresVisaInfo
              ? `${nationality} | ${visaStatus}`
              : 'Excluded per destination HR privacy rule',
          },
        }),
      });
      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok || !data.content) {
        setAiError(data.error || 'Could not generate AI CV improvements.');
        return;
      }

      const raw = data.content;
      const coverSplit = raw.split(/\[TAILORED COVER LETTER\]|Cover Letter:/i);
      if (coverSplit.length >= 2) {
        const improvedBullets = coverSplit[0].replace(/\[IMPROVED CV BULLETS\]/i, '').trim();
        const coverBody = coverSplit.slice(1).join('\n').trim();
        setAiEnhancedNotes(improvedBullets);
        if (coverBody) setCoverLetterDraft(coverBody);
      } else {
        setAiEnhancedNotes(raw);
      }
    } catch {
      setAiError('Network error while contacting AI CV studio.');
    } finally {
      setIsGenerating(false);
    }
  };

  const buildFormattedHtmlDocument = () => {
    const expLines = (aiEnhancedNotes || experienceText)
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => `<p style="margin:4px 0;">${sanitizeUserInput(l, 500)}</p>`)
      .join('');

    const eduLines = educationText
      .split('\n')
      .filter((l) => l.trim())
      .map((l) => `<p style="margin:4px 0;">${sanitizeUserInput(l, 400)}</p>`)
      .join('');

    const photoHtml =
      standard.requiresPhoto && photoDataUrl
        ? `<img src="${photoDataUrl}" alt="Applicant" style="width:96px;height:112px;object-fit:cover;border-radius:6px;border:1px solid #d6d3d1;" />`
        : standard.requiresPhoto
        ? `<div style="width:96px;height:112px;border:1px dashed #a8a29e;display:flex;align-items:center;justify-content:center;font-size:11px;color:#78716c;">Photo</div>`
        : '';

    const visaBanner = standard.requiresVisaInfo
      ? `<p style="margin:6px 0;font-size:12px;color:#065f46;"><strong>Nationality:</strong> ${sanitizeUserInput(
          nationality,
          80
        )} &nbsp;|&nbsp; <strong>Visa Status:</strong> ${sanitizeUserInput(visaStatus, 100)}</p>`
      : '';

    const signatureBlock = standard.requiresSignatureBlock
      ? `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #d6d3d1;display:flex;justify-content:space-between;font-size:12px;">
          <span>Ort, Datum: ${sanitizeUserInput(cityCountry, 80)}, ${new Date().toLocaleDateString()}</span>
          <span>Unterschrift / Signature: ___________________________</span>
         </div>`
      : '';

    const coverHtml = coverLetterDraft
      .split('\n')
      .map((p) => `<p style="margin:8px 0;">${sanitizeUserInput(p, 800)}</p>`)
      .join('');

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${sanitizeUserInput(fullName, 100)} — ${standard.countryName.en} CV</title>
  <style>
    body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; max-width: 820px; margin: 36px auto; padding: 0 28px; color: #1c1917; line-height: 1.5; }
    h1 { margin: 0; font-size: 24px; color: #064e3b; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.08em; color: #065f46; border-bottom: 1.5px solid #065f46; padding-bottom: 4px; margin: 20px 0 10px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; border-bottom: 2px solid #1c1917; padding-bottom: 14px; }
    .page-break { page-break-before: always; margin-top: 44px; padding-top: 28px; border-top: 2px dashed #d6d3d1; }
    @media print { body { margin: 16px auto; } .page-break { border-top: none; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>${sanitizeUserInput(fullName, 120)}</h1>
      <div style="font-size:15px;font-weight:600;color:#44403c;margin-top:4px;">${sanitizeUserInput(
        targetRole,
        150
      )}</div>
      <div style="font-size:12px;color:#57534e;margin-top:6px;">
        ${sanitizeUserInput(cityCountry, 100)} · ${sanitizeUserInput(phone, 40)} · ${sanitizeUserInput(
      email,
      80
    )} · ${sanitizeUserInput(linkedinUrl, 120)}
      </div>
      ${visaBanner}
    </div>
    ${photoHtml}
  </div>

  <h2>Professional Summary</h2>
  <p>${sanitizeUserInput(summaryText, 1200)}</p>

  <h2>Work Experience</h2>
  ${expLines}

  <h2>Education &amp; Credentials</h2>
  ${eduLines}

  <h2>Core Competencies &amp; Languages</h2>
  <p>${sanitizeUserInput(skillsText, 800)}</p>

  ${
    standard.id === 'ethiopia'
      ? `<h2>References</h2><p>${sanitizeUserInput(refereesText, 600)}</p>`
      : ''
  }

  ${signatureBlock}

  <div class="page-break">
    <div style="font-size:12px;color:#065f46;font-weight:700;text-transform:uppercase;">Cover Letter — ${standard.countryName.en}</div>
    <h1 style="margin-top:6px;">${sanitizeUserInput(fullName, 120)}</h1>
    <div style="font-size:12px;color:#57534e;margin-bottom:20px;">${sanitizeUserInput(
      cityCountry,
      100
    )} · ${sanitizeUserInput(email, 80)} · ${sanitizeUserInput(phone, 40)}</div>
    ${coverHtml}
  </div>
</body>
</html>`;
  };

  const handleDownloadWord = () => {
    if (!isUnlocked) {
      onRequestCheckout(standard);
      return;
    }
    const html = buildFormattedHtmlDocument();
    const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'cv';
    triggerBlobDownload(`${slug}-${standard.id}-cv.doc`, '\ufeff' + html, 'application/msword;charset=utf-8');
  };

  const handleDownloadPrintPdf = async () => {
    if (!isUnlocked) {
      onRequestCheckout(standard);
      return;
    }
    setIsExportingPdf(true);
    try {
      const slug = fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'cv';
      const cvSections: { heading: string; content: string }[] = [
        { heading: 'Professional Summary', content: summaryText },
        {
          heading: standard.id === 'germany' ? 'Berufserfahrung / Work Experience' : 'Work Experience',
          content: aiEnhancedNotes || experienceText,
        },
        {
          heading: standard.id === 'germany' ? 'Ausbildung / Education' : 'Education & Credentials',
          content: educationText,
        },
        { heading: 'Core Skills & Languages', content: skillsText },
      ];
      if (standard.id === 'ethiopia' && refereesText.trim()) {
        cvSections.push({ heading: 'References', content: refereesText });
      }
      if (standard.requiresVisaInfo) {
        cvSections.unshift({
          heading: 'Candidate Eligibility',
          content: `Nationality: ${nationality} | Visa Status: ${visaStatus}`,
        });
      }

      const pdfBytes = await buildRealPdfBytes({
        pages: [
          {
            title: fullName || 'Applicant Name',
            subtitle: `${targetRole} — ${standard.countryName.en}`,
            metaLine: `${cityCountry} · ${phone} · ${email} · ${linkedinUrl}`,
            sections: cvSections,
            photoDataUrl: standard.requiresPhoto && photoDataUrl ? photoDataUrl : undefined,
            signatureFooter: standard.requiresSignatureBlock
              ? `${cityCountry}, ${new Date().toLocaleDateString()}   |   Signature: _________________________`
              : undefined,
          },
          {
            title: `${fullName} — Cover Letter`,
            subtitle: `${standard.countryName.en} (${standard.formatLabel.en})`,
            metaLine: `${cityCountry} · ${email} · ${phone}`,
            sections: [{ heading: 'Application Letter', content: coverLetterDraft }],
          },
        ],
      });
      triggerUint8Download(`${slug}-${standard.id}-cv-cover.pdf`, pdfBytes, 'application/pdf');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Globe2 className="h-4 w-4" />
            <span>Global CV &amp; Cover Letter Studio · በየሀገራቱ ስታንዳርድ CV መስሪያ</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            International Career &amp; Country-Standard CV Hub
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-stone-600 dark:text-stone-400">
            Build, AI-polish, and preview your CV &amp; Cover Letter for free according to exact USA/Canada ATS, UK/Europass, Germany Lebenslauf, UAE/Gulf, Australia, or Ethiopian HR laws. Pay via Telebirr / CBE only when exporting final Word / Print-PDF files.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGuide((prev) => !prev)}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
        >
          <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <span>{showGuide ? 'Hide የአጻጻፍ መመሪያ' : 'Show የአጻጻፍ መመሪያ (Writing Guide)'}</span>
        </button>
      </div>

      {/* Country Selector Grid with Tiered Pricing */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CV_COUNTRY_STANDARDS.map((item) => {
          const active = item.id === selectedCountryId;
          const itemUnlocked = vipActive || unlockedCvCountryIds.has(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedCountryId(item.id)}
              className={`flex flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                active
                  ? 'border-emerald-700 bg-emerald-50/60 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30'
                  : 'border-stone-200 bg-white hover:border-emerald-600/50 dark:border-zinc-800 dark:bg-zinc-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                    {item.flagCode} · {item.maxPagesLabel}
                  </span>
                  {itemUnlocked ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="font-mono text-sm font-extrabold text-emerald-800 dark:text-emerald-400">
                      {item.priceEtb} ETB
                    </span>
                  )}
                </div>
                <div className="mt-1.5 font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  {item.countryName[lang]}
                </div>
                <div className="mt-1 text-xs text-stone-600 dark:text-stone-400">
                  {item.formatLabel[lang]}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step-by-Step Writing Guide ("የአጻጻፍ መመሪያ") */}
      {showGuide && (
        <div className="rounded-2xl border border-amber-300/70 bg-amber-50/60 p-5 dark:border-amber-700/40 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
              የአጻጻፍ መመሪያ · {standard.countryName[lang]} Rules &amp; Checklist
            </h2>
            <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-300">
              Export Fee: {standard.priceEtb} ETB (Free Preview)
            </span>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <ul className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {standard.rules[lang].map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            <ol className="space-y-1.5 text-xs text-stone-700 dark:text-stone-300">
              {standard.writingGuide[lang].map((g, i) => (
                <li key={i} className="font-medium">
                  {g}
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Split Workspace: Form Builder (Left) + Country-Formatted Live Preview (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Form */}
        <div className="lg:col-span-6 space-y-4 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
            1. Applicant Information (Free Build)
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Target Job Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                City, Country
              </label>
              <input
                type="text"
                value={cityCountry}
                onChange={(e) => setCityCountry(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                LinkedIn / Portfolio URL
              </label>
              <input
                type="text"
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
          </div>

          {standard.requiresVisaInfo && (
            <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Nationality (Gulf Standard)
                </label>
                <input
                  type="text"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  Current Visa Status
                </label>
                <input
                  type="text"
                  value={visaStatus}
                  onChange={(e) => setVisaStatus(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>
            </div>
          )}

          {standard.requiresPhoto && (
            <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-zinc-800 dark:bg-zinc-950/60">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Formal Portrait Photo ({standard.flagCode} Format Requires Photo)
              </label>
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Headshot</span>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl('')}
                    className="text-xs font-semibold text-rose-600 hover:underline"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Professional Summary
            </label>
            <textarea
              rows={2}
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Work Experience &amp; Achievements
            </label>
            <textarea
              rows={5}
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Education &amp; Certifications
              </label>
              <textarea
                rows={3}
                value={educationText}
                onChange={(e) => setEducationText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Skills &amp; Languages
              </label>
              <textarea
                rows={3}
                value={skillsText}
                onChange={(e) => setSkillsText(e.target.value)}
                className="mt-1 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
          </div>

          {standard.id === 'ethiopia' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Referees (Ethiopia / NGO Standard)
              </label>
              <input
                type="text"
                value={refereesText}
                onChange={(e) => setRefereesText(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
            </div>
          )}

          {aiError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
              {aiError}
            </div>
          )}

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateAiBullets}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
          >
            <Sparkles className="h-4 w-4 text-amber-300" />
            <span>
              {isGenerating
                ? 'AI Optimizing Bullets & Cover Letter...'
                : `AI Polish Bullets & Generate ${standard.flagCode} Cover Letter (Free Preview)`}
            </span>
          </button>
        </div>

        {/* Live Preview + Payment Gate on Final Download */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-1 rounded-lg bg-stone-100 p-1 dark:bg-zinc-800">
              <button
                type="button"
                onClick={() => setDocView('cv')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                  docView === 'cv'
                    ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-950 dark:text-stone-100'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Live {standard.flagCode} CV Preview
              </button>
              <button
                type="button"
                onClick={() => setDocView('cover')}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${
                  docView === 'cover'
                    ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-950 dark:text-stone-100'
                    : 'text-stone-600 dark:text-stone-400'
                }`}
              >
                Cover Letter Preview
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setFullscreenPreview(true)}
                className="inline-flex min-h-[34px] items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
              >
                <Maximize2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{t.cvFullscreenPreviewBtn}</span>
              </button>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {isUnlocked ? 'EXPORT UNLOCKED' : `Download Fee: ${standard.priceEtb} ETB`}
              </span>
            </div>
          </div>

          {/* Paper Sheet Preview (Watermarked & Copy-protected prior to unlock) */}
          <div
            onContextMenu={(e) => {
              if (!isUnlocked) e.preventDefault();
            }}
            onCopy={(e) => {
              if (!isUnlocked) e.preventDefault();
            }}
            className={`relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm text-stone-900 ${
              !isUnlocked ? 'select-none' : ''
            }`}
          >
            {!isUnlocked && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-around opacity-15"
              >
                <div className="-rotate-24 font-mono text-sm sm:text-base font-extrabold tracking-widest text-emerald-900 whitespace-nowrap">
                  {t.cvWatermarkDraftBanner}
                </div>
                <div className="-rotate-24 font-mono text-sm sm:text-base font-extrabold tracking-widest text-emerald-900 whitespace-nowrap">
                  {t.cvWatermarkDraftBanner}
                </div>
              </div>
            )}
            {docView === 'cv' ? (
              <div className="space-y-4 text-xs leading-relaxed">
                <div className="flex items-start justify-between gap-4 border-b-2 border-stone-900 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-emerald-950">
                      {fullName || 'Applicant Name'}
                    </h3>
                    <div className="font-semibold text-stone-700">{targetRole}</div>
                    <div className="mt-1 text-[11px] text-stone-600">
                      {cityCountry} · {phone} · {email} · {linkedinUrl}
                    </div>
                    {standard.requiresVisaInfo && (
                      <div className="mt-1.5 font-semibold text-emerald-800">
                        Nationality: {nationality} · Visa Status: {visaStatus}
                      </div>
                    )}
                    {!standard.requiresPhoto && (
                      <div className="mt-1 text-[10px] font-mono text-stone-400">
                        {standard.flagCode} Compliance: Photo &amp; Birth Date Omitted
                      </div>
                    )}
                  </div>

                  {standard.requiresPhoto && (
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-stone-300 bg-stone-100 flex items-center justify-center text-[10px] text-stone-500">
                      {photoDataUrl ? (
                        <img
                          src={photoDataUrl}
                          alt="Applicant"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        'Photo Box'
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-0.5 mb-1.5">
                    Professional Summary
                  </div>
                  <p className="text-stone-700">{summaryText}</p>
                </div>

                <div>
                  <div className="font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-0.5 mb-1.5">
                    {standard.id === 'germany' ? 'Berufserfahrung / Work Experience' : 'Work Experience'}
                  </div>
                  <div className="whitespace-pre-wrap text-stone-700">
                    {aiEnhancedNotes || experienceText}
                  </div>
                </div>

                <div>
                  <div className="font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-0.5 mb-1.5">
                    {standard.id === 'germany' ? 'Ausbildung / Education' : 'Education & Credentials'}
                  </div>
                  <div className="whitespace-pre-wrap text-stone-700">{educationText}</div>
                </div>

                <div>
                  <div className="font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-0.5 mb-1.5">
                    Core Skills &amp; Languages
                  </div>
                  <p className="text-stone-700">{skillsText}</p>
                </div>

                {standard.id === 'ethiopia' && (
                  <div>
                    <div className="font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-0.5 mb-1.5">
                      References
                    </div>
                    <p className="text-stone-700">{refereesText}</p>
                  </div>
                )}

                {standard.requiresSignatureBlock && (
                  <div className="mt-6 flex items-center justify-between border-t border-stone-300 pt-4 text-[11px] font-medium text-stone-700">
                    <span>
                      {cityCountry}, {new Date().toLocaleDateString()}
                    </span>
                    <span>Unterschrift / Signature: ___________________</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs leading-relaxed">
                <div className="border-b border-stone-200 pb-3">
                  <div className="font-display text-base font-bold text-emerald-950">
                    {fullName} — Cover Letter ({standard.countryName.en})
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {cityCountry} · {email} · {phone}
                  </div>
                </div>
                <textarea
                  rows={12}
                  value={coverLetterDraft}
                  onChange={(e) => setCoverLetterDraft(e.target.value)}
                  className="w-full rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-800 focus:border-emerald-600 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Export / Checkout Gate */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
            {!isUnlocked ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5 font-semibold text-stone-700 dark:text-stone-300">
                    <Lock className="h-3.5 w-3.5 text-amber-600" />
                    <span>Pay once ({standard.priceEtb} ETB) to download clean Word (.doc) &amp; Print-PDF</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    onClick={() => onRequestCheckout(standard)}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                  >
                    <Download className="h-4 w-4" />
                    <span>
                      {t.cvPayCleanDownloadBtn} ({standard.priceEtb} ETB)
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={onOpenVipModal}
                    className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    <Crown className="h-3.5 w-3.5" />
                    <span>Or Unlock All with VIP</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleDownloadPrintPdf}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {isExportingPdf ? 'Generating PDF...' : 'Download Clean Final PDF (.pdf)'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadWord}
                  className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                >
                  <FileText className="h-4 w-4 text-sky-700 dark:text-sky-400" />
                  <span>Download Editable Word (.doc)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Free Watermarked Preview Modal */}
      {fullscreenPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-stone-900/90 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={t.cvFullscreenPreviewBtn}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-800 bg-zinc-950 px-4 py-3 text-white sm:px-6">
            <div>
              <div className="text-xs font-mono font-bold text-amber-400">
                {standard.flagCode} · {standard.countryName[lang]}
              </div>
              <div className="text-sm font-bold">
                {isUnlocked ? 'Final Clean CV & Cover Letter' : t.cvWatermarkDraftBanner}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!isUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    setFullscreenPreview(false);
                    onRequestCheckout(standard);
                  }}
                  className="inline-flex min-h-[38px] items-center gap-2 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {t.cvPayCleanDownloadBtn} ({standard.priceEtb} ETB)
                  </span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDownloadPrintPdf}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-500"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>PDF (.pdf)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadWord}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-zinc-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Word (.doc)</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setFullscreenPreview(false)}
                aria-label={t.closeBtn}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-stone-200 hover:bg-zinc-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="mx-auto max-w-3xl space-y-6">
              {/* Sheet 1: CV */}
              <div
                onContextMenu={(e) => {
                  if (!isUnlocked) e.preventDefault();
                }}
                onCopy={(e) => {
                  if (!isUnlocked) e.preventDefault();
                }}
                className={`relative overflow-hidden rounded-xl bg-white p-8 sm:p-10 text-stone-900 shadow-2xl ${
                  !isUnlocked ? 'select-none' : ''
                }`}
              >
                {!isUnlocked && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-around opacity-15"
                  >
                    <div className="-rotate-24 font-mono text-lg font-extrabold tracking-widest text-emerald-900">
                      {t.cvWatermarkDraftBanner}
                    </div>
                    <div className="-rotate-24 font-mono text-lg font-extrabold tracking-widest text-emerald-900">
                      {t.cvWatermarkDraftBanner}
                    </div>
                  </div>
                )}

                <div className="space-y-5 text-sm leading-relaxed">
                  <div className="flex items-start justify-between gap-4 border-b-2 border-stone-900 pb-4">
                    <div>
                      <h2 className="font-display text-2xl font-extrabold text-emerald-950">
                        {fullName || 'Applicant Name'}
                      </h2>
                      <div className="text-base font-semibold text-stone-700">{targetRole}</div>
                      <div className="mt-1 text-xs text-stone-600">
                        {cityCountry} · {phone} · {email} · {linkedinUrl}
                      </div>
                      {standard.requiresVisaInfo && (
                        <div className="mt-1.5 text-xs font-semibold text-emerald-800">
                          Nationality: {nationality} · Visa Status: {visaStatus}
                        </div>
                      )}
                    </div>
                    {standard.requiresPhoto && (
                      <div className="h-28 w-24 shrink-0 overflow-hidden rounded-lg border border-stone-300 bg-stone-100 flex items-center justify-center text-xs text-stone-500">
                        {photoDataUrl ? (
                          <img
                            src={photoDataUrl}
                            alt="Applicant"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          'Photo'
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1 mb-2">
                      Professional Summary
                    </div>
                    <p className="text-stone-700">{summaryText}</p>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1 mb-2">
                      {standard.id === 'germany' ? 'Berufserfahrung / Work Experience' : 'Work Experience'}
                    </div>
                    <div className="whitespace-pre-wrap text-stone-700">
                      {aiEnhancedNotes || experienceText}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1 mb-2">
                      {standard.id === 'germany' ? 'Ausbildung / Education' : 'Education & Credentials'}
                    </div>
                    <div className="whitespace-pre-wrap text-stone-700">{educationText}</div>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1 mb-2">
                      Core Skills &amp; Languages
                    </div>
                    <p className="text-stone-700">{skillsText}</p>
                  </div>

                  {standard.id === 'ethiopia' && (
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-stone-200 pb-1 mb-2">
                        References
                      </div>
                      <p className="text-stone-700">{refereesText}</p>
                    </div>
                  )}

                  {standard.requiresSignatureBlock && (
                    <div className="mt-8 flex items-center justify-between border-t border-stone-300 pt-4 text-xs font-medium text-stone-700">
                      <span>
                        {cityCountry}, {new Date().toLocaleDateString()}
                      </span>
                      <span>Unterschrift / Signature: ___________________</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sheet 2: Cover Letter */}
              <div
                onContextMenu={(e) => {
                  if (!isUnlocked) e.preventDefault();
                }}
                onCopy={(e) => {
                  if (!isUnlocked) e.preventDefault();
                }}
                className={`relative overflow-hidden rounded-xl bg-white p-8 sm:p-10 text-stone-900 shadow-2xl ${
                  !isUnlocked ? 'select-none' : ''
                }`}
              >
                {!isUnlocked && (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center opacity-15"
                  >
                    <div className="-rotate-24 font-mono text-lg font-extrabold tracking-widest text-emerald-900">
                      {t.cvWatermarkDraftBanner}
                    </div>
                  </div>
                )}
                <div className="border-b border-stone-200 pb-3 mb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Cover Letter — {standard.countryName[lang]}
                  </div>
                  <div className="mt-1 font-display text-xl font-bold text-emerald-950">
                    {fullName}
                  </div>
                  <div className="text-xs text-stone-500">
                    {cityCountry} · {email} · {phone}
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm leading-relaxed text-stone-800">
                  {coverLetterDraft}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
