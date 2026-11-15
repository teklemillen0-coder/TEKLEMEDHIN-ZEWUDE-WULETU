export const OWNER_SUPPORT_CONTACTS = {
  telegramUsername: '@tekii18',
  telegramUrl: 'https://t.me/tekii18',
  whatsappDisplay: '+251 925 695 197',
  whatsappPhoneRaw: '251925695197',
  whatsappUrl: 'https://wa.me/251925695197',
  email: 'teklemillen0@gmail.com',
  emailUrl: 'mailto:teklemillen0@gmail.com',
} as const;

export function buildTelegramPrefillUrl(message: string): string {
  return `https://t.me/tekii18?text=${encodeURIComponent(message)}`;
}

export function buildWhatsAppPrefillUrl(message: string): string {
  return `https://wa.me/251925695197?text=${encodeURIComponent(message)}`;
}

export function buildEmailPrefillUrl(subject: string, body: string): string {
  return `mailto:teklemillen0@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
