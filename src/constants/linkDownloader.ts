import { LinkFormatOption, LinkPlatformId, LocalizedText } from '../types';

export interface PlatformDetectionResult {
  platform: LinkPlatformId;
  platformName: string;
  inferredTitle: string;
  formats: LinkFormatOption[];
}

export const LINK_PRICING_TIERS: Record<string, number> = {
  yt_mp3: 10,
  yt_720p: 25,
  yt_1080p: 45,
  tt_mp3: 10,
  tt_hd: 15,
  fb_mp3: 10,
  fb_hd: 15,
  ig_mp3: 10,
  ig_hd: 15,
  x_mp3: 10,
  x_hd: 15,
  pdf_std: 10,
  pdf_large: 25,
  doc_file: 10,
  archive_std: 40,
  archive_large: 50,
  audio_file: 5,
  web_pdf: 5,
  web_raw: 5,
};

const FORMAT_CATALOG: Record<LinkPlatformId, LinkFormatOption[]> = {
  youtube: [
    {
      id: 'yt_mp3',
      label: {
        en: 'Audio Extract (MP3 320kbps)',
        am: 'ድምጽ ብቻ (MP3 Audio)',
        om: 'Sagalee Qofa (MP3 Audio)',
        ti: 'ድምጺ ጥራይ (MP3 Audio)',
        so: 'Cod Kaliya (MP3 Audio)',
      },
      qualityNote: '320 kbps Audio · Fast Download',
      fileExt: 'mp3',
      priceEtb: 10,
      mode: 'media',
    },
    {
      id: 'yt_720p',
      label: {
        en: 'HD Video (MP4 720p)',
        am: 'HD ቪዲዮ (MP4 720p)',
        om: 'Viidiyoo HD (MP4 720p)',
        ti: 'HD ቪድዮ (MP4 720p)',
        so: 'Muuqaal HD (MP4 720p)',
      },
      qualityNote: '1280×720 HD · MP4 Video',
      fileExt: 'mp4',
      priceEtb: 25,
      mode: 'media',
    },
    {
      id: 'yt_1080p',
      label: {
        en: 'Full HD Video (MP4 1080p)',
        am: 'Full HD ቪዲዮ (MP4 1080p)',
        om: 'Viidiyoo Full HD (MP4 1080p)',
        ti: 'Full HD ቪድዮ (MP4 1080p)',
        so: 'Full HD Muuqaal (MP4 1080p)',
      },
      qualityNote: '1920×1080 Full HD · MP4 Video',
      fileExt: 'mp4',
      priceEtb: 45,
      mode: 'media',
    },
  ],
  tiktok: [
    {
      id: 'tt_hd',
      label: {
        en: 'Watermark-Free HD Video (MP4)',
        am: 'ያለ አርማ HD ቪዲዮ (No Watermark)',
        om: 'Viidiyoo HD Mallattoo Malee',
        ti: 'HD ቪድዮ ብዘይ ምልክት',
        so: 'Muuqaal HD Bilaa Calaamad ah',
      },
      qualityNote: 'No Watermark · HD MP4',
      fileExt: 'mp4',
      priceEtb: 15,
      mode: 'media',
    },
    {
      id: 'tt_mp3',
      label: {
        en: 'TikTok Sound / Audio (MP3)',
        am: 'የቲክቶክ ድምጽ (MP3 Audio)',
        om: 'Sagalee TikTok (MP3)',
        ti: 'ድምጺ ቲክቶክ (MP3)',
        so: 'Codka TikTok (MP3)',
      },
      qualityNote: 'Audio Track · MP3',
      fileExt: 'mp3',
      priceEtb: 10,
      mode: 'media',
    },
  ],
  facebook: [
    {
      id: 'fb_hd',
      label: {
        en: 'Facebook Public Video / Reel (MP4)',
        am: 'ፌስቡክ ቪዲዮ / Reels (MP4)',
        om: 'Viidiyoo Facebook / Reel (MP4)',
        ti: 'ፌስቡክ ቪድዮ / Reel (MP4)',
        so: 'Muuqaal Facebook / Reel (MP4)',
      },
      qualityNote: 'Standard / HD MP4',
      fileExt: 'mp4',
      priceEtb: 15,
      mode: 'media',
    },
    {
      id: 'fb_mp3',
      label: {
        en: 'Audio Track Only (MP3)',
        am: 'ድምጽ ብቻ (MP3)',
        om: 'Sagalee Qofa (MP3)',
        ti: 'ድምጺ ጥራይ (MP3)',
        so: 'Cod Kaliya (MP3)',
      },
      qualityNote: 'Audio Track · MP3',
      fileExt: 'mp3',
      priceEtb: 10,
      mode: 'media',
    },
  ],
  instagram: [
    {
      id: 'ig_hd',
      label: {
        en: 'Instagram Reels / Video (MP4)',
        am: 'ኢንስታግራም Reels / ቪዲዮ (MP4)',
        om: 'Viidiyoo Instagram / Reels (MP4)',
        ti: 'ኢንስታግራም Reels / ቪድዮ (MP4)',
        so: 'Muuqaal Instagram / Reels (MP4)',
      },
      qualityNote: 'HD MP4 Download',
      fileExt: 'mp4',
      priceEtb: 15,
      mode: 'media',
    },
    {
      id: 'ig_mp3',
      label: {
        en: 'Reels Audio Track (MP3)',
        am: 'ድምጽ ብቻ (MP3)',
        om: 'Sagalee Reels (MP3)',
        ti: 'ድምጺ Reels (MP3)',
        so: 'Codka Reels (MP3)',
      },
      qualityNote: 'Audio Extract · MP3',
      fileExt: 'mp3',
      priceEtb: 10,
      mode: 'media',
    },
  ],
  twitter: [
    {
      id: 'x_hd',
      label: {
        en: 'X / Twitter Video (MP4)',
        am: 'X / ትዊተር ቪዲዮ (MP4)',
        om: 'Viidiyoo X / Twitter (MP4)',
        ti: 'X / ትዊተር ቪድዮ (MP4)',
        so: 'Muuqaal X / Twitter (MP4)',
      },
      qualityNote: 'HD MP4 Stream',
      fileExt: 'mp4',
      priceEtb: 15,
      mode: 'media',
    },
    {
      id: 'x_mp3',
      label: {
        en: 'Audio Extract (MP3)',
        am: 'ድምጽ ብቻ (MP3)',
        om: 'Sagalee Qofa (MP3)',
        ti: 'ድምጺ ጥራይ (MP3)',
        so: 'Cod Kaliya (MP3)',
      },
      qualityNote: 'Audio Track · MP3',
      fileExt: 'mp3',
      priceEtb: 10,
      mode: 'media',
    },
  ],
  pdf: [
    {
      id: 'pdf_std',
      label: {
        en: 'Standard Direct PDF Document',
        am: 'መደበኛ PDF ሰነድ',
        om: 'Sanada PDF Idilee',
        ti: 'ንቡር ሰነድ PDF',
        so: 'Faylka PDF Caadiga ah',
      },
      qualityNote: 'Direct PDF · Up to 5 MB',
      fileExt: 'pdf',
      priceEtb: 10,
      mode: 'raw',
    },
    {
      id: 'pdf_large',
      label: {
        en: 'Large Academic PDF (>5 MB / Textbook)',
        am: 'ትልቅ አካዳሚክ PDF (ከ5 MB በላይ)',
        om: 'PDF Barnootaa Guddaa (>5 MB)',
        ti: 'ዓቢይ ኣካዳሚክ PDF (>5 MB)',
        so: 'PDF Weyn oo Waxbarasho (>5 MB)',
      },
      qualityNote: 'High-Speed Proxy · Textbook / Thesis',
      fileExt: 'pdf',
      priceEtb: 25,
      mode: 'raw',
    },
  ],
  document: [
    {
      id: 'doc_file',
      label: {
        en: 'Word / Excel / PowerPoint File',
        am: 'Word / Excel / PPT ሰነድ',
        om: 'Faayila Word / Excel / PPT',
        ti: 'ሰነድ Word / Excel / PPT',
        so: 'Faylka Word / Excel / PPT',
      },
      qualityNote: 'Original Format (.docx/.xlsx/.pptx)',
      fileExt: 'docx',
      priceEtb: 10,
      mode: 'raw',
    },
  ],
  archive: [
    {
      id: 'archive_std',
      label: {
        en: 'Compressed Archive Package (ZIP/RAR)',
        am: 'የተጠቀለለ ፋይል (ZIP/RAR)',
        om: 'Kuusaa Faayilaa (ZIP/RAR)',
        ti: 'ዝተጠቕለለ ፋይል (ZIP/RAR)',
        so: 'Xidhmo Faylal ah (ZIP/RAR)',
      },
      qualityNote: 'Multi-File Archive · Standard',
      fileExt: 'zip',
      priceEtb: 40,
      mode: 'raw',
    },
    {
      id: 'archive_large',
      label: {
        en: 'Large Multi-File Bundle (>25 MB)',
        am: 'ትልቅ የፋይሎች ጥቅል (>25 MB)',
        om: 'Kuusaa Guddaa (>25 MB)',
        ti: 'ዓቢይ ጥቕሊ ፋይላት (>25 MB)',
        so: 'Xidhmo Weyn (>25 MB)',
      },
      qualityNote: 'Priority Server Relay · 50 ETB',
      fileExt: 'zip',
      priceEtb: 50,
      mode: 'raw',
    },
  ],
  audio: [
    {
      id: 'audio_file',
      label: {
        en: 'Direct Audio File (MP3/WAV)',
        am: 'ቀጥታ የድምጽ ፋይል (MP3/WAV)',
        om: 'Faayila Sagalee (MP3/WAV)',
        ti: 'ፋይል ድምጺ (MP3/WAV)',
        so: 'Fayl Cod ah (MP3/WAV)',
      },
      qualityNote: 'Original Audio Stream',
      fileExt: 'mp3',
      priceEtb: 5,
      mode: 'raw',
    },
  ],
  webpage: [
    {
      id: 'web_pdf',
      label: {
        en: 'Clean Offline Article (PDF-Ready HTML)',
        am: 'ለንባብ የተዘጋጀ ከመስመር ውጭ ፋይል (Clean PDF/HTML)',
        om: 'Barruu Qulqulluu (PDF-Ready Offline)',
        ti: 'ንንባብ ዝተዳለወ ጽሩይ ፋይል (PDF-Ready)',
        so: 'Maqaal Nadiif ah oo Offline ah (PDF-Ready)',
      },
      qualityNote: 'Ads & Popups Stripped · Printable PDF',
      fileExt: 'html',
      priceEtb: 5,
      mode: 'reader',
    },
    {
      id: 'web_raw',
      label: {
        en: 'Original Page Source File',
        am: 'ዋናው የድረ-ገጽ ፋይል',
        om: 'Faayila Fuula Jalqabaa',
        ti: 'ዋና ፋይል መርበብ ሓበሬታ',
        so: 'Faylka Asalka ah ee Bogga',
      },
      qualityNote: 'Direct Proxy Fetch',
      fileExt: 'html',
      priceEtb: 5,
      mode: 'raw',
    },
  ],
};

