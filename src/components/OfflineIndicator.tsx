import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../types';
import { UI_TRANSLATIONS } from '../i18n/translations';

interface OfflineIndicatorProps {
  lang: Language;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ lang }) => {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  const t = UI_TRANSLATIONS[lang];

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 sm:right-auto sm:bottom-5 z-40 flex items-center gap-2 rounded-xl border border-amber-400/50 bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg"
    >
      <WifiOff className="h-4 w-4 shrink-0" />
      <span>{t.offlineBanner}</span>
    </div>
  );
};
