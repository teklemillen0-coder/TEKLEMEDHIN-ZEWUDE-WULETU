import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Crown,
  Download,
  FileSpreadsheet,
  FileText,
  Lock,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
} from 'lucide-react';
import { AI_TOOLS_LIST } from '../constants/aiTools';
import { AdConfig, AiToolDefinition, Language } from '../types';
import { AdSlot } from './AdSlot';

interface AiToolsSuiteViewProps {
  lang: Language;
  unlockedToolIds: Set<string>;
  vipActive: boolean;
  onRequestCheckout: (tool: AiToolDefinition) => void;
  onOpenVipModal: () => void;
  adConfig: AdConfig;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

const TOOL_UI_COPY: Record<
  Language,
  {
    pageTitle: string;
    pageSubtitle: string;
    freeTryBadge: string;
    generateBtn: string;
    generatingBtn: string;
    resetDefaults: string;
    uploadLabel: string;
    uploadHint: string;
    outputTitle: string;
    emptyOutput: string;
    payToDownloadBtn: string;
    unlockedBanner: string;
    downloadPdfBtn: string;
    downloadWordBtn: string;
    downloadExcelBtn: string;
    vipShortcut: string;
  }
> = {
  en: {
    pageTitle: 'AI & Smart Work Tools / የስራ እና AI መሳሪያዎች',
    pageSubtitle:
      'Generate & preview outputs 100% FREE with Gemini AI. Pay via Telebirr (0925695197) or CBE (1000211261513) only when you want to download the final PDF, Word, or Excel file.',
    freeTryBadge: 'Free AI Preview · Pay Only to Download',
    generateBtn: 'Generate Free Preview (AI)',
    generatingBtn: 'Generating with AI...',
    resetDefaults: 'Load Sample Inputs',
    uploadLabel: 'Attach Budget / Ledger / Tender File (Optional)',
    uploadHint: 'Supports .txt, .csv, .md, .json documents up to 500 KB',
    outputTitle: 'AI Generated Work Output (Live Preview)',
    emptyOutput: 'Adjust the parameters above and click "Generate Free Preview (AI)" to test this tool for free.',
    payToDownloadBtn: 'Unlock & Download Final File (PDF / Word / Excel)',
    unlockedBanner: 'Unlocked on this device — Export unlimited PDF, Word & Excel copies below.',
    downloadPdfBtn: 'PDF-Ready Report',
    downloadWordBtn: 'Word (.doc)',
    downloadExcelBtn: 'Excel (.csv)',
    vipShortcut: 'Or Unlock All Tools with VIP Pass',
  },
  am: {
    pageTitle: 'የስራ እና AI መሳሪያዎች (AI Smart Work Suite)',
    pageSubtitle:
      'ማንኛውንም የAI ስራ ውጤት በነፃ ይሞክሩ እና ይመልከቱ። የመጨረሻውን PDF፣ Word ወይም Excel ፋይል ማውረድ ሲፈልጉ ብቻ በቴሌብር (0925695197) ወይም ንግድ ባንክ (1000211261513) ይክፈሉ።',
    freeTryBadge: 'ነፃ AI ሙከራ · ፋይል ሲያወርዱ ብቻ ይክፈሉ',
    generateBtn: 'በነፃ አመንጭ (AI Preview)',
    generatingBtn: 'AI በማዘጋጀት ላይ ነው...',
    resetDefaults: 'ናሙና መረጃ ሙላ',
    uploadLabel: 'የበጀት ወይም የስራ ፋይል ይጫኑ (አማራጭ)',
    uploadHint: '.txt, .csv, .md, .json ፋይሎችን ይቀበላል',
    outputTitle: 'በAI የተዘጋጀ ውጤት (ቅድመ-እይታ)',
    emptyOutput: 'ከላይ ያሉትን መረጃዎች አስተካክለው "በነፃ አመንጭ" የሚለውን ይጫኑ።',
    payToDownloadBtn: 'ክፈት እና ዋናውን ፋይል አውርድ (PDF / Word / Excel)',
    unlockedBanner: 'በዚህ መሳሪያ ላይ ተከፍቷል — PDF፣ Word እና Excel በነፃ ያውርዱ።',
    downloadPdfBtn: 'PDF ሪፖርት',
    downloadWordBtn: 'Word (.doc)',
    downloadExcelBtn: 'Excel (.csv)',
    vipShortcut: 'ወይም በVIP ጥቅል ሁሉንም ይክፈቱ',
  },
  om: {
    pageTitle: 'Meeshaalee Hojii & AI (Smart Work Suite)',
    pageSubtitle:
      'Buʼaa AI bilisaan yaalaa. Faayila xumuraa PDF, Word ykn Excel buusuuf yoo barbaaddan qofa Telebirr (0925695197) ykn CBE (1000211261513) kaffalaa.',
    freeTryBadge: 'Yaalii AI Bilisaa · Buusuuf Qofa Kaffali',
    generateBtn: 'Bilisaan Qopheessi (AI)',
    generatingBtn: 'AI qopheessaa jira...',
    resetDefaults: 'Fakkeenya Guuti',
    uploadLabel: 'Faayila Baajataa / Hojiif Ol-kaaʼi (Dirqama Miti)',
    uploadHint: 'Faayila .txt, .csv, .md, .json fudhata',
    outputTitle: 'Buʼaa AI Qophaaʼe (Agarsiisa)',
    emptyOutput: 'Odeeffannoo armaan olii guutuun "Bilisaan Qopheessi" cuqaasi.',
    payToDownloadBtn: 'Bani & Faayila Xumuraa Buusi (PDF / Word / Excel)',
    unlockedBanner: 'Meeshaa kana irratti banameera — PDF, Word & Excel buusi.',
    downloadPdfBtn: 'PDF Qophaaʼaa',
    downloadWordBtn: 'Word (.doc)',
    downloadExcelBtn: 'Excel (.csv)',
    vipShortcut: 'Ykn VIPʼn Hunda Bani',
  },
  ti: {
    pageTitle: 'መሳርሒታት ስራሕን AIን (Smart Work Suite)',
    pageSubtitle:
      'ውጽኢት AI ብናጻ ፈትኑ። ናይ መወዳእታ PDF፣ Word ወይ Excel ፋይል ክተውርዱ ምስ እትደልዩ ጥራይ ብቴሌብር (0925695197) ወይ CBE (1000211261513) ክፈሉ።',
    freeTryBadge: 'ናጻ AI ፈተነ · ንምውራድ ጥራይ ክፈሉ',
    generateBtn: 'ብናጻ ኣዳሉ (AI Preview)',
    generatingBtn: 'AI የዳሉ ኣሎ...',
    resetDefaults: 'ናሙና ሓበሬታ ምላእ',
    uploadLabel: 'ፋይል ጽዓን (ኣማራጺ)',
    uploadHint: '.txt, .csv, .md, .json ፋይላት ይቕበል',
    outputTitle: 'ብAI ዝተዳለወ ውጽኢት',
    emptyOutput: 'ኣብ ላዕሊ ዘሎ ሓበሬታ ኣተዓራሪኹም "ብናጻ ኣዳሉ" ጠውቑ።',
    payToDownloadBtn: 'ክፈትን ዋና ፋይል ኣውርድን (PDF / Word / Excel)',
    unlockedBanner: 'ኣብዚ መሳርሒ ተኸፊቱ ኣሎ — PDF፣ Wordን Excelን ኣውርዱ።',
    downloadPdfBtn: 'PDF ጸብጻብ',
    downloadWordBtn: 'Word (.doc)',
    downloadExcelBtn: 'Excel (.csv)',
    vipShortcut: 'ወይ ብVIP ጥቅል ኩሉ ክፈቱ',
  },
  so: {
    pageTitle: 'Qalabka Shaqada & AI (Smart Work Suite)',
    pageSubtitle:
      'Tijaabi oo arag natiijada AI si 100% BILAASH ah. Kaliya ku bixi Telebirr (0925695197) ama CBE (1000211261513) marka aad rabto inaad soo dejiso faylka PDF, Word, ama Excel.',
    freeTryBadge: 'Tijaabo AI Bilaash ah · Bixi Kaliya Soo-dejinta',
    generateBtn: 'Samee Horudhac Bilaash ah (AI)',
    generatingBtn: 'AI ayaa diyaarinaysa...',
    resetDefaults: 'Buuxi Tusaale',
    uploadLabel: 'Ku Lifaaq Fayl Miisaaniyad / Xog (Ikhtiyaari)',
    uploadHint: 'Wuxuu aqbalaa .txt, .csv, .md, .json',
    outputTitle: 'Natiijada AI Diyaarisay',
    emptyOutput: 'Buuxi xogta sare ka dibna guji "Samee Horudhac Bilaash ah".',
    payToDownloadBtn: 'Fur & Soo Deji Faylka (PDF / Word / Excel)',
    unlockedBanner: 'Waa la furay — Soo deji nuqullo PDF, Word & Excel ah.',
    downloadPdfBtn: 'Warbixin PDF',
    downloadWordBtn: 'Word (.doc)',
    downloadExcelBtn: 'Excel (.csv)',
    vipShortcut: 'Ama Dhammaan Ku Fur VIP Pass',
  },
};

function triggerBlobDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function markdownToCsv(markdown: string, toolTitle: string): string {
  const lines = markdown.split('\n');
  const csvRows: string[] = [`"AddisVault AI Export — ${toolTitle.replace(/"/g, '""')}"`];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (/^\|[\s-:|]+\|$/.test(trimmed)) continue;
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const cells = trimmed
        .slice(1, -1)
        .split('|')
        .map((c) => `"${c.trim().replace(/"/g, '""')}"`);
      csvRows.push(cells.join(','));
    } else {
      csvRows.push(`"${trimmed.replace(/^#+\s*/, '').replace(/"/g, '""')}"`);
    }
  }
  return '\uFEFF' + csvRows.join('\n');
}

