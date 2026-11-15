import React from 'react';
import {
  Briefcase,
  Download,
  FileCheck2,
  FilePenLine,
  FileText,
  Globe,
  LayoutDashboard,
  Link2,
  Moon,
  PackageCheck,
  Scale,
  Settings,
  ShoppingBag,
  Sparkles,
  Store,
  Sun,
  User,
  Users,
} from 'lucide-react';
import { Language, MemberProfile, ViewTab } from '../types';
import { LANGUAGE_OPTIONS, UI_TRANSLATIONS } from '../i18n/translations';

interface NavbarProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  cartCount: number;
  downloadsCount: number;
  onOpenCart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isInstalled: boolean;
  onInstallClick: () => void;
  currentMember: MemberProfile | null;
  onOpenMemberAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onChangeLang,
  activeTab,
  onSelectTab,
  cartCount,
  downloadsCount,
  onOpenCart,
  theme,
  onToggleTheme,
  isInstalled,
  onInstallClick,
  currentMember,
  onOpenMemberAuth,
}) => {
  const t = UI_TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('marketplace')}
          className="flex items-center gap-2 text-left whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 rounded-lg py-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-amber-400 shadow-sm">
            <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M16 3L29 16L16 29L3 16L16 3Z" stroke="currentColor" strokeWidth="2.4" />
              <rect x="11" y="11" width="10" height="10" rx="1.5" stroke="#34D399" strokeWidth="2" />
              <circle cx="16" cy="16" r="2.2" fill="#FBBF24" />
            </svg>
          </span>
          <span className="font-display text-base sm:text-lg font-bold tracking-tight text-stone-900 dark:text-stone-100">
            {t.brandName}
          </span>
        </button>

        {/* Zone 2: Desktop Primary Navigation Links */}
        <nav
          className="hidden lg:flex items-center gap-3 xl:gap-4 overflow-x-auto no-scrollbar"
          aria-label="Primary Navigation"
        >
          <button
            type="button"
            onClick={() => onSelectTab('marketplace')}
            className={`py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'marketplace'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            {t.navMarketplace}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('cv_studio')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'cv_studio'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t.navCvStudio}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('pdf_editor')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'pdf_editor'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <FilePenLine className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t.navPdfEditor}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('legal_suite')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'legal_suite'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <Scale className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.navLegalSuite}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('lawyers_hub')}
            className={`py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'lawyers_hub'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            {t.navLawyersHub}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('ai_tools')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'ai_tools'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t.navAiTools}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('jobs')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'jobs'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>{t.navJobs}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('expediter')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'expediter'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>{t.navExpediter}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('community')}
            className={`inline-flex items-center gap-1 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTab === 'community'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            <Users className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>{t.navCommunity}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('downloads')}
            className={`py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 tabular-nums ${
              activeTab === 'downloads'
                ? 'border-emerald-600 text-emerald-700 dark:border-emerald-400 dark:text-emerald-400'
                : 'border-transparent text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100'
            }`}
          >
            {t.navDownloads}
            {downloadsCount > 0 ? ` (${downloadsCount})` : ''}
          </button>
        </nav>

        {/* Zone 3: Language Switcher, Link Tool, Settings, Owner, Theme, Cart, Install */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Prominent Language Switcher */}
          <div className="relative flex items-center">
            <Globe
              className="pointer-events-none absolute left-2 h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400"
              aria-hidden="true"
            />
            <select
              aria-label="Select Language"
              value={lang}
              onChange={(e) => onChangeLang(e.target.value as Language)}
              className="min-h-[36px] cursor-pointer appearance-none rounded-lg border border-stone-200 bg-stone-50 pl-6 pr-5 py-1 text-xs font-medium text-stone-800 transition-colors hover:border-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code}>
                  {opt.nativeName}
                </option>
              ))}
            </select>
          </div>

          {/* Link Tool compact desktop button */}
          <button
            type="button"
            onClick={() => onSelectTab('link_downloader')}
            title={t.navLinkDownloader}
            aria-label={t.navLinkDownloader}
            className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              activeTab === 'link_downloader'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
            }`}
          >
            <Link2 className="h-4 w-4" />
          </button>

          {/* Member Sign Up / Account Button */}
          <button
            type="button"
            onClick={onOpenMemberAuth}
            title={currentMember ? `${currentMember.fullName} (${currentMember.points} pts)` : t.memberSignUpLoginBtn}
            className={`flex min-h-[36px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
              currentMember
                ? 'border-emerald-600/40 bg-emerald-50 text-emerald-800 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
            }`}
          >
            <User className="h-3.5 w-3.5 shrink-0 text-emerald-700 dark:text-emerald-400" />
            <span className="hidden sm:inline max-w-[92px] truncate">
              {currentMember ? currentMember.fullName.split(' ')[0] : t.memberSignUpLoginBtn}
            </span>
          </button>

          {/* Settings compact button */}
          <button
            type="button"
            onClick={() => onSelectTab('settings')}
            title={t.navSettings}
            aria-label={t.navSettings}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              activeTab === 'settings'
                ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
            }`}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Owner Dashboard compact button */}
          <button
            type="button"
            onClick={() => onSelectTab('dashboard')}
            title={t.navDashboard}
            aria-label={t.navDashboard}
            className={`hidden lg:flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
              activeTab === 'dashboard'
                ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? t.lightModeLabel : t.darkModeLabel}
            title={theme === 'dark' ? t.lightModeLabel : t.darkModeLabel}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Cart Button */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={t.cartLabel}
            className="flex min-h-[36px] items-center gap-1 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:border-emerald-600 whitespace-nowrap shrink-0 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-100"
          >
            <ShoppingBag className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span className="tabular-nums font-mono text-xs font-semibold text-amber-700 dark:text-amber-400">
              {cartCount}
            </span>
          </button>

          {/* Prominent PWA Install App Button */}
          {!isInstalled && (
            <button
              type="button"
              onClick={onInstallClick}
              className="hidden sm:flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 whitespace-nowrap shrink-0 dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Download className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden xl:inline">{t.installAppBtn}</span>
              <span className="xl:hidden">App</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Utility Strip */}
      <div className="flex lg:hidden items-center gap-1.5 overflow-x-auto border-t border-stone-100 px-4 py-1.5 text-xs dark:border-zinc-900">
        <button
          type="button"
          onClick={() => onSelectTab('pdf_editor')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'pdf_editor'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <FilePenLine className="h-3 w-3" />
          <span>{t.navPdfEditor}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('community')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'community'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <Users className="h-3 w-3" />
          <span>{t.navCommunity}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('lawyers_hub')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'lawyers_hub'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <Scale className="h-3 w-3" />
          <span>{t.navLawyersHub}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('ai_tools')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'ai_tools'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <Sparkles className="h-3 w-3" />
          <span>{t.navAiTools}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('expediter')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'expediter'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <FileCheck2 className="h-3 w-3" />
          <span>{t.navExpediter}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('link_downloader')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'link_downloader'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <Link2 className="h-3 w-3" />
          <span>{t.navLinkDownloader}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('dashboard')}
          className={`inline-flex items-center gap-1 whitespace-nowrap rounded-lg px-2.5 py-1 font-semibold ${
            activeTab === 'dashboard'
              ? 'bg-emerald-700 text-white'
              : 'bg-stone-100 text-stone-700 dark:bg-zinc-900 dark:text-stone-300'
          }`}
        >
          <LayoutDashboard className="h-3 w-3" />
          <span>{t.navDashboard}</span>
        </button>
        {!isInstalled && (
          <button
            type="button"
            onClick={onInstallClick}
            className="sm:hidden ml-auto inline-flex items-center gap-1 whitespace-nowrap rounded-lg bg-emerald-700/10 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <Download className="h-3 w-3" />
            <span>App</span>
          </button>
        )}
      </div>
    </header>
  );
};

