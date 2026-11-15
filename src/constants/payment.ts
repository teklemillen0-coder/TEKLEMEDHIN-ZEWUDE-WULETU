export const OWNER_PAYMENT_ACCOUNTS = {
  telebirr: {
    id: 'telebirr' as const,
    nameEn: 'Telebirr',
    nameAm: 'ቴሌብር',
    number: '0925695197',
    accountHolder: 'AddisVault Digital Merchant',
  },
  cbe: {
    id: 'cbe' as const,
    nameEn: 'Commercial Bank of Ethiopia (CBE)',
    nameAm: 'ንግድ ባንክ',
    number: '1000211261513',
    accountHolder: 'AddisVault Digital Merchant',
  },
} as const;

export const PROMO_CODES: Record<string, number> = {
  ETHIO10: 10,
  BUNNA15: 15,
  ADDIS20: 20,
};

export function getPromoDiscountPercent(code: string | null): number {
  if (!code) return 0;
  const normalized = code.trim().toUpperCase();
  if (PROMO_CODES[normalized]) {
    return PROMO_CODES[normalized];
  }
  if (normalized === 'BUNDLE35') return 35;
  if (normalized === 'BUNDLE30') return 30;
  if (/^AV[A-Z0-9]{4,}$/.test(normalized)) {
    return 15;
  }
  return 0;
}

export const CURRENCY_CODE = 'ETB';
