import { DigitalProduct } from '../types';
import { CATALOG_EDUCATION_EXAMS } from './catalogEducationExams';
import { CATALOG_REGIONAL_TEXTBOOKS } from './catalogRegionalTextbooks';
import { CATALOG_LAW_ACADEMY } from './catalogLawAcademy';
import { CATALOG_SPECIALIZED } from './catalogSpecialized';
import { CATALOG_SUPER_APP } from './catalogSuperApp';

export const HERO_IMAGE = '/src/assets/images/hero_marketplace_studio_1794711378120.jpg';

export const PRODUCTS: DigitalProduct[] = [
  ...CATALOG_REGIONAL_TEXTBOOKS,
  ...CATALOG_EDUCATION_EXAMS,
  ...CATALOG_SPECIALIZED,
  ...CATALOG_SUPER_APP,
  ...CATALOG_LAW_ACADEMY,
];
