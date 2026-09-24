/**
 * Recommendation Request / Response Types
 */

export type BusinessType = 'new' | 'existing' | 'education';

export type ActivityType = 'agriculture' | 'services' | 'industrial' | 'other';

export interface UserPurposeInput {
  businessType: BusinessType;
  /** Omitted if businessType === 'education' */
  activityType?: ActivityType;
}

export interface RecognizedCourse {
  id: string;
  name: string;      // e.g. "Engineering (Diploma / B.Tech / B.E / M.Tech / M.E)"
  category: string;  // e.g. "Technical", "Medical", "Management"
}

export type CourseSelection =
  | RecognizedCourse
  | { customName: string; requiresVerification: true; id?: string; name?: string; category?: string };

export interface EducationInput {
  studyLocation: 'domestic' | 'abroad'; // no longer affects loan cap, kept for context/display only
  course: RecognizedCourse | { customName: string; requiresVerification: true };
  repaymentStarted: boolean;
  // derived, not user-entered — computed from repaymentStarted:
  // repaymentStarted === false → repaymentPeriod: "up to 12 years", moratorium: "course period + 1 year"
  // repaymentStarted === true  → repaymentPeriod: "up to 10 years", moratorium: "up to 6 months"
  repaymentPeriod?: string;
  moratorium?: string;
}

export type PurposeCategory =
  | 'start_business'
  | 'expand_business'
  | 'education'
  | 'agriculture'
  | 'services'
  | 'other';

/** Mode A — free-text semantic search */
export interface SemanticSearchRequest {
  mode: 'semantic';
  query: string;
}

/** Mode B — guided structured search */
export interface GuidedSearchRequest {
  mode: 'guided';
  /** Primary classification: Start a new business, Expand existing, or Education */
  businessType: BusinessType;
  /** Display/context activity type — omitted if businessType === 'education' */
  activityType?: ActivityType;
  /** Education-specific structured details — only present when businessType === 'education' */
  educationDetails?: EducationInput;
  /** Retained for backward compatibility */
  purpose?: PurposeCategory;
  estimatedProjectCost: number;
  loanAmountRequired: number;
  annualFamilyIncome: number;
  state: string;
  district: string;
  age: number;
  /** Caste category — NSFDC schemes are exclusively for SC */
  category?: string;
  educationLevel?: string;
  /** Whether the applicant is currently in default on any loan / financial institution */
  isExistingDefaulter: boolean;
}

export type RecommendationRequest = SemanticSearchRequest | GuidedSearchRequest;

export interface RecommendationResponse {
  recommendations: import('./scheme').SchemeRecommendation[];
  /** Timestamp of when this result was generated */
  timestamp: string;
  /** Whether the data backing these results is demo/mock data */
  isDemoData: boolean;
}
