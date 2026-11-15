import { EthiopianRegionId, GradeBand, LocalizedText } from '../types';

export interface EthiopianRegionMeta {
  id: EthiopianRegionId;
  name: LocalizedText;
  shortTag: string;
  primaryLanguages: string[];
}

export const ETHIOPIAN_REGIONS: EthiopianRegionMeta[] = [
  {
    id: 'federal_addis',
    shortTag: 'Federal / Addis',
    name: {
      en: 'Federal / Addis Ababa',
      am: 'ፌዴራል / አዲስ አበባ',
      om: 'Federaala / Finfinnee',
      ti: 'ፌዴራል / ኣዲስ ኣበባ',
      so: 'Federaalka / Addis Ababa',
    },
    primaryLanguages: ['አማርኛ (Amharic)', 'Afaan Oromoo', 'English'],
  },
  {
    id: 'oromia',
    shortTag: 'Oromia Region',
    name: {
      en: 'Oromia Region',
      am: 'ኦሮሚያ ክልል',
      om: 'Naannoo Oromiyaa',
      ti: 'ክልል ኦሮሚያ',
      so: 'Deegaanka Oromiyaa',
    },
    primaryLanguages: ['Afaan Oromoo', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'amhara',
    shortTag: 'Amhara Region',
    name: {
      en: 'Amhara Region',
      am: 'አማራ ክልል',
      om: 'Naannoo Amaaraa',
      ti: 'ክልል ኣምሓራ',
      so: 'Deegaanka Amxaarada',
    },
    primaryLanguages: ['አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'tigray',
    shortTag: 'Tigray Region',
    name: {
      en: 'Tigray Region',
      am: 'ትግራይ ክልል',
      om: 'Naannoo Tigiraay',
      ti: 'ክልል ትግራይ',
      so: 'Deegaanka Tigray',
    },
    primaryLanguages: ['ትግርኛ (Tigrinya)', 'English'],
  },
  {
    id: 'somali',
    shortTag: 'Somali Region',
    name: {
      en: 'Somali Region',
      am: 'ሶማሌ ክልል',
      om: 'Naannoo Somaalee',
      ti: 'ክልል ሶማሌ',
      so: 'Deegaanka Soomaalida',
    },
    primaryLanguages: ['Af-Soomaali', 'English'],
  },
  {
    id: 'sidama_south',
    shortTag: 'Sidama & South',
    name: {
      en: 'Sidama, Central & South Ethiopia',
      am: 'ሲዳማ፣ ማዕከላዊ እና ደቡብ ኢትዮጵያ',
      om: 'Sidaamaa, Giddugaleessaa fi Kibba Itoophiyaa',
      ti: 'ሲዳማ፣ ማእከላይን ደቡብ ኢትዮጵያን',
      so: 'Sidaama, Bartamaha & Koonfurta Itoobiya',
    },
    primaryLanguages: ['Sidaamu Afoo', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'harari_diredawa',
    shortTag: 'Harari & Dire Dawa',
    name: {
      en: 'Harari & Dire Dawa',
      am: 'ሐረሪ እና ድሬዳዋ',
      om: 'Hararii fi Dirree Dawaa',
      ti: 'ሐረሪን ድሬዳዋን',
      so: 'Harari & Diridhaba',
    },
    primaryLanguages: ['Harari (ሐረሪ)', 'Afaan Oromoo', 'Af-Soomaali', 'አማርኛ (Amharic)', 'English'],
  },
  {
    id: 'afar_bg_gambella',
    shortTag: 'Afar, B-G & Gambella',
    name: {
      en: 'Afar, Benishangul-Gumuz & Gambella',
      am: 'አፋር፣ ቤኒሻንጉል ጉሙዝ እና ጋምቤላ',
      om: 'Afaar, Beenishaangul-Gumuz fi Gaambeellaa',
      ti: 'ዓፋር፣ ቤኒሻንጉል ጉሙዝን ጋምቤላን',
      so: 'Cafarta, Benishangul-Gumuz & Gambella',
    },
    primaryLanguages: ['Qafar Af (Afar)', 'Nuer / Anyuak', 'አማርኛ (Amharic)', 'English'],
  },
];

export const REGION_NAME_BY_ID: Record<EthiopianRegionId, EthiopianRegionMeta> =
  ETHIOPIAN_REGIONS.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<EthiopianRegionId, EthiopianRegionMeta>);

export const ALL_INSTRUCTION_LANGUAGES: string[] = [
  'አማርኛ (Amharic)',
  'Afaan Oromoo',
  'ትግርኛ (Tigrinya)',
  'Af-Soomaali',
  'Sidaamu Afoo',
  'English',
  'Harari (ሐረሪ)',
  'Qafar Af (Afar)',
  'Nuer / Anyuak',
];

export const EDUCATION_GRADE_OPTIONS: GradeBand[] = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
  'Grade 10',
  'Grade 11',
  'Grade 12',
  'G1-4',
  'G5-6',
  'G7-8',
  'G9-10',
  'G11-12',
  'University',
];

export const EDUCATION_SUBJECT_OPTIONS: string[] = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Amharic',
  'Afaan Oromoo',
  'Tigrinya',
  'Af-Soomaali',
  'Sidaamu Afoo',
  'Qafar Af',
  'Environmental Science',
  'General Science',
  'Social Studies',
  'Citizenship / Civics',
  'History',
  'Geography',
  'Economics',
  'ICT',
];
