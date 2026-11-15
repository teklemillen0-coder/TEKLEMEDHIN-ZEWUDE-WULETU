import {
  CommunityChatMessage,
  MemberProfile,
  OwnerTrustProfile,
  PdfExportFormatOption,
} from '../types';

export const PDF_EXPORT_TIERS: PdfExportFormatOption[] = [
  {
    id: 'pdf_clean',
    fileExt: 'pdf',
    priceEtb: 50,
    label: {
      en: 'Clean Final PDF (.pdf)',
      am: 'ንጹህ PDF ፋይል (.pdf)',
      om: 'Faayila PDF Qulqulluu (.pdf)',
      ti: 'ጽሩይ PDF ፋይል (.pdf)',
      so: 'Fayl PDF Nadiif ah (.pdf)',
    },
    description: {
      en: 'Filled PDF fields + AI formatted layout ready to print or submit.',
      am: 'የተሞሉ ቅጾች እና በAI የተስተካከለ PDF ለህትመት ወይም ለመላክ ዝግጁ።',
      om: 'Unka guutamee fi maxxansaaf qophaaʼe.',
      ti: 'ዝተመልአ ቅጥዕታትን ንሕትመት ዝተዳለወ PDF።',
      so: 'Foomam la buuxiyay oo diyaar u ah daabacaad.',
    },
  },
  {
    id: 'word_editable',
    fileExt: 'doc',
    priceEtb: 75,
    label: {
      en: 'Editable Word Document (.doc)',
      am: 'የሚስተካከል የWord ፋይል (.doc)',
      om: 'Faayila Word Sirreeffamu (.doc)',
      ti: 'ዝመዓራረ Word ፋይል (.doc)',
      so: 'Fayl Word la tafatiri karo (.doc)',
    },
    description: {
      en: 'Opens cleanly in Microsoft Word / Google Docs for further edits.',
      am: 'በMicrosoft Word ወይም Google Docs ውስጥ ተጨማሪ ማስተካከያ ለማድረግ።',
      om: 'Microsoft Word fi Google Docs keessatti salphaatti banama.',
      ti: 'ኣብ Microsoft Word ወይ Google Docs ብቐሊሉ ይኽፈት።',
      so: 'Si fudud ugu furma Microsoft Word & Google Docs.',
    },
  },
  {
    id: 'png_highres',
    fileExt: 'png',
    priceEtb: 30,
    label: {
      en: 'High-Res Document Image (.png)',
      am: 'ጥራት ያለው ምስል (.png)',
      om: 'Suuraa Qulqullina Olaanaa (.png)',
      ti: 'ጽሩይ ስእሊ (.png)',
      so: 'Sawir Tayada Sare ah (.png)',
    },
    description: {
      en: 'Crisp A4 PNG image ideal for Telegram, WhatsApp, or portal uploads.',
      am: 'በቴሌግራም፣ በዋትስአፕ ወይም በኦንላይን ፖርታል ለመላክ ምቹ የሆነ ምስል።',
      om: 'Telegram, WhatsApp fi poortaaliif mijataa.',
      ti: 'ብTelegram፣ WhatsApp ወይ ኦንላይን ንምልኣኽ ምቹው።',
      so: 'Ku habboon Telegram, WhatsApp ama dirista degdegga ah.',
    },
  },
  {
    id: 'all_bundle',
    fileExt: 'pdf',
    priceEtb: 100,
    label: {
      en: 'Complete Bundle (PDF + Word + PNG)',
      am: 'ሙሉ ጥቅል (PDF + Word + PNG)',
      om: 'Paakeejii Guutuu (PDF + Word + PNG)',
      ti: 'ሙሉእ ጥቕላላ (PDF + Word + PNG)',
      so: 'Xirmo Dhammeystiran (PDF + Word + PNG)',
    },
    description: {
      en: 'Unlock all 3 output formats at once and save 55 ETB.',
      am: 'ሶስቱንም ቅርጾች በአንድ ጊዜ አውርደው 55 ብር ይቆጥቡ።',
      om: 'Bifa sadii walitti argachuun Birrii 55 qusadhu.',
      ti: 'ሰለስቲኦም ዓይነታት ብሓንሳብ ኣውሪድካ 55 ብር ቆጥብ።',
      so: 'Hel dhammaan 3-da nooc adigoo kaydsanaya 55 ETB.',
    },
  },
];

