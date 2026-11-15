import { AdConfig, DirectSponsorBanner } from '../types';

export const DEMO_SPONSOR_BANNERS: DirectSponsorBanner[] = [
  {
    id: 'demo-shebapay',
    title: 'ShebaExpress Courier — Same-Day Addis & Regional Delivery',
    subtitle: 'Reliable e-commerce parcel dispatch across Bole, Piassa, Hawassa, and Adama starting at 90 ETB.',
    ctaLabel: 'Book Dispatch',
    targetUrl: '#catalog',
    slot: 'top_banner',
    active: true,
    isDemo: true,
  },
  {
    id: 'demo-bunnacloud',
    title: 'BunnaCloud Ethiopia — Fast NVMe Hosting & .ET Domains',
    subtitle: 'Launch your business site with local Telebirr billing, free SSL, and 99.9% uptime support in Addis.',
    ctaLabel: 'View Plans',
    targetUrl: '#catalog',
    slot: 'in_feed',
    active: true,
    isDemo: true,
  },
  {
    id: 'demo-zemastudio',
    title: 'Zema Brand Studio — Packaging & Digital Product Mockups',
    subtitle: 'Custom Amharic & English brand identity kits for Ethiopian coffee roasters, shops, and creators.',
    ctaLabel: 'Explore Studio',
    targetUrl: '#catalog',
    slot: 'download_page',
    active: true,
    isDemo: true,
  },
  {
    id: 'demo-awashtech',
    title: 'Awash Tech Academy — Weekend Excel, Python & UI Bootcamps',
    subtitle: 'Practical career training in Addis Ababa & online. New cohort opens every first Monday.',
    ctaLabel: 'Learn More',
    targetUrl: '#catalog',
    slot: 'footer_banner',
    active: true,
    isDemo: true,
  },
];

export const DEFAULT_AD_CONFIG: AdConfig = {
  adsEnabled: true,
  showDemoBanners: true,
  activeSource: 'auto',
  enabledSlots: {
    top_banner: true,
    in_feed: true,
    download_page: true,
    footer_banner: true,
  },
  adsense: {
    publisherId: '',
    slotIds: {
      top_banner: '',
      in_feed: '',
      download_page: '',
      footer_banner: '',
    },
    unitCode: '',
  },
  thirdParty: {
    network: 'adsterra',
    bannerScript: '',
    nativeScript: '',
  },
  directSponsors: DEMO_SPONSOR_BANNERS,
  stats: {
    impressions: 0,
    clicks: 0,
  },
};
