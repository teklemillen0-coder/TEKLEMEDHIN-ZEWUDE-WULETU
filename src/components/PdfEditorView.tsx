import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Crown,
  Download,
  Eye,
  FileImage,
  FilePlus2,
  FileText,
  Languages,
  Lock,
  Maximize2,
  Plus,
  Sparkles,
  Trash2,
  Upload,
  Wand2,
  X,
} from 'lucide-react';
import {
  PDF_EXPORT_TIERS,
  STARTER_PDF_TEMPLATES,
  StarterPdfTemplate,
} from '../constants/pdfAndCommunity';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  Language,
  PdfExportFormatId,
  PendingPdfExport,
} from '../types';
import { checkClientRateLimit, sanitizeUserInput } from '../utils/appSecurity';
import {
  buildRealPdfBytes,
  inspectUploadedPdf,
  renderDocumentToCanvasPng,
  triggerUint8Download,
} from '../utils/documentExport';

interface PdfEditorViewProps {
  lang: Language;
  vipActive: boolean;
  unlockedPdfIds: Set<string>;
  lastConfirmedPdfExport: PendingPdfExport | null;
  onConsumeConfirmedPdfExport: () => void;
  onRequestCheckout: (item: PendingPdfExport) => void;
  onOpenVipModal: () => void;
  onActivityPoint?: (action: 'download') => void;
}

interface EditableField {
  key: string;
  label: string;
  value: string;
  isAcro?: boolean;
}

