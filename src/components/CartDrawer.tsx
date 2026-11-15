import React, { useState } from 'react';
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from 'lucide-react';
import { getPromoDiscountPercent } from '../constants/payment';
import { CartItem, DigitalProduct, Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface CartDrawerProps {
  isOpen: boolean;
  lang: Language;
  cartItems: CartItem[];
  productsById: Record<string, DigitalProduct>;
  appliedPromo: string | null;
  onClose: () => void;
  onUpdateQty: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onApplyPromo: (code: string | null) => void;
  onProceedCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  lang,
  cartItems,
  productsById,
  appliedPromo,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onApplyPromo,
  onProceedCheckout,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState(false);

  if (!isOpen) return null;

  const resolvedItems = cartItems
    .map((item) => ({
      ...item,
      product: productsById[item.productId],
    }))
    .filter((item) => Boolean(item.product));

  const subtotal = resolvedItems.reduce(
    (sum, item) => sum + item.product.priceEtb * item.quantity,
    0
  );
  const discountPercent = getPromoDiscountPercent(appliedPromo);
  const discountEtb = Math.round((subtotal * discountPercent) / 100);
  const totalEtb = Math.max(0, subtotal - discountEtb);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoInput.trim().toUpperCase();
    if (!cleaned) return;
    if (getPromoDiscountPercent(cleaned) > 0) {
      onApplyPromo(cleaned);
      setPromoError(false);
      setPromoInput('');
    } else {
      setPromoError(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/55 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={t.cartTitle}
    >
      <div className="flex h-full w-full max-w-md flex-col border-l border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
            <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {t.cartTitle}
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

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-5">
          {resolvedItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-stone-100 text-stone-400 dark:bg-zinc-900 dark:text-zinc-600">
                <ShoppingBag className="h-7 w-7" />
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-stone-900 dark:text-stone-100">
                {t.cartEmptyTitle}
              </h3>
              <p className="mt-1.5 max-w-xs text-sm text-stone-500 dark:text-stone-400">
                {t.cartEmptyBody}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100 dark:divide-zinc-800">
              {resolvedItems.map(({ product, quantity }) => (
                <li key={product.id} className="flex gap-3.5 py-4 first:pt-0">
                  <img
                    src={product.coverImage}
                    alt={product.title[lang]}
                    referrerPolicy="no-referrer"
                    className="h-16 w-20 shrink-0 rounded-xl object-cover bg-stone-100 dark:bg-zinc-800"
                  />
                  <div className="flex flex-1 flex-col min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 line-clamp-2">
                        {product.title[lang]}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(product.id)}
                        aria-label={t.removeLabel}
                        className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {product.format}
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-stone-200 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, -1)}
                          aria-label="Decrease quantity"
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-xs font-semibold tabular-nums text-stone-900 dark:text-stone-100">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(product.id, 1)}
                          aria-label="Increase quantity"
                          className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-zinc-800"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="font-mono text-sm font-bold tabular-nums text-emerald-800 dark:text-emerald-400">
                        {(product.priceEtb * quantity).toLocaleString()} ETB
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Promo & Summary Footer */}
        {resolvedItems.length > 0 && (
          <div className="border-t border-stone-200 bg-stone-50 p-5 space-y-4 dark:border-zinc-800 dark:bg-zinc-900/60">
            {/* Promo Code Box */}
            <div>
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => {
                      setPromoInput(e.target.value);
                      setPromoError(false);
                    }}
                    placeholder={t.promoPlaceholder}
                    className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                  />
                </div>
                <button
                  type="submit"
                  className="min-h-[44px] rounded-xl border border-stone-300 bg-white px-4 text-xs font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100 dark:hover:bg-zinc-700"
                >
                  {t.promoApplyBtn}
                </button>
              </form>
              <div className="mt-1.5 flex items-center justify-between text-xs">
                {promoError ? (
                  <span className="font-medium text-rose-600 dark:text-rose-400">{t.promoInvalid}</span>
                ) : appliedPromo ? (
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {t.promoApplied}: {appliedPromo} (-{discountPercent}%)
                  </span>
                ) : (
                  <span className="text-stone-500 dark:text-stone-400">{t.promoHint}</span>
                )}
                {appliedPromo && (
                  <button
                    type="button"
                    onClick={() => onApplyPromo(null)}
                    className="font-medium text-stone-500 underline hover:text-stone-800 dark:text-stone-400"
                  >
                    {t.promoRemove}
                  </button>
                )}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1.5 border-t border-stone-200 pt-3 text-sm dark:border-zinc-800">
              <div className="flex justify-between text-stone-600 dark:text-stone-400">
                <span>{t.subtotalLabel}</span>
                <span className="font-mono tabular-nums">{subtotal.toLocaleString()} ETB</span>
              </div>
              {discountEtb > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                  <span>{t.discountLabel}</span>
                  <span className="font-mono tabular-nums">-{discountEtb.toLocaleString()} ETB</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-base font-bold text-stone-900 dark:text-stone-100">
                <span>{t.totalLabel}</span>
                <span className="font-mono tabular-nums text-emerald-800 dark:text-emerald-400">
                  {totalEtb.toLocaleString()} ETB
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onProceedCheckout}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-700 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              {t.proceedCheckoutBtn} · {totalEtb.toLocaleString()} ETB
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
