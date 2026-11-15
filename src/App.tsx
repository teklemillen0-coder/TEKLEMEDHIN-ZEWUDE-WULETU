import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  Crown,
  Download,
  FileQuestion,
  Link2,
  Mail,
  MessageCircle,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  X,
} from 'lucide-react';
import { HERO_IMAGE, PRODUCTS } from './data/products';
import { DEFAULT_AD_CONFIG } from './constants/ads';
import { getPromoDiscountPercent } from './constants/payment';
import { OWNER_SUPPORT_CONTACTS } from './constants/support';
import {
  OWNER_DEFAULT_PROFILE,
  SEED_COMMUNITY_MESSAGES,
} from './constants/pdfAndCommunity';
import {
  SEED_EXPEDITER_REQUESTS,
  SEED_JOBS,
  SEED_WORKERS,
} from './constants/communitySeed';
import { LANGUAGE_OPTIONS, UI_TRANSLATIONS } from './i18n/translations';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  ALL_INSTRUCTION_LANGUAGES,
  ETHIOPIAN_REGIONS,
  REGION_NAME_BY_ID,
} from './constants/educationRegions';
import {
  AdConfig,
  AiToolDefinition,
  AppFontScale,
  BundleDeal,
  CartItem,
  CategoryId,
  CommunityChatMessage,
  CvCountryStandard,
  DigitalProduct,
  EthiopianRegionId,
  ExpediterRequest,
  ExpediterStatus,
  JobListing,
  Language,
  LegalConsultTier,
  LegalConsultationBooking,
  LegalDocTemplate,
  MemberProfile,
  OwnerTrustProfile,
  PaymentMethod,
  PendingLinkDownload,
  PendingPdfExport,
  PurchaseOrder,
  VaultAccessToken,
  ViewTab,
  VipPlan,
  VipSubscription,
  WorkerProfile,
} from './types';
import { downloadProductFile } from './utils/fileGenerator';
import {
  computeIntegritySig,
  readEncryptedStorage,
  sanitizeUserInput,
  sealEncryptedStorage,
  verifyCheckoutAmount,
} from './utils/appSecurity';
import {
  generateUserReferralCode,
  getOrCreateDeviceId,
  isOrderBoundToCurrentDevice,
  isVipActiveOnCurrentDevice,
  mintSingleUseVaultToken,
  validateAndConsumeVaultToken,
} from './utils/vaultSecurity';
import { AdSlot } from './components/AdSlot';
import { MobileBottomNav, Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { DownloadsView } from './components/DownloadsView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import { SmartLinkDownloaderView } from './components/SmartLinkDownloaderView';
import { AiToolsSuiteView } from './components/AiToolsSuiteView';
import { JobsMarketplaceView } from './components/JobsMarketplaceView';
import { ExpediterView } from './components/ExpediterView';
import { CvBuilderView } from './components/CvBuilderView';
import { LegalSuiteView } from './components/LegalSuiteView';
import { LawyersHubView } from './components/LawyersHubView';
import { SettingsView } from './components/SettingsView';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SupportWidget } from './components/SupportWidget';
import { MissingFileModal } from './components/MissingFileModal';
import { VipPassModal } from './components/VipPassModal';
import { GrowthSection } from './components/GrowthSection';
import { SecureVaultReaderModal } from './components/SecureVaultReaderModal';
import { PdfEditorView } from './components/PdfEditorView';
import { MemberAuthModal } from './components/MemberAuthModal';
import { CommunityTrustView } from './components/CommunityTrustView';
import { VerifiedOwnerModal } from './components/VerifiedOwnerModal';

