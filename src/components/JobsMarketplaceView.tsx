import React, { useMemo, useState } from 'react';
import {
  Briefcase,
  Check,
  CheckCircle2,
  Copy,
  MapPin,
  Phone,
  PlusCircle,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { WORKER_CATEGORIES } from '../constants/communitySeed';
import { JobListing, Language, WorkerProfile, WorkerSkillCategory } from '../types';

interface JobsMarketplaceViewProps {
  lang: Language;
  workers: WorkerProfile[];
  jobs: JobListing[];
  onRegisterWorker: (worker: WorkerProfile) => Promise<void>;
  onPostJob: (job: JobListing) => Promise<void>;
}

const COPY: Record<
  Language,
  {
    title: string;
    subtitle: string;
    freeBadge: string;
    tabWorkers: string;
    tabEmployers: string;
    searchPlaceholder: string;
    allSkills: string;
    registerTitle: string;
    postJobTitle: string;
    fullName: string;
    skillCat: string;
    experience: string;
    location: string;
    phone: string;
    bio: string;
    submitWorker: string;
    workerSuccess: string;
    jobTitle: string;
    employerName: string;
    salaryOffer: string;
    requirements: string;
    submitJob: string;
    jobSuccess: string;
    callDirect: string;
    copyPhone: string;
    copied: string;
  }
> = {
  en: {
    title: 'Free Job & Skilled Worker Marketplace / ስራ እና ሰራተኛ',
    subtitle:
      '100% Free community hub connecting Ethiopian housemaids, plumbers, gypsum artisans, electricians, tutors, and drivers directly with employers and households.',
    freeBadge: '100% Free · Zero Commission or Registration Fees',
    tabWorkers: 'Workers Register & Profiles (ሰራተኞች ይመዝገቡ)',
    tabEmployers: 'Employers Post & Browse Jobs (አሰሪዎች ስራ ይልቀቁ)',
    searchPlaceholder: 'Search trade, sub-city, or skill...',
    allSkills: 'All Skills / Trades',
    registerTitle: 'Register Free Worker Profile',
    postJobTitle: 'Post a Free Job Opening',
    fullName: 'Full Name',
    skillCat: 'Skill / Trade Category',
    experience: 'Years of Experience',
    location: 'City / Sub-city',
    phone: 'Phone Number',
    bio: 'Skills & Bio',
    submitWorker: 'Publish Free Worker Profile',
    workerSuccess: 'Your worker profile is now live and visible to employers!',
    jobTitle: 'Job Title',
    employerName: 'Employer / Household / Company',
    salaryOffer: 'Salary / Daily Rate (ETB)',
    requirements: 'Requirements & Schedule',
    submitJob: 'Publish Free Job Opening',
    jobSuccess: 'Your job opening is now live for workers to call directly!',
    callDirect: 'Call Directly',
    copyPhone: 'Copy Phone',
    copied: 'Copied',
  },
  am: {
    title: 'ነፃ የስራ እና ሰራተኛ መገናኛ ገበያ (ስራ እና ሰራተኛ)',
    subtitle:
      '100% ነፃ አገልግሎት! የቤት ሰራተኞች፣ ቧምቧ ሰራተኞች፣ ጂብሰም ሰራተኞች፣ ኤሌክትሪሻኖች፣ አስጠኚዎች እና ሹፌሮች ከአሰሪዎች ጋር ያለምንም ክፍያ የሚገናኙበት።',
    freeBadge: '100% ነፃ · ምንም የምዝገባ ወይም የኮሚሽን ክፍያ የለም',
    tabWorkers: 'ሰራተኞች ይመዝገቡ (Workers)',
    tabEmployers: 'አሰሪዎች ስራ ይልቀቁ (Employers)',
    searchPlaceholder: 'ሙያ፣ ክፍለ ከተማ ወይም ስራ ይፈልጉ...',
    allSkills: 'ሁሉም የስራ ዘርፎች',
    registerTitle: 'በነፃ የሰራተኛ መገለጫ ይመዝገቡ',
    postJobTitle: 'በነፃ ክፍት የስራ ቦታ ይልቀቁ',
    fullName: 'ሙሉ ስም',
    skillCat: 'የሙያ ዘርፍ',
    experience: 'የስራ ልምድ',
    location: 'ከተማ / ክፍለ ከተማ',
    phone: 'ስልክ ቁጥር',
    bio: 'ስለ ችሎታዎ አጭር መግለጫ',
    submitWorker: 'መገለጫውን በነፃ ይልቀቁ',
    workerSuccess: 'የሰራተኛ መገለጫዎ በተሳካ ሁኔታ ተለቋል!',
    jobTitle: 'የስራው ርዕስ',
    employerName: 'የአሰሪ / የድርጅት ስም',
    salaryOffer: 'ደመወዝ / የቀን ክፍያ (ብር)',
    requirements: 'መስፈርቶች እና የስራ ሰዓት',
    submitJob: 'ስራውን በነፃ ይልቀቁ',
    jobSuccess: 'ክፍት የስራ ቦታው በተሳካ ሁኔታ ተለቋል!',
    callDirect: 'ቀጥታ ይደውሉ',
    copyPhone: 'ቁጥር ቅዳ',
    copied: 'ተቀድቷል',
  },
  om: {
    title: 'Gabaa Hojii fi Hojjettootaa Bilisaa (ስራ እና ሰራተኛ)',
    subtitle:
      'Tajaajila 100% bilisaa hojjettoota manaa, hojjettoota ujummoo bishaanii, jiipsamii, elektirishiinota fi barsiisota qaxaroo waliin wal-qunnamsiisu.',
    freeBadge: '100% Bilisa · Kaffaltii Tokko Malee',
    tabWorkers: 'Hojjettoonni Galmaaʼaa (Workers)',
    tabEmployers: 'Qaxaroonni Hojii Maxxansaa (Employers)',
    searchPlaceholder: 'Ogummaa ykn bakka barbaadi...',
    allSkills: 'Ogummaa Hunda',
    registerTitle: 'Bilisaan Galmaaʼi',
    postJobTitle: 'Hojii Bilisaan Maxxansi',
    fullName: 'Maqaa Guutuu',
    skillCat: 'Gosa Ogummaa',
    experience: 'Muuxannoo Waggaa',
    location: 'Magaalaa / Kutaa Magaalaa',
    phone: 'Lakkoofsa Bilbilaa',
    bio: 'Ibsa Ogummaa',
    submitWorker: 'Bilisaan Maxxansi',
    workerSuccess: 'Profaayiliin hojjetaa maxxanfameera!',
    jobTitle: 'Mata Duree Hojii',
    employerName: 'Maqaa Qaxaraa / Dhaabbataa',
    salaryOffer: 'Mindaa (ETB)',
    requirements: 'Ulaagaalee Hojii',
    submitJob: 'Hojii Maxxansi',
    jobSuccess: 'Hojiin keessan maxxanfameera!',
    callDirect: 'Bilbili',
    copyPhone: 'Waraabi',
    copied: 'Waraabame',
  },
  ti: {
    title: 'ናጻ ዕዳጋ ስራሕን ሰራሕተኛን (ስራ እና ሰራተኛ)',
    subtitle:
      '100% ናጻ! ሰራሕተኛታት ገዛ፣ ቧምቧ፣ ጂብሰም፣ ኤሌክትሪሻን፣ ኣስጠኚታትን መራሕቲ መካይንን ምስ ኣስራሕቲ ብቐጥታ ዝራኸብሉ።',
    freeBadge: '100% ናጻ · ዝኾነ ክፍሊት የለን',
    tabWorkers: 'ሰራሕተኛታት ተመዝገቡ',
    tabEmployers: 'ኣስራሕቲ ስራሕ ለጥፉ',
    searchPlaceholder: 'ሞያ ወይ ከተማ ድለዩ...',
    allSkills: 'ኩሎም ሞያታት',
    registerTitle: 'ብናጻ ተመዝገቡ',
    postJobTitle: 'ናጻ ስራሕ ለጥፉ',
    fullName: 'ሙሉእ ስም',
    skillCat: 'ዓይነት ሞያ',
    experience: 'ልምዲ ስራሕ',
    location: 'ከተማ / ክፍለ ከተማ',
    phone: 'ቁጽሪ ስልኪ',
    bio: 'ሓጺር መግለጺ ክእለት',
    submitWorker: 'ብናጻ ኣሕትም',
    workerSuccess: 'መዝገብ ሰራሕተኛ ተለጢፉ ኣሎ!',
    jobTitle: 'ኣርእስቲ ስራሕ',
    employerName: 'ስም ኣስራሒ / ትካል',
    salaryOffer: 'ደሞዝ (ብር)',
    requirements: 'መስፈርታት ስራሕ',
    submitJob: 'ስራሕ ለጥፍ',
    jobSuccess: 'ክፍቲ ስራሕ ተለጢፉ ኣሎ!',
    callDirect: 'ብቐጥታ ደውል',
    copyPhone: 'ቁጽሪ ቅዳሕ',
    copied: 'ተቐዲሑ',
  },
  so: {
    title: 'Suuqa Shaqada & Shaqaalaha ee Bilaashka ah (ስራ እና ሰራተኛ)',
    subtitle:
      '100% Bilaash! Isku xidhka shaqaalaha guryaha, tubbooyinka, gypsum-ka, korontada, macallimiinta iyo darawalada iyo loo-shaqeeyayaasha.',
    freeBadge: '100% Bilaash · Lacag Laʼaan',
    tabWorkers: 'Is-diiwaangelinta Shaqaalaha',
    tabEmployers: 'Loo-shaqeeyayaasha Shaqo Qora',
    searchPlaceholder: 'Raadi xirfad ama degmo...',
    allSkills: 'Dhammaan Xirfadaha',
    registerTitle: 'Is-diiwaangeli Bilaash',
    postJobTitle: 'Soo Geli Shaqo Bilaash ah',
    fullName: 'Magaca oo Buuxa',
    skillCat: 'Qaybta Xirfadda',
    experience: 'Khibradda',
    location: 'Magaalada / Degmada',
    phone: 'Telefoonka',
    bio: 'Faahfaahin Xirfadda',
    submitWorker: 'Daabac Bilaash',
    workerSuccess: 'Xogtaada shaqaalenimo waa la daabacay!',
    jobTitle: 'Cinwaanka Shaqada',
    employerName: 'Magaca Loo-shaqeeyaha',
    salaryOffer: 'Mushaharka (ETB)',
    requirements: 'Shuruudaha Shaqada',
    submitJob: 'Daabac Shaqada',
    jobSuccess: 'Shaqada waa la daabacay!',
    callDirect: 'Wac Toos',
    copyPhone: 'Koobiyee',
    copied: 'La koobiyeeyay',
  },
};

export const JobsMarketplaceView: React.FC<JobsMarketplaceViewProps> = ({
  lang,
  workers,
  jobs,
  onRegisterWorker,
  onPostJob,
}) => {
  const c = COPY[lang];
  const [subTab, setSubTab] = useState<'workers' | 'employers'>('workers');
  const [skillFilter, setSkillFilter] = useState<WorkerSkillCategory | 'all'>('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Worker form
  const [wName, setWName] = useState('');
  const [wCat, setWCat] = useState<WorkerSkillCategory>('housemaid');
  const [wExp, setWExp] = useState('3 yrs');
  const [wLoc, setWLoc] = useState('');
  const [wPhone, setWPhone] = useState('');
  const [wBio, setWBio] = useState('');
  const [wSaved, setWSaved] = useState(false);

  // Job form
  const [jTitle, setJTitle] = useState('');
  const [jCat, setJCat] = useState<WorkerSkillCategory>('gypsum');
  const [jLoc, setJLoc] = useState('');
  const [jSalary, setJSalary] = useState('');
  const [jEmployer, setJEmployer] = useState('');
  const [jPhone, setJPhone] = useState('');
  const [jReq, setJReq] = useState('');
  const [jSaved, setJSaved] = useState(false);

  const getCategoryLabel = (cat: WorkerSkillCategory) => {
    const found = WORKER_CATEGORIES.find((wc) => wc.id === cat);
    return found ? found.labels[lang] : cat;
  };

  const filteredWorkers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return workers.filter((w) => {
      if (skillFilter !== 'all' && w.skillCategory !== skillFilter) return false;
      if (!q) return true;
      return (
        w.fullName.toLowerCase().includes(q) ||
        w.location.toLowerCase().includes(q) ||
        w.bio.toLowerCase().includes(q) ||
        getCategoryLabel(w.skillCategory).toLowerCase().includes(q)
      );
    });
  }, [workers, skillFilter, query, lang]);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (skillFilter !== 'all' && j.category !== skillFilter) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.employerName.toLowerCase().includes(q) ||
        j.requirements.toLowerCase().includes(q)
      );
    });
  }, [jobs, skillFilter, query]);

  const handleCopyPhone = async (id: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // Fallback ignored
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wName.trim() || !wPhone.trim()) return;
    await onRegisterWorker({
      id: `wk-${Date.now()}`,
      fullName: wName.trim(),
      skillCategory: wCat,
      experienceYears: wExp.trim() || '2 yrs',
      location: wLoc.trim() || 'Addis Ababa',
      phone: wPhone.trim(),
      bio: wBio.trim() || 'Available immediately for full-time or contract work.',
      createdAt: new Date().toISOString(),
    });
    setWName('');
    setWLoc('');
    setWPhone('');
    setWBio('');
    setWSaved(true);
    setTimeout(() => setWSaved(false), 3500);
  };

  const handleJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jTitle.trim() || !jPhone.trim()) return;
    await onPostJob({
      id: `jb-${Date.now()}`,
      title: jTitle.trim(),
      category: jCat,
      location: jLoc.trim() || 'Addis Ababa',
      salaryOffer: jSalary.trim() || 'Negotiable (ETB)',
      requirements: jReq.trim() || 'Experienced & reliable candidate.',
      employerName: jEmployer.trim() || 'Verified Employer',
      contactPhone: jPhone.trim(),
      createdAt: new Date().toISOString(),
    });
    setJTitle('');
    setJLoc('');
    setJSalary('');
    setJEmployer('');
    setJPhone('');
    setJReq('');
    setJSaved(true);
    setTimeout(() => setJSaved(false), 3500);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            <Users className="h-4 w-4" />
            <span>{c.freeBadge}</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {c.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm sm:text-base text-stone-600 dark:text-stone-400">
            {c.subtitle}
          </p>
        </div>

        {/* Two-way switcher */}
        <div
          className="flex flex-wrap items-center gap-1 rounded-xl border border-stone-200 bg-stone-100 p-1 dark:border-zinc-800 dark:bg-zinc-900"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'workers'}
            onClick={() => setSubTab('workers')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              subTab === 'workers'
                ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                : 'text-stone-700 hover:text-stone-900 dark:text-stone-300'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>{c.tabWorkers}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'employers'}
            onClick={() => setSubTab('employers')}
            className={`inline-flex min-h-[40px] items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              subTab === 'employers'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-stone-700 hover:text-stone-900 dark:text-stone-300'
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>{c.tabEmployers}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={c.searchPlaceholder}
            className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-900 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
          />
        </div>
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value as WorkerSkillCategory | 'all')}
          className="h-11 rounded-xl border border-stone-200 bg-white px-3.5 text-xs sm:text-sm font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
        >
          <option value="all">{c.allSkills}</option>
          {WORKER_CATEGORIES.map((wc) => (
            <option key={wc.id} value={wc.id}>
              {wc.labels[lang]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: Registration / Posting Form */}
        <div className="lg:col-span-4">
          {subTab === 'workers' ? (
            <form
              onSubmit={handleWorkerSubmit}
              className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                <PlusCircle className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>{c.registerTitle}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={wName}
                  onChange={(e) => setWName(e.target.value)}
                  placeholder="e.g. Tigist Alemayehu"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.skillCat}
                </label>
                <select
                  value={wCat}
                  onChange={(e) => setWCat(e.target.value as WorkerSkillCategory)}
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                >
                  {WORKER_CATEGORIES.map((wc) => (
                    <option key={wc.id} value={wc.id}>
                      {wc.labels[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {c.experience}
                  </label>
                  <input
                    type="text"
                    value={wExp}
                    onChange={(e) => setWExp(e.target.value)}
                    placeholder="4 yrs"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {c.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={wPhone}
                    onChange={(e) => setWPhone(e.target.value)}
                    placeholder="0911XXXXXX"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.location}
                </label>
                <input
                  type="text"
                  value={wLoc}
                  onChange={(e) => setWLoc(e.target.value)}
                  placeholder="Addis Ababa — Bole / CMC"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.bio}
                </label>
                <textarea
                  rows={2}
                  value={wBio}
                  onChange={(e) => setWBio(e.target.value)}
                  placeholder="Describe your work skills and availability..."
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              {wSaved && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{c.workerSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                {c.submitWorker}
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleJobSubmit}
              className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="flex items-center gap-2 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                <Briefcase className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span>{c.postJobTitle}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.jobTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={jTitle}
                  onChange={(e) => setJTitle(e.target.value)}
                  placeholder="e.g. Electrician Needed for Apartment"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.skillCat}
                </label>
                <select
                  value={jCat}
                  onChange={(e) => setJCat(e.target.value as WorkerSkillCategory)}
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-xs font-semibold dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                >
                  {WORKER_CATEGORIES.map((wc) => (
                    <option key={wc.id} value={wc.id}>
                      {wc.labels[lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {c.employerName}
                  </label>
                  <input
                    type="text"
                    value={jEmployer}
                    onChange={(e) => setJEmployer(e.target.value)}
                    placeholder="Household / Company"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {c.phone} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={jPhone}
                    onChange={(e) => setJPhone(e.target.value)}
                    placeholder="0911XXXXXX"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {c.location}
                  </label>
                  <input
                    type="text"
                    value={jLoc}
                    onChange={(e) => setJLoc(e.target.value)}
                    placeholder="Addis Ababa — Ayat"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {c.salaryOffer}
                  </label>
                  <input
                    type="text"
                    value={jSalary}
                    onChange={(e) => setJSalary(e.target.value)}
                    placeholder="8,000 ETB / mo"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {c.requirements}
                </label>
                <textarea
                  rows={2}
                  value={jReq}
                  onChange={(e) => setJReq(e.target.value)}
                  placeholder="Schedule, experience, start date..."
                  className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950 dark:text-stone-100"
                />
              </div>

              {jSaved && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{c.jobSuccess}</span>
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 w-full items-center justify-center rounded-xl bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-700"
              >
                {c.submitJob}
              </button>
            </form>
          )}
        </div>

        {/* Right: Directory Cards */}
        <div className="lg:col-span-8">
          {subTab === 'workers' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredWorkers.map((worker) => (
                <article
                  key={worker.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      <span>{getCategoryLabel(worker.skillCategory)}</span>
                      <span className="font-mono text-stone-500 dark:text-stone-400">
                        {worker.experienceYears}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                      {worker.fullName}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{worker.location}</span>
                    </div>
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                      {worker.bio}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3.5 dark:border-zinc-800">
                    <a
                      href={`tel:${worker.phone}`}
                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>
                        {c.callDirect} · {worker.phone}
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(worker.id, worker.phone)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
                    >
                      {copiedId === worker.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedId === worker.id ? c.copied : c.copyPhone}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredJobs.map((job) => (
                <article
                  key={job.id}
                  className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
                      <span>{getCategoryLabel(job.category)}</span>
                      <span className="font-mono text-emerald-800 dark:text-emerald-400">
                        {job.salaryOffer}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-base font-bold text-stone-900 dark:text-stone-100">
                      {job.title}
                    </h3>
                    <div className="mt-1 text-xs font-medium text-stone-500 dark:text-stone-400">
                      {job.employerName} · {job.location}
                    </div>
                    <p className="mt-3 text-xs sm:text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                      {job.requirements}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-3.5 dark:border-zinc-800">
                    <a
                      href={`tel:${job.contactPhone}`}
                      className="inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>
                        {c.callDirect} · {job.contactPhone}
                      </span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleCopyPhone(job.id, job.contactPhone)}
                      className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-200"
                    >
                      {copiedId === job.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedId === job.id ? c.copied : c.copyPhone}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
