/**
 * Recommendation Service
 *
 * v1 (mock mode):  deterministic cost-band + keyword matching against local data.
 * v2 (API mode):   POST /api/schemes/recommend — backend semantic search + eligibility engine.
 *
 * Switch between modes by setting/unsetting NEXT_PUBLIC_API_URL in .env.local.
 *
 * VOCABULARY (non-negotiable in UI copy):
 *   Semantic search  → "relevant to your requirement"
 *   Eligibility engine → "criteria matched" / "requires verification"
 *   Results are never described as "approved" or "guaranteed"
 */

import type { SchemeRecommendation, EligibilityCheck, Scheme } from '@/types/scheme';
import type {
  RecommendationRequest,
  RecommendationResponse,
  GuidedSearchRequest,
} from '@/types/recommendation';
import { apiRequest, IS_MOCK_MODE } from './apiClient';
import { VERIFIED_SCHEMES } from './mockData/schemes';
import { APP_CONFIG } from '@/config/app';

const MOCK_DELAY_MS = 1500;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── Backend DTO Interfaces ───────────────────────────────────────────────────

interface BackendSchemeSummary {
  id: string;
  schemeCode?: string;
  name: string;
  purpose?: string | null;
  category?: string | null;
  beneficiaryCategory?: string[] | null;
  financialDetails: {
    minProjectCost?: number | null;
    maxProjectCost?: number | null;
    minLoanAmount?: number | null;
    maxLoanAmount?: number | null;
    coveragePercentage?: number | null;
    interestRate?: number | null;
    interestRateText?: string | null;
    interestRateOptions?: Array<{ label: string; rate: number }> | null;
    repaymentPeriod?: string | null;
    maxRepaymentMonths?: number | null;
    moratorium?: string | null;
    moratoriumMonths?: number | null;
  };
  officialSource?: {
    organization?: string | null;
    url?: string | null;
    document?: string | null;
    lastVerified?: string | null;
    dataUpdated?: string | null;
    dataStatus?: 'LIVE' | 'VERIFIED' | 'DEMO';
  };
  officialApplicationUrl?: string | null;
  dataStatus?: 'LIVE' | 'VERIFIED' | 'DEMO';
}

interface BackendRecommendedScheme {
  scheme: BackendSchemeSummary;
  relevanceReason: string;
  relevanceFactors?: Array<{ factor: string; matched: boolean; detail: string }>;
  semanticSimilarity?: number;
  eligibilityChecks: Array<{
    criterion: string;
    status: 'matched' | 'not_matched' | 'needs_verification';
    explanation: string;
    sourceUrl?: string | null;
    effectiveFrom?: string | null;
    lastVerified?: string | null;
  }>;
  eligibilityOutcome: 'NO_MISMATCH_FOUND' | 'MISMATCH_FOUND';
  eligibilityCounts?: { matched: number; not_matched: number; needs_verification: number };
  financialFit?: {
    coveragePercentage?: number | null;
    projectCost?: number | null;
    maxLoanByCoverage?: number | null;
    loanRequired?: number | null;
    withinCoverage?: boolean | null;
    withinSchemeLoanLimit?: boolean | null;
  };
  requiresVerification?: boolean;
  officialApplicationUrl?: string;
}

interface BackendRecommendResponse {
  requestId: string;
  dataStatus?: 'LIVE' | 'VERIFIED' | 'DEMO';
  schemes: BackendRecommendedScheme[];
  retrieval?: {
    normalizedQuery: string;
    detectedLanguage: string;
    embeddingProvider: string;
    embeddingModel: string;
    candidatesConsidered: number;
    minSimilarity: number;
  };
  officialApplicationUrl?: string;
  disclaimer?: string;
  generatedAt: string;
}

interface BackendRecommendRequest {
  purpose: string;
  projectCost?: number;
  loanRequired?: number;
  annualIncome?: number;
  state?: string;
  district?: string;
  age?: number;
  beneficiaryCategory?: string;
  educationLevel?: string;
}