const CATEGORY_LIST: CategoryId[] = [
  'education',
  'national_exams',
  'law_academy',
  'video_arts',
  'culinary',
  'medical',
  'research_history',
  'business_diaspora',
  'childrens_books',
  'gov_manuals',
  'repair_kits',
  'livestock',
  'business_ideas',
  'taxpayer_ed',
  'electronics_manuals',
  'architecture_plans',
  'auto_mechanic',
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('addisvault_lang') as Language | null;
      return saved && UI_TRANSLATIONS[saved] ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  });

  const [fontScale, setFontScale] = useState<AppFontScale>(() =>
    readStorage<AppFontScale>('addisvault_font_scale', 'base')
  );

  const [deviceId] = useState<string>(() => getOrCreateDeviceId());
  const [activeTab, setActiveTab] = useState<ViewTab>('marketplace');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedExamYear, setSelectedExamYear] = useState<string>('all');
  const [selectedAudience, setSelectedAudience] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [selectedContentLang, setSelectedContentLang] = useState<Language | 'all'>('all');
  const [selectedCarBrand, setSelectedCarBrand] = useState<string>('all');
  const [selectedModelYear, setSelectedModelYear] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedInstructionLang, setSelectedInstructionLang] = useState<string>('all');
  const [selectedBookRole, setSelectedBookRole] = useState<string>('all');
  const [selectedEdition, setSelectedEdition] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_asc' | 'price_desc'>('featured');

  const handleSelectCategory = (next: CategoryId | 'all') => {
    setSelectedCategory(next);
    setSelectedGrade('all');
    setSelectedSubject('all');
    setSelectedExamYear('all');
    setSelectedAudience('all');
    setSelectedTrack('all');
    setSelectedCarBrand('all');
    setSelectedModelYear('all');
    setSelectedRegion('all');
    setSelectedInstructionLang('all');
    setSelectedBookRole('all');
    setSelectedEdition('all');
  };

  const handleSelectRegion = (nextRegion: string) => {
    setSelectedRegion(nextRegion);
    if (nextRegion !== 'all') {
      if (selectedCategory !== 'education') {
        setSelectedCategory('education');
      }
      const allowedLangs =
        REGION_NAME_BY_ID[nextRegion as EthiopianRegionId]?.primaryLanguages || [];
      if (
        selectedInstructionLang !== 'all' &&
        !allowedLangs.includes(selectedInstructionLang)
      ) {
        setSelectedInstructionLang('all');
      }
    }
  };

  const [cart, setCart] = useState<CartItem[]>(() => readStorage('addisvault_cart', []));
  const [orders, setOrders] = useState<PurchaseOrder[]>(() =>
    readEncryptedStorage('addisvault_orders', [])
  );
  const [adConfig, setAdConfig] = useState<AdConfig>(() =>
    readStorage('addisvault_ad_config', DEFAULT_AD_CONFIG)
  );
  const [vipSubscription, setVipSubscription] = useState<VipSubscription | null>(() =>
    readEncryptedStorage('addisvault_vip', null)
  );
  const [workers, setWorkers] = useState<WorkerProfile[]>(() =>
    readStorage('addisvault_workers', SEED_WORKERS)
  );
  const [jobs, setJobs] = useState<JobListing[]>(() =>
    readStorage('addisvault_jobs', SEED_JOBS)
  );
  const [expediterRequests, setExpediterRequests] = useState<ExpediterRequest[]>(() =>
    readStorage('addisvault_expediter', SEED_EXPEDITER_REQUESTS)
  );
  const [consultBookings, setConsultBookings] = useState<LegalConsultationBooking[]>(() =>
    readEncryptedStorage('addisvault_consults', [])
  );
  const [currentMember, setCurrentMember] = useState<MemberProfile | null>(() =>
    readEncryptedStorage<MemberProfile | null>('addisvault_member', null)
  );
  const [chatMessages, setChatMessages] = useState<CommunityChatMessage[]>(() =>
    readStorage('addisvault_chat_msgs', SEED_COMMUNITY_MESSAGES)
  );
  const [blockedMemberIds, setBlockedMemberIds] = useState<string[]>(() =>
    readStorage('addisvault_blocked_members', [])
  );
  const [reportedMessageIds, setReportedMessageIds] = useState<string[]>(() =>
    readStorage('addisvault_reported_msgs', [])
  );
  const [ownerProfile, setOwnerProfile] = useState<OwnerTrustProfile>(() =>
    readStorage('addisvault_owner_profile', OWNER_DEFAULT_PROFILE)
  );
  const [referralCode] = useState<string>(() => {
    const existing = readStorage<string>('addisvault_ref_code', '');
    if (existing) return existing;
    const created = generateUserReferralCode();
    try {
      localStorage.setItem('addisvault_ref_code', JSON.stringify(created));
    } catch {
      // Ignore
    }
    return created;
  });
  const [referralCreditsEtb, setReferralCreditsEtb] = useState<number>(() =>
    readStorage('addisvault_ref_credits', 0)
  );

  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [referralBannerVisible, setReferralBannerVisible] = useState(false);
  const [tokenSecurityError, setTokenSecurityError] = useState(false);

  const [previewProduct, setPreviewProduct] = useState<DigitalProduct | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [pendingVipPlan, setPendingVipPlan] = useState<VipPlan | null>(null);
  const [pendingAiTool, setPendingAiTool] = useState<AiToolDefinition | null>(null);
  const [pendingCvStandard, setPendingCvStandard] = useState<CvCountryStandard | null>(null);
  const [pendingLegalDoc, setPendingLegalDoc] = useState<LegalDocTemplate | null>(null);
  const [pendingLegalConsult, setPendingLegalConsult] = useState<{
    tier: LegalConsultTier;
    intake: { clientName: string; phone: string; branch: string; caseSummary: string };
  } | null>(null);
  const [pendingLinkDownload, setPendingLinkDownload] = useState<PendingLinkDownload | null>(null);
  const [lastConfirmedLinkDownload, setLastConfirmedLinkDownload] =
    useState<PendingLinkDownload | null>(null);
  const [pendingPdfExport, setPendingPdfExport] = useState<PendingPdfExport | null>(null);
  const [lastConfirmedPdfExport, setLastConfirmedPdfExport] =
    useState<PendingPdfExport | null>(null);
  const [isPWAModalOpen, setIsPWAModalOpen] = useState(false);
  const [isMissingFileOpen, setIsMissingFileOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isMemberAuthOpen, setIsMemberAuthOpen] = useState(false);
  const [isVerifiedOwnerOpen, setIsVerifiedOwnerOpen] = useState(false);
  const [activeVaultSession, setActiveVaultSession] = useState<{
    product: DigitalProduct;
    order: PurchaseOrder | null;
    token: VaultAccessToken;
  } | null>(null);

  const { canPromptNatively, isInstalled, isIOS, install } = usePWAInstall();

  const t = UI_TRANSLATIONS[lang];

  const productsById = useMemo(() => {
    const map: Record<string, DigitalProduct> = {};
    for (const p of PRODUCTS) {
      map[p.id] = p;
    }
    return map;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_lang', lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage failures in private browsing
    }
  }, [lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem('addisvault_theme', theme);
    } catch {
      // Ignore
    }
  }, [theme]);

  useEffect(() => {
    const pxMap: Record<AppFontScale, string> = {
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
    };
    document.documentElement.style.fontSize = pxMap[fontScale] || '16px';
    try {
      localStorage.setItem('addisvault_font_scale', JSON.stringify(fontScale));
    } catch {
      // Ignore
    }
  }, [fontScale]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_cart', JSON.stringify(cart));
    } catch {
      // Ignore
    }
  }, [cart]);

  useEffect(() => {
    sealEncryptedStorage('addisvault_orders', orders);
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_ad_config', JSON.stringify(adConfig));
    } catch {
      // Ignore
    }
  }, [adConfig]);

  useEffect(() => {
    sealEncryptedStorage('addisvault_vip', vipSubscription);
  }, [vipSubscription]);

  useEffect(() => {
    sealEncryptedStorage('addisvault_consults', consultBookings);
  }, [consultBookings]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_ref_credits', JSON.stringify(referralCreditsEtb));
    } catch {
      // Ignore
    }
  }, [referralCreditsEtb]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_workers', JSON.stringify(workers));
    } catch {
      // Ignore
    }
  }, [workers]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_jobs', JSON.stringify(jobs));
    } catch {
      // Ignore
    }
  }, [jobs]);

  useEffect(() => {
    sealEncryptedStorage('addisvault_member', currentMember);
  }, [currentMember]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_chat_msgs', JSON.stringify(chatMessages));
    } catch {
      // Ignore
    }
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_blocked_members', JSON.stringify(blockedMemberIds));
    } catch {
      // Ignore
    }
  }, [blockedMemberIds]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_reported_msgs', JSON.stringify(reportedMessageIds));
    } catch {
      // Ignore
    }
  }, [reportedMessageIds]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_owner_profile', JSON.stringify(ownerProfile));
    } catch {
      // Ignore
    }
  }, [ownerProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('addisvault_expediter', JSON.stringify(expediterRequests));
    } catch {
      // Ignore
    }
  }, [expediterRequests]);

  // Sync community job board, chat messages, and expediter inbox from server store on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/api/superapp/community')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: {
        workers?: WorkerProfile[];
        jobs?: JobListing[];
        expediterRequests?: ExpediterRequest[];
        consultations?: LegalConsultationBooking[];
        chatMessages?: CommunityChatMessage[];
      } | null) => {
        if (cancelled || !data) return;
        if (Array.isArray(data.workers) && data.workers.length > 0) {
          setWorkers((prev) => {
            const ids = new Set(data.workers!.map((w) => w.id));
            return [...data.workers!, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
        if (Array.isArray(data.jobs) && data.jobs.length > 0) {
          setJobs((prev) => {
            const ids = new Set(data.jobs!.map((j) => j.id));
            return [...data.jobs!, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
        if (Array.isArray(data.expediterRequests) && data.expediterRequests.length > 0) {
          setExpediterRequests((prev) => {
            const serverById = new Map(data.expediterRequests!.map((r) => [r.id, r]));
            const merged = [...data.expediterRequests!];
            for (const p of prev) {
              if (!serverById.has(p.id)) merged.push(p);
            }
            return merged;
          });
        }
        if (Array.isArray(data.consultations) && data.consultations.length > 0) {
          setConsultBookings((prev) => {
            const ids = new Set(data.consultations!.map((c) => c.id));
            return [...data.consultations!, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
        if (Array.isArray(data.chatMessages) && data.chatMessages.length > 0) {
          setChatMessages((prev) => {
            const ids = new Set(data.chatMessages!.map((m) => m.id));
            return [...data.chatMessages!, ...prev.filter((p) => !ids.has(p.id))];
          });
        }
      })
      .catch(() => {
        // Offline / fallback to localStorage + seed
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Handle ?ref= and ?vaultToken= URL parameters securely on initial mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    let urlChanged = false;

    const refParam = params.get('ref');
    if (refParam && getPromoDiscountPercent(refParam) > 0) {
      setAppliedPromo(refParam.trim().toUpperCase());
      setReferralBannerVisible(true);
      params.delete('ref');
      urlChanged = true;
    }

    const tokenParam = params.get('vaultToken');
    if (tokenParam) {
      const check = validateAndConsumeVaultToken(tokenParam, deviceId);
      if (check.valid) {
        const targetProduct = productsById[check.token.productId];
        if (targetProduct) {
          const matchedOrder =
            orders.find((o) => o.id === check.token.orderId && isOrderBoundToCurrentDevice(o, deviceId)) ||
            null;
          setActiveVaultSession({
            product: targetProduct,
            order: matchedOrder,
            token: check.token,
          });
        } else {
          setTokenSecurityError(true);
        }
      } else {
        setTokenSecurityError(true);
      }
      params.delete('vaultToken');
      urlChanged = true;
    }

    if (urlChanged) {
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${
        window.location.hash
      }`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [orders, productsById]);

  const handleTrackAdImpression = useCallback(() => {
    setAdConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, impressions: prev.stats.impressions + 1 },
    }));
  }, []);

  const handleTrackAdClick = useCallback(() => {
    setAdConfig((prev) => ({
      ...prev,
      stats: { ...prev.stats, clicks: prev.stats.clicks + 1 },
    }));
  }, []);

  const vipActive = isVipActiveOnCurrentDevice(vipSubscription, deviceId);

  const unlockedIds = useMemo(() => {
    const set = new Set<string>();
    if (vipActive) {
      for (const p of PRODUCTS) {
        set.add(p.id);
      }
      return set;
    }
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      for (const item of order.items) {
        set.add(item.productId);
      }
    }
    return set;
  }, [orders, vipActive, deviceId]);

  const unlockedAiToolIds = useMemo(() => {
    const set = new Set<string>();
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      if (order.aiToolId) set.add(order.aiToolId);
    }
    return set;
  }, [orders, deviceId]);

  const unlockedCvCountryIds = useMemo(() => {
    const set = new Set<string>();
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      if (order.cvCountryId) set.add(order.cvCountryId);
    }
    return set;
  }, [orders, deviceId]);

  const unlockedLegalDocIds = useMemo(() => {
    const set = new Set<string>();
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      if (order.legalDocId) set.add(order.legalDocId);
    }
    return set;
  }, [orders, deviceId]);

  const unlockedConsultTierIds = useMemo(() => {
    const set = new Set<string>();
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      if (order.legalConsultTierId) set.add(order.legalConsultTierId);
    }
    return set;
  }, [orders, deviceId]);

  const unlockedLinkIds = useMemo(() => {
    const set = new Set<string>();
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      if (order.linkDownloadId) set.add(order.linkDownloadId);
    }
    return set;
  }, [orders, deviceId]);

  const unlockedPdfIds = useMemo(() => {
    const set = new Set<string>();
    for (const order of orders) {
      if (!isOrderBoundToCurrentDevice(order, deviceId)) continue;
      if (order.pdfExportId) set.add(order.pdfExportId);
    }
    return set;
  }, [orders, deviceId]);

  const awardMemberActivity = useCallback(
    (kind: 'download' | 'purchase' | 'chat' | 'referral') => {
      setCurrentMember((prev) => {
        if (!prev) return prev;
        if (kind === 'download') {
          return {
            ...prev,
            points: prev.points + 25,
            downloadsCount: prev.downloadsCount + 1,
          };
        }
        if (kind === 'purchase') {
          return {
            ...prev,
            verifiedBuyer: true,
            points: prev.points + 100,
            purchasesCount: prev.purchasesCount + 1,
          };
        }
        if (kind === 'chat') {
          return {
            ...prev,
            points: prev.points + 15,
            helpfulChatsCount: prev.helpfulChatsCount + 1,
          };
        }
        return {
          ...prev,
          points: prev.points + 75,
          referralsCount: prev.referralsCount + 1,
        };
      });
    },
    []
  );

  const lawAcademyProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === 'law_academy'),
    []
  );

  const handleOpenInVault = useCallback(
    (product: DigitalProduct, explicitOrder?: PurchaseOrder | null) => {
      const matchedOrder =
        explicitOrder !== undefined
          ? explicitOrder
          : orders.find(
              (o) =>
                isOrderBoundToCurrentDevice(o, deviceId) &&
                o.items.some((item) => item.productId === product.id)
            ) || null;
      const buyerLabel =
        matchedOrder?.buyerContact ||
        vipSubscription?.buyerContact ||
        matchedOrder?.refNumber ||
        vipSubscription?.refNumber ||
        'AddisVault Buyer';
      const token = mintSingleUseVaultToken({
        productId: product.id,
        orderId: matchedOrder?.id || vipSubscription?.orderId || 'VIP-PASS',
        buyerLabel,
      });
      setPreviewProduct(null);
      setActiveVaultSession({ product, order: matchedOrder, token });
      awardMemberActivity('download');
    },
    [orders, deviceId, vipSubscription, awardMemberActivity]
  );

  const cartIds = useMemo(() => new Set(cart.map((c) => c.productId)), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, c) => sum + c.quantity, 0), [cart]);

  const subFilterOptions = useMemo(() => {
    const base =
      selectedCategory === 'all'
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === selectedCategory);

    const regionScoped =
      selectedRegion === 'all'
        ? base
        : base.filter((p) => p.regionId === selectedRegion);

    const grades = Array.from(
      new Set(regionScoped.map((p) => p.gradeBand).filter(Boolean))
    ) as string[];
    const subjects = Array.from(
      new Set(regionScoped.map((p) => p.subject).filter(Boolean))
    ) as string[];
    const years = Array.from(new Set(base.map((p) => p.examYear).filter(Boolean))) as string[];
    const audiences = Array.from(new Set(base.map((p) => p.audience).filter(Boolean))) as string[];
    const tracks = Array.from(new Set(base.map((p) => p.track).filter(Boolean))) as string[];
    const carBrands = Array.from(new Set(base.map((p) => p.carBrand).filter(Boolean))) as string[];
    const modelYears = Array.from(new Set(base.map((p) => p.modelYear).filter(Boolean))) as string[];

    const regionLangList =
      selectedRegion !== 'all'
        ? REGION_NAME_BY_ID[selectedRegion as EthiopianRegionId]?.primaryLanguages ||
          ALL_INSTRUCTION_LANGUAGES
        : ALL_INSTRUCTION_LANGUAGES;
    const productLangs = new Set(
      regionScoped.map((p) => p.instructionLanguage).filter(Boolean) as string[]
    );
    const instructionLanguages = Array.from(
      new Set([...regionLangList, ...Array.from(productLangs)])
    );

    const bookRoles = Array.from(
      new Set(regionScoped.map((p) => p.bookRole).filter(Boolean))
    ) as string[];
    const editions = Array.from(
      new Set(regionScoped.map((p) => p.curriculumEdition).filter(Boolean))
    ) as string[];

    return {
      grades,
      subjects,
      years,
      audiences,
      tracks,
      carBrands,
      modelYears,
      instructionLanguages,
      bookRoles,
      editions,
    };
  }, [selectedCategory, selectedRegion]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = PRODUCTS.filter((product) => {
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }
      if (selectedRegion !== 'all' && product.regionId !== selectedRegion) {
        return false;
      }
      if (
        selectedInstructionLang !== 'all' &&
        product.instructionLanguage !== selectedInstructionLang
      ) {
        return false;
      }
      if (selectedBookRole !== 'all' && product.bookRole !== selectedBookRole) {
        return false;
      }
      if (selectedEdition !== 'all' && product.curriculumEdition !== selectedEdition) {
        return false;
      }
      if (selectedGrade !== 'all' && product.gradeBand !== selectedGrade) {
        return false;
      }
      if (selectedSubject !== 'all' && product.subject !== selectedSubject) {
        return false;
      }
      if (selectedExamYear !== 'all' && product.examYear !== selectedExamYear) {
        return false;
      }
      if (selectedAudience !== 'all' && product.audience !== selectedAudience) {
        return false;
      }
      if (selectedTrack !== 'all' && product.track !== selectedTrack) {
        return false;
      }
      if (selectedCarBrand !== 'all' && product.carBrand !== selectedCarBrand) {
        return false;
      }
      if (selectedModelYear !== 'all' && product.modelYear !== selectedModelYear) {
        return false;
      }
      if (
        selectedContentLang !== 'all' &&
        product.availableLanguages &&
        !product.availableLanguages.includes(selectedContentLang)
      ) {
        return false;
      }
      if (!q) return true;
      const regionName = product.regionId
        ? REGION_NAME_BY_ID[product.regionId]?.name[lang] || ''
        : '';
      return (
        product.title[lang].toLowerCase().includes(q) ||
        product.title.en.toLowerCase().includes(q) ||
        product.description[lang].toLowerCase().includes(q) ||
        product.description.en.toLowerCase().includes(q) ||
        product.sku.toLowerCase().includes(q) ||
        product.format.toLowerCase().includes(q) ||
        regionName.toLowerCase().includes(q) ||
        (product.regionId?.toLowerCase().includes(q) ?? false) ||
        (product.instructionLanguage?.toLowerCase().includes(q) ?? false) ||
        (product.curriculumYearLabel?.toLowerCase().includes(q) ?? false) ||
        (product.gradeBand?.toLowerCase().includes(q) ?? false) ||
        (product.subject?.toLowerCase().includes(q) ?? false) ||
        (product.examYear?.toLowerCase().includes(q) ?? false) ||
        (product.carBrand?.toLowerCase().includes(q) ?? false) ||
        (product.modelYear?.toLowerCase().includes(q) ?? false) ||
        (product.track?.toLowerCase().includes(q) ?? false)
      );
    });

    if (sortBy === 'price_asc') {
      return [...list].sort((a, b) => a.priceEtb - b.priceEtb);
    }
    if (sortBy === 'price_desc') {
      return [...list].sort((a, b) => b.priceEtb - a.priceEtb);
    }
    return list;
  }, [
    lang,
    searchQuery,
    selectedCategory,
    selectedRegion,
    selectedInstructionLang,
    selectedBookRole,
    selectedEdition,
    selectedGrade,
    selectedSubject,
    selectedExamYear,
    selectedAudience,
    selectedTrack,
    selectedCarBrand,
    selectedModelYear,
    selectedContentLang,
    sortBy,
  ]);

  const resolvedCartItems = useMemo(
    () =>
      cart
        .map((c) => ({ product: productsById[c.productId], quantity: c.quantity }))
        .filter((item) => Boolean(item.product)),
    [cart, productsById]
  );

  const subtotalEtb = useMemo(
    () => resolvedCartItems.reduce((sum, item) => sum + item.product.priceEtb * item.quantity, 0),
    [resolvedCartItems]
  );

  const discountPercent = getPromoDiscountPercent(appliedPromo);
  const discountEtb = Math.round((subtotalEtb * discountPercent) / 100);
  const totalEtb = Math.max(0, subtotalEtb - discountEtb);

  const handleAddToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev;
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const handleAddBundleToCart = (bundle: BundleDeal) => {
    setCart((prev) => {
      const next = [...prev];
      for (const pid of bundle.productIds) {
        if (!next.some((i) => i.productId === pid) && productsById[pid]) {
          next.push({ productId: pid, quantity: 1 });
        }
      }
      return next;
    });
    setAppliedPromo(bundle.discountPercent === 35 ? 'BUNDLE35' : 'BUNDLE30');
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleConfirmOrder = ({
    paymentMethod,
    refNumber,
    buyerContact,
    vipPlan,
    aiTool,
    cvStandard,
    legalDoc,
    legalConsult,
    linkDownload,
    pdfExport,
  }: {
    paymentMethod: PaymentMethod;
    refNumber: string;
    buyerContact?: string;
    vipPlan?: VipPlan | null;
    aiTool?: AiToolDefinition | null;
    cvStandard?: CvCountryStandard | null;
    legalDoc?: LegalDocTemplate | null;
    legalConsult?: {
      tier: LegalConsultTier;
      intake: { clientName: string; phone: string; branch: string; caseSummary: string };
    } | null;
    linkDownload?: PendingLinkDownload | null;
    pdfExport?: PendingPdfExport | null;
  }): PurchaseOrder => {
    const cleanRef = sanitizeUserInput(refNumber, 64);
    const cleanContact = buyerContact ? sanitizeUserInput(buyerContact, 80) : undefined;

    if (vipPlan) {
      const vipOrderId = `AV-VIP-${Date.now().toString().slice(-6)}`;
      const expiresAt = new Date(
        Date.now() + vipPlan.durationDays * 24 * 60 * 60 * 1000
      ).toISOString();
      const newVip: VipSubscription = {
        active: true,
        planId: vipPlan.id,
        orderId: vipOrderId,
        activatedAt: new Date().toISOString(),
        expiresAt,
        deviceId,
        refNumber: cleanRef,
        buyerContact: cleanContact,
      };
      setVipSubscription(newVip);

      const vipOrder: PurchaseOrder = {
        id: vipOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: vipPlan.id,
            sku: vipPlan.id.toUpperCase(),
            titleSnapshot: vipPlan.title[lang],
            category: 'education',
            priceEtb: vipPlan.priceEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: vipPlan.priceEtb,
        discountEtb: 0,
        totalEtb: vipPlan.priceEtb,
        buyerContact: cleanContact,
        deviceId,
        isVipOrder: true,
        vipPlanId: vipPlan.id,
        integritySig: computeIntegritySig(`${vipOrderId}:${vipPlan.priceEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [vipOrder, ...prev]);
      awardMemberActivity('purchase');
      return vipOrder;
    }

    if (aiTool) {
      const aiOrderId = `AV-AI-${Date.now().toString().slice(-6)}`;
      const aiOrder: PurchaseOrder = {
        id: aiOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: aiTool.id,
            sku: aiTool.id.toUpperCase(),
            titleSnapshot: aiTool.title[lang],
            category: 'business_ideas',
            priceEtb: aiTool.priceEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: aiTool.priceEtb,
        discountEtb: 0,
        totalEtb: aiTool.priceEtb,
        buyerContact: cleanContact,
        deviceId,
        aiToolId: aiTool.id,
        integritySig: computeIntegritySig(`${aiOrderId}:${aiTool.priceEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [aiOrder, ...prev]);
      awardMemberActivity('purchase');
      return aiOrder;
    }

    if (cvStandard) {
      const cvOrderId = `AV-CV-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        cvCountryId: cvStandard.id,
      });
      const cvOrder: PurchaseOrder = {
        id: cvOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: `cv-${cvStandard.id}`,
            sku: `CV-${cvStandard.id.toUpperCase()}`,
            titleSnapshot: `${cvStandard.countryName[lang]} — ${cvStandard.formatLabel[lang]}`,
            category: 'business_diaspora',
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        cvCountryId: cvStandard.id,
        integritySig: computeIntegritySig(`${cvOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [cvOrder, ...prev]);
      awardMemberActivity('purchase');
      return cvOrder;
    }

    if (legalDoc) {
      const legalOrderId = `AV-LAW-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        legalDocId: legalDoc.id,
      });
      const legalOrder: PurchaseOrder = {
        id: legalOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: legalDoc.id,
            sku: legalDoc.id.toUpperCase(),
            titleSnapshot: legalDoc.title[lang],
            category: 'law_academy',
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        legalDocId: legalDoc.id,
        integritySig: computeIntegritySig(`${legalOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [legalOrder, ...prev]);
      awardMemberActivity('purchase');
      return legalOrder;
    }

    if (legalConsult) {
      const consultOrderId = `AV-CONS-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        legalConsultTierId: legalConsult.tier.id,
      });
      const consultOrder: PurchaseOrder = {
        id: consultOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: legalConsult.tier.id,
            sku: legalConsult.tier.id.toUpperCase(),
            titleSnapshot: legalConsult.tier.title[lang],
            category: 'law_academy',
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact || legalConsult.intake.phone,
        deviceId,
        legalConsultTierId: legalConsult.tier.id,
        integritySig: computeIntegritySig(`${consultOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [consultOrder, ...prev]);

      const booking: LegalConsultationBooking = {
        id: consultOrderId,
        bookingCode: `AVLAW-${consultOrderId.slice(-6)}`,
        tierId: legalConsult.tier.id,
        tierTitle: legalConsult.tier.title[lang],
        priceEtb: verified.totalEtb,
        branch: legalConsult.intake.branch === 'criminal' ? 'criminal' : 'civil',
        clientName: sanitizeUserInput(legalConsult.intake.clientName, 80),
        phone: sanitizeUserInput(legalConsult.intake.phone, 24),
        caseSummary: sanitizeUserInput(legalConsult.intake.caseSummary, 1000),
        refNumber: cleanRef,
        paymentMethod,
        createdAt: new Date().toISOString(),
      };
      setConsultBookings((prev) => [booking, ...prev]);
      fetch('/api/superapp/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      }).catch(() => {
        // Saved locally in encrypted storage
      });
      awardMemberActivity('purchase');
      return consultOrder;
    }

    if (linkDownload) {
      const linkOrderId = `AV-LINK-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        linkFormatId: linkDownload.formatOption.id,
      });
      const linkOrder: PurchaseOrder = {
        id: linkOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: linkDownload.id,
            sku: linkDownload.formatOption.id.toUpperCase(),
            titleSnapshot: `${linkDownload.title} — ${linkDownload.formatOption.label[lang]}`,
            category: 'education',
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        linkDownloadId: linkDownload.id,
        linkDownloadPriceEtb: verified.totalEtb,
        integritySig: computeIntegritySig(`${linkOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [linkOrder, ...prev]);
      awardMemberActivity('purchase');
      return linkOrder;
    }

    if (pdfExport) {
      const pdfOrderId = `AV-PDF-${Date.now().toString().slice(-6)}`;
      const verified = verifyCheckoutAmount({
        cartItems: [],
        promoCode: null,
        pdfFormatId: pdfExport.formatOption.id,
      });
      const pdfOrder: PurchaseOrder = {
        id: pdfOrderId,
        refNumber: cleanRef,
        paymentMethod,
        items: [
          {
            productId: pdfExport.id,
            sku: pdfExport.formatOption.id.toUpperCase(),
            titleSnapshot: `${pdfExport.documentTitle} — ${pdfExport.formatOption.label[lang]}`,
            category: 'education',
            priceEtb: verified.totalEtb,
            quantity: 1,
          },
        ],
        subtotalEtb: verified.subtotalEtb,
        discountEtb: 0,
        totalEtb: verified.totalEtb,
        buyerContact: cleanContact,
        deviceId,
        pdfExportId: pdfExport.id,
        pdfExportPriceEtb: verified.totalEtb,
        integritySig: computeIntegritySig(`${pdfOrderId}:${verified.totalEtb}:${cleanRef}`),
        createdAt: new Date().toISOString(),
      };
      setOrders((prev) => [pdfOrder, ...prev]);
      awardMemberActivity('purchase');
      return pdfOrder;
    }

    const verifiedCart = verifyCheckoutAmount({
      cartItems: cart,
      promoCode: appliedPromo,
    });
    const orderId = `AV-${Date.now().toString().slice(-6)}`;
    const newOrder: PurchaseOrder = {
      id: orderId,
      refNumber: cleanRef,
      paymentMethod,
      items: resolvedCartItems.map(({ product, quantity }) => ({
        productId: product.id,
        sku: product.sku,
        titleSnapshot: product.title[lang],
        category: product.category,
        priceEtb: product.priceEtb,
        quantity,
      })),
      subtotalEtb: verifiedCart.subtotalEtb,
      discountEtb: verifiedCart.discountEtb,
      totalEtb: verifiedCart.totalEtb,
      promoCode: appliedPromo || undefined,
      buyerContact: cleanContact,
      deviceId,
      integritySig: computeIntegritySig(`${orderId}:${verifiedCart.totalEtb}:${cleanRef}`),
      createdAt: new Date().toISOString(),
    };

    if (appliedPromo && /^AV[A-Z0-9]{4,}$/.test(appliedPromo)) {
      setReferralCreditsEtb((prev) => prev + Math.round(verifiedCart.totalEtb * 0.15));
      awardMemberActivity('referral');
    }

    setOrders((prev) => [newOrder, ...prev]);
    setCart([]);
    setAppliedPromo(null);
    awardMemberActivity('purchase');
    return newOrder;
  };

  const handleInstallClick = async () => {
    if (canPromptNatively) {
      const result = await install();
      if (result === 'accepted') return;
    }
    setIsPWAModalOpen(true);
  };

  // Snapshot items shown in CheckoutModal even after cart clears upon confirmation
  const [checkoutSnapshotItems, setCheckoutSnapshotItems] = useState<
    { product: DigitalProduct; quantity: number }[]
  >([]);

  const clearPendingNonCartCheckout = () => {
    setPendingVipPlan(null);
    setPendingAiTool(null);
    setPendingCvStandard(null);
    setPendingLegalDoc(null);
    setPendingLegalConsult(null);
    setPendingLinkDownload(null);
    setPendingPdfExport(null);
  };

  const openCheckout = () => {
    clearPendingNonCartCheckout();
    setCheckoutSnapshotItems(resolvedCartItems);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleSelectVipPlanCheckout = (plan: VipPlan) => {
    clearPendingNonCartCheckout();
    setPendingVipPlan(plan);
    setCheckoutSnapshotItems([]);
    setIsVipModalOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleRequestAiToolCheckout = (tool: AiToolDefinition) => {
    clearPendingNonCartCheckout();
    setPendingAiTool(tool);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestCvCheckout = (standard: CvCountryStandard) => {
    clearPendingNonCartCheckout();
    setPendingCvStandard(standard);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestLegalDocCheckout = (doc: LegalDocTemplate) => {
    clearPendingNonCartCheckout();
    setPendingLegalDoc(doc);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestConsultCheckout = (
    tier: LegalConsultTier,
    intake: { clientName: string; phone: string; branch: string; caseSummary: string }
  ) => {
    clearPendingNonCartCheckout();
    setPendingLegalConsult({ tier, intake });
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestLinkCheckout = (item: PendingLinkDownload) => {
    clearPendingNonCartCheckout();
    setPendingLinkDownload(item);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handleRequestPdfCheckout = (item: PendingPdfExport) => {
    clearPendingNonCartCheckout();
    setPendingPdfExport(item);
    setCheckoutSnapshotItems([]);
    setIsCheckoutOpen(true);
  };

  const handlePostCommunityMessage = async (msg: CommunityChatMessage) => {
    setChatMessages((prev) => [msg, ...prev]);
    awardMemberActivity('chat');
    try {
      await fetch('/api/community/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msg),
      });
    } catch {
      // Saved locally
    }
  };

  const handleHelpfulCommunityMessage = (msgId: string) => {
    setChatMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, helpfulCount: m.helpfulCount + 1 } : m))
    );
    awardMemberActivity('chat');
  };

  const handleReportCommunityMessage = (msgId: string) => {
    setReportedMessageIds((prev) => (prev.includes(msgId) ? prev : [...prev, msgId]));
  };

  const handleBlockCommunityMember = (memberId: string) => {
    setBlockedMemberIds((prev) => (prev.includes(memberId) ? prev : [...prev, memberId]));
  };

  const handleClaimMonthlyReward = (rewardLabel: string) => {
    if (!currentMember) {
      setIsMemberAuthOpen(true);
      return;
    }
    setCurrentMember((prev) =>
      prev
        ? {
            ...prev,
            monthlyRewardClaimed: rewardLabel,
          }
        : prev
    );
    setReferralCreditsEtb((c) => c + 50);
    if (!vipActive) {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      setVipSubscription({
        active: true,
        planId: 'monthly',
        orderId: `REWARD-${currentMember.id}`,
        activatedAt: new Date().toISOString(),
        expiresAt,
        deviceId,
        refNumber: 'MONTHLY-REWARD',
        buyerContact: currentMember.contact,
      });
    }
  };

  const handleClearSessionData = () => {
    setCart([]);
    setSearchQuery('');
    handleSelectCategory('all');
    setAppliedPromo(null);
    try {
      localStorage.removeItem('addisvault_vault_tokens');
    } catch {
      // Ignore
    }
  };

  const handleRegisterWorker = async (worker: WorkerProfile) => {
    setWorkers((prev) => [worker, ...prev]);
    try {
      await fetch('/api/superapp/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worker),
      });
    } catch {
      // Persisted locally
    }
  };

  const handlePostJob = async (job: JobListing) => {
    setJobs((prev) => [job, ...prev]);
    try {
      await fetch('/api/superapp/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
    } catch {
      // Persisted locally
    }
  };

  const handleSubmitExpediterRequest = async (req: ExpediterRequest) => {
    setExpediterRequests((prev) => [req, ...prev]);
    try {
      await fetch('/api/superapp/expediter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      });
    } catch {
      // Persisted locally
    }
  };

  const handleUpdateExpediterRequest = async (
    id: string,
    patch: { status: ExpediterStatus; ownerReply?: string; quoteEtb?: number }
  ) => {
    setExpediterRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: patch.status,
              ownerReply: patch.ownerReply !== undefined ? patch.ownerReply : r.ownerReply,
              quoteEtb: patch.quoteEtb !== undefined ? patch.quoteEtb : r.quoteEtb,
              updatedAt: new Date().toISOString(),
            }
          : r
      )
    );
    try {
      await fetch(`/api/superapp/expediter/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
    } catch {
      // Persisted locally
    }
  };

  const handleBuyNowWithSnapshot = (productId: string) => {
    const product = productsById[productId];
    if (!product) return;
    const nextCart = cart.some((c) => c.productId === productId)
      ? cart
      : [...cart, { productId, quantity: 1 }];
    setCart(nextCart);
    clearPendingNonCartCheckout();
    setCheckoutSnapshotItems(
      nextCart
        .map((c) => ({ product: productsById[c.productId], quantity: c.quantity }))
        .filter((item) => Boolean(item.product))
    );
    setPreviewProduct(null);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 dark:bg-zinc-950 dark:text-stone-100">
      <Navbar
        lang={lang}
        onChangeLang={setLang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        cartCount={cartCount}
        downloadsCount={unlockedIds.size}
        onOpenCart={() => setIsCartOpen(true)}
        theme={theme}
        onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
        isInstalled={isInstalled}
        onInstallClick={handleInstallClick}
        currentMember={currentMember}
        onOpenMemberAuth={() => setIsMemberAuthOpen(true)}
      />

      <main className="flex-1 pb-20 lg:pb-12">
        {/* Global Token Security Alert Banner */}
        {tokenSecurityError && (
          <div className="border-b border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{t.vaultTokenErrorBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setTokenSecurityError(false)}
                aria-label={t.closeBtn}
                className="p-1 text-rose-700 hover:text-rose-900 dark:text-rose-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Friend Referral Applied Notification Banner */}
        {referralBannerVisible && appliedPromo && (
          <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
              <span>
                {t.referralAutoAppliedBanner} ({appliedPromo})
              </span>
              <button
                type="button"
                onClick={() => setReferralBannerVisible(false)}
                aria-label={t.closeBtn}
                className="p-1 text-emerald-700 hover:text-emerald-900 dark:text-emerald-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'marketplace' && (
          <>
            {/* Editorial Storefront Hero */}
            <section className="border-b border-stone-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/40">
              <div className="mx-auto grid max-w-7xl items-stretch gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-12 lg:gap-10 lg:py-14">
                <div className="flex flex-col justify-center lg:col-span-7">
                  <p className="text-xs font-semibold tracking-wide text-emerald-800 dark:text-emerald-400">
                    {t.heroPaymentNote}
                  </p>
                  <h1
                    className="mt-3 font-display text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12] dark:text-stone-50"
                    style={{ textWrap: 'balance' }}
                  >
                    {t.heroTitle}
                  </h1>
                  <p className="mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-stone-600 dark:text-stone-300">
                    {t.heroSubtitle}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <a
                      href="#catalog"
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
                    >
                      <span>{t.heroBrowseCta}</span>
                      <ArrowDown className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveTab('link_downloader')}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:border-emerald-600 hover:text-emerald-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <Link2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                      <span>{t.heroLinkToolCta}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVipModalOpen(true)}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-500/50 bg-amber-50/70 px-4 py-2.5 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/50"
                    >
                      <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <span>{vipActive ? t.vipActiveTitle : t.vipBtnLabel}</span>
                    </button>
                    {!isInstalled && (
                      <button
                        type="button"
                        onClick={handleInstallClick}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 transition-colors hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <Download className="h-4 w-4" />
                        <span>{t.installAppBtn}</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <div className="relative h-56 sm:h-72 lg:h-full min-h-[240px] w-full overflow-hidden rounded-2xl border border-stone-200 bg-zinc-900 dark:border-zinc-800">
                    <img
                      src={HERO_IMAGE}
                      alt={t.brandName}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-100">
                      <span className="font-mono font-semibold text-amber-300">
                        Telebirr 0925695197
                      </span>
                      <span className="font-mono font-semibold text-emerald-300">
                        CBE 1000211261513
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Top Banner Ad Slot (below Hero section) */}
            <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
              <AdSlot
                slot="top_banner"
                adConfig={adConfig}
                lang={lang}
                onTrackImpression={handleTrackAdImpression}
                onTrackClick={handleTrackAdClick}
              />
            </div>

            {/* Growth & Monetization Section: Refer & Earn 15%, VIP Pass, Value Bundles & Matric Mini-Quiz */}
            <GrowthSection
              lang={lang}
              referralCode={referralCode}
              referralCreditsEtb={referralCreditsEtb}
              productsById={productsById}
              onAddBundleToCart={handleAddBundleToCart}
              onOpenVipModal={() => setIsVipModalOpen(true)}
            />

            {/* Monthly Active User Reward Winner Banner */}
            <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300/70 bg-amber-50/70 px-5 py-3.5 dark:border-amber-700/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-display text-sm font-bold text-stone-900 dark:text-stone-100">
                      {t.monthlyRewardTitle}
                    </div>
                    <div className="text-xs text-stone-600 dark:text-stone-300">
                      {t.monthlyRewardWinnerBanner}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {!currentMember && (
                    <button
                      type="button"
                      onClick={() => setIsMemberAuthOpen(true)}
                      className="min-h-[38px] rounded-xl border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-bold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      {t.memberSignUpLoginBtn}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveTab('community')}
                    className="min-h-[38px] rounded-xl bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                  >
                    {t.navCommunity} →
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Search, Category Filter Tabs & Product Grid */}
            <section id="catalog" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* Search Input */}
                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(sanitizeUserInput(e.target.value, 120))}
                    placeholder={t.searchPlaceholder}
                    aria-label={t.searchPlaceholder}
                    className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-9 text-sm text-stone-900 placeholder:text-stone-400 focus:border-emerald-600 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      aria-label={t.clearFilters}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Results count + Request Missing File Action */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs font-medium text-stone-500 tabular-nums dark:text-stone-400">
                    <span className="font-mono font-bold text-stone-900 dark:text-stone-100">
                      {filteredProducts.length}
                    </span>{' '}
                    {t.resultsCount}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMissingFileOpen(true)}
                    className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl border border-emerald-700/30 bg-emerald-50/70 px-3.5 py-1.5 text-xs font-semibold text-emerald-900 transition-colors hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                  >
                    <FileQuestion className="h-3.5 w-3.5 shrink-0" />
                    <span>{t.requestMissingBtn}</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Tabs */}
              <div
                className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2"
                role="tablist"
                aria-label="Product Categories"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedCategory === 'all'}
                  onClick={() => handleSelectCategory('all')}
                  className={`min-h-[40px] rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {t.allCategories}
                </button>
                {CATEGORY_LIST.map((catId) => (
                  <button
                    key={catId}
                    type="button"
                    role="tab"
                    aria-selected={selectedCategory === catId}
                    onClick={() => handleSelectCategory(catId)}
                    className={`min-h-[40px] rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      selectedCategory === catId
                        ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                        : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {t.categories[catId]}
                  </button>
                ))}
              </div>

              {/* Multi-Regional Grades 1–12 Ethiopian Textbook Cascading Filter Bar */}
              {(selectedCategory === 'education' || selectedRegion !== 'all') && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-xs font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-300">
                      {t.regionalLibraryHeading}
                    </h2>
                    {(selectedRegion !== 'all' ||
                      selectedInstructionLang !== 'all' ||
                      selectedGrade !== 'all' ||
                      selectedBookRole !== 'all' ||
                      selectedSubject !== 'all' ||
                      selectedEdition !== 'all') && (
                      <button
                        type="button"
                        onClick={() => handleSelectCategory('education')}
                        className="text-xs font-semibold text-emerald-800 hover:underline dark:text-emerald-300"
                      >
                        {t.clearFilters}
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <span>{t.filterRegionLabel}</span>
                      <select
                        value={selectedRegion}
                        onChange={(e) => handleSelectRegion(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {ETHIOPIAN_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.id}>
                            {reg.name[lang]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <span>{t.filterInstructionLangLabel}</span>
                      <select
                        value={selectedInstructionLang}
                        onChange={(e) => setSelectedInstructionLang(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.instructionLanguages.map((langName) => (
                          <option key={langName} value={langName}>
                            {langName}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <span>{t.filterGradeLabel}</span>
                      <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.grades.map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <span>{t.filterBookRoleLabel}</span>
                      <select
                        value={selectedBookRole}
                        onChange={(e) => setSelectedBookRole(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        <option value="student_textbook">{t.studentBookOption}</option>
                        <option value="teachers_guide">{t.teachersGuideOption}</option>
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <span>{t.filterSubjectLabel}</span>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        {subFilterOptions.subjects.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="flex flex-col gap-1 text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                      <span>{t.filterEditionLabel}</span>
                      <select
                        value={selectedEdition}
                        onChange={(e) => setSelectedEdition(e.target.value)}
                        className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        <option value="all">{t.allOption}</option>
                        <option value="new_curriculum">{t.newCurriculumOption}</option>
                        <option value="previous_edition">{t.previousEditionOption}</option>
                      </select>
                    </label>
                  </div>
                </div>
              )}

              {/* Nested Sub-Filters (Grade, Subject, Exam Year, Track, Audience, Region Quick-Jump) + Price Sort */}
              <div className="mt-3 flex flex-wrap items-center gap-2.5">
                {selectedCategory === 'all' && selectedRegion === 'all' && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterRegionLabel}:</span>
                    <select
                      value={selectedRegion}
                      onChange={(e) => handleSelectRegion(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {ETHIOPIAN_REGIONS.map((reg) => (
                        <option key={reg.id} value={reg.id}>
                          {reg.name[lang]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {selectedCategory !== 'education' && subFilterOptions.grades.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterGradeLabel}:</span>
                    <select
                      value={selectedGrade}
                      onChange={(e) => setSelectedGrade(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.grades.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {selectedCategory !== 'education' && subFilterOptions.subjects.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterSubjectLabel}:</span>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subFilterOptions.years.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterYearLabel}:</span>
                    <select
                      value={selectedExamYear}
                      onChange={(e) => setSelectedExamYear(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subFilterOptions.tracks.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterTrackLabel}:</span>
                    <select
                      value={selectedTrack}
                      onChange={(e) => setSelectedTrack(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.tracks.map((tr) => (
                        <option key={tr} value={tr}>
                          {tr}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subFilterOptions.audiences.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterAudienceLabel}:</span>
                    <select
                      value={selectedAudience}
                      onChange={(e) => setSelectedAudience(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.audiences.map((aud) => (
                        <option key={aud} value={aud}>
                          {aud}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subFilterOptions.carBrands.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterCarBrandLabel}:</span>
                    <select
                      value={selectedCarBrand}
                      onChange={(e) => setSelectedCarBrand(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.carBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {subFilterOptions.modelYears.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                    <span>{t.filterModelYearLabel}:</span>
                    <select
                      value={selectedModelYear}
                      onChange={(e) => setSelectedModelYear(e.target.value)}
                      className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                    >
                      <option value="all">{t.allOption}</option>
                      {subFilterOptions.modelYears.map((yr) => (
                        <option key={yr} value={yr}>
                          {yr}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 dark:text-stone-400">
                  <span>{t.filterLanguageLabel}:</span>
                  <select
                    value={selectedContentLang}
                    onChange={(e) => setSelectedContentLang(e.target.value as Language | 'all')}
                    className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                  >
                    <option value="all">{t.allOption}</option>
                    {LANGUAGE_OPTIONS.map((opt) => (
                      <option key={opt.code} value={opt.code}>
                        {opt.nativeName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-center gap-1.5 text-xs font-medium text-stone-600 sm:ml-auto dark:text-stone-400">
                  <span>{t.sortLabel}:</span>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as 'featured' | 'price_asc' | 'price_desc')
                    }
                    className="h-9 rounded-lg border border-stone-200 bg-white px-2.5 text-xs font-semibold text-stone-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
                  >
                    <option value="featured">{t.sortFeatured}</option>
                    <option value="price_asc">{t.sortPriceLow}</option>
                    <option value="price_desc">{t.sortPriceHigh}</option>
                  </select>
                </label>
              </div>

              {/* Product Grid */}
              {filteredProducts.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-stone-200 bg-white px-6 py-14 text-center dark:border-zinc-800 dark:bg-zinc-900">
                  <h2 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
                    {t.noResultsTitle}
                  </h2>
                  <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-400">
                    {t.noResultsBody}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        handleSelectCategory('all');
                      }}
                      className="inline-flex min-h-[42px] items-center rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800 dark:bg-emerald-600"
                    >
                      {t.clearFilters}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMissingFileOpen(true)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-stone-100"
                    >
                      <FileQuestion className="h-3.5 w-3.5" />
                      <span>{t.requestMissingBtn}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product, index) => (
                    <Fragment key={product.id}>
                      <ProductCard
                        product={product}
                        lang={lang}
                        inCart={cartIds.has(product.id)}
                        isUnlocked={unlockedIds.has(product.id)}
                        onAddToCart={handleAddToCart}
                        onPreview={setPreviewProduct}
                        onDownloadFull={(prod) => handleOpenInVault(prod)}
                      />
                      {(index + 1) % 6 === 0 && (
                        <div className="col-span-full">
                          <AdSlot
                            slot="in_feed"
                            adConfig={adConfig}
                            lang={lang}
                            variantIndex={Math.floor((index + 1) / 6) - 1}
                            onTrackImpression={handleTrackAdImpression}
                            onTrackClick={handleTrackAdClick}
                          />
                        </div>
                      )}
                    </Fragment>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'ai_tools' && (
          <AiToolsSuiteView
            lang={lang}
            unlockedToolIds={unlockedAiToolIds}
            vipActive={vipActive}
            onRequestCheckout={handleRequestAiToolCheckout}
            onOpenVipModal={() => setIsVipModalOpen(true)}
            adConfig={adConfig}
            onTrackAdImpression={handleTrackAdImpression}
            onTrackAdClick={handleTrackAdClick}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsMarketplaceView
            lang={lang}
            workers={workers}
            jobs={jobs}
            onRegisterWorker={handleRegisterWorker}
            onPostJob={handlePostJob}
          />
        )}

        {activeTab === 'expediter' && (
          <ExpediterView
            lang={lang}
            requests={expediterRequests}
            onSubmitRequest={handleSubmitExpediterRequest}
          />
        )}

        {activeTab === 'link_downloader' && (
          <SmartLinkDownloaderView
            lang={lang}
            adConfig={adConfig}
            vipActive={vipActive}
            unlockedLinkIds={unlockedLinkIds}
            lastConfirmedLinkDownload={lastConfirmedLinkDownload}
            onConsumeConfirmedLinkDownload={() => setLastConfirmedLinkDownload(null)}
            onRequestCheckout={handleRequestLinkCheckout}
            onOpenVipModal={() => setIsVipModalOpen(true)}
            onTrackAdImpression={handleTrackAdImpression}
            onTrackAdClick={handleTrackAdClick}
          />
        )}

        {activeTab === 'downloads' && (
          <DownloadsView
            lang={lang}
            orders={orders}
            productsById={productsById}
            allProducts={PRODUCTS}
            vipSubscription={vipSubscription}
            onOpenInVault={(prod, ord) => handleOpenInVault(prod, ord)}
            onBrowseMarketplace={() => setActiveTab('marketplace')}
            onOpenVipModal={() => setIsVipModalOpen(true)}
            adConfig={adConfig}
            onTrackAdImpression={handleTrackAdImpression}
            onTrackAdClick={handleTrackAdClick}
          />
        )}

        {activeTab === 'cv_studio' && (
          <CvBuilderView
            lang={lang}
            unlockedCvCountryIds={unlockedCvCountryIds}
            vipActive={vipActive}
            onRequestCheckout={handleRequestCvCheckout}
            onOpenVipModal={() => setIsVipModalOpen(true)}
          />
        )}

        {activeTab === 'pdf_editor' && (
          <PdfEditorView
            lang={lang}
            vipActive={vipActive}
            unlockedPdfIds={unlockedPdfIds}
            lastConfirmedPdfExport={lastConfirmedPdfExport}
            onConsumeConfirmedPdfExport={() => setLastConfirmedPdfExport(null)}
            onRequestCheckout={handleRequestPdfCheckout}
            onOpenVipModal={() => setIsVipModalOpen(true)}
            onActivityPoint={(action) => awardMemberActivity(action)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityTrustView
            lang={lang}
            currentMember={currentMember}
            chatMessages={chatMessages}
            blockedMemberIds={blockedMemberIds}
            reportedMessageIds={reportedMessageIds}
            onOpenAuthModal={() => setIsMemberAuthOpen(true)}
            onPostMessage={handlePostCommunityMessage}
            onHelpfulMessage={handleHelpfulCommunityMessage}
            onReportMessage={handleReportCommunityMessage}
            onBlockMember={handleBlockCommunityMember}
            onClaimMonthlyReward={handleClaimMonthlyReward}
          />
        )}

        {activeTab === 'legal_suite' && (
          <LegalSuiteView
            lang={lang}
            unlockedLegalDocIds={unlockedLegalDocIds}
            unlockedConsultTierIds={unlockedConsultTierIds}
            consultBookings={consultBookings}
            vipActive={vipActive}
            onRequestDocCheckout={handleRequestLegalDocCheckout}
            onRequestConsultCheckout={handleRequestConsultCheckout}
            onOpenVipModal={() => setIsVipModalOpen(true)}
          />
        )}

        {activeTab === 'lawyers_hub' && (
          <LawyersHubView
            lang={lang}
            lawProducts={lawAcademyProducts}
            cartIds={cartIds}
            unlockedIds={unlockedIds}
            onAddToCart={handleAddToCart}
            onPreview={setPreviewProduct}
            onOpenVault={(prod) => handleOpenInVault(prod)}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            lang={lang}
            onChangeLang={setLang}
            theme={theme}
            onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
            fontScale={fontScale}
            onChangeFontScale={setFontScale}
            unlockedCount={unlockedIds.size}
            cartCount={cartCount}
            onClearSessionData={handleClearSessionData}
          />
        )}

        {activeTab === 'dashboard' && (
          <OwnerDashboardView
            lang={lang}
            orders={orders}
            adConfig={adConfig}
            onUpdateAdConfig={setAdConfig}
            expediterRequests={expediterRequests}
            consultBookings={consultBookings}
            onUpdateExpediterRequest={handleUpdateExpediterRequest}
            ownerProfile={ownerProfile}
            onUpdateOwnerProfile={setOwnerProfile}
          />
        )}

        {/* Footer Banner Slot (above footer & mobile bottom navigation bar) */}
        {activeTab !== 'dashboard' && (
          <div className="mx-auto max-w-7xl px-4 pt-2 pb-6 sm:px-6">
            <AdSlot
              slot="footer_banner"
              adConfig={adConfig}
              lang={lang}
              onTrackImpression={handleTrackAdImpression}
              onTrackClick={handleTrackAdClick}
            />
          </div>
        )}
      </main>

      {/* Footer with Direct 24/7 Owner Support Contacts */}
      <footer className="border-t border-stone-200 bg-white pb-20 lg:pb-6 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-xs text-stone-500 sm:px-6 dark:text-stone-400">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t.footerCopyright}</span>
            <span className="font-mono">{t.footerTrust}</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-4 dark:border-zinc-900">
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-semibold text-stone-700 dark:text-stone-300">
                {t.footerSupportLabel}
              </span>
              <a
                href={OWNER_SUPPORT_CONTACTS.telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-sky-700 hover:underline dark:text-sky-400"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Telegram ({OWNER_SUPPORT_CONTACTS.telegramUsername})</span>
              </a>
              <a
                href={OWNER_SUPPORT_CONTACTS.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-emerald-700 hover:underline dark:text-emerald-400"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp ({OWNER_SUPPORT_CONTACTS.whatsappDisplay})</span>
              </a>
              <a
                href={OWNER_SUPPORT_CONTACTS.emailUrl}
                className="inline-flex items-center gap-1.5 font-medium text-amber-800 hover:underline dark:text-amber-400"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>{OWNER_SUPPORT_CONTACTS.email}</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setIsVerifiedOwnerOpen(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.verifiedOwnerNavLabel}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsMissingFileOpen(true)}
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-800 hover:underline dark:text-emerald-400"
              >
                <FileQuestion className="h-3.5 w-3.5" />
                <span>{t.requestMissingBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        lang={lang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        downloadsCount={unlockedIds.size}
      />

      {/* Modals & Drawers */}
      <ProductModal
        product={previewProduct}
        lang={lang}
        isUnlocked={previewProduct ? unlockedIds.has(previewProduct.id) : false}
        inCart={previewProduct ? cartIds.has(previewProduct.id) : false}
        onClose={() => setPreviewProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNowWithSnapshot}
        onDownloadSample={(prod) => downloadProductFile(prod, 'sample', lang)}
        onDownloadFull={(prod) => handleOpenInVault(prod)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        lang={lang}
        cartItems={cart}
        productsById={productsById}
        appliedPromo={appliedPromo}
        onClose={() => setIsCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveFromCart}
        onApplyPromo={setAppliedPromo}
        onProceedCheckout={openCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        lang={lang}
        items={checkoutSnapshotItems}
        pendingVipPlan={pendingVipPlan}
        pendingAiTool={pendingAiTool}
        pendingCvStandard={pendingCvStandard}
        pendingLegalDoc={pendingLegalDoc}
        pendingLegalConsult={pendingLegalConsult}
        pendingLinkDownload={pendingLinkDownload}
        pendingPdfExport={pendingPdfExport}
        subtotalEtb={subtotalEtb}
        discountEtb={discountEtb}
        totalEtb={totalEtb}
        promoCode={appliedPromo}
        onClose={() => {
          setIsCheckoutOpen(false);
          clearPendingNonCartCheckout();
        }}
        onConfirmOrder={handleConfirmOrder}
        onOpenInVault={(prod, ord) => {
          setIsCheckoutOpen(false);
          clearPendingNonCartCheckout();
          handleOpenInVault(prod, ord);
        }}
        onGoToDownloads={() => setActiveTab('downloads')}
        onReturnToAiTool={() => setActiveTab('ai_tools')}
        onReturnToCvStudio={() => setActiveTab('cv_studio')}
        onReturnToLegalSuite={() => setActiveTab('legal_suite')}
        onReturnToLinkDownloader={(item) => {
          setLastConfirmedLinkDownload(item);
          setActiveTab('link_downloader');
        }}
        onReturnToPdfEditor={(item) => {
          setLastConfirmedPdfExport(item);
          setActiveTab('pdf_editor');
        }}
        adConfig={adConfig}
        onTrackAdImpression={handleTrackAdImpression}
        onTrackAdClick={handleTrackAdClick}
      />

      <VipPassModal
        isOpen={isVipModalOpen}
        lang={lang}
        vipSubscription={vipSubscription}
        onClose={() => setIsVipModalOpen(false)}
        onSelectPlan={handleSelectVipPlanCheckout}
      />

      <MissingFileModal
        isOpen={isMissingFileOpen}
        lang={lang}
        onClose={() => setIsMissingFileOpen(false)}
      />

      <MemberAuthModal
        isOpen={isMemberAuthOpen}
        lang={lang}
        currentMember={currentMember}
        ordersCount={orders.length}
        onClose={() => setIsMemberAuthOpen(false)}
        onAuthSuccess={(member) => setCurrentMember(member)}
        onLogout={() => setCurrentMember(null)}
      />

      <VerifiedOwnerModal
        isOpen={isVerifiedOwnerOpen}
        lang={lang}
        ownerProfile={ownerProfile}
        onClose={() => setIsVerifiedOwnerOpen(false)}
      />

      <SecureVaultReaderModal
        product={activeVaultSession?.product || null}
        order={activeVaultSession?.order || null}
        token={activeVaultSession?.token || null}
        lang={lang}
        onClose={() => setActiveVaultSession(null)}
        onRenewSession={(prod) => handleOpenInVault(prod)}
      />

      <PWAInstallModal
        isOpen={isPWAModalOpen}
        lang={lang}
        canPromptNatively={canPromptNatively}
        isIOS={isIOS}
        onPromptNative={handleInstallClick}
        onClose={() => setIsPWAModalOpen(false)}
      />

      <SupportWidget
        lang={lang}
        isHidden={isCheckoutOpen || Boolean(activeVaultSession)}
        onOpenMissingFile={() => setIsMissingFileOpen(true)}
        onOpenVerifiedOwner={() => setIsVerifiedOwnerOpen(true)}
      />

      <OfflineIndicator lang={lang} />
    </div>
  );
}