interface MobileBottomNavProps {
  lang: Language;
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  downloadsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  lang,
  activeTab,
  onSelectTab,
  downloadsCount,
}) => {
  const t = UI_TRANSLATIONS[lang];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-5 border-t border-stone-200 bg-white/95 backdrop-blur-md lg:hidden dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <button
        type="button"
        onClick={() => onSelectTab('marketplace')}
        className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
          activeTab === 'marketplace'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-stone-500 dark:text-stone-400'
        }`}
      >
        <Store className="h-5 w-5" />
        <span className="truncate max-w-full">{t.navMarketplace}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('cv_studio')}
        className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
          activeTab === 'cv_studio'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-stone-500 dark:text-stone-400'
        }`}
      >
        <FileText className="h-5 w-5" />
        <span className="truncate max-w-full">{t.navCvStudio}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('legal_suite')}
        className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
          activeTab === 'legal_suite'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-stone-500 dark:text-stone-400'
        }`}
      >
        <Scale className="h-5 w-5" />
        <span className="truncate max-w-full">{t.navLegalSuite}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('jobs')}
        className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
          activeTab === 'jobs'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-stone-500 dark:text-stone-400'
        }`}
      >
        <Briefcase className="h-5 w-5" />
        <span className="truncate max-w-full">{t.navJobs}</span>
      </button>

      <button
        type="button"
        onClick={() => onSelectTab('downloads')}
        className={`flex flex-col items-center justify-center gap-1 px-1 text-[10px] font-medium transition-colors ${
          activeTab === 'downloads'
            ? 'text-emerald-700 dark:text-emerald-400'
            : 'text-stone-500 dark:text-stone-400'
        }`}
      >
        <div className="relative">
          <PackageCheck className="h-5 w-5" />
          {downloadsCount > 0 && (
            <span className="absolute -right-2 -top-1 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
              {downloadsCount}
            </span>
          )}
        </div>
        <span className="truncate max-w-full">{t.navDownloads}</span>
      </button>
    </nav>
  );
};
