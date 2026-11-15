import { CvCountryStandard, LegalConsultTier, LegalDocTemplate } from '../types';

export const CV_COUNTRY_STANDARDS: CvCountryStandard[] = [
  {
    id: 'ethiopia',
    priceEtb: 50,
    flagCode: 'ET',
    countryName: {
      en: 'Ethiopia (Local & NGO Standard)',
      am: 'ኢትዮጵያ (የሀገር ውስጥ እና NGO ስታንዳርድ)',
      om: 'Itoophiyaa (Istaandaardii Biyya Keessaa & NGO)',
      ti: 'ኢትዮጵያ (ውሽጢ ዓድን NGOን)',
      so: 'Itoobiya (Heerka Gudaha & NGO)',
    },
    formatLabel: {
      en: 'Ethiopian Corporate & INGO Standard CV + Application Letter',
      am: 'የኢትዮጵያ ድርጅቶች እና INGO ስታንዳርድ CV + የማመልከቻ ደብዳቤ',
      om: 'CV Istaandaardii Itoophiyaa & INGO + Xalayaa Iyyannoo',
      ti: 'ስታንዳርድ CV ኢትዮጵያን INGOን + ደብዳቤ መመልከቲ',
      so: 'CV-ga Shirkadaha Itoobiya & INGO + Warqadda Codsiga',
    },
    requiresPhoto: false,
    requiresVisaInfo: false,
    requiresSignatureBlock: false,
    maxPagesLabel: '2 Pages + Cover Letter',
    rules: {
      en: [
        'Includes clear Education GPA, NGO/Company roles, Languages (Amharic/Oromo/English), and Referees.',
        'Formal Ethiopian Application Letter ("To: Human Resources Department") formatted for local employers & UN/INGO portals.',
        'Optional photo; clean chronological order expected by Addis Ababa HR teams.',
      ],
      am: [
        'የትምህርት ደረጃ (GPA)፣ የስራ ልምድ፣ ቋንቋዎች (አማርኛ/ኦሮምኛ/እንግሊዝኛ) እና ዋቢዎች (Referees) ይካተታሉ።',
        'ለኢትዮጵያ መንግስታዊ፣ የግል እና INGO ድርጅቶች የተዘጋጀ የማመልከቻ ደብዳቤ (Cover Letter) አብሮ ይወጣል።',
        'በአዲስ አበባ የሰው ሀብት (HR) ክፍሎች የሚመረጥ ግልጽ ቅደም ተከተል።',
      ],
      om: [
        'GPA barnootaa, muuxannoo hojii, afaanotaa fi wabii (Referees) ni hammata.',
        'Xalayaa iyyannoo dhaabbilee Itoophiyaa fi INGOf qophaaʼe.',
        'Tartiiba qulqulluu HR Itoophiyaa biratti fudhatamu.',
      ],
      ti: [
        'GPA ትምህርቲ፣ ልምዲ ስራሕ፣ ቋንቋታትን ምስክርን (Referees) የጠቓልል።',
        'ንውሽጢ ዓድን INGOን ዝተዳለወ ደብዳቤ መመልከቲ የጠቓልል።',
        'ንጹር ቅደም ተከተል ንHR ኣዲስ ኣበባ።',
      ],
      so: [
        'Waxaa ku jira GPA waxbarasho, khibrad shaqo, luqadaha, iyo tixraacyo (Referees).',
        'Warqad codsi rasmi ah oo ku habboon shirkadaha Itoobiya & INGO.',
        'Nidaam cad oo HR-ku jecel yahay.',
      ],
    },
    writingGuide: {
      en: [
        'Step 1: Enter your exact degree, university, and graduation year.',
        'Step 2: List work achievements using numbers (e.g. "Managed 45M ETB procurement budget").',
        'Step 3: Include 2–3 professional referees with verified titles and phone numbers.',
        'Step 4: Click AI Generate to write tailored achievement bullets & an Ethiopian Cover Letter.',
      ],
      am: [
        'ደረጃ 1፡ የተመረቁበትን ዩኒቨርሲቲ፣ ዲግሪ እና ዓ.ም. በትክክል ያስገቡ።',
        'ደረጃ 2፡ የስራ ውጤቶችን በቁጥር ይግለጹ (ለምሳሌ፡ "የ45 ሚሊዮን ብር ግዥ አስተዳድሬያለሁ")።',
        'ደረጃ 3፡ 2–3 ዋቢዎችን (Referees) ከስልክና የስራ መደብ ጋር ያስገቡ።',
        'ደረጃ 4፡ "AI አመንጭ" የሚለውን ተጭነው ሙያዊ CV እና Cover Letter ያዘጋጁ።',
      ],
      om: [
        'Tarkaanfii 1: Digirii, yuunivarsiitii fi bara eebbaa galchi.',
        'Tarkaanfii 2: Buʼaa hojii lakkoofsaan ibsi.',
        'Tarkaanfii 3: Wabii (Referees) 2–3 dabali.',
        'Tarkaanfii 4: AI cuqaasuun CV fi Cover Letter qopheessi.',
      ],
      ti: [
        'ስጉምቲ 1፡ ዲግሪ፣ ዩኒቨርሲቲን ዓመተ ምረቓን ኣእቱ።',
        'ስጉምቲ 2፡ ውጽኢት ስራሕ ብቑጽሪ ግለጽ።',
        'ስጉምቲ 3፡ 2–3 ዋሕስ/Referees ወስኽ።',
        'ስጉምቲ 4፡ AI ተጠቒምካ ሙሉእ CV ኣዳሉ።',
      ],
      so: [
        'Tallaabada 1: Geli shahaadada, jaamacadda, iyo sanadka qalin-jabinta.',
        'Tallaabada 2: Ku qor guulahaaga adigoo adeegsanaya tirooyin.',
        'Tallaabada 3: Ku dar 2–3 qof oo tixraac ah (Referees).',
        'Tallaabada 4: Riix AI si aad u soo saarto CV iyo Cover Letter.',
      ],
    },
  },
  {
    id: 'uae',
    priceEtb: 100,
    flagCode: 'AE',
    countryName: {
      en: 'UAE & Middle East (Dubai / Qatar / Saudi)',
      am: 'ዱባይ / UAE እና መካከለኛው ምስራቅ (Gulf Standard)',
      om: 'UAE & Baha Giddugaleessaa (Dubai / Qatar)',
      ti: 'UAE / ዱባይን ማእከላይ ምብራቕን',
      so: 'UAE & Bariga Dhexe (Dubai / Qatar / Saudi)',
    },
    formatLabel: {
      en: 'Gulf Corporate CV (Photo + Visa Status + Nationality)',
      am: 'የዱባይ እና ገልፍ ድርጅቶች CV (ፎቶ + ቪዛ ሁኔታ + ዜግነት)',
      om: 'CV Gulf (Suuraa + Haala Viizaa + Lammummaa)',
      ti: 'CV ዱባይን ገልፍን (ስእሊ + ኩነታት ቪዛ + ዜግነት)',
      so: 'CV-ga Khaliijka (Sawir + Xaaladda Fiisaha + Jinsiyadda)',
    },
    requiresPhoto: true,
    requiresVisaInfo: true,
    requiresSignatureBlock: false,
    maxPagesLabel: '2 Pages Gulf Standard',
    rules: {
      en: [
        'Dubai/GCC recruiters expect a professional headshot photo on the top-right header.',
        'Must explicitly state Nationality, Current Visa Status (Visit / Employment / Freelance), and Notice Period.',
        'Driving License (UAE/Home Country) & Languages spoken clearly highlighted.',
      ],
      am: [
        'የዱባይ እና የገልፍ ቀጣሪዎች በCV ራስጌ ላይ ፕሮፌሽናል ፎቶ ይጠይቃሉ።',
        'ዜግነት (Nationality)፣ የቪዛ ሁኔታ (Visit Visa / Employment Visa) እና የስራ መልቀቂያ ጊዜ (Notice Period) መካተት አለበት።',
        'የመንጃ ፈቃድ እና የሚችሉዋቸው ቋንቋዎች በግልጽ ይቀመጣሉ።',
      ],
      om: [
        'Dhaabbileen Dubai suuraa piroofeeshinaalaa fi haala viizaa ni barbaadu.',
        'Lammummaa, Haala Viizaa (Visit / Employment), fi Notice Period ifatti kaaʼa.',
        'Eeyyama konkolaachisummaa fi afaanota ni agarsiisa.',
      ],
      ti: [
        'ቀጠርቲ ዱባይን ገልፍን ኣብ ላዕሊ ፕሮፌሽናል ስእሊ ይደልዩ።',
        'ዜግነት፣ ኩነታት ቪዛ (Visit / Employment) እና Notice Period ብግልጺ ይጸሓፍ።',
        'ፍቓድ መዘወርን ቋንቋታትን ብንጹር ይቕመጡ።',
      ],
      so: [
        'Shirkadaha Dubai waxay filayaan sawir xirfadeed oo dusha sare ah.',
        'Waa inuu muujiyaa Jinsiyadda, Xaaladda Fiisaha, iyo Notice Period.',
        'Shahaadada wadista gaadiidka iyo luqadaha waa lagu daraa.',
      ],
    },
    writingGuide: {
      en: [
        'Step 1: Add your Nationality (e.g., Ethiopian) and Current Visa Status (e.g., Visit Visa / Ready to Relocate).',
        'Step 2: Upload a clean suit/collar photo or keep the UAE photo frame ready.',
        'Step 3: Highlight GCC-relevant metrics: hospitality, sales, logistics, engineering, or nursing.',
        'Step 4: Generate Gulf HR bullets + WhatsApp/Email ready Cover Letter.',
      ],
      am: [
        'ደረጃ 1፡ ዜግነትዎን እና የቪዛ ሁኔታዎን (ለምሳሌ Visit Visa ወይም ዝግጁ) ይሙሉ።',
        'ደረጃ 2፡ ንጹህ የፓስፖርት/ፕሮፌሽናል ፎቶ ይጫኑ።',
        'ደረጃ 3፡ በሆቴል፣ ሽያጭ፣ ሎጂስቲክስ፣ ምህንድስና ወይም ጤና ያለዎትን ልምድ ይዘርዝሩ።',
        'ደረጃ 4፡ የዱባይ ስታንዳርድ CV እና Cover Letter በAI ያመንጩ።',
      ],
      om: [
        'Tarkaanfii 1: Lammummaa fi haala viizaa galchi.',
        'Tarkaanfii 2: Suuraa qulqulluu ol-feʼi.',
        'Tarkaanfii 3: Muuxannoo kee lakkoofsaan ibsi.',
        'Tarkaanfii 4: AIʼn CV fi Cover Letter qopheessi.',
      ],
      ti: [
        'ስጉምቲ 1፡ ዜግነትን ኩነታት ቪዛን ምላእ።',
        'ስጉምቲ 2፡ ጽሩይ ስእሊ ጽዓን።',
        'ስጉምቲ 3፡ ልምዲ ስራሕካ ብዝርዝር ጽሓፍ።',
        'ስጉምቲ 4፡ ብAI ዝተዳለወ CV ኣውጽእ።',
      ],
      so: [
        'Tallaabada 1: Geli Jinsiyadda & Xaaladda Fiisaha.',
        'Tallaabada 2: Soo geli sawir xirfadeed.',
        'Tallaabada 3: Sharax khibraddaada.',
        'Tallaabada 4: Ku soo saar AI.',
      ],
    },
  },
  {
    id: 'eu_uk',
    priceEtb: 180,
    flagCode: 'EU',
    countryName: {
      en: 'UK & Europe (Europass / UK CV Standard)',
      am: 'እንግሊዝ እና አውሮፓ (UK & Europass ስታንዳርድ)',
      om: 'UK & Awurooppaa (Europass / UK CV)',
      ti: 'ብሪጣንያን ኣውሮጳን (UK & Europass)',
      so: 'UK & Yurub (Europass / UK CV)',
    },
    formatLabel: {
      en: 'UK / Europass 2-Page Competency CV + Cover Letter',
      am: 'የUK እና አውሮፓ (Europass) ባለ 2-ገጽ CV + Cover Letter',
      om: 'CV UK / Europass Fuula 2 + Cover Letter',
      ti: 'ናይ UK / ኣውሮጳ ባለ 2-ገጽ CV + Cover Letter',
      so: 'CV-ga UK / Europass (2 Bog) + Cover Letter',
    },
    requiresPhoto: false,
    requiresVisaInfo: false,
    requiresSignatureBlock: false,
    maxPagesLabel: '2 Pages UK / Europass',
    rules: {
      en: [
        'UK Equality Act rule: DO NOT include photo, date of birth, or marital status.',
        'Start with a strong 4-line Personal Profile followed by Key Skills matrix and reverse-chronological work.',
        'Includes European CEFR Language levels (B2/C1 English) expected by EU scholarships & employers.',
      ],
      am: [
        'የUK ህግ መሰረት ፎቶ፣ እድሜ እና የጋብቻ ሁኔታ አይካተትም።',
        'በጠንካራ የ4-መስመር ሙያዊ መግለጫ (Personal Profile) እና CEFR የቋንቋ ደረጃ (B2/C1) ይጀምራል።',
        'ለአውሮፓ ስኮላርሺፕ እና የስራ ማመልከቻዎች ተስማሚ ባለ 2 ገጽ ቅርጽ።',
      ],
      om: [
        'Akka seera UKʼtti suuraan, umuriin fi haalli gaaʼelaa hin barreeffamu.',
        'Ibsa dhuunfaa sarara 4 fi sadarkaa afaanii CEFR (B2/C1) qaba.',
        'Qulqullina Europass fi UK guutuu qaba.',
      ],
      ti: [
        'ብመሰረት ሕጊ UK ስእሊ፣ ዕድመን ኩነታት መርዓን ኣይእተውን።',
        'ብሓያል Personal Profile እና CEFR ደረጃ ቋንቋ (B2/C1) ይዳሎ።',
        'ንስራሕን ስኮላርሺፕን ኣውሮጳ ተመራጺ እዩ።',
      ],
      so: [
        'Sida uu qabo sharciga UK: HA ku darin sawir, da’, ama xaaladda guurka.',
        'Wuxuu ka bilaabmaa Personal Profile xooggan & heerka luqadda CEFR.',
        'Ku habboon shaqooyinka & deeqaha waxbarasho ee Yurub.',
      ],
    },
    writingGuide: {
      en: [
        'Step 1: Leave out photo and birth date to comply with UK anti-discrimination HR screening.',
        'Step 2: Use action verbs ("Spearheaded", "Delivered", "Engineered") with UK British spelling.',
        'Step 3: Specify CEFR language proficiency (e.g., English C1, Amharic Native).',
        'Step 4: Generate UK Personal Statement + Cover Letter tailored to the job advert.',
      ],
      am: [
        'ደረጃ 1፡ በUK ህግ መሰረት ፎቶና የልደት ቀን አያስገቡ።',
        'ደረጃ 2፡ ጠንካራ የስራ ግሶችን ("Spearheaded", "Delivered") ይጠቀሙ።',
        'ደረጃ 3፡ የቋንቋ ደረጃዎን በCEFR (ለምሳሌ English C1) ይግለጹ።',
        'ደረጃ 4፡ በAI ሙያዊ የUK/Europass CV እና Cover Letter ያመንጩ።',
      ],
      om: [
        'Tarkaanfii 1: Suuraa fi guyyaa dhalootaa dhiisi.',
        'Tarkaanfii 2: Gochima cimaa ("Delivered", "Managed") fayyadami.',
        'Tarkaanfii 3: Sadarkaa CEFR ibsi.',
        'Tarkaanfii 4: AIʼn qopheessi.',
      ],
      ti: [
        'ስጉምቲ 1፡ ስእልን ዕለተ ልደትን ኣይተእቱ።',
        'ስጉምቲ 2፡ ሓያላት ቃላት ("Delivered", "Managed") ተጠቐም።',
        'ስጉምቲ 3፡ ደረጃ ቋንቋ CEFR ግለጽ።',
        'ስጉምቲ 4፡ ብAI ኣዳሉ።',
      ],
      so: [
        'Tallaabada 1: Ha darin sawir iyo taariikh dhalasho.',
        'Tallaabada 2: Adeegso ereyo waxqabad leh.',
        'Tallaabada 3: Sheeg heerka luqadda CEFR.',
        'Tallaabada 4: Ku soo saar AI.',
      ],
    },
  },
  {
    id: 'germany',
    priceEtb: 220,
    flagCode: 'DE',
    countryName: {
      en: 'Germany & DACH (Lebenslauf Standard)',
      am: 'ጀርመን እና DACH (የጀርመን Lebenslauf ስታንዳርድ)',
      om: 'Jarmanii & DACH (Lebenslauf)',
      ti: 'ጀርመንን DACHን (Lebenslauf)',
      so: 'Jarmalka & DACH (Lebenslauf)',
    },
    formatLabel: {
      en: 'German Tabular Lebenslauf (Photo + Place/Date & Signature Block)',
      am: 'የጀርመን Lebenslauf (ፎቶ + የስራ ቀጠሮ ሠንጠረዥ + ቀን እና ፊርማ)',
      om: 'Lebenslauf Jarmanii (Suuraa + Gabatee + Mallattoo)',
      ti: 'ጀርመናዊ Lebenslauf (ስእሊ + ሰንጠረዥ + ዕለትን ፊርማን)',
      so: 'Lebenslauf Jarmal (Sawir + Jadwal + Saxeex)',
    },
    requiresPhoto: true,
    requiresVisaInfo: false,
    requiresSignatureBlock: true,
    maxPagesLabel: '2 Pages Tabular Lebenslauf',
    rules: {
      en: [
        'Classic German "Tabellarischer Lebenslauf" 2-column date-left layout.',
        'Includes professional Bewerbungsfoto (top-right), Date of Birth / Nationality in header.',
        'Mandatory closing Date, City & Signature block ("Datum, Unterschrift") at bottom of last page.',
      ],
      am: [
        'ትክክለኛ የጀርመን ባለ 2-አምድ "Tabellarischer Lebenslauf" አቀማመጥ።',
        'ከላይ በስተቀኝ ፕሮፌሽናል ፎቶ (Bewerbungsfoto) እና የልደት/ዜግነት መረጃ ይይዛል።',
        'በCVው ግርጌ ላይ የግድ የከተማ ስም፣ ቀን እና የፊርማ ቦታ (Place, Date & Signature) ይኖረዋል።',
      ],
      om: [
        'Bifa "Tabellarischer Lebenslauf" sarara 2 (guyyaa bitaatti) qaba.',
        'Suuraa piroofeeshinaalaa fi odeeffannoo dhuunfaa qabata.',
        'Xumurarratti guyyaa, magaalaa fi iddoo mallattoo qaba.',
      ],
      ti: [
        'ክላሲክ ጀርመናዊ "Tabellarischer Lebenslauf" ብ2 ዓምዲ ዝተሰርዐ።',
        'ኣብ ላዕሊ ስእልን መሰረታዊ ሓበሬታን የጠቓልል።',
        'ኣብ መወዳእታ ዕለት፣ ከተማን ቦታ ፊርማን የጠቓልል።',
      ],
      so: [
        'Qaabka Jarmalka ee 2-da tiir ("Tabellarischer Lebenslauf").',
        'Waxaa ku jira sawir xirfadeed iyo macluumaadka gaarka ah.',
        'Qaybta hoose waxaa ku qoran taariikhda, magaalada, iyo saxeexa.',
      ],
    },
    writingGuide: {
      en: [
        'Step 1: Add your city & date for the German signature footer.',
        'Step 2: Upload a formal portrait photo (Bewerbungsfoto) with neutral background.',
        'Step 3: Use exact MM/YYYY – MM/YYYY timelines without unexplained gaps.',
        'Step 4: Generate structured German-style Lebenslauf + Anschreiben Cover Letter.',
      ],
      am: [
        'ደረጃ 1፡ ከተማዎን እና ቀንዎን ለፊርማው ክፍል ያስገቡ።',
        'ደረጃ 2፡ ንጹህ መደበኛ ፎቶ ይጫኑ።',
        'ደረጃ 3፡ የስራ እና የትምህርት ጊዜያትን በወር/ዓመት (MM/YYYY) በትክክል ይግለጹ።',
        'ደረጃ 4፡ የጀርመን Lebenslauf እና Cover Letter በAI ያዘጋጁ።',
      ],
      om: [
        'Tarkaanfii 1: Magaalaa fi guyyaa mallattoof galchi.',
        'Tarkaanfii 2: Suuraa ol-feʼi.',
        'Tarkaanfii 3: Jiʼaa fi bara hojii tartiibaan galchi.',
        'Tarkaanfii 4: AIʼn Lebenslauf qopheessi.',
      ],
      ti: [
        'ስጉምቲ 1፡ ከተማን ዕለትን ንፊርማ ኣእቱ።',
        'ስጉምቲ 2፡ ፕሮፌሽናል ስእሊ ጽዓን።',
        'ስጉምቲ 3፡ ወርሕን ዓመትን ስራሕ ብዘይ ክፍተት ጽሓፍ።',
        'ስጉምቲ 4፡ ብAI Lebenslauf ኣዳሉ።',
      ],
      so: [
        'Tallaabada 1: Geli magaalada & taariikhda saxeexa.',
        'Tallaabada 2: Soo geli sawir rasmi ah.',
        'Tallaabada 3: Qor taariikhaha bil/sanad si sax ah.',
        'Tallaabada 4: Ku soo saar AI.',
      ],
    },
  },
  {
    id: 'usa_canada',
    priceEtb: 300,
    flagCode: 'US',
    countryName: {
      en: 'USA & Canada (ATS 1-Page Resume)',
      am: 'አሜሪካ እና ካናዳ (ATS-Friendly ባለ 1-ገጽ Resume)',
      om: 'USA & Kaanaadaa (ATS Resume Fuula 1)',
      ti: 'ኣሜሪካን ካናዳን (ATS 1-Page Resume)',
      so: 'USA & Canada (ATS 1-Page Resume)',
    },
    formatLabel: {
      en: 'US / Canadian ATS-Optimized 1-Page Resume + Cover Letter',
      am: 'የአሜሪካ እና ካናዳ ATS-Friendly ባለ 1-ገጽ Resume + Cover Letter',
      om: 'Resume ATS USA & Kaanaadaa Fuula 1 + Cover Letter',
      ti: 'ናይ ኣሜሪካን ካናዳን ATS ባለ 1-ገጽ Resume + Cover Letter',
      so: 'USA & Canada ATS 1-Page Resume + Cover Letter',
    },
    requiresPhoto: false,
    requiresVisaInfo: false,
    requiresSignatureBlock: false,
    maxPagesLabel: 'Strict 1 Page ATS',
    rules: {
      en: [
        'STRICT NO PHOTO, NO AGE, NO MARITAL STATUS (US EEOC / Canadian HR compliance — protects against auto-rejection).',
        'Single-column clean ATS text layout so Greenhouse, Workday, and Lever scanners read 100% of keywords.',
        'Every experience bullet uses Action Verb + Task + Measurable Metric (e.g., "Reduced cost by 28%").',
      ],
      am: [
        'በአሜሪካ/ካናዳ HR ህግ መሰረት ፎቶ፣ እድሜ እና የጋብቻ ሁኔታ በፍጹም አይካተትም (አውቶማቲክ ውድቅ እንዳይደረግ)።',
        'ለWorkday እና Greenhouse ATS ሲስተሞች 100% ተነባቢ የሆነ ነጠላ-አምድ (Single-Column) ቅርጽ።',
        'እያንዳንዱ ነጥብ Action Verb + ቁጥራዊ ውጤት (Metrics) ይይዛል።',
      ],
      om: [
        'Akka seera USA/Kaanaadaatti SUURAAN, UMURIIN, GAAʼELLI gonkumaa hin galamu.',
        'Unka qulqulluu ATS (Workday/Greenhouse) %100 dubbifamu qaba.',
        'Qabxiin hunduu buʼaa lakkoofsaan agarsiisa.',
      ],
      ti: [
        'ብሕጊ HR ኣሜሪካ/ካናዳ ስእሊ፣ ዕድመ፣ ኩነታት መርዓ ብፍጹም ኣይእተውን።',
        'ንATS ሲስተማት 100% ዝንበብ ጽሩይ Single-Column ቅርጺ።',
        'ነፍሲ ወከፍ ነጥቢ ብቑጽራዊ ውጽኢት ይጸሓፍ።',
      ],
      so: [
        'SHARCI ADAG: HA ku darin sawir, da’, ama guur (si ATS uusan ku diidin).',
        'Qaab hal-tiir ah oo nadiif ah oo 100% u akhrisma nidaamyada ATS.',
        'Qodob kasta wuxuu muujiyaa tiro iyo natiijo la cabbiri karo.',
      ],
    },
    writingGuide: {
      en: [
        'Step 1: Keep contact header strictly Name · City/Country · Email · Phone · LinkedIn.',
        'Step 2: Paste the US/Canadian job title so AI injects exact ATS keywords.',
        'Step 3: Quantify impact with percentages, dollar/ETB savings, or customer counts.',
        'Step 4: Export 1-page ATS Resume + concise North American Cover Letter.',
      ],
      am: [
        'ደረጃ 1፡ በራስጌው ላይ ስም፣ ከተማ፣ ኢሜይል፣ ስልክ እና LinkedIn ብቻ ያስገቡ።',
        'ደረጃ 2፡ የሚያመለክቱበትን የስራ መደብ ስም ያስገቡ (ATS ቃላት እንዲካተቱ)።',
        'ደረጃ 3፡ ውጤቶችን በ% ወይም በቁጥር ይግለጹ።',
        'ደረጃ 4፡ ባለ 1-ገጽ ATS Resume እና Cover Letter በAI ያመንጩ።',
      ],
      om: [
        'Tarkaanfii 1: Maqaa, magaalaa, email, bilbila fi LinkedIn qofa galchi.',
        'Tarkaanfii 2: Gosa hojii barreessi (ATS keywords dabaluuf).',
        'Tarkaanfii 3: Buʼaa hojii parsantaan ibsi.',
        'Tarkaanfii 4: AIʼn Resume fuula 1 qopheessi.',
      ],
      ti: [
        'ስጉምቲ 1፡ ስም፣ ከተማ፣ ኢመይል፣ ስልክን LinkedInን ጥራይ ኣእቱ።',
        'ስጉምቲ 2፡ ናይቲ ስራሕ ኣርእስቲ ኣእቱ (ATS Keywords ንምውሳኽ)።',
        'ስጉምቲ 3፡ ውጽኢት ስራሕካ ብ% ወይ ብቑጽሪ ግለጽ።',
        'ስጉምቲ 4፡ ብAI 1-ገጽ ATS Resume ኣውጽእ።',
      ],
      so: [
        'Tallaabada 1: Ku koob madaxa Magaca, Magaalada, Email, Telefoon & LinkedIn.',
        'Tallaabada 2: Geli magaca shaqada aad codsanayso.',
        'Tallaabada 3: Ku cabbir waxqabadkaaga boqolley (%) ama tiro.',
        'Tallaabada 4: Ku soo saar AI.',
      ],
    },
  },
  {
    id: 'australia',
    priceEtb: 300,
    flagCode: 'AU',
    countryName: {
      en: 'Australia & New Zealand (Skill-Migration CV)',
      am: 'አውስትራሊያ እና ኒውዚላንድ (Skill-Migration Standard)',
      om: 'Awustiraaliyaa & New Zealand',
      ti: 'ኣውስትራሊያን ኒውዚላንድን',
      so: 'Australia & New Zealand',
    },
    formatLabel: {
      en: 'Australian / NZ Achievement CV (2–3 Pages) + Cover Letter',
      am: 'የአውስትራሊያ / ኒውዚላንድ የስኬት CV + Cover Letter',
      om: 'CV Milkaaʼinaa Australia / NZ + Cover Letter',
      ti: 'ናይ ኣውስትራሊያ / NZ CV + Cover Letter',
      so: 'CV-ga Australia / NZ + Cover Letter',
    },
    requiresPhoto: false,
    requiresVisaInfo: false,
    requiresSignatureBlock: false,
    maxPagesLabel: '2–3 Pages AU/NZ',
    rules: {
      en: [
        'No photo, no birth date — complies with Australian Fair Work hiring standards.',
        'Highlights Career Summary, Key Achievements per role, and Australian-style Reference note.',
        'Ideal for Skilled Migration (Subclass 189/190/482) and ANZ corporate applications.',
      ],
      am: [
        'ፎቶ እና የልደት ቀን አይካተትም።',
        'የስራ ሚናዎችን ብቻ ሳይሆን ቁልፍ ስኬቶችን (Key Achievements) ለየብቻ ያጎላል።',
        'ለአውስትራሊያ Skilled Migration (189/190/482) እና የድርጅት ስራዎች ተስማሚ።',
      ],
      om: [
        'Suuraa fi guyyaan dhalootaa hin galamu.',
        'Milkaaʼina ijoo gahee hojii tokkoon tokkoon agarsiisa.',
        'Skilled Migration fi hojii Australia/NZf qophaaʼe.',
      ],
      ti: [
        'ስእልን ዕለተ ልደትን ኣይእተውን።',
        'ኣብ ነፍሲ ወከፍ ስራሕ ቁልፊ ዓወታት (Key Achievements) የጉልሕ።',
        'ንSkilled Migration (189/190/482) ምቹው እዩ።',
      ],
      so: [
        'Ma jiro sawir ama taariikh dhalasho.',
        'Wuxuu iftiimiyaa Guulaha Muhiimka ah ee shaqo kasta.',
        'Ku habboon Skilled Migration & shaqooyinka ANZ.',
      ],
    },
    writingGuide: {
      en: [
        'Step 1: List 2–3 Key Achievements separately below each job responsibility.',
        'Step 2: Mention Australian/NZ recognized qualifications, trades, or IT/Health credentials.',
        'Step 3: End with "Referees available upon request".',
        'Step 4: Generate tailored AU/NZ CV + Selection Criteria Cover Letter via AI.',
      ],
      am: [
        'ደረጃ 1፡ ከእያንዳንዱ ስራ በታች 2–3 ዋና ስኬቶችን (Key Achievements) ለይተው ይጻፉ።',
        'ደረጃ 2፡ ሙያዊ ሰርተፊኬቶችዎን እና የቴክኒክ ክህሎቶችዎን ያስገቡ።',
        'ደረጃ 3፡ በመጨረሻ "Referees available upon request" የሚለው ይካተታል።',
        'ደረጃ 4፡ የአውስትራሊያ/NZ CV እና Cover Letter በAI ያመንጩ።',
      ],
      om: [
        'Tarkaanfii 1: Gahee hojii jalatti milkaaʼina ijoo 2–3 tarreessi.',
        'Tarkaanfii 2: Waraqaa ragaa ogummaa galchi.',
        'Tarkaanfii 3: "Referees available upon request" kaaʼi.',
        'Tarkaanfii 4: AIʼn qopheessi.',
      ],
      ti: [
        'ስጉምቲ 1፡ ኣብ ትሕቲ ነፍሲ ወከፍ ስራሕ 2–3 ቀንዲ ዓወታት ጽሓፍ።',
        'ስጉምቲ 2፡ ሞያዊ ምስክር ወረቐታትካ ኣእቱ።',
        'ስጉምቲ 3፡ "Referees available upon request" ይካተት።',
        'ስጉምቲ 4፡ ብAI ኣዳሉ።',
      ],
      so: [
        'Tallaabada 1: Ku qor 2–3 Guulood oo waaweyn hoosta shaqo kasta.',
        'Tallaabada 2: Geli shahaadooyinka xirfadeed.',
        'Tallaabada 3: Ku dar "Referees available upon request".',
        'Tallaabada 4: Ku soo saar AI.',
      ],
    },
  },
];