export const PDF_EXPORT_PRICE_MAP: Record<string, number> = PDF_EXPORT_TIERS.reduce(
  (acc, item) => {
    acc[item.id] = item.priceEtb;
    return acc;
  },
  {} as Record<string, number>
);

export interface StarterPdfTemplate {
  id: string;
  title: string;
  fields: { key: string; label: string; value: string }[];
  bodyText: string;
}

export const STARTER_PDF_TEMPLATES: StarterPdfTemplate[] = [
  {
    id: 'tpl_business_permit',
    title: 'Ethiopian Trade & License Application Form',
    fields: [
      { key: 'applicant_name', label: 'Applicant Full Name / የአመልካች ሙሉ ስም', value: '' },
      { key: 'tin_number', label: 'TIN Number / የግብር ከፋይ መለያ ቁጥር', value: '' },
      { key: 'subcity_woreda', label: 'City, Sub-City & Woreda / ክፍለ ከተማና ወረዳ', value: '' },
      { key: 'business_sector', label: 'Business Sector / የስራ ዘርፍ', value: '' },
      { key: 'capital_etb', label: 'Registered Capital (ETB) / ካፒታል', value: '' },
      { key: 'phone_number', label: 'Phone Number / ስልክ ቁጥር', value: '' },
    ],
    bodyText:
      'TO: Ministry of Trade & Regional Integration / Woreda Trade Office\n\nSubject: Application for Commercial Registration & Business License Renewal\n\nI respectfully submit this completed application form along with supporting TIN clearance and lease documentation for review and approval in accordance with Ethiopian Commercial Registration Proclamation.',
  },
  {
    id: 'tpl_office_letter',
    title: 'Bilingual Official Application / Clearance Form',
    fields: [
      { key: 'full_name', label: 'Full Name / ሙሉ ስም', value: '' },
      { key: 'id_or_student_no', label: 'ID / Employee / Student Number', value: '' },
      { key: 'department_office', label: 'Organization / University Office', value: '' },
      { key: 'request_date', label: 'Date / ቀን', value: new Date().toLocaleDateString() },
    ],
    bodyText:
      'Dear Sir / Madam,\n\nI kindly request processing of my official clearance / transcript verification document referenced above. Please update any missing lines or translate cleanly into Amharic or English using the AI Helper beside this form.',
  },
  {
    id: 'tpl_service_contract',
    title: 'Ethiopian Service & Consultancy Agreement',
    fields: [
      { key: 'client_party', label: 'First Party (Client)', value: '' },
      { key: 'provider_party', label: 'Second Party (Service Provider)', value: '' },
      { key: 'total_fee_etb', label: 'Agreed Contract Fee (ETB)', value: '' },
      { key: 'delivery_timeline', label: 'Completion Timeline', value: '' },
    ],
    bodyText:
      '1. Scope of Services: The Second Party agrees to deliver the project milestones specified in the schedule.\n2. Payment Terms: Settled via Telebirr or Commercial Bank of Ethiopia upon verified milestone acceptance.\n3. Governing Law: Governed by the Civil Code of Ethiopia.',
  },
];