const ID_ALIAS_MAP: Record<string, string> = {
  'micro-finance-scheme': 'mfs',
  'term-loan': 'term-loan',
  'aajeevika-micro-finance-yojana': 'aajeevika',
  'udyam-nidhi-yojana': 'udyam-nidhi',
  'educational-loan-scheme': 'els',
  'nsfdc-mfs': 'mfs',
  'nsfdc-tl': 'term-loan',
  'nsfdc-amy': 'aajeevika',
  'nsfdc-uny': 'udyam-nidhi',
  'nsfdc-els': 'els',
};

function buildBackendPayload(request: RecommendationRequest): BackendRecommendRequest {
  if (request.mode === 'semantic') {
    let purpose = request.query.trim();
    if (purpose.length < 3) {
      purpose = (purpose + '   ').slice(0, 3);
    }
    if (purpose.length > 1000) {
      purpose = purpose.slice(0, 1000);
    }
    return { purpose };
  }

  let purpose = '';
  if (request.businessType === 'education') {
    const course = request.educationDetails?.course;
    const courseName = course
      ? ('customName' in course ? course.customName : course.name)
      : 'higher education';
    const loc = request.educationDetails?.studyLocation === 'abroad' ? 'abroad' : 'in India';
    purpose = `Educational loan for ${courseName} (${loc})`;
  } else {
    const bizTypeLabel = request.businessType === 'new' ? 'Start a new business' : 'Expand an existing business';
    const activityLabels: Record<string, string> = {
      agriculture: 'agriculture & allied sector',
      services: 'services sector',
      industrial: 'industrial & manufacturing sector',
      other: 'income-generating activities',
    };
    const activityText = request.activityType && activityLabels[request.activityType]
      ? ` in ${activityLabels[request.activityType]}`
      : '';
    purpose = `${bizTypeLabel}${activityText}`;
  }

  purpose = purpose.trim();
  if (purpose.length < 3) {
    purpose = 'Start a small business or enterprise';
  }
  if (purpose.length > 1000) {
    purpose = purpose.slice(0, 1000);
  }

  const projectCost = Number.isFinite(request.estimatedProjectCost) && request.estimatedProjectCost > 0
    ? Math.min(request.estimatedProjectCost, 1e10)
    : undefined;

  let loanRequired = Number.isFinite(request.loanAmountRequired) && request.loanAmountRequired > 0
    ? Math.min(request.loanAmountRequired, 1e10)
    : undefined;

  if (projectCost !== undefined && loanRequired !== undefined && loanRequired > projectCost) {
    loanRequired = projectCost;
  }

  const annualIncome = Number.isFinite(request.annualFamilyIncome) && request.annualFamilyIncome >= 0
    ? Math.min(request.annualFamilyIncome, 1e11)
    : undefined;

  const age = Number.isFinite(request.age) && request.age >= 0 && request.age <= 120
    ? Math.floor(request.age)
    : undefined;

  const state = request.state ? request.state.trim().slice(0, 64) : undefined;
  const district = request.district ? request.district.trim().slice(0, 64) : undefined;
  const beneficiaryCategory = request.category ? request.category.trim().slice(0, 64) : 'SC';
  const educationLevel = request.educationLevel ? request.educationLevel.trim().slice(0, 64) : undefined;

  const payload: BackendRecommendRequest = {
    purpose,
    projectCost,
    loanRequired,
    annualIncome,
    state,
    district,
    age,
    beneficiaryCategory,
    educationLevel,
  };

  return payload;
}

