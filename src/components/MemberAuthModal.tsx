import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  LogOut,
  ShieldCheck,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { ETHIOPIAN_REGIONS } from '../constants/educationRegions';
import { UI_TRANSLATIONS } from '../i18n/translations';
import { Language, MemberProfile, MemberRole } from '../types';
import { sanitizeUserInput } from '../utils/appSecurity';

interface MemberAuthModalProps {
  isOpen: boolean;
  lang: Language;
  currentMember: MemberProfile | null;
  ordersCount: number;
  onClose: () => void;
  onAuthSuccess: (member: MemberProfile) => void;
  onLogout: () => void;
}

const ROLES: MemberRole[] = ['Student', 'Professional', 'Business Owner', 'Lawyer', 'Artisan'];

export const MemberAuthModal: React.FC<MemberAuthModalProps> = ({
  isOpen,
  lang,
  currentMember,
  ordersCount,
  onClose,
  onAuthSuccess,
  onLogout,
}) => {
  const t = UI_TRANSLATIONS[lang];
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [fullName, setFullName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState('Addis Ababa');
  const [role, setRole] = useState<MemberRole>('Student');
  const [sharePhone, setSharePhone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const cleanContact = sanitizeUserInput(contact, 100).trim();
    const cleanPassword = sanitizeUserInput(password, 64).trim();
    const cleanName = sanitizeUserInput(fullName, 100).trim();

    if (mode === 'signup' && (!cleanName || !cleanContact || cleanPassword.length < 4)) {
      setErrorMsg('Please enter your name, phone/email, and a 4+ character PIN/password.');
      return;
    }
    if (mode === 'login' && (!cleanContact || !cleanPassword)) {
      setErrorMsg('Please enter your phone/email and PIN/password.');
      return;
    }

    setIsBusy(true);
    try {
      const endpoint =
        mode === 'signup' ? '/api/community/members/register' : '/api/community/members/login';
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: cleanName,
          contact: cleanContact,
          password: cleanPassword,
          region,
          role,
          sharePhone,
        }),
      });
      const data = (await resp.json()) as {
        ok?: boolean;
        member?: MemberProfile;
        error?: string;
      };
      if (!resp.ok || !data.member) {
        if (resp.status === 409 || resp.status === 401) {
          setErrorMsg(data.error || 'Authentication error');
          return;
        }
        // Fallback offline/local registration when server not reachable
        if (mode === 'signup') {
          const fallbackMember: MemberProfile = {
            id: `AV-MBR-${Math.floor(1000 + Math.random() * 8999)}`,
            fullName: cleanName,
            contact: cleanContact,
            region,
            role,
            sharePhone,
            verifiedBuyer: ordersCount > 0,
            points: 20 + ordersCount * 100,
            downloadsCount: 0,
            purchasesCount: ordersCount,
            referralsCount: 0,
            helpfulChatsCount: 0,
            joinedAt: new Date().toISOString(),
          };
          onAuthSuccess(fallbackMember);
          onClose();
          return;
        }
        setErrorMsg(data.error || 'Could not sign in.');
        return;
      }

      const hydratedMember: MemberProfile = {
        ...data.member,
        verifiedBuyer: data.member.verifiedBuyer || ordersCount > 0,
        purchasesCount: Math.max(data.member.purchasesCount || 0, ordersCount),
      };
      onAuthSuccess(hydratedMember);
      onClose();
    } catch {
      if (mode === 'signup') {
        const localMember: MemberProfile = {
          id: `AV-MBR-${Math.floor(1000 + Math.random() * 8999)}`,
          fullName: cleanName,
          contact: cleanContact,
          region,
          role,
          sharePhone,
          verifiedBuyer: ordersCount > 0,
          points: 20 + ordersCount * 100,
          downloadsCount: 0,
          purchasesCount: ordersCount,
          referralsCount: 0,
          helpfulChatsCount: 0,
          joinedAt: new Date().toISOString(),
        };
        onAuthSuccess(localMember);
        onClose();
      } else {
        setErrorMsg('Network error. Try creating a local account on this device.');
      }
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-auth-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4 dark:border-zinc-800">
          <h2 id="member-auth-title" className="font-display text-base font-bold text-stone-900 dark:text-stone-100">
            {t.memberModalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.closeBtn}
            className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {currentMember ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {currentMember.id}
                  </span>
                  {(currentMember.verifiedBuyer || ordersCount > 0) && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t.memberVerifiedBuyer}</span>
                    </span>
                  )}
                </div>
                <div className="mt-1.5 font-display text-lg font-extrabold text-stone-900 dark:text-stone-100">
                  {currentMember.fullName}
                </div>
                <div className="text-xs text-stone-600 dark:text-stone-400">
                  {currentMember.role} · {currentMember.region}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                    Activity Points
                  </div>
                  <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-400">
                    {currentMember.points}
                  </div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 dark:border-zinc-800 dark:bg-zinc-900">
                  <div className="text-[11px] font-medium text-stone-500 dark:text-stone-400">
                    Verified Purchases
                  </div>
                  <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-amber-700 dark:text-amber-400">
                    {Math.max(currentMember.purchasesCount, ordersCount)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-stone-200 p-3 text-xs text-stone-600 dark:border-zinc-800 dark:text-stone-400">
                <Award className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Logins (+10), Downloads (+25), Purchases (+100), Referrals (+75), Helpful Chats (+15) count toward Monthly Rewards.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                <LogOut className="h-4 w-4" />
                <span>{t.memberLogoutBtn}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tab Switcher */}
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                    mode === 'signup'
                      ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-800 dark:text-stone-100'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>{t.memberSignUpTab}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-colors ${
                    mode === 'login'
                      ? 'bg-white text-stone-900 shadow-sm dark:bg-zinc-800 dark:text-stone-100'
                      : 'text-stone-600 dark:text-stone-400'
                  }`}
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>{t.memberLoginTab}</span>
                </button>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {t.memberFullNameLabel}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t.memberContactLabel}
                </label>
                <input
                  type="text"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="09XXXXXXXX or email@example.com"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                  {t.memberPasswordLabel}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 4 characters"
                  className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 text-xs dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                />
              </div>

              {mode === 'signup' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {t.memberRegionLabel}
                      </label>
                      <select
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        {ETHIOPIAN_REGIONS.map((reg) => (
                          <option key={reg.id} value={reg.shortTag}>
                            {reg.shortTag}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                        {t.memberRoleLabel}
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as MemberRole)}
                        className="mt-1 h-10 w-full rounded-xl border border-stone-200 bg-stone-50 px-2.5 text-xs font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-stone-100"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300">
                    <input
                      type="checkbox"
                      checked={sharePhone}
                      onChange={(e) => setSharePhone(e.target.checked)}
                      className="mt-0.5 rounded border-stone-300 text-emerald-700"
                    />
                    <span>{t.memberSharePhoneLabel}</span>
                  </label>
                </>
              )}

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isBusy}
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 dark:bg-emerald-600"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{mode === 'signup' ? t.memberCreateAccountBtn : t.memberLoginBtn}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