export const AiToolsSuiteView: React.FC<AiToolsSuiteViewProps> = ({
  lang,
  unlockedToolIds,
  vipActive,
  onRequestCheckout,
  onOpenVipModal,
  adConfig,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const copy = TOOL_UI_COPY[lang];
  const [selectedToolId, setSelectedToolId] = useState<string>(AI_TOOLS_LIST[0].id);

  const activeTool = useMemo(
    () => AI_TOOLS_LIST.find((tool) => tool.id === selectedToolId) || AI_TOOLS_LIST[0],
    [selectedToolId]
  );

  const [formValuesByTool, setFormValuesByTool] = useState<Record<string, Record<string, string>>>(() => {
    const init: Record<string, Record<string, string>> = {};
    for (const tool of AI_TOOLS_LIST) {
      init[tool.id] = {};
      for (const f of tool.fields) {
        init[tool.id][f.key] = f.defaultValue || '';
      }
    }
    return init;
  });

  const [uploadedFileByTool, setUploadedFileByTool] = useState<
    Record<string, { name: string; text: string }>
  >({});
  const [outputsByTool, setOutputsByTool] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentInputs = formValuesByTool[activeTool.id] || {};
  const currentOutput = outputsByTool[activeTool.id] || '';
  const currentUpload = uploadedFileByTool[activeTool.id];
  const isUnlocked = vipActive || unlockedToolIds.has(activeTool.id);

  const handleFieldChange = (key: string, value: string) => {
    setFormValuesByTool((prev) => ({
      ...prev,
      [activeTool.id]: {
        ...(prev[activeTool.id] || {}),
        [key]: value,
      },
    }));
  };

  const handleResetDefaults = () => {
    const defaults: Record<string, string> = {};
    for (const f of activeTool.fields) {
      defaults[f.key] = f.defaultValue || '';
    }
    setFormValuesByTool((prev) => ({
      ...prev,
      [activeTool.id]: defaults,
    }));
    setErrorMsg(null);
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) return;
    if (file.size > 500 * 1024) {
      setErrorMsg('Please upload a text/CSV/document file under 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setUploadedFileByTool((prev) => ({
        ...prev,
        [activeTool.id]: { name: file.name, text },
      }));
      setErrorMsg(null);
    };
    reader.readAsText(file);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolTitle: activeTool.title.en,
          systemInstruction: activeTool.systemInstruction,
          inputs: currentInputs,
          uploadedText: currentUpload?.text || '',
          language: lang,
        }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || !data.content) {
        setErrorMsg(data.error || 'Could not generate AI preview right now. Please try again.');
      } else {
        setOutputsByTool((prev) => ({
          ...prev,
          [activeTool.id]: data.content!,
        }));
      }
    } catch {
      setErrorMsg('Network error while connecting to AI service. Please check your connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExport = (format: 'pdf' | 'word' | 'excel') => {
    const textToExport =
      currentOutput ||
      `${activeTool.title[lang]}\n\nParameters:\n${Object.entries(currentInputs)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')}`;
    const safeSlug = activeTool.id.replace(/[^a-z0-9_-]/gi, '-');

    if (format === 'excel') {
      const csv = markdownToCsv(textToExport, activeTool.title[lang]);
      triggerBlobDownload(`addisvault-${safeSlug}.csv`, csv, 'text/csv;charset=utf-8');
      return;
    }

    const htmlBody = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(activeTool.title[lang])} — AddisVault AI Deliverable</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 820px; margin: 36px auto; padding: 0 24px; color: #1c1917; line-height: 1.65; }
    .hdr { border-bottom: 2px solid #065f46; padding-bottom: 12px; margin-bottom: 20px; }
    .hdr h1 { margin: 0 0 4px 0; font-size: 20px; color: #065f46; }
    .hdr p { margin: 0; font-size: 12px; color: #57534e; }
    pre { white-space: pre-wrap; font-family: inherit; font-size: 13.5px; background: #fafaf9; border: 1px solid #e7e5e4; padding: 18px; border-radius: 8px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="hdr">
    <h1>${escapeHtml(activeTool.title[lang])}</h1>
    <p>Generated by AddisVault Smart Work Suite · ${new Date().toLocaleDateString()} · Telebirr 0925695197 / CBE 1000211261513</p>
  </div>
  ${
    format === 'pdf'
      ? '<p class="no-print"><button onclick="window.print()" style="padding:8px 14px;background:#047857;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Print / Save as PDF</button></p>'
      : ''
  }
  <pre>${escapeHtml(textToExport)}</pre>
</body>
</html>`;

    if (format === 'word') {
      triggerBlobDownload(`addisvault-${safeSlug}.doc`, htmlBody, 'application/msword;charset=utf-8');
    } else {
      triggerBlobDownload(`addisvault-${safeSlug}-pdf-ready.html`, htmlBody, 'text/html;charset=utf-8');
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" />
            <span>{copy.freeTryBadge}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {copy.pageTitle}
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-stone-600 dark:text-stone-400 leading-relaxed">
            {copy.pageSubtitle}
          </p>
        </div>

        {!vipActive && (
          <button
            type="button"
            onClick={onOpenVipModal}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300"
          >
            <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>{copy.vipShortcut}</span>
          </button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Catalog of 10 AI Work Tools */}
        <div className="lg:col-span-4 space-y-2.5">
          {AI_TOOLS_LIST.map((tool, idx) => {
            const selected = tool.id === activeTool.id;
            const unlocked = vipActive || unlockedToolIds.has(tool.id);
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => {
                  setSelectedToolId(tool.id);
                  setErrorMsg(null);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                  selected
                    ? 'border-emerald-600 bg-emerald-50/60 dark:border-emerald-500 dark:bg-emerald-950/25'
                    : 'border-stone-200 bg-white hover:border-stone-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                  <span className="text-emerald-800 dark:text-emerald-400">
                    {String(idx + 1).padStart(2, '0')} · {tool.categoryTag[lang]}
                  </span>
                  {unlocked ? (
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="font-mono font-bold text-stone-600 dark:text-stone-300">
                      {tool.priceEtb} ETB
                    </span>
                  )}
                </div>
                <div className="mt-1 font-display text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                  {tool.title[lang]}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-stone-600 dark:text-stone-400">
                  {tool.description[lang]}
                </p>
              </button>
            );
          })}
        </div>

        {/* Right Interactive AI Workspace */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4 dark:border-zinc-800">
              <div>
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  {activeTool.categoryTag[lang]}
                </div>
                <h2 className="mt-1 font-display text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100">
                  {activeTool.title[lang]}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {activeTool.description[lang]}
                </p>
              </div>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{copy.resetDefaults}</span>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="mt-5 space-y-4">
              {activeTool.supportsFileUpload && (
                <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50/70 p-4 dark:border-zinc-700 dark:bg-zinc-950/60">
                  <label className="flex cursor-pointer flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Upload className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                      <div>
                        <div className="text-xs font-bold text-stone-800 dark:text-stone-200">
                          {copy.uploadLabel}
                        </div>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400">
                          {currentUpload
                            ? `Loaded: ${currentUpload.name} (${currentUpload.text.length.toLocaleString()} chars)`
                            : copy.uploadHint}
                        </div>
                      </div>
                    </div>
                    <span className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200">
                      Choose File
                    </span>
                    <input
                      type="file"
                      accept=".txt,.csv,.md,.json,.log"
                      onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                      className="sr-only"
                    />
                  </label>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {activeTool.fields.map((field) => (
                  <div
                    key={field.key}
                    className={field.type === 'textarea' ? 'sm:col-span-2' : ''}
                  >
                    <label
                      htmlFor={`ai-field-${activeTool.id}-${field.key}`}
                      className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
                    >
                      {field.label[lang]}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        id={`ai-field-${activeTool.id}-${field.key}`}
                        rows={3}
                        value={currentInputs[field.key] ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                      />
                    ) : field.type === 'select' && field.options ? (
                      <select
                        id={`ai-field-${activeTool.id}-${field.key}`}
                        value={currentInputs[field.key] ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                      >
                        {field.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`ai-field-${activeTool.id}-${field.key}`}
                        type={field.type}
                        value={currentInputs[field.key] ?? ''}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        placeholder={field.placeholder}
                        className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                      />
                    )}
                  </div>
                ))}
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isGenerating ? copy.generatingBtn : copy.generateBtn}</span>
              </button>
            </form>
          </div>

          {/* Live AI Output + Pay-to-Download Export Gate */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                <FileText className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>{copy.outputTitle}</span>
              </div>
              <span className="font-mono text-xs text-stone-500 dark:text-stone-400">
                {activeTool.priceEtb} ETB export
              </span>
            </div>

            {currentOutput ? (
              <div className="mt-4 max-h-[380px] overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-4 text-xs sm:text-sm leading-relaxed text-stone-800 whitespace-pre-wrap font-sans dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-200">
                {currentOutput}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50/60 p-6 text-center text-xs sm:text-sm text-stone-500 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-stone-400">
                {copy.emptyOutput}
              </div>
            )}

            {/* Pay-to-Download Action Bar */}
            <div className="mt-5 border-t border-stone-100 pt-4 dark:border-zinc-800">
              {isUnlocked ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>{copy.unlockedBanner}</span>
                  </div>
                  <div className="grid gap-2.5 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => handleExport('pdf')}
                      className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <Printer className="h-4 w-4" />
                      <span>{copy.downloadPdfBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('word')}
                      className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                    >
                      <Download className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      <span>{copy.downloadWordBtn}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExport('excel')}
                      className="flex min-h-[42px] items-center justify-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                    >
                      <FileSpreadsheet className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span>{copy.downloadExcelBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-stone-600 dark:text-stone-400">
                    Telebirr <strong className="font-mono">0925695197</strong> · CBE{' '}
                    <strong className="font-mono">1000211261513</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRequestCheckout(activeTool)}
                    className="flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700"
                  >
                    <Lock className="h-4 w-4 shrink-0" />
                    <span>
                      {copy.payToDownloadBtn} · {activeTool.priceEtb} ETB
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <AdSlot
            slot="in_feed"
            adConfig={adConfig}
            lang={lang}
            onTrackImpression={onTrackAdImpression}
            onTrackClick={onTrackAdClick}
          />
        </div>
      </div>
    </section>
  );
};
