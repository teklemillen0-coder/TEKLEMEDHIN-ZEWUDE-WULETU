import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const STORE_DIR = path.join(__dirname, '.data');
const STORE_PATH = path.join(STORE_DIR, 'superapp-store.json');

import crypto from 'crypto';

interface StoreData {
  workers: unknown[];
  jobs: unknown[];
  expediterRequests: unknown[];
  consultations: unknown[];
  members: Record<string, unknown>[];
  chatMessages: Record<string, unknown>[];
}

function hashMemberSecret(pinOrPass: string, salt = 'AV_MBR_SALT_2026'): string {
  return crypto.createHash('sha256').update(`${salt}:${pinOrPass.trim()}`).digest('hex');
}

function readStore(): StoreData {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      return {
        workers: [],
        jobs: [],
        expediterRequests: [],
        consultations: [],
        members: [],
        chatMessages: [],
      };
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoreData>;
    return {
      workers: Array.isArray(parsed.workers) ? parsed.workers : [],
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
      expediterRequests: Array.isArray(parsed.expediterRequests) ? parsed.expediterRequests : [],
      consultations: Array.isArray(parsed.consultations) ? parsed.consultations : [],
      members: Array.isArray(parsed.members) ? (parsed.members as Record<string, unknown>[]) : [],
      chatMessages: Array.isArray(parsed.chatMessages)
        ? (parsed.chatMessages as Record<string, unknown>[])
        : [],
    };
  } catch {
    return {
      workers: [],
      jobs: [],
      expediterRequests: [],
      consultations: [],
      members: [],
      chatMessages: [],
    };
  }
}

function writeStore(data: StoreData): void {
  try {
    if (!fs.existsSync(STORE_DIR)) {
      fs.mkdirSync(STORE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist store:', err);
  }
}

function sanitizeServerText(input: unknown, maxLen = 4000): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/\u0000/g, '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, maxLen);
}

function sanitizeRecordStrings(obj: Record<string, unknown>, maxLen = 2500): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    const cleanKey = sanitizeServerText(k, 80);
    if (!cleanKey) continue;
    if (typeof v === 'string') {
      out[cleanKey] = sanitizeServerText(v, maxLen);
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      out[cleanKey] = v;
    }
  }
  return out;
}

const rateBuckets = new Map<string, number[]>();

function createRateLimiter(bucketPrefix: string, windowMs: number, maxHits: number) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `${bucketPrefix}:${ip}`;
    const now = Date.now();
    const recent = (rateBuckets.get(key) || []).filter((ts) => now - ts < windowMs);
    if (recent.length >= maxHits) {
      res.status(429).json({
        error: 'Rate limit exceeded. Please wait a minute before submitting again.',
      });
      return;
    }
    recent.push(now);
    rateBuckets.set(key, recent);
    if (rateBuckets.size > 1000) {
      rateBuckets.clear();
    }
    next();
  };
}

function isBlockedHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === 'localhost' ||
    lower === '0.0.0.0' ||
    lower === '::1' ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return true;
  }
  const ipv4Match = lower.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipv4Match) {
    const a = Number(ipv4Match[1]);
    const b = Number(ipv4Match[2]);
    if (
      a === 10 ||
      a === 127 ||
      a === 0 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168)
    ) {
      return true;
    }
  }
  return false;
}

function validatePublicUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    if (isBlockedHostname(parsed.hostname)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function inferFilename(parsedUrl: URL, contentDisposition: string | null, contentType: string): string {
  if (contentDisposition) {
    const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\n]+)/i);
    if (utf8Match?.[1]) {
      return decodeURIComponent(utf8Match[1]).replace(/["/\\]/g, '_');
    }
    const basicMatch = contentDisposition.match(/filename="?([^";\n]+)"?/i);
    if (basicMatch?.[1]) {
      return basicMatch[1].replace(/["/\\]/g, '_');
    }
  }
  const pathSeg = parsedUrl.pathname.split('/').filter(Boolean).pop();
  if (pathSeg && pathSeg.includes('.')) {
    return pathSeg.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
  const extMap: Record<string, string> = {
    'application/pdf': '.pdf',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'audio/mpeg': '.mp3',
    'text/html': '.html',
    'text/plain': '.txt',
    'text/csv': '.csv',
    'application/zip': '.zip',
    'application/json': '.json',
    'image/png': '.png',
    'image/jpeg': '.jpg',
  };
  const baseType = contentType.split(';')[0].trim().toLowerCase();
  const ext = extMap[baseType] || '.bin';
  const cleanHost = parsedUrl.hostname.replace(/[^a-zA-Z0-9-]/g, '_');
  return `addisvault-${cleanHost}${ext}`;
}

function detectCategoryLabel(contentType: string, filename: string): string {
  const ct = contentType.toLowerCase();
  const fn = filename.toLowerCase();
  if (ct.includes('pdf') || fn.endsWith('.pdf')) return 'PDF Document';
  if (ct.startsWith('video/') || fn.endsWith('.mp4') || fn.endsWith('.webm')) return 'Video File';
  if (ct.startsWith('audio/') || fn.endsWith('.mp3')) return 'Audio File';
  if (ct.includes('zip') || fn.endsWith('.zip')) return 'Archive Package';
  if (ct.includes('word') || fn.endsWith('.doc') || fn.endsWith('.docx')) return 'Word Document';
  if (ct.includes('html')) return 'Web Page / Article';
  if (ct.startsWith('image/')) return 'Image Asset';
  return 'Digital File';
}

function buildCleanReaderHtml(rawHtml: string, sourceUrl: string, titleHint: string): string {
  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const pageTitle = titleMatch?.[1]?.trim() || titleHint;
  const cleaned = rawHtml
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '');

  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] || cleaned;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${pageTitle} — AddisVault Offline Reader</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 820px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #1c1917; background: #fafaf9; }
    .av-banner { border-bottom: 2px solid #065f46; padding-bottom: 12px; margin-bottom: 24px; font-size: 13px; color: #57534e; }
    .av-banner strong { color: #065f46; }
    img { max-width: 100%; height: auto; border-radius: 8px; }
    a { color: #065f46; }
  </style>
</head>
<body>
  <div class="av-banner">
    <strong>AddisVault Smart Link Downloader</strong> · Clean Offline Copy<br/>
    Source: <a href="${sourceUrl}">${sourceUrl}</a>
  </div>
  <h1>${pageTitle}</h1>
  <div>${bodyHtml}</div>
</body>
</html>`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '4mb' }));

  // Enterprise security headers
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  const aiRateLimit = createRateLimiter('ai', 60_000, 25);
  const formRateLimit = createRateLimiter('form', 60_000, 35);

  // =========================================================================
  // Server-Side Gemini AI Endpoint for AddisVault AI Work Tools, CV & Legal
  // =========================================================================
  app.post('/api/ai/generate', aiRateLimit, async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({
        error: 'Gemini API key is not configured in server secrets. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const { toolTitle, systemInstruction, inputs, uploadedText, language } = req.body as {
      toolTitle?: string;
      systemInstruction?: string;
      inputs?: Record<string, string>;
      uploadedText?: string;
      language?: string;
    };

    const langNames: Record<string, string> = {
      en: 'English',
      am: 'Amharic (አማርኛ) with clear headings and clean English technical/financial terms where helpful',
      om: 'Afaan Oromoo',
      ti: 'Tigrinya (ትግርኛ)',
      so: 'Somali (Soomaali)',
    };
    const safeLang = sanitizeServerText(language || 'en', 10);
    const targetLang = langNames[safeLang] || 'English';

    const cleanInputs = sanitizeRecordStrings((inputs || {}) as Record<string, unknown>, 3000);
    const inputSummary = Object.entries(cleanInputs)
      .map(([k, v]) => `- ${k}: ${String(v || '').trim()}`)
      .join('\n');

    const safeToolTitle = sanitizeServerText(toolTitle || 'Ethiopian Productivity Document', 200);
    const safeSystemInstruction = sanitizeServerText(
      systemInstruction ||
        'You are a senior Ethiopian business, university, financial, legal, and HR specialist. Provide precise, practical, ready-to-use output formatted cleanly.',
      2000
    );
    const safeUploadedText = uploadedText ? sanitizeServerText(uploadedText, 8000) : '';

    const prompt = [
      `Tool: ${safeToolTitle}`,
      `Target Output Language: ${targetLang}`,
      '',
      'User Provided Parameters:',
      inputSummary || '(Default template)',
      safeUploadedText ? `\nAttached Document Excerpt (User Upload):\n${safeUploadedText}` : '',
      '',
      'Generate a comprehensive, well-structured deliverable with clear sections ready for professional review and export to PDF, Word, or Excel.',
    ].join('\n');

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction: safeSystemInstruction,
        },
      });

      const output = (response.text || '').trim();
      if (!output) {
        res.status(502).json({ error: 'The AI model returned an empty response. Please try again.' });
        return;
      }

      res.json({ content: output });
    } catch (err) {
      console.error('Gemini API error:', err);
      const message = err instanceof Error ? err.message : 'Failed to generate AI document';
      res.status(502).json({ error: message });
    }
  });

  // =========================================================================
  // Community Two-Way Jobs, Expediter & Legal Consultation API Routes
  // =========================================================================
  app.get('/api/superapp/community', (_req, res) => {
    res.json(readStore());
  });

  app.post('/api/superapp/workers', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const worker = sanitizeRecordStrings(raw || {}, 1200);
    if (!worker.fullName || !worker.phone) {
      res.status(400).json({ error: 'Name and phone are required.' });
      return;
    }
    const store = readStore();
    store.workers = [worker, ...store.workers];
    writeStore(store);
    res.json({ ok: true, worker });
  });

  app.post('/api/superapp/jobs', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const job = sanitizeRecordStrings(raw || {}, 1200);
    if (!job.title || !job.contactPhone) {
      res.status(400).json({ error: 'Job title and phone are required.' });
      return;
    }
    const store = readStore();
    store.jobs = [job, ...store.jobs];
    writeStore(store);
    res.json({ ok: true, job });
  });

  app.post('/api/superapp/expediter', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const item = sanitizeRecordStrings(raw || {}, 1500);
    if (!item.clientName || !item.phone || !item.serviceNeeded) {
      res.status(400).json({ error: 'Client name, phone, and service are required.' });
      return;
    }
    const store = readStore();
    store.expediterRequests = [item, ...store.expediterRequests];
    writeStore(store);
    res.json({ ok: true, request: item });
  });

  app.patch('/api/superapp/expediter/:id', formRateLimit, (req, res) => {
    const id = sanitizeServerText(req.params.id, 120);
    const { status, ownerReply, quoteEtb } = req.body as {
      status?: string;
      ownerReply?: string;
      quoteEtb?: number;
    };
    const store = readStore();
    let updated: unknown = null;
    store.expediterRequests = store.expediterRequests.map((entry) => {
      const rec = entry as Record<string, unknown>;
      if (rec.id === id) {
        updated = {
          ...rec,
          status: status ? sanitizeServerText(status, 40) : rec.status,
          ownerReply: ownerReply !== undefined ? sanitizeServerText(ownerReply, 1500) : rec.ownerReply,
          quoteEtb: quoteEtb !== undefined && Number.isFinite(Number(quoteEtb)) ? Number(quoteEtb) : rec.quoteEtb,
          updatedAt: new Date().toISOString(),
        };
        return updated;
      }
      return entry;
    });
    writeStore(store);
    res.json({ ok: true, request: updated });
  });

  app.post('/api/superapp/consultations', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const booking = sanitizeRecordStrings(raw || {}, 2000);
    if (!booking.clientName || !booking.phone || !booking.tierId) {
      res.status(400).json({ error: 'Client name, phone, and package tier are required.' });
      return;
    }
    const store = readStore();
    store.consultations = [booking, ...store.consultations];
    writeStore(store);
    res.json({ ok: true, booking });
  });

  // =========================================================================
  // Member Registration, Monthly Rewards Leaderboard & Community Chat Routes
  // =========================================================================
  app.post('/api/community/members/register', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const fullName = sanitizeServerText(raw?.fullName, 100);
    const contact = sanitizeServerText(raw?.contact, 100);
    const password = sanitizeServerText(raw?.password, 64);
    const region = sanitizeServerText(raw?.region, 80) || 'Addis Ababa';
    const role = sanitizeServerText(raw?.role, 40) || 'Student';
    const sharePhone = Boolean(raw?.sharePhone);

    if (!fullName || !contact || password.length < 4) {
      res.status(400).json({ error: 'Name, phone/email, and 4+ char PIN/password are required.' });
      return;
    }

    const store = readStore();
    const normalizedContact = contact.toLowerCase();
    const exists = store.members.find(
      (m) => String(m.contact || '').toLowerCase() === normalizedContact
    );
    if (exists) {
      res.status(409).json({ error: 'Account already exists with this phone or email. Please log in.' });
      return;
    }

    const memberId = `AV-MBR-${Math.floor(1000 + Math.random() * 8999)}`;
    const memberRecord = {
      id: memberId,
      fullName,
      contact,
      passwordHash: hashMemberSecret(password),
      region,
      role,
      sharePhone,
      verifiedBuyer: false,
      points: 20,
      downloadsCount: 0,
      purchasesCount: 0,
      referralsCount: 0,
      helpfulChatsCount: 0,
      joinedAt: new Date().toISOString(),
    };

    store.members = [memberRecord, ...store.members];
    writeStore(store);
    const { passwordHash: _ignored, ...publicMember } = memberRecord;
    res.json({ ok: true, member: publicMember });
  });

  app.post('/api/community/members/login', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const contact = sanitizeServerText(raw?.contact, 100).toLowerCase();
    const password = sanitizeServerText(raw?.password, 64);
    if (!contact || !password) {
      res.status(400).json({ error: 'Phone/email and password are required.' });
      return;
    }
    const store = readStore();
    const foundIdx = store.members.findIndex(
      (m) => String(m.contact || '').toLowerCase() === contact
    );
    if (foundIdx === -1) {
      res.status(401).json({ error: 'Account not found. Please sign up first.' });
      return;
    }
    const member = store.members[foundIdx];
    if (member.passwordHash !== hashMemberSecret(password)) {
      res.status(401).json({ error: 'Incorrect PIN or password.' });
      return;
    }
    // Award daily/session login activity bonus
    const updatedMember: Record<string, unknown> = {
      ...member,
      points: Number(member.points || 0) + 10,
    };
    store.members[foundIdx] = updatedMember;
    writeStore(store);
    const publicMember = { ...updatedMember };
    delete publicMember.passwordHash;
    res.json({ ok: true, member: publicMember });
  });

  app.post('/api/community/chat', formRateLimit, (req, res) => {
    const raw = req.body as Record<string, unknown>;
    const message = sanitizeServerText(raw?.message, 800);
    if (!message || message.length < 3) {
      res.status(400).json({ error: 'Message is too short.' });
      return;
    }
    const entry = {
      id: `msg-${Date.now()}`,
      memberId: sanitizeServerText(raw?.memberId, 40) || 'AV-GUEST',
      authorName: sanitizeServerText(raw?.authorName, 80) || 'Member',
      authorRegion: sanitizeServerText(raw?.authorRegion, 80) || 'Ethiopia',
      authorRole: sanitizeServerText(raw?.authorRole, 40) || 'Student',
      verifiedBuyer: Boolean(raw?.verifiedBuyer),
      room: ['trust', 'exams', 'careers'].includes(String(raw?.room))
        ? String(raw?.room)
        : 'trust',
      message,
      optionalPhone: raw?.optionalPhone ? sanitizeServerText(raw.optionalPhone, 24) : undefined,
      helpfulCount: 0,
      createdAt: new Date().toISOString(),
    };
    const store = readStore();
    store.chatMessages = [entry, ...store.chatMessages].slice(0, 120);
    writeStore(store);
    res.json({ ok: true, message: entry });
  });

  // =========================================================================
  // Universal Social Media & File Link Downloader Endpoints
  // =========================================================================
  app.post('/api/link/inspect', async (req, res) => {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url : '';
    const parsed = validatePublicUrl(rawUrl);
    if (!parsed) {
      res.status(400).json({ error: 'Please enter a valid public http:// or https:// URL.' });
      return;
    }

    const host = parsed.hostname.toLowerCase();
    const isSocial =
      host.includes('youtube.com') ||
      host === 'youtu.be' ||
      host.includes('tiktok.com') ||
      host.includes('facebook.com') ||
      host.includes('fb.watch') ||
      host.includes('instagram.com') ||
      host.includes('twitter.com') ||
      host === 'x.com';

    // Try lightweight oEmbed metadata lookup for YouTube / TikTok
    if (host.includes('youtube.com') || host === 'youtu.be') {
      try {
        const oe = await fetch(
          `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.toString())}&format=json`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (oe.ok) {
          const meta = (await oe.json()) as { title?: string; author_name?: string };
          const title = meta.title || 'YouTube Video';
          res.json({
            url: parsed.toString(),
            filename: `${title.replace(/[^\w\s-]/g, '').slice(0, 60) || 'youtube-video'}.mp4`,
            detectedTitle: meta.author_name ? `${title} — ${meta.author_name}` : title,
            contentType: 'video/mp4',
            fileKind: 'YouTube Video / Audio',
            isWebPage: false,
            sizeBytes: null,
          });
          return;
        }
      } catch {
        // Fallback below
      }
    }

    if (host.includes('tiktok.com')) {
      try {
        const oe = await fetch(
          `https://www.tiktok.com/oembed?url=${encodeURIComponent(parsed.toString())}`,
          { signal: AbortSignal.timeout(6000) }
        );
        if (oe.ok) {
          const meta = (await oe.json()) as { title?: string; author_name?: string };
          const title = meta.title || 'TikTok HD Video';
          res.json({
            url: parsed.toString(),
            filename: `${title.replace(/[^\w\s-]/g, '').slice(0, 60) || 'tiktok-video'}.mp4`,
            detectedTitle: meta.author_name ? `${title} (@${meta.author_name})` : title,
            contentType: 'video/mp4',
            fileKind: 'TikTok HD Video',
            isWebPage: false,
            sizeBytes: null,
          });
          return;
        }
      } catch {
        // Fallback below
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);

    try {
      let response = await fetch(parsed.toString(), {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'AddisVault-Downloader/2.0' },
      });

      if (response.status === 405 || response.status === 403 || response.status === 501) {
        response = await fetch(parsed.toString(), {
          method: 'GET',
          redirect: 'follow',
          signal: controller.signal,
          headers: {
            'User-Agent': 'AddisVault-Downloader/2.0',
            Range: 'bytes=0-4095',
          },
        });
      }

      clearTimeout(timer);

      if (!response.ok && response.status !== 206) {
        if (isSocial) {
          res.json({
            url: parsed.toString(),
            filename: `${host.replace(/\./g, '-')}-media.mp4`,
            detectedTitle: `Media from ${host}`,
            contentType: 'video/mp4',
            fileKind: 'Social Media Video',
            isWebPage: false,
            sizeBytes: null,
          });
          return;
        }
        res.status(502).json({
          error: `Remote server responded with status ${response.status}.`,
        });
        return;
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentLengthHeader = response.headers.get('content-length');
      const contentDisposition = response.headers.get('content-disposition');
      const filename = inferFilename(parsed, contentDisposition, contentType);
      const fileKind = detectCategoryLabel(contentType, filename);
      const isWebPage = contentType.toLowerCase().includes('text/html');

      res.json({
        url: response.url || parsed.toString(),
        filename,
        detectedTitle: filename,
        contentType,
        fileKind,
        isWebPage,
        sizeBytes: contentLengthHeader ? Number(contentLengthHeader) : null,
      });
    } catch (err) {
      clearTimeout(timer);
      if (isSocial) {
        res.json({
          url: parsed.toString(),
          filename: `${host.replace(/\./g, '-')}-media.mp4`,
          detectedTitle: `Media from ${host}`,
          contentType: 'video/mp4',
          fileKind: 'Social Media Video',
          isWebPage: false,
          sizeBytes: null,
        });
        return;
      }
      const msg = err instanceof Error ? err.message : 'Unable to reach URL';
      res.status(502).json({ error: `Fetch error: ${msg}` });
    }
  });

  app.get('/api/link/download', async (req, res) => {
    const rawUrl = typeof req.query.url === 'string' ? req.query.url : '';
    const mode =
      req.query.mode === 'reader'
        ? 'reader'
        : req.query.mode === 'media'
        ? 'media'
        : 'raw';
    const formatLabel =
      typeof req.query.formatLabel === 'string'
        ? sanitizeServerText(req.query.formatLabel, 80)
        : 'HD Media Export';
    const titleHint =
      typeof req.query.title === 'string'
        ? sanitizeServerText(req.query.title, 120)
        : 'AddisVault Media Package';

    const parsed = validatePublicUrl(rawUrl);

    if (!parsed) {
      res.status(400).send('Invalid public URL.');
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(parsed.toString(), {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal,
        headers: { 'User-Agent': 'AddisVault-Downloader/2.0' },
      });

      clearTimeout(timer);

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const contentDisposition = response.headers.get('content-disposition');
      const filename = inferFilename(parsed, contentDisposition, contentType);
      const isBinaryMedia =
        contentType.toLowerCase().startsWith('video/') ||
        contentType.toLowerCase().startsWith('audio/');

      if (mode === 'media' && (!response.ok || !isBinaryMedia)) {
        const htmlContent = response.ok && contentType.includes('text/html') ? await response.text() : '';
        const ogTitleMatch = htmlContent.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
        const resolvedTitle = ogTitleMatch?.[1] || titleHint;
        const safeFileBase = resolvedTitle.replace(/[^\w\s-]/g, '').trim().slice(0, 50) || 'addisvault-media';
        const packHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${resolvedTitle} — AddisVault Universal Downloader</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 760px; margin: 40px auto; padding: 24px; color: #1c1917; background: #fafaf9; line-height: 1.6; }
    .card { background: #ffffff; border: 1px solid #e7e5e4; border-radius: 16px; padding: 24px; }
    .badge { font-family: monospace; font-size: 12px; color: #047857; font-weight: 700; }
    h1 { font-size: 20px; margin: 8px 0 12px; }
    a.btn { display: inline-block; margin-top: 16px; background: #047857; color: #fff; text-decoration: none; padding: 12px 18px; border-radius: 10px; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">AddisVault Universal Downloader · ${formatLabel}</div>
    <h1>${resolvedTitle}</h1>
    <p><strong>Verified Source URL:</strong> <a href="${parsed.toString()}">${parsed.toString()}</a></p>
    <p>Prepared for offline reference and direct media access via AddisVault Ethiopia.</p>
    <a class="btn" href="${parsed.toString()}" target="_blank" rel="noopener noreferrer">Open Original Source Media</a>
  </div>
</body>
</html>`;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${safeFileBase}-media-pack.html"`);
        res.send(packHtml);
        return;
      }

      if (!response.ok) {
        res.status(502).send(`Remote server returned HTTP ${response.status}`);
        return;
      }

      if (mode === 'reader' && contentType.toLowerCase().includes('text/html')) {
        const htmlText = await response.text();
        const readerDoc = buildCleanReaderHtml(htmlText, parsed.toString(), filename);
        const readerName = filename.replace(/\.html?$/i, '') + '-offline-reader.html';
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${readerName}"`);
        res.send(readerDoc);
        return;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', buffer.length.toString());
      res.send(buffer);
    } catch (err) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : 'Download failed';
      res.status(502).send(`Download failed: ${msg}`);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AddisVault server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
