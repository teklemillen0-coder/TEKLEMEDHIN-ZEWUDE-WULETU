import { PurchaseOrder, VaultAccessToken, VipSubscription } from '../types';

const DEVICE_STORAGE_KEY = 'addisvault_device_id';
const TOKENS_STORAGE_KEY = 'addisvault_vault_tokens';
export const TOKEN_TTL_MS = 15 * 60 * 1000; // 15-minute expiring access tokens

export function getOrCreateDeviceId(): string {
  try {
    const existing = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (existing) return existing;
    const uaHash = navigator.userAgent
      .split('')
      .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) & 0xffffff, 7)
      .toString(16)
      .toUpperCase();
    const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
    const nextId = `AVD-${uaHash}-${rand}`;
    localStorage.setItem(DEVICE_STORAGE_KEY, nextId);
    return nextId;
  } catch {
    return 'AVD-SESSION';
  }
}

export function getShortDeviceTag(deviceId: string): string {
  return deviceId.length > 10 ? deviceId.slice(-6) : deviceId;
}

export function readVaultTokens(): VaultAccessToken[] {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VaultAccessToken[]) : [];
  } catch {
    return [];
  }
}

function saveVaultTokens(tokens: VaultAccessToken[]) {
  try {
    // Keep only last 40 tokens to prevent storage bloat
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens.slice(0, 40)));
  } catch {
    // Ignore storage quota errors
  }
}

export function isOrderBoundToCurrentDevice(
  order: PurchaseOrder,
  currentDeviceId: string
): boolean {
  if (!order.deviceId) return true; // Legacy order backward compatibility
  return order.deviceId === currentDeviceId;
}

export function isVipActiveOnCurrentDevice(
  vip: VipSubscription | null,
  currentDeviceId: string
): boolean {
  if (!vip || !vip.active) return false;
  if (vip.deviceId && vip.deviceId !== currentDeviceId) return false;
  return Date.now() < new Date(vip.expiresAt).getTime();
}

function signTokenFields(token: Omit<VaultAccessToken, 'signature'>): string {
  const payload = `${token.tokenId}|${token.productId}|${token.orderId}|${token.deviceId}|${token.issuedAt}|${token.expiresAt}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `AVSIG-${(hash >>> 0).toString(16).toUpperCase().padStart(8, '0')}`;
}

export function mintSingleUseVaultToken(params: {
  productId: string;
  orderId: string;
  buyerLabel: string;
}): VaultAccessToken {
  const deviceId = getOrCreateDeviceId();
  const now = Date.now();
  const baseToken: Omit<VaultAccessToken, 'signature'> = {
    tokenId: `AVT-${now.toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    productId: params.productId,
    orderId: params.orderId,
    deviceId,
    buyerLabel: params.buyerLabel,
    issuedAt: now,
    expiresAt: now + TOKEN_TTL_MS,
    consumed: false,
  };
  const token: VaultAccessToken = {
    ...baseToken,
    signature: signTokenFields(baseToken),
  };
  const existing = readVaultTokens();
  saveVaultTokens([token, ...existing]);
  return token;
}

export function validateAndConsumeVaultToken(
  tokenId: string,
  currentDeviceId: string
): { valid: true; token: VaultAccessToken } | { valid: false; reason: 'not_found' | 'device_mismatch' | 'expired' | 'already_used' | 'tampered' } {
  const tokens = readVaultTokens();
  const idx = tokens.findIndex((t) => t.tokenId === tokenId);
  if (idx === -1) {
    return { valid: false, reason: 'not_found' };
  }
  const found = tokens[idx];
  if (found.signature) {
    const expectedSig = signTokenFields({
      tokenId: found.tokenId,
      productId: found.productId,
      orderId: found.orderId,
      deviceId: found.deviceId,
      buyerLabel: found.buyerLabel,
      issuedAt: found.issuedAt,
      expiresAt: found.expiresAt,
      consumed: false,
    });
    if (found.signature !== expectedSig) {
      return { valid: false, reason: 'tampered' };
    }
  }
  if (found.deviceId !== currentDeviceId) {
    return { valid: false, reason: 'device_mismatch' };
  }
  if (found.consumed) {
    return { valid: false, reason: 'already_used' };
  }
  if (Date.now() > found.expiresAt) {
    return { valid: false, reason: 'expired' };
  }

  // Mark as single-use consumed for share-link replay protection, while keeping active in-app session
  const updated = [...tokens];
  updated[idx] = { ...found, consumed: true };
  saveVaultTokens(updated);
  return { valid: true, token: updated[idx] };
}

export function buildExpiringVaultShareLink(tokenId: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/?vaultToken=${encodeURIComponent(tokenId)}`;
}

export function generateUserReferralCode(): string {
  try {
    const key = 'addisvault_my_ref_code';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const code = `AV${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    localStorage.setItem(key, code);
    return code;
  } catch {
    return 'AVREF15';
  }
}
