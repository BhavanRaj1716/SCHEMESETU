/**
 * Scheme Types — matches the API contract in the spec.
 * No business logic here — just shapes.
 */

export interface EligibilityRule {
  criterion: string;
  description: string;
  /** The field on the user's profile this rule checks against */
  field?: string;
  /** The threshold value (e.g. 500000 for income ceiling) */
  value?: string | number;
}

export interface SchemeFinancialDetails {
  maxLoanAmount?: number;
  maxProjectCost?: number;
  interestRate?: number;
  /** Some schemes have variable rates (e.g. Udyam Nidhi: 13% co-op / 15% SFB) */
  interestRateAlt?: number;
  interestRateNote?: string;
  repaymentPeriod?: string;
  repaymentPeriodMonths?: number;
  moratorium?: string;
  moratoriumMonths?: number;
  /** Extra moratorium condition, e.g. "12 months for plantation/construction" */
  moratoriumNote?: string;
  coverage?: string;
  /** Whether interest accrues during moratorium — not publicly confirmed for all schemes */
  interestDuringMoratorium?: boolean | null;
}

export interface OfficialSource {
  organization: string;
  url: string;
  lastVerified: string;
}

export interface Scheme {
  id: string;
  name: string;
  shortName: string;
  category: string;
  purpose: string;
  description: string;
  eligibility: EligibilityRule[];
  financialDetails: SchemeFinancialDetails;
  requiredDocuments: string[];
  officialSource: OfficialSource;
  /** Categories of channel partners that can process this scheme */
  channelPartnerTypes: string[];
}

export type EligibilityStatus = 'matched' | 'not_matched' | 'needs_verification';

export interface EligibilityCheck {
  criterion: string;
  status: EligibilityStatus;
  explanation: string;
}

export interface SchemeRecommendation {
  scheme: Scheme;
  relevanceReason: string;
  eligibilityChecks: EligibilityCheck[];
  requiresVerification: boolean;
  /**
   * True when the eligibility engine determined the user's inputs pass this
   * scheme's hard criteria (income, age, business type). Undefined for
   * semantic-search results where deterministic checks are not run.
   */
  isEligible?: boolean;
  /**
   * Whether the applicant can use PM-SURAJ's digital processing path.
   * Only set for guided-search results; undefined for semantic search results.
   */
  applicationPath?: 'digital' | 'offline';
  /** Plain-language explanation of why this path was selected */
  applicationPathReason?: string;
}