export const OWNER_DEFAULT_PROFILE: OwnerTrustProfile = {
  fullName: 'Tekleab Millen',
  roleTitle: {
    en: 'Founder & Verified Platform Owner — AddisVault Ethiopia',
    am: 'የAddisVault ኢትዮጵያ መስራች እና የተረጋገጠ ባለቤት',
    om: 'Hundeessaa fi Abbaa AddisVault Itoophiyaa Mirkaneeffame',
    ti: 'መስራትን ዝተረጋገጸ ዋናን AddisVault ኢትዮጵያ',
    so: 'Aasaasaha & Mulkiilaha La Xaqiijiyay ee AddisVault',
  },
  photoUrl: '/assets/aistudio/IMG-20260831-WA0002_10830218.jpg',
  welcomeBio: {
    en: 'Welcome to AddisVault. Every textbook, Matric exam pack, legal pleading, and software kit is personally verified for Ethiopian students, lawyers, technicians, and entrepreneurs with instant Telebirr & CBE unlock.',
    am: 'ወደ AddisVault እንኳን በደህና መጡ። እያንዳንዱ መጽሐፍ፣ የማትሪክ ፈተና፣ የህግ ሰነድ እና የስራ መሳሪያ በጥራት ተረጋግጦ በቴሌብር እና በንግድ ባንክ ወዲያውኑ እንዲደርስዎ ተዘጋጅቷል።',
    om: 'Baga gara AddisVault nagaan dhuftan. Kitaabni, qormaanni biyyoolessaa fi meeshaan hojii hunduu qulqullinaan mirkaneeffameera.',
    ti: 'ናብ AddisVault ብደሓን መጻእኩም። ኩሉ መጻሕፍቲ፣ ፈተናታት ማትሪክ፣ ሕጋዊ ሰነዳትን ናውቲ ስራሕን ብጽፈት ተረጋጊጹ ብቴሌብርን ንግድ ባንክን ብቐጥታ ይቐርብ።',
    so: 'Ku soo dhawoow AddisVault. Buug kasta, imtixaan kasta, iyo dukumeenti kasta waa la hubiyay waxaana si degdeg ah loogu furaa Telebirr & CBE.',
  },
  faydaStatement: {
    en: 'Identity Verified via Ethiopian National ID (Fayda) — Full ID card number hidden for anti-fraud security; available for private verification upon official business request.',
    am: 'ማንነት በኢትዮጵያ ብሄራዊ መታወቂያ (ፋይዳ / Fayda) የተረጋገጠ — ከማጭበርበር ለመጠበቅ ሙሉው የመታወቂያ ቁጥር ተደብቋል፤ ለህጋዊ ወይም ለድርጅታዊ የስራ ጥያቄ በግል ይቀርባል።',
    om: 'Eenyummaan Waraqaa Eenyummaa Biyoolessaa Itoophiyaa (Fayda) tiin mirkaneeffameera — nageenyaaf lakkoofsi guutuun dhokfameera; gaaffii hojii seeraa qabeessaaf dhuunfaan ni dhihaata.',
    ti: 'መንነት ብብሄራዊ መታወቂያ ኢትዮጵያ (ፋይዳ / Fayda) ዝተረጋገጸ — ካብ ምትላል ንምክልኻል ሙሉእ ቁጽሪ ተሓቢኡ ኣሎ፤ ንሕጋዊ ወይ ንግዳዊ ሕቶ ብብሕቲ ይቐርብ።',
    so: 'Aqoonsiga waxaa lagu xaqiijiyay Kaarka Qaranka Itoobiya (Fayda) — lambarka buuxa waa la qariyay si looga hortago khiyaanada; waxaa lagu arki karaa codsi ganacsi oo rasmi ah.',
  },
  faydaMaskedCode: 'FAYDA-ET-****-9197',
  cityCountry: 'Addis Ababa, Ethiopia',
};

export const SEED_LEADERBOARD_MEMBERS: MemberProfile[] = [
  {
    id: 'AV-MBR-1042',
    fullName: 'Dawit Mekonnen',
    contact: '+251 911 482 109',
    region: 'Addis Ababa',
    role: 'Professional',
    sharePhone: true,
    verifiedBuyer: true,
    points: 680,
    downloadsCount: 14,
    purchasesCount: 4,
    referralsCount: 3,
    helpfulChatsCount: 6,
    joinedAt: '2026-06-12T08:30:00.000Z',
  },
  {
    id: 'AV-MBR-2088',
    fullName: 'Chaltu Gemechu',
    contact: '+251 922 714 550',
    region: 'Oromia (Adama)',
    role: 'Student',
    sharePhone: true,
    verifiedBuyer: true,
    points: 545,
    downloadsCount: 11,
    purchasesCount: 3,
    referralsCount: 2,
    helpfulChatsCount: 5,
    joinedAt: '2026-07-04T10:15:00.000Z',
  },
  {
    id: 'AV-MBR-3194',
    fullName: 'Selamawit Berhane',
    contact: '+251 914 883 221',
    region: 'Tigray (Mekelle)',
    role: 'Lawyer',
    sharePhone: false,
    verifiedBuyer: true,
    points: 490,
    downloadsCount: 9,
    purchasesCount: 3,
    referralsCount: 2,
    helpfulChatsCount: 4,
    joinedAt: '2026-07-19T14:20:00.000Z',
  },
  {
    id: 'AV-MBR-4410',
    fullName: 'Yonas Tadesse',
    contact: '+251 918 302 914',
    region: 'Amhara (Bahir Dar)',
    role: 'Business Owner',
    sharePhone: true,
    verifiedBuyer: true,
    points: 410,
    downloadsCount: 8,
    purchasesCount: 2,
    referralsCount: 2,
    helpfulChatsCount: 3,
    joinedAt: '2026-08-03T09:00:00.000Z',
  },
  {
    id: 'AV-MBR-5076',
    fullName: 'Abdi Mohamed Hassan',
    contact: '+251 915 640 318',
    region: 'Somali (Jigjiga)',
    role: 'Student',
    sharePhone: true,
    verifiedBuyer: true,
    points: 355,
    downloadsCount: 7,
    purchasesCount: 2,
    referralsCount: 1,
    helpfulChatsCount: 4,
    joinedAt: '2026-08-18T11:45:00.000Z',
  },
];