function mapBackendResponse(
  backendData: BackendRecommendResponse,
  request: RecommendationRequest
): RecommendationResponse {
  const recommendations: SchemeRecommendation[] = backendData.schemes.map((item) => {
    const targetId = ID_ALIAS_MAP[item.scheme.id.toLowerCase()] ||
                     (item.scheme.schemeCode ? ID_ALIAS_MAP[item.scheme.schemeCode.toLowerCase()] : null) ||
                     item.scheme.id;

    const matchedVerifiedScheme = VERIFIED_SCHEMES.find(
      (s) => s.id === targetId || s.id === item.scheme.id
    );

    const scheme: Scheme = matchedVerifiedScheme || {
      id: item.scheme.id,
      name: item.scheme.name,
      shortName: item.scheme.schemeCode || item.scheme.name,
      category: item.scheme.category || 'General',
      purpose: item.scheme.purpose || item.scheme.name,
      description: item.scheme.purpose || '',
      eligibility: [],
      financialDetails: {
        maxLoanAmount: item.scheme.financialDetails?.maxLoanAmount ?? undefined,
        maxProjectCost: item.scheme.financialDetails?.maxProjectCost ?? undefined,
        interestRate: item.scheme.financialDetails?.interestRate ?? undefined,
        interestRateNote: item.scheme.financialDetails?.interestRateText ?? undefined,
        repaymentPeriod: item.scheme.financialDetails?.repaymentPeriod ?? undefined,
        repaymentPeriodMonths: item.scheme.financialDetails?.maxRepaymentMonths ?? undefined,
        moratorium: item.scheme.financialDetails?.moratorium ?? undefined,
        moratoriumMonths: item.scheme.financialDetails?.moratoriumMonths ?? undefined,
      },
      requiredDocuments: [],
      officialSource: {
        organization: item.scheme.officialSource?.organization || 'NSFDC',
        url: item.scheme.officialSource?.url || item.officialApplicationUrl || 'https://nsfdc.nic.in',
        lastVerified: item.scheme.officialSource?.lastVerified || new Date().toISOString().split('T')[0],
      },
      channelPartnerTypes: [],
    };

    const eligibilityChecks: EligibilityCheck[] = (item.eligibilityChecks || []).map((c) => ({
      criterion: c.criterion,
      status: c.status,
      explanation: c.explanation,
    }));

    const isEligible = request.mode === 'guided'
      ? item.eligibilityOutcome === 'NO_MISMATCH_FOUND'
      : undefined;

    let applicationPath: 'digital' | 'offline' | undefined = undefined;
    let applicationPathReason: string | undefined = undefined;

    if (request.mode === 'guided') {
      const res = resolveApplicationPath(request.loanAmountRequired, request.businessType);
      applicationPath = res.applicationPath;
      applicationPathReason = res.applicationPathReason;
    }

    return {
      scheme,
      relevanceReason: item.relevanceReason,
      eligibilityChecks,
      requiresVerification: item.requiresVerification ?? true,
      isEligible,
      applicationPath,
      applicationPathReason,
    };
  });

  return {
    recommendations,
    timestamp: backendData.generatedAt || new Date().toISOString(),
    isDemoData: backendData.dataStatus === 'DEMO',
  };
}

export async function getRecommendations(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  if (!IS_MOCK_MODE) {
    const payload = buildBackendPayload(request);
    const rawResponse = await apiRequest<BackendRecommendResponse>('/api/schemes/recommend', {
      method: 'POST',
      body: payload,
    });
    return mapBackendResponse(rawResponse, request);
  }

  // ── Mock mode ──────────────────────────────────────────────────────────────
  await delay(MOCK_DELAY_MS);

  const recommendations =
    request.mode === 'semantic'
      ? mockSemanticSearch(request.query)
      : mockGuidedSearch(request);

  return {
    recommendations,
    timestamp: new Date().toISOString(),
    isDemoData: true,
  };
}

// ── Mock implementations (only used when NEXT_PUBLIC_API_URL is not set) ──────

