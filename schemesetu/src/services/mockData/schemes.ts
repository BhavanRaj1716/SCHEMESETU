/**
 * VERIFIED SCHEME DATA — NSFDC Concessional Credit Schemes
 *
 * Source: nsfdc.nic.in/scheme
 * Last verified: 2026-09-21
 *
 * ⚠️  Every figure here must match the official NSFDC website.
 *     Do NOT invent, round, or approximate any number.
 *     If a figure cannot be verified, use null and display the
 *     "Information currently unavailable" disclaimer.
 */

import type { Scheme } from '@/types/scheme';

export const VERIFIED_SCHEMES: Scheme[] = [
  {
    id: 'mfs',
    name: 'Micro Finance Scheme',
    shortName: 'MFS',
    category: 'Micro Enterprise',
    purpose: 'Small/micro business activities with project cost up to ₹1.40 lakh',
    description:
      'Provides prompt, need-based credit for small and micro income-generating business activities for members of Scheduled Castes living below Double the Poverty Line. Covers activities such as petty trade, small shops, tailoring, repair services, and other self-employment ventures. Loans are disbursed through State Channelizing Agencies (SCAs), Public Sector Banks, and Regional Rural Banks.',
    eligibility: [
      {
        criterion: 'Caste Category',
        description: 'Must belong to Scheduled Caste (SC) community with a valid caste certificate issued by competent authority',
        field: 'category',
        value: 'SC',
      },
      {
        criterion: 'Annual Family Income',
        description: 'Annual family income must not exceed ₹5,00,000 (Double the Poverty Line)',
        field: 'annualFamilyIncome',
        value: 500000,
      },
      {
        criterion: 'Project Cost',
        description: 'Total project cost must be up to ₹1,40,000',
        field: 'estimatedProjectCost',
        value: 140000,
      },
    ],
    financialDetails: {
      maxLoanAmount: 125000,
      maxProjectCost: 140000,
      interestRate: 6.5,
      repaymentPeriod: '3 years, quarterly instalments',
      repaymentPeriodMonths: 36,
      moratorium: '3 months',
      moratoriumMonths: 3,
      coverage: '90% of project cost',
      interestDuringMoratorium: null,
    },
    requiredDocuments: [
      'Scheduled Caste certificate issued by competent authority',
      'Income certificate (annual family income ≤ ₹5,00,000)',
      'Identity proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address proof',
      'Project report / business plan',
      'Bank account details',
      'Passport-size photographs',
    ],
    officialSource: {
      organization: 'NSFDC',
      url: 'https://nsfdc.nic.in/scheme',
      lastVerified: '2026-09-21',
    },
    channelPartnerTypes: [
      'State Channelizing Agencies (SCAs)',
      'Public Sector Banks (PSBs)',
      'Regional Rural Banks (RRBs)',
    ],
  },
  {
    id: 'term-loan',
    name: 'Term Loan Scheme',
    shortName: 'Term Loan',
    category: 'Enterprise Finance',
    purpose: 'Larger income-generating activities with project cost from ₹1.40 lakh to ₹50 lakh',
    description:
      'Financial assistance for income-generating activities where the project cost exceeds the Micro Finance Scheme ceiling. Covers manufacturing, services, agriculture, transport, and allied activities. Suitable for setting up workshops, buying machinery, commercial vehicles, and other capital-intensive ventures. Loans are disbursed through State Channelizing Agencies (SCAs), Public Sector Banks, RRBs, and SIDBI.',
    eligibility: [
      {
        criterion: 'Caste Category',
        description: 'Must belong to Scheduled Caste (SC) community with a valid caste certificate issued by competent authority',
        field: 'category',
        value: 'SC',
      },
      {
        criterion: 'Annual Family Income',
        description: 'Annual family income must not exceed ₹5,00,000',
        field: 'annualFamilyIncome',
        value: 500000,
      },
      {
        criterion: 'Project Cost',
        description: 'Total project cost must be between ₹1,40,000 and ₹50,00,000',
        field: 'estimatedProjectCost',
        value: '140000-5000000',
      },
    ],
    financialDetails: {
      maxLoanAmount: 4500000,
      maxProjectCost: 5000000,
      interestRate: 8,
      repaymentPeriod: '7 years, quarterly instalments',
      repaymentPeriodMonths: 84,
      moratorium: '6 months (12 months for plantation/construction projects)',
      moratoriumMonths: 6,
      moratoriumNote: '12 months for plantation/construction projects',
      coverage: '90% of project cost',
      interestDuringMoratorium: null,
    },
    requiredDocuments: [
      'Scheduled Caste certificate issued by competent authority',
      'Income certificate (annual family income ≤ ₹5,00,000)',
      'Identity proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address proof',
      'Detailed project report',
      'Quotations for machinery/equipment (if applicable)',
      'Bank account details',
      'Passport-size photographs',
      'Collateral/security documents (as per SCA requirements)',
    ],
    officialSource: {
      organization: 'NSFDC',
      url: 'https://nsfdc.nic.in/scheme',
      lastVerified: '2026-09-21',
    },
    channelPartnerTypes: [
      'State Channelizing Agencies (SCAs)',
      'Public Sector Banks (PSBs)',
      'Regional Rural Banks (RRBs)',
      'Other Agencies & SIDBI',
    ],
  },
  {
    id: 'aajeevika',
    name: 'Aajeevika Micro-Finance Yojana',
    shortName: 'Aajeevika MFY',
    category: 'Micro Enterprise',
    purpose: 'Small/micro business activities via NBFC-MFIs with project cost up to ₹1.40 lakh',
    description:
      'Micro-finance scheme channeled exclusively through NBFC-MFIs (Non-Banking Financial Company – Micro Finance Institutions) for small and micro income-generating activities. Designed to reach SC beneficiaries in areas where traditional SCA coverage is limited, particularly in rural and semi-urban regions. Covers petty trade, animal husbandry, handicrafts, and other micro-enterprises.',
    eligibility: [
      {
        criterion: 'Caste Category',
        description: 'Must belong to Scheduled Caste (SC) community with a valid caste certificate issued by competent authority',
        field: 'category',
        value: 'SC',
      },
      {
        criterion: 'Annual Family Income',
        description: 'Annual family income must not exceed ₹5,00,000',
        field: 'annualFamilyIncome',
        value: 500000,
      },
      {
        criterion: 'Project Cost',
        description: 'Total project cost must be up to ₹1,40,000',
        field: 'estimatedProjectCost',
        value: 140000,
      },
    ],
    financialDetails: {
      maxLoanAmount: 125000,
      maxProjectCost: 140000,
      interestRate: 15,
      repaymentPeriod: '3 years, quarterly instalments',
      repaymentPeriodMonths: 36,
      moratorium: '3 months',
      moratoriumMonths: 3,
      coverage: '90% of project cost',
      interestDuringMoratorium: null,
    },
    requiredDocuments: [
      'Scheduled Caste certificate issued by competent authority',
      'Income certificate (annual family income ≤ ₹5,00,000)',
      'Identity proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address proof',
      'Business activity details',
      'Bank account details',
      'Passport-size photographs',
    ],
    officialSource: {
      organization: 'NSFDC',
      url: 'https://nsfdc.nic.in/scheme',
      lastVerified: '2026-09-21',
    },
    channelPartnerTypes: ['NBFC–Micro Finance Institutions (NBFC-MFIs)'],
  },
  {
    id: 'udyam-nidhi',
    name: 'Udyam Nidhi Yojana',
    shortName: 'Udyam Nidhi',
    category: 'Enterprise Finance',
    purpose: 'Business activities via Cooperative Societies/Banks/SFBs with project cost up to ₹5 lakh',
    description:
      'Enterprise finance scheme channeled through Cooperative Societies, Cooperative Banks, and Small Finance Banks (SFBs). Provides credit for income-generating activities including small manufacturing, service enterprises, and trade. Offers a higher project cost ceiling than micro-finance schemes and is accessible through cooperative banking channels across India.',
    eligibility: [
      {
        criterion: 'Caste Category',
        description: 'Must belong to Scheduled Caste (SC) community with a valid caste certificate issued by competent authority',
        field: 'category',
        value: 'SC',
      },
      {
        criterion: 'Annual Family Income',
        description: 'Annual family income must not exceed ₹5,00,000',
        field: 'annualFamilyIncome',
        value: 500000,
      },
      {
        criterion: 'Project Cost',
        description: 'Total project cost must be up to ₹5,00,000',
        field: 'estimatedProjectCost',
        value: 500000,
      },
    ],
    financialDetails: {
      maxLoanAmount: 450000,
      maxProjectCost: 500000,
      interestRate: 13,
      interestRateAlt: 15,
      interestRateNote: '13% p.a. via Cooperative Societies/Banks; 15% p.a. via Small Finance Banks',
      repaymentPeriod: 'Up to 5 years',
      repaymentPeriodMonths: 60,
      moratorium: '3 months',
      moratoriumMonths: 3,
      coverage: '90% of project cost',
      interestDuringMoratorium: null,
    },
    requiredDocuments: [
      'Scheduled Caste certificate issued by competent authority',
      'Income certificate (annual family income ≤ ₹5,00,000)',
      'Identity proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address proof',
      'Business activity details / project report',
      'Bank account details',
      'Passport-size photographs',
    ],
    officialSource: {
      organization: 'NSFDC',
      url: 'https://nsfdc.nic.in/scheme',
      lastVerified: '2026-09-21',
    },
    channelPartnerTypes: [
      'Cooperative Societies',
      'Co-operative Banks',
      'Small Finance Banks (SFBs)',
    ],
  },
  {
    id: 'els',
    name: 'Educational Loan Scheme',
    shortName: 'ELS',
    category: 'Education',
    purpose: 'Higher education financing for professional and technical courses in India and abroad',
    description:
      'Educational loan for SC students pursuing professional and technical education at recognized institutions in India and abroad. Covers tuition fees, hostel charges, examination fees, purchase of books/equipment, and other course-related expenses. Loan amount is up to 90% of the course fee or ₹40 lakh, whichever is less. Repayment begins after course completion with a generous moratorium period.',
    eligibility: [
      {
        criterion: 'Caste Category',
        description: 'Must belong to Scheduled Caste (SC) community with a valid caste certificate issued by competent authority',
        field: 'category',
        value: 'SC',
      },
      {
        criterion: 'Annual Family Income',
        description: 'Annual family income must not exceed ₹5,00,000',
        field: 'annualFamilyIncome',
        value: 500000,
      },
      {
        criterion: 'Admission',
        description: 'Must have secured admission in a recognized professional/technical course at a recognized institution',
        field: 'educationLevel',
        value: 'higher_education',
      },
    ],
    financialDetails: {
      maxLoanAmount: 4000000,  // ₹40 lakh — unified cap for India and abroad
      maxProjectCost: 4000000,
      interestRate: 6.5,
      interestRateNote: 'Up to ₹40 lakh or 90% of course fee, whichever is less',
      repaymentPeriod: '10 years repayment period after moratorium',
      repaymentPeriodMonths: 120,
      moratorium: 'Course period + 1 year (or 6 months after getting employment)',
      moratoriumMonths: undefined,
      moratoriumNote: 'Moratorium is course duration plus one year, or six months after course completion/employment, whichever is earlier',
      coverage: '90% of course fee',
      interestDuringMoratorium: null,
    },
    requiredDocuments: [
      'Scheduled Caste certificate issued by competent authority',
      'Income certificate (annual family income ≤ ₹5,00,000)',
      'Identity proof (Aadhaar Card / Voter ID / PAN Card)',
      'Address proof',
      'Admission letter from recognized institution',
      'Fee structure / prospectus of the course',
      'Academic records / marksheets of previous qualifying examination',
      'Bank account details',
      'Passport-size photographs',
      'Co-applicant (parent/guardian) identity and address proof',
    ],
    officialSource: {
      organization: 'NSFDC',
      url: 'https://nsfdc.nic.in/scheme',
      lastVerified: '2026-09-21',
    },
    channelPartnerTypes: [
      'State Channelizing Agencies (SCAs)',
      'Public Sector Banks (PSBs)',
    ],
  },


];