export const SEED_COMMUNITY_MESSAGES: CommunityChatMessage[] = [
  {
    id: 'msg-seed-01',
    memberId: 'AV-MBR-1042',
    authorName: 'Dawit Mekonnen',
    authorRegion: 'Addis Ababa · Verified Buyer',
    authorRole: 'Professional',
    verifiedBuyer: true,
    room: 'trust',
    message:
      'Just unlocked the Germany Lebenslauf CV & Federal Grade 12 Physics pack via Telebirr (0925695197). Entered my FT reference and the files opened in less than 5 seconds. 100% genuine Ethiopian platform.',
    optionalPhone: '+251 911 482 109',
    helpfulCount: 18,
    createdAt: '2026-11-12T09:15:00.000Z',
  },
  {
    id: 'msg-seed-02',
    memberId: 'AV-MBR-2088',
    authorName: 'Chaltu Gemechu',
    authorRegion: 'Oromia (Adama) · Verified Buyer',
    authorRole: 'Student',
    verifiedBuyer: true,
    room: 'exams',
    message:
      'Barattoota Oromiyaa hundaaf: Afaan Oromoo Grade 10 & Grade 12 Matric exam packs I downloaded here match the New Curriculum (2016 E.C.) completely. Thank you @tekii18 for fast WhatsApp support!',
    optionalPhone: '+251 922 714 550',
    helpfulCount: 14,
    createdAt: '2026-11-13T11:40:00.000Z',
  },
  {
    id: 'msg-seed-03',
    memberId: 'AV-MBR-3194',
    authorName: 'Selamawit Berhane',
    authorRegion: 'Tigray (Mekelle) · Verified Buyer',
    authorRole: 'Lawyer',
    verifiedBuyer: true,
    room: 'trust',
    message:
      'Used CBE (1000211261513) for the VIP Yearly Pass and the Civil Cassation Court Pleadings bundle. Both Amharic & Tigrinya regional books plus the court templates downloaded cleanly with zero broken links.',
    helpfulCount: 12,
    createdAt: '2026-11-13T16:05:00.000Z',
  },
  {
    id: 'msg-seed-04',
    memberId: 'AV-MBR-4410',
    authorName: 'Yonas Tadesse',
    authorRegion: 'Amhara (Bahir Dar) · Verified Buyer',
    authorRole: 'Business Owner',
    verifiedBuyer: true,
    room: 'careers',
    message:
      'በSmart PDF Filler መሳሪያ የንግድ ፈቃድ ቅጽ አስገብቼ በAI አማርኛ እና እንግሊዝኛ አስተካክዬ በ50 ብር PDF አውርጃለሁ። ለሥራ ፈላጊዎችም የCV መስሪያው በቅድሚያ Preview ማሳየቱ በጣም ታማኝ ነው።',
    optionalPhone: '+251 918 302 914',
    helpfulCount: 21,
    createdAt: '2026-11-14T08:25:00.000Z',
  },
  {
    id: 'msg-seed-05',
    memberId: 'AV-MBR-5076',
    authorName: 'Abdi Mohamed Hassan',
    authorRegion: 'Somali (Jigjiga) · Verified Buyer',
    authorRole: 'Student',
    verifiedBuyer: true,
    room: 'exams',
    message:
      'Downloaded Af-Soomaali Grade 8 Regional Textbooks & Exit Exam guides via CBE. Anyone preparing for 2017 Matric in Jigjiga or Dire Dawa can reveal my number to share study notes.',
    optionalPhone: '+251 915 640 318',
    helpfulCount: 9,
    createdAt: '2026-11-14T13:10:00.000Z',
  },
];
