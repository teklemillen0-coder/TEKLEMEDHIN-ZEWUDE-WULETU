import React, { useState } from 'react';
import { Check, CheckCircle2, Crown, ShieldCheck, X } from 'lucide-react';
import { VIP_PLANS } from '../constants/growth';
import { Language, VipPlan, VipSubscription } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';
import {
  getOrCreateDeviceId,
  getShortDeviceTag,
  isVipActiveOnCurrentDevice,
} from '../utils/vaultSecurity';

interface VipPassModalProps {
  isOpen: boolean;
  lang: Language;
  vipSubscription: VipSubscription | null;
  onClose: () => void;
  onSelectPlan: (plan: VipPlan) => void;
}

export const VipPassModal: React.FC<VipPassModalProps> = ({
  isOpen,
  lang,
  vipSubscription,
  onClose,
  onSelectPlan,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [selectedPlanId, setSelectedPlanId] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  const deviceId = getOrCreateDeviceId();
  const isActive = isVipActiveOnCurrentDevice(vipSubscription, deviceId);
  const selectedPlan = VIP_PLANS.find((p) => p.id === selectedPlanId) || VIP_PLANS[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vip-modal-title"
    >
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2
              id="vip-modal-title"
              className="font-display text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100"
            >
              {t.vipModalTitle}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-zinc-800 dark:hover:text-stone-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          <p className="text-sm leading-relaxed text-stone-600 dark:text-stone-300">
            {t.vipModalSubtitle}
          </p>

          {isActive && vipSubscription && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                <div className="text-sm">
                  <div className="font-display font-bold text-emerald-950 dark:text-emerald-200">
                    {t.vipActiveTitle}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-900/80 dark:text-emerald-300/90">
                    <span>
                      {t.vipExpiresLabel}:{' '}
                      <strong className="font-mono">
                        {new Date(vipSubscription.expiresAt).toLocaleDateString()}
                      </strong>
                    </span>
                    <span>
                      {t.vipDeviceBoundLabel}:{' '}
                      <strong className="font-mono">{getShortDeviceTag(deviceId)}</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {VIP_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`flex flex-col rounded-2xl border p-5 text-left transition-colors ${
                    isSelected
                      ? 'border-amber-600 bg-amber-50/50 dark:border-amber-500 dark:bg-amber-950/20'
                      : 'border-stone-200 bg-white hover:border-stone-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                      {plan.id === 'monthly' ? t.vipMonthlyLabel : t.vipAnnualLabel}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {plan.badge[lang]}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-baseline gap-2.5">
                    <span className="font-mono text-2xl font-extrabold tabular-nums text-stone-900 dark:text-stone-100">
                      {plan.priceEtb.toLocaleString()} ETB
                    </span>
                    {plan.originalPriceEtb && (
                      <span className="font-mono text-sm font-semibold line-through tabular-nums text-stone-400 dark:text-stone-500">
                        {plan.originalPriceEtb.toLocaleString()} ETB
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs font-semibold text-stone-700 dark:text-stone-200">
                    {plan.title[lang]}
                  </div>
                  <p className="mt-2 flex items-start gap-2 border-t border-stone-200/80 pt-3 text-xs leading-relaxed text-stone-600 dark:border-zinc-800 dark:text-stone-300">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>{plan.subtitle[lang]}</span>
                  </p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span>{t.vaultBannerBody}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 bg-stone-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-900/70">
          <div>
            <div className="text-xs text-stone-500 dark:text-stone-400">
              {selectedPlan.title[lang]}
            </div>
            <div className="font-mono text-lg font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
              {selectedPlan.priceEtb.toLocaleString()} ETB
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectPlan(selectedPlan)}
            className="flex min-h-[44px] items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition-colors hover:bg-amber-700"
          >
            <Crown className="h-4 w-4 shrink-0" />
            <span>{t.vipSubscribeBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
