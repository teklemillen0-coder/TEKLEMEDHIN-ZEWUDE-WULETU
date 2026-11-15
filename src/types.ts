export type Language = 'en' | 'am' | 'om' | 'ti' | 'so';

export type CategoryId =
  | 'education'
  | 'national_exams'
  | 'video_arts'
  | 'culinary'
  | 'medical'
  | 'research_history'
  | 'business_diaspora'
  | 'childrens_books'
  | 'gov_manuals'
  | 'repair_kits'
  | 'livestock'
  | 'business_ideas'
  | 'taxpayer_ed'
  | 'electronics_manuals'
  | 'architecture_plans'
  | 'auto_mechanic'
  | 'law_academy';

export type PaymentMethod = 'telebirr' | 'cbe';

export type ViewTab =
  | 'marketplace'
  | 'cv_studio'
  | 'pdf_editor'
  | 'legal_suite'
  | 'lawyers_hub'
  | 'ai_tools'
  | 'jobs'
  | 'expediter'
  | 'link_downloader'
  | 'community'
  | 'downloads'
  | 'settings'
  | 'dashboard';

export type AppFontScale = 'sm' | 'base' | 'lg' | 'xl';

export type CvCountryId = 'ethiopia' | 'uae' | 'eu_uk' | 'germany' | 'usa_canada' | 'australia';

export interface CvCountryStandard {
  id: CvCountryId;
  priceEtb: number;
  flagCode: string;
  countryName: LocalizedText;
  formatLabel: LocalizedText;
  requiresPhoto: boolean;
  requiresVisaInfo: boolean;
  requiresSignatureBlock: boolean;
  maxPagesLabel: string;
  rules: Record<Language, string[]>;
  writingGuide: Record<Language, string[]>;
}

export type LegalBranch = 'civil' | 'criminal';

export interface LegalDocTemplate {
  id: string;
  branch: LegalBranch;
  priceEtb: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  courtLevel: string;
  defaultFactsPlaceholder: string;
  defaultReliefPlaceholder: string;
  legalBasisHint: string;
}

export interface LegalConsultTier {
  id: string;
  priceEtb: number;
  durationLabel: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  deliverables: Record<Language, string[]>;
}

