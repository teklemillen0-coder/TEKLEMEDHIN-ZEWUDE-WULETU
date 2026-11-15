import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  LockOpen,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { OWNER_PAYMENT_ACCOUNTS } from '../constants/payment';
import { OWNER_SUPPORT_CONTACTS } from '../constants/support';
import {
  AdConfig,
  AiToolDefinition,
  CvCountryStandard,
  DigitalProduct,
  Language,
  LegalConsultTier,
  LegalDocTemplate,
  PaymentMethod,
  PendingLinkDownload,
  PendingPdfExport,
  PurchaseOrder,
  VipPlan,
} from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  checkClientRateLimit,
  sanitizeUserInput,
  verifyCheckoutAmount,
} from '../utils/appSecurity';
import { AdSlot } from './AdSlot';

interface CheckoutModalProps {
  isOpen: boolean;
  lang: Language;
  items: { product: DigitalProduct; quantity: number }[];
  pendingVipPlan?: VipPlan | null;
  pendingAiTool?: AiToolDefinition | null;
  pendingCvStandard?: CvCountryStandard | null;
  pendingLegalDoc?: LegalDocTemplate | null;
  pendingLegalConsult?: {
    tier: LegalConsultTier;
    intake: { clientName: string; phone: string; branch: string; caseSummary: string };
  } | null;
  pendingLinkDownload?: PendingLinkDownload | null;
  pendingPdfExport?: PendingPdfExport | null;
  subtotalEtb: number;
  discountEtb: number;
  totalEtb: number;
  promoCode: string | null;
  onClose: () => void;
  onConfirmOrder: (payload: {
    paymentMethod: PaymentMethod;
    refNumber: string;
    buyerContact?: string;
    vipPlan?: VipPlan | null;
    aiTool?: AiToolDefinition | null;
    cvStandard?: CvCountryStandard | null;
    legalDoc?: LegalDocTemplate | null;
    legalConsult?: {
      tier: LegalConsultTier;
      intake: { clientName: string; phone: string; branch: string; caseSummary: string };
    } | null;
    linkDownload?: PendingLinkDownload | null;
    pdfExport?: PendingPdfExport | null;
  }) => PurchaseOrder;
  onOpenInVault: (product: DigitalProduct, order: PurchaseOrder) => void;
  onGoToDownloads: () => void;
  onReturnToAiTool?: () => void;
  onReturnToCvStudio?: () => void;
  onReturnToLegalSuite?: () => void;
  onReturnToLinkDownloader?: (item: PendingLinkDownload) => void;
  onReturnToPdfEditor?: (item: PendingPdfExport) => void;
  adConfig: AdConfig;
  onTrackAdImpression: () => void;
  onTrackAdClick: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  lang,
  items,
  pendingVipPlan = null,
  pendingAiTool = null,
  pendingCvStandard = null,
  pendingLegalDoc = null,
  pendingLegalConsult = null,
  pendingLinkDownload = null,
  pendingPdfExport = null,
  promoCode,
  onClose,
  onConfirmOrder,
  onOpenInVault,
  onGoToDownloads,
  onReturnToAiTool,
  onReturnToCvStudio,
  onReturnToLegalSuite,
  onReturnToLinkDownloader,
  onReturnToPdfEditor,
  adConfig,
  onTrackAdImpression,
  onTrackAdClick,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [refNumber, setRefNumber] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [refError, setRefError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<'telebirr' | 'cbe' | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<PurchaseOrder | null>(null);

  if (!isOpen) return null;

  // Anti-tamper price calculation directly from authoritative catalog & tier tables
  const verified = verifyCheckoutAmount({
    cartItems: items.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
    promoCode,
    vipPlanId: pendingVipPlan?.id || null,
    aiToolId: pendingAiTool?.id || null,
    cvCountryId: pendingCvStandard?.id || null,
    legalDocId: pendingLegalDoc?.id || null,
    legalConsultTierId: pendingLegalConsult?.tier.id || null,
    linkFormatId: pendingLinkDownload?.formatOption.id || null,
    pdfFormatId: pendingPdfExport?.formatOption.id || null,
  });

  const effectiveSubtotal = verified.subtotalEtb;
  const effectiveDiscount = verified.discountEtb;
  const effectiveTotal = verified.totalEtb;

  const handleCopy = async (key: 'telebirr' | 'cbe', value: string) => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkClientRateLimit('checkout_submit', 12)) {
      setRefError('Too many attempts. Please wait 60 seconds.');
      return;
    }
    const cleanRef = sanitizeUserInput(refNumber, 64).trim();
    if (cleanRef.length < 4) {
      setRefError(t.refError);
      return;
    }
    const cleanContact = sanitizeUserInput(buyerContact, 120).trim();
    const order = onConfirmOrder({
      paymentMethod,
      refNumber: cleanRef.toUpperCase(),
      buyerContact: cleanContact || undefined,
      vipPlan: pendingVipPlan,
      aiTool: pendingAiTool,
      cvStandard: pendingCvStandard,
      legalDoc: pendingLegalDoc,
      legalConsult: pendingLegalConsult,
      linkDownload: pendingLinkDownload,
      pdfExport: pendingPdfExport,
    });
    setConfirmedOrder(order);
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    setRefNumber('');
    setBuyerContact('');
    setRefError(null);
    onClose();
  };

  const renderSupportStrip = () => (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 text-xs dark:border-zinc-800 dark:bg-zinc-900">
      <div className="font-semibold text-stone-700 dark:text-stone-300">
        {t.checkoutSupportNote}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <a
          href={OWNER_SUPPORT_CONTACTS.telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-semibold text-sky-700 hover:bg-sky-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-sky-400"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Telegram {OWNER_SUPPORT_CONTACTS.telegramUsername}</span>
        </a>
        <a
          href={OWNER_SUPPORT_CONTACTS.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-emerald-400"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          <span>WhatsApp {OWNER_SUPPORT_CONTACTS.whatsappDisplay}</span>
        </a>
        <a
          href={OWNER_SUPPORT_CONTACTS.emailUrl}
          className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-semibold text-amber-800 hover:bg-amber-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-amber-400"
        >
          <Mail className="h-3.5 w-3.5" />
          <span>{OWNER_SUPPORT_CONTACTS.email}</span>
        </a>
      </div>
    </div>
  );

  const summaryBannerTitle = pendingVipPlan
    ? pendingVipPlan.title[lang]
    : pendingAiTool
    ? pendingAiTool.title[lang]
    : pendingCvStandard
    ? pendingCvStandard.formatLabel[lang]
    : pendingLegalDoc
    ? pendingLegalDoc.title[lang]
    : pendingLegalConsult
    ? pendingLegalConsult.tier.title[lang]
    : pendingLinkDownload
    ? `${pendingLinkDownload.title} (${pendingLinkDownload.formatOption.label[lang]})`
    : pendingPdfExport
    ? `${pendingPdfExport.documentTitle} (${pendingPdfExport.formatOption.label[lang]})`
    : `${t.totalLabel} (${items.reduce((s, i) => s + i.quantity, 0)})${
        promoCode ? ` · ${promoCode}` : ''
      }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="relative flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <h2
            id="checkout-modal-title"
            className="font-display text-lg font-bold text-stone-900 dark:text-stone-100"
          >
            {confirmedOrder ? t.orderConfirmedTitle : t.checkoutTitle}
          </h2>
          <button
            type="button"
            onClick={handleResetAndClose}
            aria-label={t.closeBtn}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-zinc-800 dark:hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {confirmedOrder ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3.5">
                  <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-700 dark:text-emerald-400" />
                  <div>
                    <h3 className="font-display text-base font-bold text-emerald-950 dark:text-emerald-200">
                      {t.orderConfirmedTitle}
                    </h3>
                    <p className="mt-1 text-sm text-emerald-900/80 dark:text-emerald-300/90">
                      {t.orderConfirmedBody}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-emerald-900 dark:text-emerald-300">
                      <span>
                        {t.orderRefDisplay}: <strong className="font-mono">{confirmedOrder.refNumber}</strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {t.paidVia}:{' '}
                        <strong>
                          {confirmedOrder.paymentMethod === 'telebirr' ? t.telebirrLabel : t.cbeLabel}
                        </strong>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-bold">
                        {confirmedOrder.totalEtb.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Page Banner */}
              <AdSlot
                slot="download_page"
                adConfig={adConfig}
                lang={lang}
                onTrackImpression={onTrackAdImpression}
                onTrackClick={onTrackAdClick}
              />

              {/* Instant Protected Unlock Section */}
              {confirmedOrder.isVipOrder ? (
                <div className="flex items-center gap-3 rounded-xl border border-amber-300/80 bg-amber-50/60 p-4 dark:border-amber-700/50 dark:bg-amber-950/20">
                  <Crown className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {t.vipActiveTitle}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      {t.vaultBannerTitle}
                    </div>
                  </div>
                </div>
              ) : confirmedOrder.cvCountryId ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-4 dark:border-emerald-700/50 dark:bg-emerald-950/20">
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {confirmedOrder.items[0]?.titleSnapshot || 'International CV Unlocked'}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      Print-Ready PDF &amp; Editable Word (.doc) CV &amp; Cover Letter downloads are unlocked.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      onReturnToCvStudio?.();
                    }}
                    className="flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Download CV &amp; Cover Letter Now</span>
                  </button>
                </div>
              ) : confirmedOrder.legalDocId || confirmedOrder.legalConsultTierId ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-4 dark:border-emerald-700/50 dark:bg-emerald-950/20">
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {confirmedOrder.items[0]?.titleSnapshot || 'Legal Service Unlocked'}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      {confirmedOrder.legalConsultTierId
                        ? 'Your Legal Consultation booking is confirmed! Open Legal Suite to launch Telegram / WhatsApp.'
                        : 'Your formatted Court Pleading Word (.doc) & Print-PDF exports are unlocked.'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      onReturnToLegalSuite?.();
                    }}
                    className="flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Return to Legal Suite</span>
                  </button>
                </div>
              ) : confirmedOrder.aiToolId ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-4 dark:border-emerald-700/50 dark:bg-emerald-950/20">
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {confirmedOrder.items[0]?.titleSnapshot || 'AI Tool Export Unlocked'}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      PDF, Word (.doc), and Excel (.csv) exports are now unlocked on this device.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleResetAndClose();
                      onReturnToAiTool?.();
                    }}
                    className="flex min-h-[42px] items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Download PDF / Word / Excel Now</span>
                  </button>
                </div>
              ) : confirmedOrder.linkDownloadId && pendingLinkDownload ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-4 dark:border-emerald-700/50 dark:bg-emerald-950/20">
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {confirmedOrder.items[0]?.titleSnapshot || pendingLinkDownload.title}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      {pendingLinkDownload.platformName} · {pendingLinkDownload.formatOption.label[lang]} unlocked!
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const snapshot = pendingLinkDownload;
                      handleResetAndClose();
                      onReturnToLinkDownloader?.(snapshot);
                    }}
                    className="flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t.linkPayAndDownloadBtn}</span>
                  </button>
                </div>
              ) : confirmedOrder.pdfExportId && pendingPdfExport ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/80 bg-emerald-50/60 p-4 dark:border-emerald-700/50 dark:bg-emerald-950/20">
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {confirmedOrder.items[0]?.titleSnapshot || pendingPdfExport.documentTitle}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      {pendingPdfExport.formatOption.label[lang]} unlocked cleanly!
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const snapshot = pendingPdfExport;
                      handleResetAndClose();
                      onReturnToPdfEditor?.(snapshot);
                    }}
                    className="flex min-h-[42px] items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t.pdfUnlockedExportBtn}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map(({ product }) => (
                    <div
                      key={product.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-mono text-stone-500 dark:text-stone-400">
                          {product.sku} · {product.format}
                        </div>
                        <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                          {product.title[lang]}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenInVault(product, confirmedOrder)}
                        className="flex min-h-[42px] items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-amber-700 whitespace-nowrap"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>{t.vaultOpenBtn}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {renderSupportStrip()}

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleResetAndClose();
                    onGoToDownloads();
                  }}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <LockOpen className="h-4 w-4" />
                  <span>{t.goToDownloadsBtn}</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Clear Instructions */}
              <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                {t.checkoutIntro}
              </p>

              {/* Amount Banner (Verified Price) */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 px-5 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                <div>
                  <div className="text-xs font-medium text-emerald-900/75 dark:text-emerald-300/80">
                    {summaryBannerTitle}
                  </div>
                  <div className="font-mono text-2xl font-extrabold tabular-nums text-emerald-800 dark:text-emerald-400">
                    {effectiveTotal.toLocaleString()} ETB
                  </div>
                </div>
                {effectiveDiscount > 0 && (
                  <div className="text-right text-xs text-stone-600 dark:text-stone-400">
                    <div>
                      {t.subtotalLabel}:{' '}
                      <span className="font-mono line-through">
                        {effectiveSubtotal.toLocaleString()} ETB
                      </span>
                    </div>
                    <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                      -{effectiveDiscount.toLocaleString()} ETB
                    </div>
                  </div>
                )}
              </div>

              {/* Step 1: Hardcoded Owner Merchant Payment Accounts */}
              <div className="space-y-3">
                <h3 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  {t.step1Title}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400">{t.step1Body}</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Telebirr Card */}
                  <div
                    className={`rounded-2xl border p-4 transition-colors ${
                      paymentMethod === 'telebirr'
                        ? 'border-emerald-600 bg-emerald-50/40 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-stone-200 bg-stone-50/70 dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      <Smartphone className="h-4 w-4" />
                      <span>{t.telebirrLabel}</span>
                    </div>
                    <div className="mt-2 font-mono text-xl font-bold tracking-wide tabular-nums text-stone-900 dark:text-stone-100">
                      {OWNER_PAYMENT_ACCOUNTS.telebirr.number}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy('telebirr', OWNER_PAYMENT_ACCOUNTS.telebirr.number)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition-colors hover:border-emerald-600 hover:bg-emerald-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100 dark:hover:bg-zinc-700"
                      >
                        {copiedKey === 'telebirr' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400">{t.copiedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>{t.copyNumberBtn}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('telebirr')}
                        className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          paymentMethod === 'telebirr'
                            ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                            : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {paymentMethod === 'telebirr' ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>

                  {/* CBE Card */}
                  <div
                    className={`rounded-2xl border p-4 transition-colors ${
                      paymentMethod === 'cbe'
                        ? 'border-amber-600 bg-amber-50/40 dark:border-amber-500 dark:bg-amber-950/20'
                        : 'border-stone-200 bg-stone-50/70 dark:border-zinc-800 dark:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400">
                      <Building2 className="h-4 w-4" />
                      <span>{t.cbeLabel}</span>
                    </div>
                    <div className="mt-2 font-mono text-xl font-bold tracking-wide tabular-nums text-stone-900 dark:text-stone-100">
                      {OWNER_PAYMENT_ACCOUNTS.cbe.number}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy('cbe', OWNER_PAYMENT_ACCOUNTS.cbe.number)}
                        className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition-colors hover:border-amber-600 hover:bg-amber-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100 dark:hover:bg-zinc-700"
                      >
                        {copiedKey === 'cbe' ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-emerald-700 dark:text-emerald-400">{t.copiedBtn}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>{t.copyNumberBtn}</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cbe')}
                        className={`min-h-[38px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          paymentMethod === 'cbe'
                            ? 'bg-amber-600 text-white'
                            : 'text-stone-600 hover:bg-stone-200/70 dark:text-stone-300 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {paymentMethod === 'cbe' ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Transaction Reference ID */}
              <div className="space-y-4 border-t border-stone-200 pt-5 dark:border-zinc-800">
                <h3 className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                  {t.step2Title}
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t.paymentMethodLabel}
                  </label>
                  <div className="mt-2 grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('telebirr')}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        paymentMethod === 'telebirr'
                          ? 'border-emerald-600 bg-emerald-700 text-white dark:bg-emerald-600'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
                      }`}
                    >
                      {t.telebirrLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cbe')}
                      className={`min-h-[44px] rounded-xl border px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                        paymentMethod === 'cbe'
                          ? 'border-amber-600 bg-amber-600 text-white'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
                      }`}
                    >
                      {t.cbeLabel}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tx-ref-input"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
                  >
                    {t.refInputLabel} *
                  </label>
                  <input
                    id="tx-ref-input"
                    type="text"
                    required
                    value={refNumber}
                    onChange={(e) => {
                      setRefNumber(e.target.value);
                      setRefError(null);
                    }}
                    placeholder={t.refInputPlaceholder}
                    className="mt-1.5 h-12 w-full rounded-xl border border-stone-300 bg-white px-4 font-mono text-sm text-stone-900 placeholder:font-sans placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                  />
                  {refError && (
                    <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                      {refError}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="buyer-contact-input"
                    className="block text-xs font-semibold text-stone-700 dark:text-stone-300"
                  >
                    {t.contactInputLabel}
                  </label>
                  <input
                    id="buyer-contact-input"
                    type="text"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                    placeholder={t.contactInputPlaceholder}
                    className="mt-1.5 h-11 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                  />
                </div>
              </div>

              {renderSupportStrip()}

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                <LockOpen className="h-4 w-4" />
                <span>
                  {t.confirmPaymentBtn} · {effectiveTotal.toLocaleString()} ETB
                </span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