function mockSemanticSearch(query: string): SchemeRecommendation[] {
  const isEducation =
    /education|college|university|degree|course|study|student|school|tuition/i.test(query);
  const isBusiness =
    /business|shop|dairy|farm|start|enterprise|manufacture|service|trade|work/i.test(query);

  const amountMatch = query.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lac|l)/i);
  const amount = amountMatch
    ? parseFloat(amountMatch[1].replace(/,/g, '')) * 100000
    : null;

  const results: SchemeRecommendation[] = [];

  for (const scheme of VERIFIED_SCHEMES) {
    let relevant = false;
    let relevanceReason = '';

    if (isEducation && scheme.id === 'els') {
      relevant = true;
      relevanceReason =
        'Your requirement mentions education — this scheme is specifically designed for financing professional and technical courses.';
    } else if (isBusiness) {
      if (amount !== null) {
        if (amount <= 140000 && (scheme.id === 'mfs' || scheme.id === 'aajeevika')) {
          relevant = true;
          relevanceReason = `Your estimated requirement of ${fmt(amount)} falls within this scheme's project cost band of up to ₹1,40,000.`;
        } else if (amount > 140000 && amount <= 500000 && scheme.id === 'udyam-nidhi') {
          relevant = true;
          relevanceReason = `Your estimated requirement of ${fmt(amount)} falls within this scheme's project cost band of up to ₹5,00,000.`;
        } else if (amount > 140000 && amount <= 5000000 && scheme.id === 'term-loan') {
          relevant = true;
          relevanceReason = `Your estimated requirement of ${fmt(amount)} falls within this scheme's project cost band of ₹1,40,000 to ₹50,00,000.`;
        }
      } else if (scheme.id !== 'els') {
        relevant = true;
        relevanceReason =
          'Your requirement describes a business activity — this scheme supports income-generating business projects.';
      }
    } else if (
      query.toLowerCase().includes(scheme.name.toLowerCase()) ||
      query.toLowerCase().includes(scheme.shortName.toLowerCase())
    ) {
      relevant = true;
      relevanceReason = `Your search is relevant to the ${scheme.name}.`;
    }

    if (relevant) {
      results.push({
        scheme,
        relevanceReason,
        eligibilityChecks: basicEligibilityChecks(scheme),
        requiresVerification: true,
        // isEligible is intentionally absent for semantic results — no deterministic checks were run
      });
    }
  }

  if (results.length === 0) {
    return VERIFIED_SCHEMES.map((scheme) => ({
      scheme,
      relevanceReason:
        'Showing all available schemes. Refine your search with specific details about your requirement for more targeted results.',
      eligibilityChecks: basicEligibilityChecks(scheme),
      requiresVerification: true,
    }));
  }

  return results;
}