export const LEGAL_DOC_TEMPLATES: LegalDocTemplate[] = [
  // CIVIL LAW BRANCH
  {
    id: 'civil_statement_of_claim',
    branch: 'civil',
    priceEtb: 350,
    courtLevel: 'Federal / Regional First Instance or High Court (የመጀመሪያ / ከፍተኛ ፍርድ ቤት)',
    title: {
      en: 'Statement of Claim (የፍትሐ ብሔር ክስ አቤቱታ)',
      am: 'የፍትሐ ብሔር ክስ አቤቱታ (Statement of Claim)',
      om: 'Himannaa Hariiroo Hawaasaa (Statement of Claim)',
      ti: 'ክሲ ፍትሐ ብሔር (Statement of Claim)',
      so: 'Dacwadda Madaniga ah (Statement of Claim)',
    },
    subtitle: {
      en: 'Structured per Ethiopian Civil Procedure Code Art. 222–224 with cause of action, evidence list & relief prayer.',
      am: 'በኢትዮጵያ የፍትሐ ብሔር ሥነ-ሥርዓት ሕግ አንቀጽ 222–224 መሰረት ዝርዝር የክስ አቤቱታ፣ የማስረጃ ዝርዝር እና የዳኝነት ጥያቄ።',
      om: 'Akka Seera Deemsa Falmii Hariiroo Hawaasaa Kwt. 222–224tti qophaaʼa.',
      ti: 'ብመሰረት ሕጊ ስነ-ስርዓት ፍትሐ ብሔር ዓንቀጽ 222–224 ዝተዳለወ።',
      so: 'Waxaa loo diyaariyay si waafaqsan Xeerka Habka Madaniga Qod. 222–224.',
    },
    defaultFactsPlaceholder:
      'Example: On 12/04/2016 E.C., Defendant borrowed 450,000 ETB via written loan agreement due on 12/10/2016 E.C., but failed to repay despite repeated written notices.',
    defaultReliefPlaceholder:
      'Order Defendant to pay 450,000 ETB principal plus 9% legal interest and court filing costs.',
    legalBasisHint: 'Ethiopian Civil Procedure Code Art. 222–224; Civil Code Art. 1731 & 2471',
  },
  {
    id: 'civil_statement_of_defense',
    branch: 'civil',
    priceEtb: 350,
    courtLevel: 'Federal / Regional Civil Bench',
    title: {
      en: 'Statement of Defense (የመከላከያ መልስ)',
      am: 'የፍትሐ ብሔር መከላከያ መልስ (Statement of Defense)',
      om: 'Deebii Falmii (Statement of Defense)',
      ti: 'መልሲ መከላከያ (Statement of Defense)',
      so: 'Jawaabta Difaaca Madaniga ah (Statement of Defense)',
    },
    subtitle: {
      en: 'Preliminary objections (Art. 244), point-by-point admissions/denials & affirmative defenses under Art. 234.',
      am: 'የመጀመሪያ ደረጃ መቃወሚያዎች (አንቀጽ 244)፣ በየአንቀጹ መልስ እና ፍሬ-ነገር መከላከያ (አንቀጽ 234)።',
      om: 'Mormii duraa (Kwt. 244) fi deebii qabxii-qabxii (Kwt. 234) qaba.',
      ti: 'መባእታዊ ተቃውሞ (ዓንቀጽ 244) ከምኡውን ዝርዝር መልሲ (ዓንቀጽ 234)።',
      so: 'Diidmooyin horudhac ah (Qod. 244) & difaac faahfaahsan.',
    },
    defaultFactsPlaceholder:
      'Example: Claim is time-barred / Plaintiff failed to fulfill prerequisite delivery obligations under Clause 4 of the supply contract.',
    defaultReliefPlaceholder:
      'Dismiss the claim in entirety on preliminary objection or merits with costs awarded to Defendant.',
    legalBasisHint: 'Ethiopian Civil Procedure Code Art. 234–245; Civil Code limitation/contract defenses',
  },
  {
    id: 'civil_appeal',
    branch: 'civil',
    priceEtb: 400,
    courtLevel: 'Appellate High Court / Federal Supreme Court (ይግባኝ ችሎት)',
    title: {
      en: 'Civil Appeal Memorandum (የፍትሐ ብሔር ይግባኝ ማመልከቻ)',
      am: 'የፍትሐ ብሔር ይግባኝ ማመልከቻ (Civil Appeal Memo)',
      om: 'Iyyannoo Olʼiyyannoo (Civil Appeal)',
      ti: 'ጥርዓን ይግባኝ ፍትሐ ብሔር',
      so: 'Codsiga Racfaanka Madaniga ah (Civil Appeal)',
    },
    subtitle: {
      en: 'Errors of law & fact grounds structured under Civil Procedure Code Art. 327–330.',
      am: 'በሥነ-ሥርዓት ሕግ አንቀጽ 327–330 መሰረት የሕግ እና የፍሬ-ነገር ስህተቶችን በግልጽ የሚያቀርብ የይግባኝ ማመልከቻ።',
      om: 'Dogoggora seeraa fi dhugaa Kwt. 327–330 jalatti qophaaʼa.',
      ti: 'ጌጋ ሕግን ፍሬ-ነገርን ብመሰረት ዓንቀጽ 327–330 ዘቕርብ ይግባኝ።',
      so: 'Khaladaadka sharciga & xaqiiqada ee Qod. 327–330.',
    },
    defaultFactsPlaceholder:
      'Example: Lower court rendered judgment on File No. 12458/16 on 05/06/2017 E.C. overlooking Exhibit B bank transfer receipts.',
    defaultReliefPlaceholder:
      'Reverse the lower court judgment and enter judgment in favor of Appellant.',
    legalBasisHint: 'Ethiopian Civil Procedure Code Art. 320–345',
  },
  {
    id: 'civil_contract',
    branch: 'civil',
    priceEtb: 300,
    courtLevel: 'Notarial / Documents Authentication & Registration (ውልና ማስረጃ)',
    title: {
      en: 'Formal Contract / Agreement (ሕጋዊ ውል / ስምምነት)',
      am: 'የንግድ / ኪራይ / ብድር / የአገልግሎት ውል (Contract)',
      om: 'Waliigaltee Seeraa (Contract / Agreement)',
      ti: 'ሕጋዊ ውዕሊ / ስምምዕነት',
      so: 'Heshiis Rasmi ah (Contract / Agreement)',
    },
    subtitle: {
      en: 'Enforceable Ethiopian Civil Code contract (Sale, Lease, Partnership, Construction, or Service).',
      am: 'በኢትዮጵያ ፍትሐ ብሔር ሕግ መሰረት የተዘጋጀ የኪራይ፣ የሽያጭ፣ የሽርክና ወይም የአገልግሎት ውል።',
      om: 'Waliigaltee bittaa, kiraa, ykn tajaajilaa Seera Hariiroo Hawaasaatiin qophaaʼe.',
      ti: 'ብሕጊ ፍትሐ ብሔር ኢትዮጵያ ዝተዳለወ ሕጋዊ ውዕሊ።',
      so: 'Heshiis sharci ah oo iib, kiro, ama adeeg.',
    },
    defaultFactsPlaceholder:
      'Example: Commercial lease of a 120 sqm shop in Bole, Addis Ababa for 2 years at 65,000 ETB/month with 6-month advance payment.',
    defaultReliefPlaceholder:
      'Clear obligations, default penalties (Art. 1889), force majeure, termination notice & Addis Ababa arbitration/court venue.',
    legalBasisHint: 'Ethiopian Civil Code Art. 1675–1805, 2896–2949',
  },
  {
    id: 'civil_power_of_attorney',
    branch: 'civil',
    priceEtb: 250,
    courtLevel: 'DARS / Embassy / Court Agency (የውክልና ሰነድ)',
    title: {
      en: 'Power of Attorney (የውክልና ሥልጣን ሰነድ)',
      am: 'ልዩ ወይም ጠቅላላ የውክልና ሰነድ (Power of Attorney)',
      om: 'Aangoo Bakka Buʼummaa (Power of Attorney)',
      ti: 'ሰነድ ውክልና (Power of Attorney)',
      so: 'Wakaaladda Sharciga ah (Power of Attorney)',
    },
    subtitle: {
      en: 'Specific or general agency authorization under Civil Code Art. 2199–2233 for property, banking, or court representation.',
      am: 'በፍትሐ ብሔር ሕግ አንቀጽ 2199–2233 መሰረት ለንብረት አስተዳደር፣ ለባንክ ወይም ለፍርድ ቤት ክርክር የሚውል የውክልና ሰነድ።',
      om: 'Bakka buʼummaa qabeenyaa, baankii ykn mana murtiitiif Kwt. 2199–2233 jalatti.',
      ti: 'ንምሕደራ ንብረት፣ ባንክ ወይ ቤት ፍርዲ ዝውዕል ውክልና።',
      so: 'Wakaalad maamul hanti, bangi, ama maxkamad.',
    },
    defaultFactsPlaceholder:
      'Example: Principal residing abroad authorizes Agent in Addis Ababa to manage, collect rent, and renew lease for House No. 412, Yeka Sub-city.',
    defaultReliefPlaceholder:
      'Explicit scope of agency powers, restriction on alienation/sale unless stated, validity term & revocation clause.',
    legalBasisHint: 'Ethiopian Civil Code Art. 2199–2233 (Agency & Mandate)',
  },
  {
    id: 'civil_injunction',
    branch: 'civil',
    priceEtb: 300,
    courtLevel: 'Urgent Injunction / Attachment Bench (እግድ ጥያቄ)',
    title: {
      en: 'Injunction / Attachment Petition (የእግድ አቤቱታ)',
      am: 'የንብረት ወይም የባንክ ሂሳብ እግድ አቤቱታ (Injunction Petition)',
      om: 'Iyyannoo Dhorkaa Qabeenyaa (Injunction)',
      ti: 'ጥርዓን እግድ ንብረት ወይ ሕሳብ (Injunction)',
      so: 'Codsiga Xanibaadda Hantida (Injunction Petition)',
    },
    subtitle: {
      en: 'Temporary attachment & restraining order petition under Civil Procedure Code Art. 151–156.',
      am: 'በፍትሐ ብሔር ሥነ-ሥርዓት ሕግ አንቀጽ 151–156 መሰረት ንብረት እንዳይሸጥ/እንዳይዘዋወር የሚቀርብ ጊዜያዊ የእግድ ጥያቄ።',
      om: 'Iyyannoo dhorkaa yerootii Kwt. 151–156 jalatti qabeenyi akka hin gurguramne.',
      ti: 'ንብረት ከይሽየጥ ዝቐርብ ግዝያዊ ጥርዓን እግድ (ዓንቀጽ 151–156)።',
      so: 'Codsiga joojinta iibinta hantida Qod. 151–156.',
    },
    defaultFactsPlaceholder:
      'Example: Defendant is attempting to sell/transfer vehicle Plate No. AA-2-B45120 while principal debt suit of 620,000 ETB is pending.',
    defaultReliefPlaceholder:
      'Issue immediate temporary injunction prohibiting transfer/encumbrance pending final judgment.',
    legalBasisHint: 'Ethiopian Civil Procedure Code Art. 151–156 (Attachment before Judgment & Temporary Injunction)',
  },

  // CRIMINAL LAW BRANCH
  {
    id: 'criminal_defense_brief',
    branch: 'criminal',
    priceEtb: 400,
    courtLevel: 'Federal / Regional Criminal Trial Bench (የወንጀል ችሎት)',
    title: {
      en: 'Criminal Defense Brief (የወንጀል መከላከያ መልስ)',
      am: 'የወንጀል ክስ መከላከያ እና መቃወሚያ (Criminal Defense Brief)',
      om: 'Deebii Falmii Yakkaa (Criminal Defense Brief)',
      ti: 'መከላከያ ክሲ ገበን (Criminal Defense Brief)',
      so: 'Difaaca Dacwadda Ciqaabta (Criminal Defense Brief)',
    },
    subtitle: {
      en: 'Preliminary objections (Art. 130 CPC), reasonable doubt arguments, actus reus/mens rea & mitigating factors.',
      am: 'የክስ መቃወሚያ (አንቀጽ 130)፣ የወንጀል ማቋቋሚያ ፍሬ-ነገር ጉድለት እና የቅጣት ማቅለያ ነጥቦች (FDRE Criminal Code)።',
      om: 'Mormii himannaa yakkaa (Kwt. 130) fi qabxiilee bilisa baasan.',
      ti: 'ተቃውሞ ክሲ ገበን (ዓንቀጽ 130) ከምኡውን ዝርዝር መከላከያ።',
      so: 'Diidmada dacwadda ciqaabta & difaac sharci oo dhammaystiran.',
    },
    defaultFactsPlaceholder:
      'Example: Accused charged under Criminal Code Art. 692 despite underlying dispute being purely civil contractual non-payment without fraudulent intent.',
    defaultReliefPlaceholder:
      'Dismiss charge for failure to state a criminal offense under Art. 130/141 CPC or enter verdict of acquittal.',
    legalBasisHint: 'FDRE Criminal Procedure Code Art. 130–149; FDRE Criminal Code Art. 23, 57–59, 82',
  },
  {
    id: 'criminal_bail_application',
    branch: 'criminal',
    priceEtb: 250,
    courtLevel: 'Bail & Remand Bench (የዋስትና ችሎት)',
    title: {
      en: 'Bail Application (የዋስትና መብት ጥያቄ)',
      am: 'የዋስትና መብት ማስከበሪያ አቤቱታ (Bail Application)',
      om: 'Iyyannoo Wabii (Bail Application)',
      ti: 'ጥርዓን መሰል ዋሕስ (Bail Application)',
      so: 'Codsiga Damaanadda Xorriyadda (Bail Application)',
    },
    subtitle: {
      en: 'Constitutional right to bail (Art. 19(6) FDRE Const.) & Criminal Procedure Code Art. 63–69 defense against remand.',
      am: 'በኢፌዴሪ ሕገ-መንግስት አንቀጽ 19(6) እና በወንጀል ሥነ-ሥርዓት ሕግ አንቀጽ 63–69 መሰረት የሚቀርብ የዋስትና ጥያቄ።',
      om: 'Mirga wabii Heera Mootummaa Kwt. 19(6) fi Seera Yakkaa Kwt. 63–69 jalatti.',
      ti: 'ብመሰረት ሕገ-መንግስቲ ዓንቀጽ 19(6) ከምኡውን ዓንቀጽ 63–69 ዝቐርብ ጥርዓን ዋሕስ።',
      so: 'Codsi damaanad xorriyadeed Qod. 19(6) Dastuurka & Qod. 63–69.',
    },
    defaultFactsPlaceholder:
      'Example: Applicant has fixed residential address in Addis Ababa, stable employment, no prior criminal record, and alleged offense carries under 15 years.',
    defaultReliefPlaceholder:
      'Release Applicant on reasonable cash or personal surety bail pursuant to Art. 19(6) of the FDRE Constitution.',
    legalBasisHint: 'FDRE Constitution Art. 19(6); Criminal Procedure Code Art. 59, 63–69',
  },
  {
    id: 'criminal_appeal_memo',
    branch: 'criminal',
    priceEtb: 400,
    courtLevel: 'Criminal Appellate / Cassation Bench (የወንጀል ይግባኝ)',
    title: {
      en: 'Criminal Appeal Memorandum (የወንጀል ይግባኝ ማመልከቻ)',
      am: 'የወንጀል ይግባኝ እና የቅጣት ማሻሻያ ማመልከቻ (Criminal Appeal)',
      om: 'Iyyannoo Olʼiyyannoo Yakkaa (Criminal Appeal)',
      ti: 'ጥርዓን ይግባኝ ገበን (Criminal Appeal)',
      so: 'Racfaanka Dacwadda Ciqaabta (Criminal Appeal)',
    },
    subtitle: {
      en: 'Appeal against conviction or sentencing under Criminal Procedure Code Art. 181–195 & Sentencing Manual 2/2006.',
      am: 'በጥፋተኝነት ውሳኔ ወይም በቅጣት አወሳሰን መመሪያ 2/2006 ስሌት ላይ የሚቀርብ የይግባኝ ማመልከቻ።',
      om: 'Olʼiyyannoo murtoo balleessummaa ykn adabbii Kwt. 181–195 jalatti.',
      ti: 'ይግባኝ ብዛዕባ ውሳኔ ጥፍኣት ወይ መምርሒ ቅጽዓት 2/2006።',
      so: 'Racfaan ka dhan ah xukunka dembiga ama ciqaabta.',
    },
    defaultFactsPlaceholder:
      'Example: Trial court failed to credit 3 mitigating grounds under Art. 82 and misapplied Sentencing Guideline level calculations.',
    defaultReliefPlaceholder:
      'Overturn conviction or reduce sentence strictly in accordance with Federal Sentencing Manual No. 2/2006.',
    legalBasisHint: 'Criminal Procedure Code Art. 181–195; Federal Supreme Court Sentencing Manual No. 2/2006',
  },
  {
    id: 'criminal_witness_evidence',
    branch: 'criminal',
    priceEtb: 250,
    courtLevel: 'Criminal Trial Bench (የምስክር እና ማስረጃ ማቅረቢያ)',
    title: {
      en: 'Defense Witness & Evidence Submission (የመከላከያ ምስክር እና ማስረጃ ማቅረቢያ)',
      am: 'የመከላከያ ምስክሮች እና የሰነድ ማስረጃ ማቅረቢያ ቅጽ',
      om: 'Dhiyeessii Ragaawwan & Galmeewwan Ittisaa',
      ti: 'ቅጥዒ መቕረቢ መከላከያ መሰኻኽርን ሰነዳትን',
      so: 'Gudbinta Markhaatiyaasha & Caddaymaha Difaaca',
    },
    subtitle: {
      en: 'Formal court filing listing defense witnesses (names, addresses, facts proved) & authenticated exhibits under Art. 142.',
      am: 'በአንቀጽ 142 መሰረት የመከላከያ ምስክሮችን ስም፣ አድራሻ፣ የሚያስረዱትን ፍሬ-ነገር እና የሰነድ ማስረጃዎችን ለችሎት ማቅረቢያ።',
      om: 'Tarree ragaawwan ittisaa fi galmeewwan mana murtiitti dhiyeessuu.',
      ti: 'ስም መሰኻኽር፣ ኣድራሻን ዝምስክርዎ ፍሬ-ነገርን መቕረቢ ሰነድ።',
      so: 'Liiska markhaatiyaasha difaaca & caddaymaha maxkamadda.',
    },
    defaultFactsPlaceholder:
      'Example: Three eyewitnesses (Ato Dawit, W/ro Selam, Ato Bekele) and Telecom call-detail/CCTV logs proving alibi on the alleged date.',
    defaultReliefPlaceholder:
      'Admit listed defense exhibits into the record and issue court summonses to named defense witnesses.',
    legalBasisHint: 'FDRE Constitution Art. 20(4); Criminal Procedure Code Art. 142–145',
  },
];

