import { AI_TOOLS_LIST } from '../constants/aiTools';
import {
  CV_COUNTRY_STANDARDS,
  LEGAL_CONSULT_TIERS,
  LEGAL_DOC_TEMPLATES,
} from '../constants/careerAndLegal';
import { VIP_PLANS } from '../constants/growth';
import { LINK_PRICING_TIERS } from '../constants/linkDownloader';
import { PDF_EXPORT_PRICE_MAP } from '../constants/pdfAndCommunity';
import { getPromoDiscountPercent } from '../constants/payment';
import { PRODUCTS } from '../data/products';

const SESSION_SECRET_SALT = 'AV_SEC_2025_ETB_VAULT';

export function sanitizeUserInput(raw: string, maxLen = 2000): string {
  return String(raw || '')
    .replace(/\u0000/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .slice(0, maxLen);
}

export function sanitizePhone(raw: string): string {
  return raw.replace(/[^0-9+\-\s()]/g, '').slice(0, 24);
}

const BLOCKED_CHAT_TERMS = [
  'scam',
  'fraud',
  'hack',
  'free money',
  'crypto giveaway',
  'xxx',
  'porn',
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'bastard',
];

export function sanitizeAndFilterChatMessage(raw: string): {
  clean: string;
  flaggedSpam: boolean;
} {
  let clean = sanitizeUserInput(raw, 800).trim();
  const urlCount = (clean.match(/https?:\/\/|t\.me\/|wa\.me\//gi) || []).length;
  const flaggedSpam = urlCount >= 2;
  for (const term of BLOCKED_CHAT_TERMS) {
    const rx = new RegExp(`\\b${term.replace(/\s+/g, '\\s+')}\\b`, 'gi');
    clean = clean.replace(rx, '***');
  }
  return { clean, flaggedSpam };
}

export function computeIntegritySig(payload: string): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  const full = `${SESSION_SECRET_SALT}:${payload}`;
  for (let i = 0; i < full.length; i++) {
    const ch = full.charCodeAt(i);
    h1 ^= ch;
    h1 = Math.imul(h1, 0x01000193);
    h2 = Math.imul(h2 ^ ch, 0x85ebca6b);
  }
  return `${(h1 >>> 0).toString(16).padStart(8, '0')}${(h2 >>> 0).toString(16).padStart(8, '0')}`;
}

export function sealEncryptedStorage(key: string, data: unknown): void {
  try {
    const json = JSON.stringify(data);
    const sig = computeIntegritySig(`${key}:${json}`);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    localStorage.setItem(key, JSON.stringify({ v: 2, p: encoded, s: sig }));
  } catch {
    // Ignore storage quota errors
  }
}

export function readEncryptedStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as { v?: number; p?: string; s?: string } | T;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'v' in parsed &&
      parsed.v === 2 &&
      typeof parsed.p === 'string' &&
      typeof parsed.s === 'string'
    ) {
      const json = decodeURIComponent(escape(atob(parsed.p)));
      const expected = computeIntegritySig(`${key}:${json}`);
      if (expected !== parsed.s) {
        return fallback;
      }
      return JSON.parse(json) as T;
    }
    return parsed as T;
  } catch {
    return fallback;
  }
}

export function hashOwnerPin(pin: string): string {
  return computeIntegritySig(`OWNER_PIN:${pin.trim()}`);
}

export function verifyOwnerPin(inputPin: string, storedValue: string | null): boolean {
  const clean = inputPin.trim();
  if (!clean) return false;
  if (!storedValue) {
    return clean === '0925';
  }
  if (storedValue.startsWith('HASH:')) {
    return `HASH:${hashOwnerPin(clean)}` === storedValue;
  }
  return clean === storedValue;
}

const clientActionHistory = new Map<string, number[]>();

export function checkClientRateLimit(actionKey: string, maxPerMinute = 15): boolean {
  const now = Date.now();
  const list = (clientActionHistory.get(actionKey) || []).filter((ts) => now - ts < 60_000);
  if (list.length >= maxPerMinute) {
    return false;
  }
  list.push(now);
  clientActionHistory.set(actionKey, list);
  return true;
}

export interface VerifiedCheckoutPricing {
  subtotalEtb: number;
  discountEtb: number;
  totalEtb: number;
  itemLabel: string;
}

export function verifyCheckoutAmount(params: {
  cartItems: { productId: string; quantity: number }[];
  promoCode: string | null;
  vipPlanId?: 'monthly' | 'annual' | null;
  aiToolId?: string | null;
  cvCountryId?: string | null;
  legalDocId?: string | null;
  legalConsultTierId?: string | null;
  linkFormatId?: string | null;
  pdfFormatId?: string | null;
}): VerifiedCheckoutPricing {
  if (params.vipPlanId) {
    const plan = VIP_PLANS.find((p) => p.id === params.vipPlanId);
    const price = plan ? plan.priceEtb : 1000;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: plan?.title.en || 'VIP Pass',
    };
  }
  if (params.aiToolId) {
    const tool = AI_TOOLS_LIST.find((t) => t.id === params.aiToolId);
    const price = tool ? tool.priceEtb : 0;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: tool?.title.en || 'AI Document',
    };
  }
  if (params.cvCountryId) {
    const std = CV_COUNTRY_STANDARDS.find((c) => c.id === params.cvCountryId);
    const price = std ? std.priceEtb : 250;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: std?.formatLabel.en || 'International CV',
    };
  }
  if (params.legalDocId) {
    const doc = LEGAL_DOC_TEMPLATES.find((d) => d.id === params.legalDocId);
    const price = doc ? doc.priceEtb : 350;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: doc?.title.en || 'Court Pleading',
    };
  }
  if (params.legalConsultTierId) {
    const tier = LEGAL_CONSULT_TIERS.find((t) => t.id === params.legalConsultTierId);
    const price = tier ? tier.priceEtb : 200;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: tier?.title.en || 'Legal Consultation',
    };
  }
  if (params.linkFormatId) {
    const price = LINK_PRICING_TIERS[params.linkFormatId] ?? 15;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: `Universal Link Download (${params.linkFormatId})`,
    };
  }
  if (params.pdfFormatId) {
    const price = PDF_EXPORT_PRICE_MAP[params.pdfFormatId] ?? 50;
    return {
      subtotalEtb: price,
      discountEtb: 0,
      totalEtb: price,
      itemLabel: `Smart PDF Filler Export (${params.pdfFormatId})`,
    };
  }

  let subtotal = 0;
  for (const row of params.cartItems) {
    const prod = PRODUCTS.find((p) => p.id === row.productId);
    const qty = Math.max(1, Math.min(25, Math.floor(row.quantity || 1)));
    if (prod) {
      subtotal += prod.priceEtb * qty;
    }
  }
  const pct = getPromoDiscountPercent(params.promoCode);
  const discount = Math.round((subtotal * pct) / 100);
  const total = Math.max(0, subtotal - discount);
  return {
    subtotalEtb: subtotal,
    discountEtb: discount,
    totalEtb: total,
    itemLabel: 'Digital Cart Order',
  };
}