export const PdfEditorView: React.FC<PdfEditorViewProps> = ({
  lang,
  vipActive,
  unlockedPdfIds,
  lastConfirmedPdfExport,
  onConsumeConfirmedPdfExport,
  onRequestCheckout,
  onOpenVipModal,
  onActivityPoint,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [docTitle, setDocTitle] = useState<string>(STARTER_PDF_TEMPLATES[0].title);
  const [fields, setFields] = useState<EditableField[]>(STARTER_PDF_TEMPLATES[0].fields);
  const [bodyText, setBodyText] = useState<string>(STARTER_PDF_TEMPLATES[0].bodyText);
  const [sourcePdfBytes, setSourcePdfBytes] = useState<Uint8Array | null>(null);
  const [sourcePdfPreviewUrl, setSourcePdfPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(1);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponseNote, setAiResponseNote] = useState<string | null>(null);
  const [isAiBusy, setIsAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [selectedFormatId, setSelectedFormatId] = useState<PdfExportFormatId>('pdf_clean');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const activeExportTier =
    PDF_EXPORT_TIERS.find((tier) => tier.id === selectedFormatId) || PDF_EXPORT_TIERS[0];

  const docHashKey = `${docTitle.trim().slice(0, 32)}_${selectedFormatId}`;
  const isCurrentFormatUnlocked = vipActive || unlockedPdfIds.has(docHashKey);

  useEffect(() => {
    return () => {
      if (sourcePdfPreviewUrl) URL.revokeObjectURL(sourcePdfPreviewUrl);
    };
  }, [sourcePdfPreviewUrl]);

  const performExport = async (formatId: PdfExportFormatId) => {
    setIsExporting(true);
    try {
      const slug =
        docTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'addisvault-document';

      const filledFieldsBlock = fields
        .map((f) => `${f.label}: ${f.value || '________________________'}`)
        .join('\n');

      const sections = [
        {
          heading: 'Filled Form Fields / የተሞሉ መረጃዎች',
          content: filledFieldsBlock,
        },
        {
          heading: 'Document Content / የሰነድ ይዘት',
          content: bodyText,
        },
      ];

      const acroValues: Record<string, string> = {};
      for (const f of fields) {
        if (f.isAcro) acroValues[f.key] = f.value;
      }

      if (formatId === 'pdf_clean' || formatId === 'all_bundle') {
        const pdfBytes = await buildRealPdfBytes({
          sourcePdfBytes,
          acroFormValues: acroValues,
          pages: [
            {
              title: docTitle,
              subtitle: uploadedFileName ? `Updated Document (${uploadedFileName})` : 'AddisVault Smart PDF Form',
              metaLine: `Prepared with AddisVault Smart PDF Filler · ${new Date().toLocaleDateString()}`,
              sections,
              signatureFooter: `Verified Digital Document · AddisVault Ethiopia`,
            },
          ],
        });
        triggerUint8Download(`${slug}-filled.pdf`, pdfBytes, 'application/pdf');
      }

      if (formatId === 'word_editable' || formatId === 'all_bundle') {
        const rowsHtml = fields
          .map(
            (f) =>
              `<tr><td style="padding:6px 10px;border:1px solid #d6d3d1;font-weight:600;background:#fafaf9;">${sanitizeUserInput(
                f.label,
                160
              )}</td><td style="padding:6px 10px;border:1px solid #d6d3d1;">${sanitizeUserInput(
                f.value || '',
                500
              )}</td></tr>`
          )
          .join('');
        const bodyHtml = bodyText
          .split('\n')
          .map((p) => `<p style="margin:6px 0;">${sanitizeUserInput(p, 1200)}</p>`)
          .join('');
        const wordDoc = `<!doctype html><html><head><meta charset="utf-8"><title>${sanitizeUserInput(
          docTitle,
          120
        )}</title></head><body style="font-family:'Segoe UI',Calibri,Arial,sans-serif;max-width:780px;margin:32px auto;color:#1c1917;line-height:1.55;">
          <h1 style="color:#065f46;border-bottom:2px solid #065f46;padding-bottom:8px;">${sanitizeUserInput(
            docTitle,
            140
          )}</h1>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${rowsHtml}</table>
          <div style="margin-top:20px;">${bodyHtml}</div>
        </body></html>`;
        triggerUint8Download(`${slug}-editable.doc`, '\ufeff' + wordDoc, 'application/msword;charset=utf-8');
      }

      if (formatId === 'png_highres' || formatId === 'all_bundle') {
        const { bytes: pngBytes } = await renderDocumentToCanvasPng({
          title: docTitle,
          subtitle: uploadedFileName ? `Edited from ${uploadedFileName}` : 'AddisVault Smart Form',
          metaLine: `Date: ${new Date().toLocaleDateString()}`,
          sections,
          signatureFooter: 'Exported via AddisVault Smart PDF Filler & AI Editor',
        });
        triggerUint8Download(`${slug}-highres.png`, pngBytes, 'image/png');
      }

      onActivityPoint?.('download');
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    if (!lastConfirmedPdfExport) return;
    void performExport(lastConfirmedPdfExport.formatOption.id);
    onConsumeConfirmedPdfExport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastConfirmedPdfExport]);

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setAiError('Please select a valid .pdf document.');
      return;
    }

    setAiError(null);
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    setSourcePdfBytes(bytes);
    setUploadedFileName(file.name);
    setDocTitle(file.name.replace(/\.pdf$/i, ''));

    if (sourcePdfPreviewUrl) URL.revokeObjectURL(sourcePdfPreviewUrl);
    const previewBlobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
    setSourcePdfPreviewUrl(previewBlobUrl);

    const inspected = await inspectUploadedPdf(bytes);
    setPdfPageCount(inspected.pageCount);

    if (inspected.acroFields.length > 0) {
      setFields(
        inspected.acroFields.slice(0, 20).map((f) => ({
          key: f.name,
          label: f.name.replace(/[_-]+/g, ' '),
          value: f.currentValue,
          isAcro: true,
        }))
      );
    } else {
      setFields([
        { key: 'full_name', label: 'Applicant / Party Full Name', value: '' },
        { key: 'id_or_ref', label: 'ID / License / Reference No.', value: '' },
        { key: 'date_field', label: 'Date / ቀን', value: new Date().toLocaleDateString() },
        { key: 'location_field', label: 'City / Sub-City / Office', value: '' },
      ]);
    }

    if (inspected.extractedHintText.trim()) {
      setBodyText(inspected.extractedHintText);
    }
  };

  const handleLoadTemplate = (tpl: StarterPdfTemplate) => {
    setSourcePdfBytes(null);
    if (sourcePdfPreviewUrl) {
      URL.revokeObjectURL(sourcePdfPreviewUrl);
      setSourcePdfPreviewUrl(null);
    }
    setUploadedFileName(null);
    setPdfPageCount(1);
    setDocTitle(tpl.title);
    setFields(tpl.fields.map((f) => ({ ...f })));
    setBodyText(tpl.bodyText);
    setAiResponseNote(null);
    setAiError(null);
  };

  const handleAddField = () => {
    const cleanLabel = sanitizeUserInput(newFieldLabel, 80).trim();
    if (!cleanLabel) return;
    setFields((prev) => [
      ...prev,
      {
        key: `custom_${Date.now()}`,
        label: cleanLabel,
        value: '',
      },
    ]);
    setNewFieldLabel('');
  };

  const runAiAssistant = async (
    mode: 'auto_fill' | 'translate_am' | 'translate_en' | 'fix_grammar' | 'custom'
  ) => {
    if (!checkClientRateLimit('pdf_ai_helper', 12)) {
      setAiError('Rate limit reached. Please wait 60 seconds.');
      return;
    }
    setIsAiBusy(true);
    setAiError(null);

    const taskInstructions: Record<typeof mode, string> = {
      auto_fill:
        'Fill any blank form fields cleanly based on the context and improve the document body so it reads professionally and completely. Return a JSON-like list or clean [FIELDS] block followed by [DOCUMENT BODY].',
      translate_am:
        'Translate the document fields and full body text accurately into natural, formal Amharic (አማርኛ) while preserving all numbers and legal/official names.',
      translate_en:
        'Translate the document fields and full body text into crisp, formal International Business & Legal English.',
      fix_grammar:
        'Proofread, fix all grammar/spelling/punctuation mistakes, and polish formatting into crisp formal prose without changing factual meaning.',
      custom:
        sanitizeUserInput(aiPrompt, 600) ||
        'Improve clarity, format headings cleanly, and complete missing standard sections.',
    };

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolTitle: `Smart PDF Form Filler & Document Editor — ${docTitle}`,
          language: mode === 'translate_am' ? 'am' : mode === 'translate_en' ? 'en' : lang,
          systemInstruction: `You are an expert bilingual Ethiopian & international document editor. Task: ${taskInstructions[mode]}. Return clearly structured text with [FILLED_FIELDS] key=value lines if helpful, followed by [DOCUMENT_BODY] ready to paste into the official PDF.`,
          inputs: {
            DocumentTitle: sanitizeUserInput(docTitle, 140),
            FormFields: fields.map((f) => `${f.label}: ${f.value || '(BLANK)'}`).join('\n'),
            UserInstruction: sanitizeUserInput(aiPrompt, 500),
          },
          uploadedText: sanitizeUserInput(bodyText, 5000),
        }),
      });
      const data = (await response.json()) as { content?: string; error?: string };
      if (!response.ok || !data.content) {
        setAiError(data.error || 'Could not reach AI Document Assistant.');
        return;
      }

      const raw = data.content.trim();
      setAiResponseNote(raw);

      // Parse optional [DOCUMENT_BODY] section automatically if present
      const splitBody = raw.split(/\[DOCUMENT_BODY\]|\[DOCUMENT BODY\]/i);
      if (splitBody.length >= 2) {
        const parsedFieldsText = splitBody[0].replace(/\[FILLED_FIELDS\]|\[FIELDS\]/gi, '').trim();
        const nextBody = splitBody.slice(1).join('\n').trim();
        if (nextBody) setBodyText(nextBody);

        if (parsedFieldsText) {
          setFields((prev) =>
            prev.map((field) => {
              const rx = new RegExp(
                `${field.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:=]\\s*(.+)`,
                'i'
              );
              const m = parsedFieldsText.match(rx);
              if (m?.[1] && !field.value.trim()) {
                return { ...field, value: m[1].trim() };
              }
              return field;
            })
          );
        }
      } else {
        setBodyText(raw);
      }
    } catch {
      setAiError('Network error contacting AI Document Assistant.');
    } finally {
      setIsAiBusy(false);
    }
  };

  const handlePayOrExport = () => {
    if (isCurrentFormatUnlocked) {
      void performExport(selectedFormatId);
      return;
    }
    onRequestCheckout({
      id: docHashKey,
      documentTitle: docTitle || 'PDF Document',
      formatOption: activeExportTier,
    });
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <FileText className="h-4 w-4" />
            <span>PDF መሙያ እና AI አስተካካይ · Smart PDF Filler &amp; AI Editor</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t.pdfEditorTitle}
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-stone-600 dark:text-stone-400">
            {t.pdfEditorSubtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreenPreview(true)}
          className="inline-flex min-h-[42px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
        >
          <Maximize2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t.cvFullscreenPreviewBtn}</span>
        </button>
      </div>

      {/* PDF Upload & Starter Form Templates Bar */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUploadPdf}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-600"
            >
              <Upload className="h-4 w-4" />
              <span>{t.pdfUploadBtn}</span>
            </button>
            {uploadedFileName && (
              <span className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                Loaded: <strong>{uploadedFileName}</strong> ({pdfPageCount} page{pdfPageCount > 1 ? 's' : ''})
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
              {t.pdfStarterTemplatesLabel}
            </span>
            {STARTER_PDF_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleLoadTemplate(tpl)}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-800 hover:border-emerald-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-200"
              >
                <FilePlus2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>{tpl.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Split Workspace: Fields + Document Editor (Left) & AI Helper + Watermarked Live Preview (Right) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Document Title, Form Fields & Editable Body */}
        <div className="lg:col-span-6 space-y-5 rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Document Title
            </label>
            <input
              type="text"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          {/* Detected & Custom Fillable Form Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                Form Fields ({fields.length})
              </h2>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {fields.map((field, idx) => (
                <div key={field.key} className="relative">
                  <div className="flex items-center justify-between gap-1">
                    <label className="block text-[11px] font-semibold text-stone-600 dark:text-stone-300 truncate">
                      {field.label}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFields((prev) => prev.filter((_, i) => i !== idx))}
                      aria-label="Remove field"
                      className="text-stone-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={field.value}
                    onChange={(e) =>
                      setFields((prev) =>
                        prev.map((item, i) =>
                          i === idx ? { ...item, value: e.target.value } : item
                        )
                      )
                    }
                    placeholder={`Enter ${field.label}...`}
                    className="mt-1 h-9 w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
              ))}
            </div>

            {/* Add custom form field */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Add new field name (e.g. Signature, Kebele ID)..."
                className="h-9 flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
              <button
                type="button"
                onClick={handleAddField}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Field</span>
              </button>
            </div>
          </div>

          {/* Editable Main Document Body */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
              Document Text &amp; Sections (Editable)
            </label>
            <textarea
              rows={9}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs leading-relaxed dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
            />
          </div>

          {/* Source PDF Embed if uploaded */}
          {sourcePdfPreviewUrl && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                Original Uploaded PDF Reference
              </div>
              <iframe
                src={sourcePdfPreviewUrl}
                title="Uploaded PDF Reference"
                className="h-56 w-full rounded-xl border border-stone-200 bg-stone-100 dark:border-zinc-800"
              />
            </div>
          )}
        </div>

        {/* Right Column: Interactive AI Document Helper + Watermarked Preview + Multi-Format Export */}
        <div className="lg:col-span-6 space-y-5">
          {/* Interactive AI Helper */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 space-y-3.5 dark:border-emerald-900/50 dark:bg-emerald-950/20">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-display text-sm font-bold text-emerald-950 dark:text-emerald-200">
                <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{t.pdfAiHelperTitle}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isAiBusy}
                onClick={() => runAiAssistant('auto_fill')}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-50 dark:bg-emerald-600"
              >
                <Wand2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.pdfAiActionAutoFill}</span>
              </button>
              <button
                type="button"
                disabled={isAiBusy}
                onClick={() => runAiAssistant('fix_grammar')}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{t.pdfAiActionFixGrammar}</span>
              </button>
              <button
                type="button"
                disabled={isAiBusy}
                onClick={() => runAiAssistant('translate_am')}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
              >
                <Languages className="h-3.5 w-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                <span className="truncate">{t.pdfAiActionTranslateAm}</span>
              </button>
              <button
                type="button"
                disabled={isAiBusy}
                onClick={() => runAiAssistant('translate_en')}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
              >
                <Languages className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <span className="truncate">{t.pdfAiActionTranslateEn}</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder={t.pdfAiPromptPlaceholder}
                className="h-10 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-xs dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
              />
              <button
                type="button"
                disabled={isAiBusy}
                onClick={() => runAiAssistant('custom')}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-50 whitespace-nowrap"
              >
                <span>{isAiBusy ? '...' : t.pdfAiActionRunCustom}</span>
              </button>
            </div>

            {aiError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                {aiError}
              </div>
            )}

            {aiResponseNote && (
              <div className="rounded-xl border border-emerald-200 bg-white p-3 text-xs text-stone-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-stone-300">
                <div className="font-semibold text-emerald-800 dark:text-emerald-400">
                  AI Applied Changes to Document
                </div>
                <p className="mt-1 line-clamp-3 text-[11px]">{aiResponseNote}</p>
              </div>
            )}
          </div>

          {/* Live Watermarked Sheet Preview */}
          <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 shadow-sm text-stone-900">
            {!isCurrentFormatUnlocked && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-12 overflow-hidden opacity-15 select-none"
              >
                {[0, 1, 2].map((row) => (
                  <div
                    key={row}
                    className="-rotate-24 whitespace-nowrap font-mono text-lg font-extrabold tracking-widest text-emerald-900"
                  >
                    ADDISVAULT DRAFT PREVIEW · PAY TO EXPORT
                  </div>
                ))}
              </div>
            )}

            <div className="relative z-10 space-y-4">
              <div className="flex items-start justify-between gap-2 border-b-2 border-stone-900 pb-3">
                <div>
                  <h3 className="font-display text-base font-extrabold text-emerald-950">
                    {docTitle || 'Untitled Document'}
                  </h3>
                  <div className="text-[11px] text-stone-500">
                    {fields.length} Fields · {new Date().toLocaleDateString()}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFullscreenPreview(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:underline"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Full View</span>
                </button>
              </div>

              {fields.length > 0 && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-b border-stone-200 pb-3 text-xs">
                  {fields.map((f) => (
                    <div key={f.key}>
                      <span className="font-semibold text-stone-500">{f.label}: </span>
                      <span className="font-medium text-stone-900">
                        {f.value || '____________'}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="whitespace-pre-wrap text-xs leading-relaxed text-stone-800 max-h-60 overflow-y-auto">
                {bodyText}
              </div>
            </div>
          </div>

          {/* Multi-Format Export Pricing & Telebirr / CBE Checkout Gate */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                {t.pdfExportTitle}
              </h2>
              <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {vipActive ? 'VIP 0 ETB' : `${activeExportTier.priceEtb} ETB`}
              </span>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {PDF_EXPORT_TIERS.map((tier) => {
                const active = tier.id === selectedFormatId;
                const unlocked = vipActive || unlockedPdfIds.has(`${docTitle.trim().slice(0, 32)}_${tier.id}`);
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedFormatId(tier.id)}
                    className={`flex flex-col justify-between rounded-xl border p-3 text-left transition-colors ${
                      active
                        ? 'border-emerald-700 bg-emerald-50/70 dark:border-emerald-500 dark:bg-emerald-950/30'
                        : 'border-stone-200 bg-stone-50 hover:border-emerald-600/50 dark:border-zinc-800 dark:bg-zinc-950'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-900 dark:text-stone-100">
                        {tier.fileExt === 'png' ? (
                          <FileImage className="h-3.5 w-3.5 text-amber-600" />
                        ) : (
                          <FileText className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                        )}
                        <span>{tier.label[lang]}</span>
                      </span>
                      <span className="font-mono text-xs font-extrabold text-emerald-800 dark:text-emerald-400">
                        {unlocked ? 'FREE' : `${tier.priceEtb} ETB`}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-stone-600 dark:text-stone-400">
                      {tier.description[lang]}
                    </p>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={isExporting}
                onClick={handlePayOrExport}
                className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
              >
                {isCurrentFormatUnlocked ? (
                  <Download className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>
                  {isExporting
                    ? 'Generating Clean File...'
                    : isCurrentFormatUnlocked
                    ? `${t.pdfUnlockedExportBtn} (${activeExportTier.label[lang]})`
                    : `${t.pdfPayToExportBtn} · ${activeExportTier.priceEtb} ETB`}
                </span>
              </button>

              {!vipActive && (
                <button
                  type="button"
                  onClick={onOpenVipModal}
                  className="min-h-[46px] inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/50 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>VIP 0 ETB</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Watermarked Live Preview Modal */}
      {isFullscreenPreview && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-stone-950/85 backdrop-blur-sm p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
        >
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between rounded-t-2xl border-b border-stone-200 bg-white px-5 py-3.5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
              {docTitle} · {isCurrentFormatUnlocked ? 'Clean Final Document' : t.cvWatermarkDraftBanner}
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenPreview(false)}
              className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="relative mx-auto flex-1 w-full max-w-4xl overflow-y-auto bg-white p-8 sm:p-12 text-stone-900 shadow-2xl">
            {!isCurrentFormatUnlocked && (
              <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-16 opacity-15 select-none"
              >
                {[0, 1, 2, 3].map((row) => (
                  <div
                    key={row}
                    className="-rotate-24 whitespace-nowrap font-mono text-2xl font-extrabold tracking-widest text-emerald-900"
                  >
                    {t.cvWatermarkDraftBanner}
                  </div>
                ))}
              </div>
            )}
            <h2 className="font-display text-2xl font-extrabold text-emerald-950 border-b-2 border-stone-900 pb-3">
              {docTitle}
            </h2>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-stone-200 pb-5 text-sm">
              {fields.map((f) => (
                <div key={f.key}>
                  <span className="font-semibold text-stone-500">{f.label}: </span>
                  <span className="font-semibold text-stone-900">{f.value || '____________'}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 whitespace-pre-wrap text-sm leading-7 text-stone-800">
              {bodyText}
            </div>
          </div>
          <div className="mx-auto flex w-full max-w-4xl items-center justify-end gap-3 rounded-b-2xl border-t border-stone-200 bg-stone-50 px-5 py-3 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => {
                setIsFullscreenPreview(false);
                handlePayOrExport();
              }}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-800"
            >
              <Download className="h-4 w-4" />
              <span>
                {isCurrentFormatUnlocked
                  ? t.pdfUnlockedExportBtn
                  : `${t.pdfPayToExportBtn} (${activeExportTier.priceEtb} ETB)`}
              </span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