export interface LegalConsultationBooking {
  id: string;
  bookingCode: string;
  tierId: string;
  tierTitle: string;
  priceEtb: number;
  branch: string;
  clientName: string;
  phone: string;
  caseSummary: string;
  refNumber: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export type LocalizedText = Record<Language, string>;

export type EthiopianRegionId =
  | 'federal_addis'
  | 'oromia'
  | 'amhara'
  | 'tigray'
  | 'somali'
  | 'sidama_south'
  | 'harari_diredawa'
  | 'afar_bg_gambella';

export type GradeBand =
  | 'Grade 1'
  | 'Grade 2'
  | 'Grade 3'
  | 'Grade 4'
  | 'Grade 5'
  | 'Grade 6'
  | 'Grade 7'
  | 'Grade 8'
  | 'Grade 9'
  | 'Grade 10'
  | 'Grade 11'
  | 'Grade 12'
  | 'G1-4'
  | 'G5-6'
  | 'G7-8'
  | 'G9-10'
  | 'G11-12'
  | 'University';

export interface DigitalProduct {
  id: string;
  sku: string;
  category: CategoryId;
  priceEtb: number;
  format: string;
  fileSize: string;
  fileExtension: string;
  coverImage: string;
  accentPattern: 'diamond' | 'lattice' | 'horizon' | 'prism' | 'weave' | 'arch';
  gradeBand?: GradeBand;
  subject?: string;
  examYear?: string;
  audience?: 'Doctors & Students' | 'Patients & Families';
  track?: 'Grade Tutoring' | 'Fine Arts' | 'Handicrafts';
  lawSection?: 'Codes & Proclamations' | 'Cassation Decisions' | 'Reference Books' | 'Video Advocacy Courses';
  regionId?: EthiopianRegionId;
  instructionLanguage?: string;
  bookRole?: 'Student Textbook' | "Teacher's Guide";
  curriculumEdition?: 'New Curriculum' | 'Previous Edition';
  curriculumYearLabel?: string;
  carBrand?: string;
  modelYear?: string;
  availableLanguages?: Language[];
  hasVideoPreview?: boolean;
  videoChapters?: string[];
  title: LocalizedText;
  description: LocalizedText;
  highlights: Record<Language, string[]>;
  sampleExcerpt: LocalizedText;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItemSnapshot {
  productId: string;
  sku: string;
  titleSnapshot: string;
  category: CategoryId;
  priceEtb: number;
  quantity: number;
}

export interface PurchaseOrder {
  id: string;
  refNumber: string;
  paymentMethod: PaymentMethod;
  items: OrderItemSnapshot[];
  subtotalEtb: number;
  discountEtb: number;
  totalEtb: number;
  promoCode?: string;
  buyerContact?: string;
  deviceId?: string;
  isVipOrder?: boolean;
  vipPlanId?: 'monthly' | 'annual';
  aiToolId?: string;
  cvCountryId?: CvCountryId;
  legalDocId?: string;
  legalConsultTierId?: string;
  linkDownloadId?: string;
  linkDownloadPriceEtb?: number;
  pdfExportId?: string;
  pdfExportPriceEtb?: number;
  integritySig?: string;
  createdAt: string;
}

export type LinkPlatformId =
  | 'youtube'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'twitter'
  | 'pdf'
  | 'document'
  | 'archive'
  | 'audio'
  | 'webpage';

export interface LinkFormatOption {
  id: string;
  label: LocalizedText;
  qualityNote: string;
  fileExt: string;
  priceEtb: number;
  mode: 'raw' | 'reader' | 'media';
}

export interface PendingLinkDownload {
  id: string;
  url: string;
  platform: LinkPlatformId;
  platformName: string;
  title: string;
  formatOption: LinkFormatOption;
}

export interface VipPlan {
  id: 'monthly' | 'annual';
  originalPriceEtb?: number;
  priceEtb: number;
  durationDays: number;
  title: LocalizedText;
  subtitle: LocalizedText;
  badge: LocalizedText;
}

export interface VipSubscription {
  active: boolean;
  planId: 'monthly' | 'annual';
  orderId: string;
  refNumber: string;
  buyerContact?: string;
  deviceId: string;
  activatedAt: string;
  expiresAt: string;
}

export interface BundleDeal {
  id: string;
  discountPercent: number;
  productIds: string[];
  promoCode: string;
  title: LocalizedText;
  subtitle: LocalizedText;
}

export interface QuizQuestion {
  id: string;
  subject: string;
  question: LocalizedText;
  options: Record<Language, string[]>;
  correctIndex: number;
  explanation: LocalizedText;
}

export interface VaultAccessToken {
  tokenId: string;
  productId: string;
  orderId: string;
  deviceId: string;
  buyerLabel: string;
  issuedAt: number;
  expiresAt: number;
  consumed: boolean;
  signature?: string;
}

export type AdSlotId = 'top_banner' | 'in_feed' | 'download_page' | 'footer_banner';

export type ThirdPartyNetwork = 'adsterra' | 'monetag' | 'popads';

export type ActiveAdSource = 'auto' | 'adsense' | 'third_party' | 'direct_sponsor';

export interface DirectSponsorBanner {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  targetUrl: string;
  imageDataUrl?: string;
  slot: AdSlotId | 'all';
  active: boolean;
  isDemo?: boolean;
}

export interface AdConfig {
  adsEnabled: boolean;
  showDemoBanners: boolean;
  activeSource: ActiveAdSource;
  enabledSlots: Record<AdSlotId, boolean>;
  adsense: {
    publisherId: string;
    slotIds: Record<AdSlotId, string>;
    unitCode: string;
  };
  thirdParty: {
    network: ThirdPartyNetwork;
    bannerScript: string;
    nativeScript: string;
  };
  directSponsors: DirectSponsorBanner[];
  stats: {
    impressions: number;
    clicks: number;
  };
}

export interface LinkDownloadHistoryItem {
  id: string;
  url: string;
  filename: string;
  fileKind: string;
  downloadedAt: string;
}

export interface AiToolField {
  key: string;
  label: LocalizedText;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'select';
  options?: string[];
  defaultValue?: string;
}

export interface AiToolDefinition {
  id: string;
  priceEtb: number;
  categoryTag: LocalizedText;
  title: LocalizedText;
  description: LocalizedText;
  supportsFileUpload: boolean;
  fields: AiToolField[];
  systemInstruction: string;
}

export type WorkerSkillCategory =
  | 'housemaid'
  | 'plumber'
  | 'gypsum'
  | 'electrician'
  | 'tutor'
  | 'driver'
  | 'skilled_labor';

export interface WorkerProfile {
  id: string;
  fullName: string;
  skillCategory: WorkerSkillCategory;
  experienceYears: string;
  location: string;
  phone: string;
  bio: string;
  createdAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  category: WorkerSkillCategory;
  location: string;
  salaryOffer: string;
  requirements: string;
  employerName: string;
  contactPhone: string;
  createdAt: string;
}

export type ExpediterStatus = 'Pending' | 'In Progress' | 'Quoted' | 'Completed';

export interface ExpediterRequest {
  id: string;
  trackingCode: string;
  clientName: string;
  phone: string;
  serviceNeeded: string;
  location: string;
  details: string;
  status: ExpediterStatus;
  ownerReply?: string;
  quoteEtb?: number;
  createdAt: string;
  updatedAt: string;
}

export type PdfExportFormatId = 'pdf_clean' | 'word_editable' | 'png_highres' | 'all_bundle';

export interface PdfExportFormatOption {
  id: PdfExportFormatId;
  fileExt: string;
  priceEtb: number;
  label: LocalizedText;
  description: LocalizedText;
}

export interface PendingPdfExport {
  id: string;
  documentTitle: string;
  formatOption: PdfExportFormatOption;
}

export type MemberRole = 'Student' | 'Professional' | 'Business Owner' | 'Lawyer' | 'Artisan';

export interface MemberProfile {
  id: string;
  fullName: string;
  contact: string;
  region: string;
  role: MemberRole;
  sharePhone: boolean;
  verifiedBuyer: boolean;
  points: number;
  downloadsCount: number;
  purchasesCount: number;
  referralsCount: number;
  helpfulChatsCount: number;
  joinedAt: string;
  monthlyRewardClaimed?: string;
}

export type ChatRoomFilter = 'all' | 'trust' | 'exams' | 'careers';

export interface CommunityChatMessage {
  id: string;
  memberId: string;
  authorName: string;
  authorRegion: string;
  authorRole: MemberRole;
  verifiedBuyer: boolean;
  room: 'trust' | 'exams' | 'careers';
  message: string;
  optionalPhone?: string;
  helpfulCount: number;
  reportedBy?: string[];
  createdAt: string;
}

export interface OwnerTrustProfile {
  fullName: string;
  roleTitle: LocalizedText;
  photoUrl: string;
  welcomeBio: LocalizedText;
  faydaStatement: LocalizedText;
  faydaMaskedCode: string;
  cityCountry: string;
}

