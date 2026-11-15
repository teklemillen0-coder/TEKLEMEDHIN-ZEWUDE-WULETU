import React, { useEffect, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Crown,
  Gift,
  GraduationCap,
  MessageCircle,
  Package,
  RotateCcw,
  Send,
  XCircle,
} from 'lucide-react';
import { BUNDLE_DEALS, MATRIC_MINI_QUIZ } from '../constants/growth';
import { BundleDeal, DigitalProduct, Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface GrowthSectionProps {
  lang: Language;
  referralCode: string;
  referralCreditsEtb: number;
  productsById: Record<string, DigitalProduct>;
  onAddBundleToCart: (bundle: BundleDeal) => void;
  onOpenVipModal: () => void;
}

function getRemainingFlashSeconds(): number {
  const cycleSeconds = 6 * 60 * 60; // 6-hour rolling flash window
  const nowSec = Math.floor(Date.now() / 1000);
  return cycleSeconds - (nowSec % cycleSeconds);
}

function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':');
}

export const GrowthSection: React.FC<GrowthSectionProps> = ({
  lang,
  referralCode,
  referralCreditsEtb,
  productsById,
  onAddBundleToCart,
  onOpenVipModal,
}) => {
  const t = UI_TRANSLATIONS[lang];

  // Flash Countdown Timer
  const [secondsLeft, setSecondsLeft] = useState<number>(() => getRemainingFlashSeconds());
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft(getRemainingFlashSeconds());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Referral share link & copy state
  const [copiedRef, setCopiedRef] = useState(false);
  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?ref=${encodeURIComponent(referralCode)}`
      : `https://addisvault.et/?ref=${referralCode}`;

  const shareText = `AddisVault 🇪🇹 — Textbooks, Matric Exams & Repair Kits with 15% OFF using my code ${referralCode}: ${shareUrl}`;
  const telegramShareHref = `https://t.me/share/url?url=${encodeURIComponent(
    shareUrl
  )}&text=${encodeURIComponent(shareText)}`;
  const whatsappShareHref = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopyReferral = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = shareUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
  };

  // Interactive 5-Question Matric Practice Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const currentQuestion = MATRIC_MINI_QUIZ[quizIndex];
  const selectedOption = selectedAnswers[currentQuestion.id];
  const isAnswered = typeof selectedOption === 'number';
  const totalAnswered = Object.keys(selectedAnswers).length;
  const totalCorrect = MATRIC_MINI_QUIZ.reduce(
    (sum, q) => (selectedAnswers[q.id] === q.correctIndex ? sum + 1 : sum),
    0
  );
  const quizCompleted = totalAnswered === MATRIC_MINI_QUIZ.length;

  const handleSelectOption = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizIndex(0);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 space-y-6">
      {/* 1. Refer & Earn 15% + VIP Quick Strip */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8 flex flex-col justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-400">
                <Gift className="h-4 w-4 shrink-0" />
                <span>{t.referralTitle}</span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
                {t.referralSubtitle}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                {t.referralCreditsLabel}
              </div>
              <div className="font-mono text-base font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
                {referralCreditsEtb.toLocaleString()} ETB
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-stone-100 pt-3.5 dark:border-zinc-800">
            <div className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs dark:border-zinc-800 dark:bg-zinc-950">
              <span className="text-stone-500 dark:text-stone-400">{t.referralCodeLabel}:</span>
              <strong className="font-mono text-stone-900 dark:text-stone-100">
                {referralCode}
              </strong>
            </div>

            <button
              type="button"
              onClick={handleCopyReferral}
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100 dark:hover:bg-zinc-700"
            >
              {copiedRef ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-700 dark:text-emerald-400">{t.copiedBtn}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>{t.referralCopyLinkBtn}</span>
                </>
              )}
            </button>

            <a
              href={telegramShareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-700"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.referralShareTelegram}</span>
            </a>

            <a
              href={whatsappShareHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{t.referralShareWhatsapp}</span>
            </a>
          </div>
        </div>

        {/* VIP Pass Membership Card */}
        <div className="lg:col-span-4 flex flex-col justify-between rounded-2xl border border-amber-300/70 bg-amber-50/50 p-5 dark:border-amber-700/40 dark:bg-amber-950/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-400">
              <Crown className="h-4 w-4 shrink-0" />
              <span>{t.vipBadgeLabel}</span>
            </div>
            <h3 className="mt-1.5 font-display text-base font-bold text-stone-900 dark:text-stone-100">
              {t.vipModalTitle}
            </h3>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
              <span className="line-through text-stone-400 mr-1.5">1,500</span>
              <strong className="font-mono text-stone-900 dark:text-stone-100">1,000 ETB/mo</strong> ·{' '}
              <strong className="font-mono text-stone-900 dark:text-stone-100">2,500 ETB/yr</strong> — 86+ Books, Manuals &amp; AI Suite
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenVipModal}
            className="mt-4 flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors hover:bg-amber-700"
          >
            <Crown className="h-4 w-4" />
            <span>{t.vipBtnLabel}</span>
          </button>
        </div>
      </div>

      {/* 2. Smart Value Bundles + Interactive 5-Question Matric Mini-Quiz */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Flash Value Bundles */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3.5 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
              <h2 className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
                {t.bundlesTitle}
              </h2>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{t.bundlesTimerLabel}:</span>
              <span className="font-mono font-bold tabular-nums">
                {formatCountdown(secondsLeft)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {BUNDLE_DEALS.map((bundle) => {
              const rawSum = bundle.productIds.reduce(
                (sum, id) => sum + (productsById[id]?.priceEtb || 0),
                0
              );
              const bundlePrice = Math.round(rawSum * (1 - bundle.discountPercent / 100));
              const isAdded = addedBundleId === bundle.id;

              return (
                <div
                  key={bundle.id}
                  className="flex flex-col justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-3.5 dark:border-zinc-800 dark:bg-zinc-950/60"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      <span>
                        {t.bundleSaveLabel} {bundle.discountPercent}%
                      </span>
                      <span className="font-mono text-stone-500 dark:text-stone-400">
                        {bundle.productIds.length} files
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-xs sm:text-sm font-bold text-stone-900 dark:text-stone-100 leading-snug">
                      {bundle.title[lang]}
                    </h3>
                    <p className="mt-1 text-xs text-stone-600 dark:text-stone-400 line-clamp-2">
                      {bundle.subtitle[lang]}
                    </p>
                  </div>

                  <div className="mt-3 border-t border-stone-200/80 pt-2.5 dark:border-zinc-800">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-sm font-extrabold tabular-nums text-emerald-800 dark:text-emerald-400">
                        {bundlePrice.toLocaleString()} ETB
                      </span>
                      <span className="font-mono text-[11px] line-through tabular-nums text-stone-400">
                        {rawSum.toLocaleString()}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAddBundleToCart(bundle);
                        setAddedBundleId(bundle.id);
                        setTimeout(() => setAddedBundleId(null), 1800);
                      }}
                      className="mt-2 flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      {isAdded ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>{t.addedToCartBtn}</span>
                        </>
                      ) : (
                        <span>{t.bundleAddBtn}</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive 5-Question Matric Mini-Quiz */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-display text-sm sm:text-base font-bold text-stone-900 dark:text-stone-100">
                  {t.quizTitle}
                </h2>
              </div>
              <span className="font-mono text-xs font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
                {t.quizScoreLabel}: {totalCorrect}/{MATRIC_MINI_QUIZ.length}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
              <span className="font-semibold">
                {t.quizQuestionOf} {quizIndex + 1} / {MATRIC_MINI_QUIZ.length} ·{' '}
                {currentQuestion.subject}
              </span>
              <div className="flex gap-1">
                {MATRIC_MINI_QUIZ.map((q, idx) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuizIndex(idx)}
                    aria-label={`${t.quizQuestionOf} ${idx + 1}`}
                    className={`h-6 w-6 rounded-md font-mono text-[11px] font-bold transition-colors ${
                      idx === quizIndex
                        ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                        : typeof selectedAnswers[q.id] === 'number'
                        ? selectedAnswers[q.id] === q.correctIndex
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-stone-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-3 text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug">
              {currentQuestion.question[lang]}
            </p>

            <div className="mt-3 space-y-2">
              {currentQuestion.options[lang].map((opt, idx) => {
                const chosen = selectedOption === idx;
                const isRight = idx === currentQuestion.correctIndex;
                let styleClass =
                  'border-stone-200 bg-stone-50 text-stone-800 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-stone-200 dark:hover:bg-zinc-800';
                if (isAnswered) {
                  if (isRight) {
                    styleClass =
                      'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200';
                  } else if (chosen && !isRight) {
                    styleClass =
                      'border-rose-500 bg-rose-50 text-rose-900 dark:border-rose-500 dark:bg-rose-950/40 dark:text-rose-200';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`flex min-h-[38px] w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors ${styleClass}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isRight && (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    )}
                    {isAnswered && chosen && !isRight && (
                      <XCircle className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {isAnswered && (
              <div className="mt-3 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-700 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-stone-300">
                <strong className="text-emerald-800 dark:text-emerald-400">
                  {selectedOption === currentQuestion.correctIndex
                    ? t.quizCorrectFeedback
                    : t.quizWrongFeedback}{' '}
                </strong>
                <span>{currentQuestion.explanation[lang]}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100 pt-3 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              {quizIndex < MATRIC_MINI_QUIZ.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setQuizIndex((i) => Math.min(MATRIC_MINI_QUIZ.length - 1, i + 1))}
                  className="min-h-[36px] rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                >
                  Next ({quizIndex + 2}/{MATRIC_MINI_QUIZ.length})
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{t.quizRestartBtn}</span>
                </button>
              )}
              {quizCompleted && (
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  {totalCorrect}/5
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenVipModal}
              className="min-h-[36px] rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700"
            >
              {t.quizUnlockCta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
