import { ExpediterRequest, JobListing, WorkerProfile, WorkerSkillCategory } from '../types';

export const WORKER_CATEGORIES: {
  id: WorkerSkillCategory;
  labels: { en: string; am: string; om: string; ti: string; so: string };
}[] = [
  {
    id: 'housemaid',
    labels: {
      en: 'Housemaid / Domestic Worker',
      am: 'የቤት ሰራተኛ (Housemaid)',
      om: 'Hojjetaa Manaa',
      ti: 'ሰራሕተኛ ገዛ',
      so: 'Shaqaalaha Guriga',
    },
  },
  {
    id: 'plumber',
    labels: {
      en: 'Plumber',
      am: 'ቧምቧ ሰራተኛ (Plumber)',
      om: 'Hojjetaa Ujummoo Bishaanii',
      ti: 'ሰራሕተኛ ቧምቧ',
      so: 'Farsamo-yaqaan Tubbooyinka',
    },
  },
  {
    id: 'gypsum',
    labels: {
      en: 'Gypsum & Finishing Worker',
      am: 'ጂብሰም እና ፊኒሺንግ ሰራተኛ',
      om: 'Hojjetaa Jiipsamii fi Xumuraa',
      ti: 'ሰራሕተኛ ጂብሰምን ፊኒሺንግን',
      so: 'Shaqaalaha Gypsum & Qurxinta',
    },
  },
  {
    id: 'electrician',
    labels: {
      en: 'Electrician',
      am: 'ኤሌክትሪሻን (Electrician)',
      om: 'Elektirishiinii',
      ti: 'ኤሌክትሪሻን',
      so: 'Koronto-yaqaan',
    },
  },
  {
    id: 'tutor',
    labels: {
      en: 'Home Tutor / Teacher',
      am: 'አስጠኚ እና መምህር (Tutor)',
      om: 'Barsiisaa / Qoʼachiisaa',
      ti: 'ኣስጠኚ / መምህር',
      so: 'Macallin Guri',
    },
  },
  {
    id: 'driver',
    labels: {
      en: 'Licensed Driver',
      am: 'ሹፌር (Driver)',
      om: 'Konkolaachisaa',
      ti: 'መራሕ መኪና',
      so: 'Darawal',
    },
  },
  {
    id: 'skilled_labor',
    labels: {
      en: 'Carpenter / Mason / Skilled Labor',
      am: 'አናጺ / ግንበኛ / ልዩ ባለሙያ',
      om: 'Muka-hoo / Gimbii / Ogummaa',
      ti: 'ነዳቓይ / ነዳቓይ ሓጺን',
      so: 'Farsamo-yaqaan Guud',
    },
  },
];

export const SEED_WORKERS: WorkerProfile[] = [
  {
    id: 'wk-1',
    fullName: 'Selamawit Bekele',
    skillCategory: 'housemaid',
    experienceYears: '5 yrs',
    location: 'Addis Ababa — Bole / CMC',
    phone: '0911458210',
    bio: 'Experienced live-in & daily domestic helper, Ethiopian cooking, laundry, and childcare.',
    createdAt: '2026-11-10T09:00:00.000Z',
  },
  {
    id: 'wk-2',
    fullName: 'Dawit Haile',
    skillCategory: 'plumber',
    experienceYears: '7 yrs',
    location: 'Addis Ababa — Kazanchis / Yeka',
    phone: '0913882041',
    bio: 'PPR & PVC pipe installation, water tanker booster pumps, bathroom/kitchen leak repair.',
    createdAt: '2026-11-11T10:30:00.000Z',
  },
  {
    id: 'wk-3',
    fullName: 'Yonas Girma',
    skillCategory: 'gypsum',
    experienceYears: '6 yrs',
    location: 'Addis Ababa — Ayat / Lebu / Adama',
    phone: '0921604912',
    bio: 'Modern false ceiling gypsum boards, LED cove profiles, cornice, and wall skim-coat finishing.',
    createdAt: '2026-11-12T14:15:00.000Z',
  },
  {
    id: 'wk-4',
    fullName: 'Meron Tadesse',
    skillCategory: 'tutor',
    experienceYears: '4 yrs',
    location: 'Addis Ababa — Sarbet / Lideta',
    phone: '0940331955',
    bio: 'Grade 7–12 Math, Physics, and Grade 12 Matric exam home tutoring in Amharic & English.',
    createdAt: '2026-11-13T08:45:00.000Z',
  },
];

export const SEED_JOBS: JobListing[] = [
  {
    id: 'jb-1',
    title: 'Gypsum Ceiling Team Needed for G+1 Villa Finishing',
    category: 'gypsum',
    location: 'Addis Ababa — Bole Bulbula',
    salaryOffer: '650 ETB / Day or Contract',
    requirements: '3+ years decorative gypsum board & LED strip ceiling experience. Immediate start.',
    employerName: 'Abiyot Builders PLC',
    contactPhone: '0911229088',
    createdAt: '2026-11-12T11:00:00.000Z',
  },
  {
    id: 'jb-2',
    title: 'Full-Time Reliable Housemaid & Cooking Assistant',
    category: 'housemaid',
    location: 'Addis Ababa — Old Airport',
    salaryOffer: '7,500 ETB / Month + Room & Meals',
    requirements: 'Kind, trustworthy, experienced in Ethiopian meals and light housekeeping.',
    employerName: 'Family Household',
    contactPhone: '0912774410',
    createdAt: '2026-11-13T12:20:00.000Z',
  },
  {
    id: 'jb-3',
    title: 'Evening Grade 12 Math & Chemistry Private Home Tutor',
    category: 'tutor',
    location: 'Hawassa — Tabor Sub-city',
    salaryOffer: '5,000 ETB / Month (3 days/week)',
    requirements: 'University STEM graduate or experienced Matric prep teacher.',
    employerName: 'Ato Mekonnen',
    contactPhone: '0916883104',
    createdAt: '2026-11-14T09:10:00.000Z',
  },
];

export const SEED_EXPEDITER_REQUESTS: ExpediterRequest[] = [
  {
    id: 'exp-1',
    trackingCode: 'EXP-1042',
    clientName: 'Bereket Tesfaye',
    phone: '0911345098',
    serviceNeeded: 'Trade License Renewal & Tax Clearance',
    location: 'Addis Ababa — Bole Sub-city',
    details: 'Need agent follow-up for yearly commercial registration & ERCA clearance stamp.',
    status: 'Quoted',
    ownerReply: 'Documents reviewed. Service facilitation fee quote: 1,500 ETB. Reply on Telegram @tekii18 to begin.',
    quoteEtb: 1500,
    createdAt: '2026-11-13T10:00:00.000Z',
    updatedAt: '2026-11-13T14:00:00.000Z',
  },
];