export const LEGAL_CONSULT_TIERS: LegalConsultTier[] = [
  {
    id: 'consult_quick_qa',
    priceEtb: 200,
    durationLabel: '20-Min Direct Q&A',
    title: {
      en: 'Quick Legal Q&A Consultation',
      am: 'ፈጣን የሕግ ጥያቄ እና ምክር (Quick Q&A)',
      om: 'Gaaffii & Gorsa Seeraa Saffisaa',
      ti: 'ቅልጡፍ ሕቶን ምኽርን ሕጊ',
      so: 'Talo-siin Sharci oo Degdeg ah',
    },
    subtitle: {
      en: 'Fast clarification on Ethiopian family, labor, rental, traffic, or small-claims rights.',
      am: 'በቤተሰብ፣ በስራ፣ በቤት ኪራይ፣ በትራፊክ ወይም በዕለታዊ የሕግ ጉዳዮች ፈጣን ምላሽ።',
      om: 'Deebii saffisaa dhimma maatii, hojii, kiraa fi falmii salphaa.',
      ti: 'ቅልጡፍ ምላሽ ብዛዕባ ቤተሰብ፣ ስራሕ፣ ክራይን መሰረታዊ ሕግን።',
      so: 'Jawaab degdeg ah oo ku saabsan arrimaha qoyska, shaqada & kirada.',
    },
    deliverables: {
      en: [
        'Direct legal clarity via Telegram / WhatsApp',
        'Applicable Ethiopian code articles cited',
        'Recommended next practical step checklist',
      ],
      am: [
        'በቴሌግራም / ዋትስአፕ ቀጥታ የሕግ ምክር',
        'አግባብነት ያላቸው የኢትዮጵያ ሕግ አንቀጾች ማብራሪያ',
        'ቀጣይ መውሰድ ያለብዎት እርምጃ መመሪያ',
      ],
      om: [
        'Gorsa kallattii Telegram / WhatsApp',
        'Keewwata seeraa Itoophiyaa ibsame',
        'Tarkaanfii itti aanu qajeelfamaan',
      ],
      ti: [
        'ብቴሌግራም / ዋትስኣፕ ቀጥታ ምኽሪ ሕጊ',
        'ዝምልከቶም ዓንቀጻት ሕጊ ኢትዮጵያ',
        'ዝቕጽል ግብራዊ ስጉምቲ',
      ],
      so: [
        'Talo toos ah Telegram / WhatsApp',
        'Qodobbada sharciga Itoobiya ee khuseeya',
        'Tallaabada xigta ee la qaadayo',
      ],
    },
  },
  {
    id: 'consult_doc_review',
    priceEtb: 500,
    durationLabel: '45-Min Document Audit',
    title: {
      en: 'Contract & Legal Document Review',
      am: 'የውል እና የሕግ ሰነድ ምርመራ (Document Review)',
      om: 'Sakattaʼa Waliigaltee & Sanada Seeraa',
      ti: 'ምርመራ ውዕልን ሰነዳት ሕግን',
      so: 'Dib-u-eegista Heshiisyada & Dukumeentiyada',
    },
    subtitle: {
      en: 'Thorough line-by-line review of lease contracts, loan agreements, court summons, or employment offers.',
      am: 'የኪራይ ውሎችን፣ የብድር ስምምነቶችን፣ የፍርድ ቤት መጥሪያዎችን ወይም የስራ ውሎችን ከስጋት ነጻ እንዲሆኑ መመርመር።',
      om: 'Sakattaʼa waliigaltee kiraa, liqii, waamicha mana murtii fi hojii.',
      ti: 'ዝርዝር ምርመራ ውዕላት ክራይ፣ ልቃሕ፣ መጸዋዕታ ቤት ፍርድን ስራሕን።',
      so: 'Dib-u-eegis buuxda oo heshiisyada kirada, deynta, ama shaqada.',
    },
    deliverables: {
      en: [
        'Risk & loophole audit of your uploaded/described terms',
        'Red-flag clause protection edits before signing',
        'Direct Q&A session via Telegram or WhatsApp',
      ],
      am: [
        'ከመፈረምዎ በፊት አደገኛ አንቀጾችን መለየትና ማስተካከል',
        'የመብት ጥበቃ ማሻሻያ ሀሳቦች',
        'በቴሌግራም ወይም ዋትስአፕ ዝርዝር ውይይት',
      ],
      om: [
        'Sakattaʼa balaa fi hanqina waliigaltee',
        'Sirreeffama osoo hin mallatteessin dura',
        'Marii kallattii Telegram / WhatsApp',
      ],
      ti: [
        'ቅድሚ ምፍራም ሓደገኛ ዓንቀጻት ምፍላይ',
        'መመሓየሺ ሓሳባት',
        'ቀጥታ ዝርርብ ብቴሌግራም ወይ ዋትስኣፕ',
      ],
      so: [
        'Baadhista khataraha ku jira qodobada heshiiska',
        'Talooyinka wax ka beddelka ka hor saxeexa',
        'Wadahadal toos ah Telegram / WhatsApp',
      ],
    },
  },
  {
    id: 'consult_full_strategy',
    priceEtb: 1000,
    durationLabel: '60+ Min Full Strategy',
    title: {
      en: 'Full Case Strategy Session (Civil & Criminal)',
      am: 'ሙሉ የክስ እና የመከላከያ ስትራቴጂ ምክክር (Full Case Strategy)',
      om: 'Marii Tarsiimoo Dhimma Guutuu (Civil & Criminal)',
      ti: 'ምሉእ ስትራቴጂካዊ ምኽሪ ጉዳይ (ፍትሐ ብሔር & ገበን)',
      so: 'Fadhiga Istaraatiijiyadda Kiiska Buuxda',
    },
    subtitle: {
      en: 'Deep case mapping, evidence plan, witness order & Cassation precedent alignment for active disputes.',
      am: 'ለተከፈቱ ወይም ለሚከፈቱ ክሶች ሙሉ የማስረጃ እቅድ፣ የምስክር ቅደም ተከተል እና የሰበር ውሳኔዎች ትስስር።',
      om: 'Karoora ragaa guutuu, tartiiba ragaawwanii fi murtoo Dhaddacha Ijibbaataa.',
      ti: 'ምሉእ ትልሚ መርትዖ፣ ቅደም ተከተል መሰኻኽርን ምትእስሳር ሰበርን።',
      so: 'Qorshaha buuxa ee caddaymaha, markhaatiyaasha & xukunada Cassation.',
    },
    deliverables: {
      en: [
        'Complete Civil or Criminal litigation roadmap',
        'Evidence & Cassation Bench precedent checklist',
        'Priority 1-on-1 follow-up via Telegram (@tekii18) & WhatsApp',
      ],
      am: [
        'ሙሉ የፍትሐ ብሔር ወይም የወንጀል ክርክር ፍኖተ ካርታ',
        'የማስረጃ እና የሰበር ችሎት ውሳኔዎች ማመሳከሪያ',
        'ቅድሚያ የሚሰጠው የ1-ለ-1 ክትትል በTelegram እና WhatsApp',
      ],
      om: [
        'Kaartaa falmii Hariiroo Hawaasaa ykn Yakkaa guutuu',
        'Galmee ragaa fi fakkeenya murtoo Ijibbaataa',
        'Hordoffii dursa qabu Telegram & WhatsApp irratti',
      ],
      ti: [
        'ምሉእ ፍኖተ ካርታ ክርክር ፍትሐ ብሔር ወይ ገበን',
        'መወከሲ መርትዖን ውሳኔታት ሰበርን',
        'ቀዳምነት ዘለዎ 1-ን-1 ክትትል',
      ],
      so: [
        'Khariidad dhammaystiran oo dacwadda madaniga/ciqaabta ah',
        'Hubinta caddaymaha & xukunada Maxkamadda Sare',
        'La-talin gaar ah Telegram & WhatsApp',
      ],
    },
  },
];
