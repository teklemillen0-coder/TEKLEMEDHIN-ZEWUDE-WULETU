import React, { useMemo, useState } from 'react';
import { BookOpen, PlayCircle, Scale, ShieldCheck } from 'lucide-react';
import { DigitalProduct, Language } from '../types';
import { ProductCard } from './ProductCard';

interface LawyersHubViewProps {
  lang: Language;
  lawProducts: DigitalProduct[];
  cartIds: Set<string>;
  unlockedIds: Set<string>;
  onAddToCart: (productId: string) => void;
  onPreview: (product: DigitalProduct) => void;
  onOpenVault: (product: DigitalProduct) => void;
}

const SECTION_TABS = [
  'All',
  'Codes & Proclamations',
  'Cassation Decisions',
  'Reference Books',
  'Video Advocacy Courses',
] as const;

export const LawyersHubView: React.FC<LawyersHubViewProps> = ({
  lang,
  lawProducts,
  cartIds,
  unlockedIds,
  onAddToCart,
  onPreview,
  onOpenVault,
}) => {
  const [sectionFilter, setSectionFilter] = useState<(typeof SECTION_TABS)[number]>('All');

  const visibleProducts = useMemo(() => {
    if (sectionFilter === 'All') return lawProducts;
    return lawProducts.filter((p) => p.lawSection === sectionFilter);
  }, [lawProducts, sectionFilter]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-6 dark:border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
            <Scale className="h-4 w-4" />
            <span>Lawyers&apos; Professional Academy &amp; Legal Library · የጠበቆች ማዕከል</span>
          </div>
          <h1 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Ethiopian Codes, Cassation Bench Rulings &amp; Video Advocacy Courses
          </h1>
          <p className="mt-1.5 max-w-3xl text-sm text-stone-600 dark:text-stone-400">
            Curated digital reference library for advocates, judges, prosecutors, and law students—including Federal Supreme Court Cassation Volumes 1–25, Proclamation 1243/2021, Labor Proclamation 1156/2019, and 5-language video courtroom advocacy training.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-600 dark:text-stone-300">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>{lawProducts.length} Legal Resources</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <PlayCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span>5-Language Video Audio</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
            <span>Protected Vault Access</span>
          </span>
        </div>
      </div>

      {/* Sub-Section Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SECTION_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setSectionFilter(tab)}
            className={`min-h-[40px] rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
              sectionFilter === tab
                ? 'bg-emerald-700 text-white dark:bg-emerald-600'
                : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-stone-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            lang={lang}
            inCart={cartIds.has(product.id)}
            isUnlocked={unlockedIds.has(product.id)}
            onAddToCart={onAddToCart}
            onPreview={onPreview}
            onDownloadFull={onOpenVault}
          />
        ))}
      </div>
    </section>
  );
};