export function detectPlatformFromUrl(rawUrl: string): PlatformDetectionResult | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
  } catch {
    return null;
  }

  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();

  let platform: LinkPlatformId = 'webpage';
  let platformName = 'Web Article / Direct Link';
  let inferredTitle = decodeURIComponent(path.split('/').filter(Boolean).pop() || host);

  if (host.includes('youtube.com') || host === 'youtu.be' || host.endsWith('.youtu.be')) {
    platform = 'youtube';
    platformName = 'YouTube Video & Audio';
    const vParam = parsed.searchParams.get('v');
    inferredTitle = vParam
      ? `YouTube Video (${vParam})`
      : `YouTube Media — ${parsed.pathname.slice(1) || 'Watch'}`;
  } else if (host.includes('tiktok.com')) {
    platform = 'tiktok';
    platformName = 'TikTok HD Video';
    inferredTitle = `TikTok Video (${parsed.pathname.split('/').filter(Boolean).pop() || 'clip'})`;
  } else if (host.includes('facebook.com') || host.includes('fb.watch') || host === 'fb.com') {
    platform = 'facebook';
    platformName = 'Facebook Video / Reels';
    inferredTitle = `Facebook Public Video (${host})`;
  } else if (host.includes('instagram.com') || host.includes('instagr.am')) {
    platform = 'instagram';
    platformName = 'Instagram Reels / Video';
    inferredTitle = `Instagram Reel (${parsed.pathname.split('/').filter(Boolean).pop() || 'post'})`;
  } else if (host.includes('twitter.com') || host === 'x.com' || host.endsWith('.x.com')) {
    platform = 'twitter';
    platformName = 'X (Twitter) Video';
    inferredTitle = `X / Twitter Media (${parsed.pathname.split('/').filter(Boolean).pop() || 'post'})`;
  } else if (path.endsWith('.pdf')) {
    platform = 'pdf';
    platformName = 'PDF Document';
  } else if (/\.(docx?|xlsx?|pptx?|csv|txt|rtf)$/.test(path)) {
    platform = 'document';
    platformName = 'Word / Office Document';
  } else if (/\.(zip|rar|7z|tar|gz)$/.test(path)) {
    platform = 'archive';
    platformName = 'Archive Package (ZIP/RAR)';
  } else if (/\.(mp3|m4a|wav|ogg|aac)$/.test(path)) {
    platform = 'audio';
    platformName = 'Audio Track (MP3/WAV)';
  }

  return {
    platform,
    platformName,
    inferredTitle: inferredTitle.slice(0, 90),
    formats: FORMAT_CATALOG[platform],
  };
}

export function getLinkPricingLabel(lang: keyof LocalizedText): string {
  const labels: LocalizedText = {
    en: '5–50 ETB Tiered · Free w/ VIP',
    am: 'ከ5–50 ብር · በVIP ነጻ',
    om: 'Birrii 5–50 · VIP waliin Bilisa',
    ti: 'ካብ 5–50 ብር · ብVIP ነጻ',
    so: '5–50 ETB · VIP Bilaash',
  };
  return labels[lang];
}
