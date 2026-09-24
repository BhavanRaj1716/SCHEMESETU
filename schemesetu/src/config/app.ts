/**
 * SchemeSetu — Central Application Configuration
 * All product naming, URLs, and disclaimer text live here.
 * Rename the product by editing this file alone.
 */

export const APP_CONFIG = {
  name: 'SchemeSetu',
  tagline: 'Scheme Discovery & Financial Guidance',
  description:
    'Understand available NSFDC schemes, check your eligibility, estimate real repayment, and find a channel partner near you — then apply directly through the official PM-SURAJ portal.',
  version: '0.1.0',

  /** Official external links */
  urls: {
    pmSuraj: 'https://pmsuraj.dosje.gov.in/',
    nsfdc: 'https://nsfdc.nic.in/',
    nsfdcSchemes: 'https://nsfdc.nic.in/scheme',
    nsfdcEligibility: 'https://nsfdc.nic.in/eligibility-requirements',
    nsfdcPartners: 'https://nsfdc.nic.in/our-channel-partners',
  },

  /** Disclaimers — shown verbatim in the UI */
  disclaimers: {
    prototype:
      'Prototype — Smart India Hackathon 2026',
    notOfficial:
      'Student-developed prototype. Not an official Government of India website.',
    schemeTerms:
      'Scheme terms change periodically — always confirm current limits, rates, and eligibility on nsfdc.nic.in or the PM-SURAJ portal before applying.',
    noApproval:
      'Potentially suitable scheme — final eligibility and approval are subject to verification by the authorized agency via the official PM-SURAJ application.',
    emiDisclaimer:
      'Illustrative calculation only. Actual repayment terms are set by the applicable scheme and authorized channel partner.',
    partnerHealth:
      'Partner-level fund-health information is not available in the current verified dataset — this ranking uses simulated demo data, clearly labeled.',
    dataUnavailable:
      'Information currently unavailable — please verify with the official source.',
  },

  /** Data provenance */
  dataSource: {
    organization: 'NSFDC',
    url: 'https://nsfdc.nic.in/scheme',
    lastVerified: '2026-09-21',
  },

  /** Navigation items */
  nav: [
    { label: 'Home', href: '/' },
    { label: 'Find a Scheme', href: '/find' },
    { label: 'Scheme Directory', href: '/schemes' },
    { label: 'Financial Calculator', href: '/calculator' },
    { label: 'Partner Locator', href: '/partners' },
    { label: 'Help', href: '/help' },
  ],

  /**
   * PM-SURAJ digital application path rules.
   * VERIFY all figures on pmsuraj.dosje.gov.in before launch — these change.
   */
  digitalPath: {
    /** ₹15,00,000 — current PM-SURAJ digital processing cap [VERIFY before launch] */
    maxDigitalLoanAmount: 1500000,
    /** PM-SURAJ currently restricts digital applications to new businesses only */
    allowedForBusinessTypes: ['new'] as const,
    /** General NSFDC scheme age band — verify per scheme; some use 20–53 [VERIFY] */
    ageEligibilityMin: 18,
    ageEligibilityMax: 55,
  },

  /** Supported locales */
  locales: ['en', 'ta', 'hi'] as const,
  defaultLocale: 'en' as const,
} as const;

export type Locale = (typeof APP_CONFIG.locales)[number];