function mockGuidedSearch(request: GuidedSearchRequest): SchemeRecommendation[] {
  const results: SchemeRecommendation[] = [];
  const { ageEligibilityMin, ageEligibilityMax } = APP_CONFIG.digitalPath;

  for (const scheme of VERIFIED_SCHEMES) {
    const checks: EligibilityCheck[] = [];
    let isRelevant = false;
    let relevanceReason = '';

    // —— Income check ————————————————————————————————
    const incomeCheck: EligibilityCheck = {
      criterion: 'Annual Family Income',
      status: request.annualFamilyIncome <= 500000 ? 'matched' : 'not_matched',
      explanation:
        request.annualFamilyIncome <= 500000
          ? `Your annual family income of ${fmt(request.annualFamilyIncome)} is within the ₹5,00,000 ceiling.`
          : `Your annual family income of ${fmt(request.annualFamilyIncome)} exceeds the ₹5,00,000 ceiling for this scheme.`,
    };
    checks.push(incomeCheck);

    // —— Category check (SC mandate - self-declared, requires official certificate) ──
    checks.push({
      criterion: 'Caste Category',
      status: 'needs_verification',
      explanation:
        'Self-declared as Scheduled Caste (SC) — matches scheme mandate. Requires a valid caste certificate for verification during the official application.',
    });

    // —— Age check (18–55 from config - computed comparison) ──
    const ageInRange = request.age >= ageEligibilityMin && request.age <= ageEligibilityMax;
    checks.push({
      criterion: 'Age',
      status: ageInRange ? 'matched' : 'not_matched',
      explanation: ageInRange
        ? `Age ${request.age} is within the eligible range (${ageEligibilityMin}–${ageEligibilityMax} years).`
        : `Age ${request.age} is outside the general eligible range (${ageEligibilityMin}–${ageEligibilityMax} years). Some schemes may use a narrower band — verify with the official source.`,
    });

    // —— Defaulter check (self-declared, unverifiable client-side without credit bureau) ──
    checks.push({
      criterion: 'Loan Default Status',
      status: request.isExistingDefaulter ? 'not_matched' : 'needs_verification',
      explanation: request.isExistingDefaulter
        ? 'Applicants currently in default on any loan or financial institution are not eligible. This will be verified during the official application process.'
        : 'Self-declared no existing loan default — subject to verification with credit institutions during the official application process.',
    });

    // —— Purpose / financial fit ———————————————————————
    const isEducation = request.businessType === 'education' || request.purpose === 'education';

    if (isEducation && scheme.id === 'els') {
      isRelevant = true;
      const courseName = request.educationDetails?.course
        ? 'requiresVerification' in request.educationDetails.course
          ? request.educationDetails.course.customName
          : request.educationDetails.course.name
        : '';
      const studyLoc = request.educationDetails?.studyLocation === 'abroad' ? 'abroad' : 'in India';

      relevanceReason = courseName
        ? `Your requirement is for financing ${courseName} (${studyLoc}) — this scheme finances up to ₹40 lakh or 90% of course fee for study in India or abroad.`
        : 'Your requirement is for education financing — this scheme finances up to ₹40 lakh or 90% of course fee for study in India or abroad.';

      const courseRequiresVerification =
        request.educationDetails?.course &&
        'requiresVerification' in request.educationDetails.course;

      checks.push({
        criterion: 'Course Recognition',
        status: courseRequiresVerification ? 'needs_verification' : 'matched',
        explanation: courseRequiresVerification
          ? `The course "${courseName}" is not on the standard recognized list and requires manual verification by NSFDC.`
          : courseName
          ? `Selected course "${courseName}" matches the recognized professional/technical programs covered under ELS.`
          : 'Education purpose matches the Educational Loan Scheme.',
      });

      const maxLoan = 4000000; // NSFDC ELS single combined cap: up to ₹40 lakh or 90% of course fee
      const covered = Math.min(request.estimatedProjectCost * 0.9, maxLoan);
      const interestRate = scheme.financialDetails.interestRate;
      checks.push({
        criterion: 'Financial Fit',
        status: covered >= request.loanAmountRequired ? 'matched' : 'needs_verification',
        explanation:
          covered >= request.loanAmountRequired
            ? `The scheme covers up to 90% of course fee (up to ₹40 lakh for study in India or abroad) at ${interestRate}% interest per annum, meeting your requested loan of ${fmt(request.loanAmountRequired)}.`
            : `Requested loan of ${fmt(request.loanAmountRequired)} exceeds eligible coverage (${fmt(covered)}, capped at ₹40 lakh at ${interestRate}% interest per annum).`,
      });

      if (request.educationDetails) {
        const { repaymentStarted } = request.educationDetails;
        checks.push({
          criterion: 'Repayment & Moratorium Terms',
          status: 'matched',
          explanation: repaymentStarted
            ? 'Repayment status: Already repaying. Repayment period: up to 10 years. Moratorium: up to 6 months.'
            : 'Repayment status: Not yet started repayment. Repayment period: up to 12 years. Moratorium: course period plus 1 year.',
        });
      }
    } else if (!isEducation && scheme.id !== 'els') {
      const cost = request.estimatedProjectCost;
      const activityLabels: Record<string, string> = {
        agriculture: 'agriculture & allied',
        services: 'services sector',
        industrial: 'industrial & manufacturing',
        other: 'income-generating',
      };
      const activityText =
        request.activityType && activityLabels[request.activityType]
          ? `, supporting ${activityLabels[request.activityType]} activities like yours`
          : '';

      if (scheme.id === 'mfs' && cost <= 140000) {
        isRelevant = true;
        relevanceReason = `Your project cost of ${fmt(cost)} is within the Micro Finance Scheme band (up to ₹1,40,000)${activityText}.`;
      } else if (scheme.id === 'term-loan' && cost > 140000 && cost <= 5000000) {
        isRelevant = true;
        relevanceReason = `Your project cost of ${fmt(cost)} falls in the Term Loan band (₹1,40,000 to ₹50,00,000)${activityText}.`;
      } else if (scheme.id === 'aajeevika' && cost <= 140000) {
        isRelevant = true;
        relevanceReason = `Your project cost of ${fmt(cost)} is within the Aajeevika MFY band (up to ₹1,40,000)${activityText}, channeled through NBFC-MFIs.`;
      } else if (scheme.id === 'udyam-nidhi' && cost <= 500000) {
        isRelevant = true;
        relevanceReason = `Your project cost of ${fmt(cost)} is within the Udyam Nidhi Yojana band (up to ₹5,00,000)${activityText}.`;
      }

      if (isRelevant) {
        const maxLoan = scheme.financialDetails.maxLoanAmount ?? cost * 0.9;
        const covered = Math.min(cost * 0.9, maxLoan);
        const interestRate = scheme.financialDetails.interestRate;
        checks.push({
          criterion: 'Financial Fit',
          status: covered >= request.loanAmountRequired ? 'matched' : 'needs_verification',
          explanation:
            covered >= request.loanAmountRequired
              ? `The scheme covers up to 90% of project cost (${fmt(covered)}) at ${interestRate}% interest per annum, which meets your requested loan of ${fmt(request.loanAmountRequired)}.`
              : `The scheme covers up to 90% of project cost (${fmt(covered)}) at ${interestRate}% interest per annum. Your requested loan of ${fmt(request.loanAmountRequired)} may require adjustment.`,
        });
      }
    }

    // —— Location check ———————————————————————————————
    checks.push({
      criterion: 'Location',
      status: 'needs_verification',
      explanation: `State: ${request.state}, District: ${request.district}. Channel partner availability in your area requires verification.`,
    });

    if (isRelevant && incomeCheck.status !== 'not_matched') {
      // —— Resolve digital vs offline path —————————————————
      const { applicationPath, applicationPathReason } = resolveApplicationPath(
        request.loanAmountRequired,
        request.businessType,
      );

      results.push({
        scheme,
        relevanceReason,
        eligibilityChecks: checks,
        requiresVerification: checks.some((c) => c.status === 'needs_verification'),
        isEligible: true,
        applicationPath,
        applicationPathReason,
      });
    } else if (isRelevant && incomeCheck.status === 'not_matched') {
      // Income fails → include the scheme as ineligible so the UI can render it
      // in the "Other NSFDC Schemes" secondary list with an explanation.
      results.push({
        scheme,
        relevanceReason,
        eligibilityChecks: checks,
        requiresVerification: false,
        isEligible: false,
      });
    }
    // If the scheme is not relevant at all, omit it from results entirely.
  }

  return results;
}

function basicEligibilityChecks(scheme: SchemeRecommendation['scheme']): EligibilityCheck[] {
  return [
    {
      criterion: 'Annual Family Income',
      status: 'needs_verification',
      explanation:
        'Annual family income must not exceed ₹5,00,000. Provide your income details for verification.',
    },
    {
      criterion: 'Caste Category',
      status: 'needs_verification',
      explanation:
        'Must belong to Scheduled Caste (SC) community with a valid caste certificate.',
    },
    {
      criterion: 'Project Cost / Purpose',
      status: 'needs_verification',
      explanation: `This scheme covers projects ${
        scheme.financialDetails.maxProjectCost
          ? `up to ${fmt(scheme.financialDetails.maxProjectCost)}`
          : 'within specified limits'
      }. Verify your project details against scheme requirements.`,
    },
  ];
}

/**
 * Resolves whether the applicant can use PM-SURAJ's digital processing path.
 * - Compares requested loan amount against maxDigitalLoanAmount (not project cost)
 * - Expansions and education loans are routed offline
 *
 * [VERIFY figures on pmsuraj.dosje.gov.in before launch]
 */
function resolveApplicationPath(
  loanRequired: number,
  businessType?: 'new' | 'existing' | 'education',
): { applicationPath: 'digital' | 'offline'; applicationPathReason: string } {
  const { maxDigitalLoanAmount } = APP_CONFIG.digitalPath;

  if (businessType !== 'new') {
    return {
      applicationPath: 'offline',
      applicationPathReason:
        businessType === 'existing'
          ? 'This case needs to be handled in person — PM-SURAJ currently does not support digital applications for business expansions, only new businesses.'
          : businessType === 'education'
          ? 'Educational loans under NSFDC (ELS) are processed through state channelising agencies or partner banks offline.'
          : 'Application path will be confirmed during the official process. Visit your nearest channel partner for guidance.',
    };
  }

  if (loanRequired > maxDigitalLoanAmount) {
    return {
      applicationPath: 'offline',
      applicationPathReason: `This case needs to be handled in person — your requested loan amount (${fmt(loanRequired)}) exceeds the PM-SURAJ digital processing limit of ${fmt(maxDigitalLoanAmount)}.`,
    };
  }

  return {
    applicationPath: 'digital',
    applicationPathReason: `Good news — you can apply for this directly online. Your requested loan (${fmt(loanRequired)}) is within PM-SURAJ's current digital processing limit of ${fmt(maxDigitalLoanAmount)}, and this is a new business.`,
  };
}

function fmt(amount: number): string {
  if (amount >= 100000) {
    const lakhs = amount / 100000;
    return `₹${lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(2)} lakh`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}
