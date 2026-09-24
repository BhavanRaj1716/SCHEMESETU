# Connecting the Next.js frontend

The frontend only needs one env var: `NEXT_PUBLIC_API_BASE_URL` (e.g. `http://localhost:8000`).
On the backend set `FRONTEND_URL` to the frontend origin (comma-separate several).

## Types (`lib/api-types.ts`)

```ts
export type DataStatus = "LIVE" | "VERIFIED" | "DEMO";
export type CheckStatus = "matched" | "not_matched" | "needs_verification";

export interface RecommendRequest {
  purpose: string;
  projectCost?: number;
  loanRequired?: number;
  annualIncome?: number;
  state?: string;
  district?: string;
  age?: number;
  beneficiaryCategory?: string;
  educationLevel?: string | null;
}

export interface OfficialSource {
  organization: string | null; url: string | null; document: string | null;
  lastVerified: string | null; dataUpdated: string | null; dataStatus: DataStatus;
}
export interface FinancialDetails {
  minProjectCost: number | null; maxProjectCost: number | null; minLoanAmount: number | null; maxLoanAmount: number | null;
  coveragePercentage: number | null; interestRate: number | null; interestRateText: string | null;
  interestRateOptions: { label: string; rate: number }[] | null;
  repaymentPeriod: string | null; maxRepaymentMonths: number | null; moratorium: string | null; moratoriumMonths: number | null;
}
export interface SchemeSummary {
  id: string; schemeCode: string; name: string; purpose: string | null; category: string | null;
  beneficiaryCategory: string[] | null; financialDetails: FinancialDetails; officialSource: OfficialSource;
  officialApplicationUrl: string | null; dataStatus: DataStatus;
}
export interface EligibilityCheck {
  criterion: string; status: CheckStatus; explanation: string;
  sourceUrl: string | null; effectiveFrom: string | null; lastVerified: string | null;
}
export interface RecommendedScheme {
  scheme: SchemeSummary;
  relevanceReason: string;
  relevanceFactors: { factor: string; matched: boolean; detail: string }[];
  semanticSimilarity: number; // NOT an eligibility measure - never render as a percentage
  eligibilityChecks: EligibilityCheck[];
  eligibilityOutcome: "NO_MISMATCH_FOUND" | "MISMATCH_FOUND";
  eligibilityCounts: { matched: number; notMatched: number; needsVerification: number };
  financialFit: {
    coveragePercentage: number | null; projectCost: number | null; maxLoanByCoverage: number | null;
    loanRequired: number | null; withinCoverage: boolean | null; withinSchemeLoanLimit: boolean | null;
  };
  requiresVerification: boolean;
  officialApplicationUrl: string;
}
export interface RecommendResponse {
  requestId: string; dataStatus: DataStatus | null; schemes: RecommendedScheme[];
  retrieval: { normalizedQuery: string; detectedLanguage: string; embeddingProvider: string; embeddingModel: string; candidatesConsidered: number; minSimilarity: number };
  officialApplicationUrl: string; disclaimer: string; generatedAt: string;
}
export interface ApiError { error: { code: string; message: string; details: Record<string, unknown> } }
```

## Client (`lib/api.ts`)

```ts
import type { ApiError, RecommendRequest, RecommendResponse } from "./api-types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;

export class ApiRequestError extends Error {
  constructor(public code: string, message: string, public details: Record<string, unknown> = {}) { super(message); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: { "Content-Type": "application/json" }, ...init });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiError | null;
    throw new ApiRequestError(body?.error.code ?? "INTERNAL_ERROR", body?.error.message ?? res.statusText, body?.error.details);
  }
  return res.json() as Promise<T>;
}

export const recommendSchemes = (payload: RecommendRequest) =>
  request<RecommendResponse>("/api/schemes/recommend", { method: "POST", body: JSON.stringify(payload) });
```

## Using it (form → results)

Send only fields the user filled in; drop empty strings/NaN. Your Zod schema can mirror the request table in `API_CONTRACT.md`.

```tsx
const payload: RecommendRequest = {
  purpose: values.purpose,
  ...(values.projectCost && { projectCost: Number(values.projectCost) }),
  ...(values.loanRequired && { loanRequired: Number(values.loanRequired) }),
  ...(values.annualIncome && { annualIncome: Number(values.annualIncome) }),
  ...(values.state && { state: values.state }),
  ...(values.district && { district: values.district }),
  ...(values.beneficiaryCategory && { beneficiaryCategory: values.beneficiaryCategory }),
};
const data = await recommendSchemes(payload);

data.schemes.map((r) => (
  <SchemeCard key={r.scheme.id}
    name={r.scheme.name}
    why={r.relevanceReason}                       // "Why relevant"
    checks={r.eligibilityChecks}                  // matched / not_matched / needs_verification badges
    maxLoan={r.scheme.financialDetails.maxLoanAmount}
    interest={r.scheme.financialDetails.interestRate ?? r.scheme.financialDetails.interestRateText}
    repayment={r.scheme.financialDetails.repaymentPeriod}
    moratorium={r.scheme.financialDetails.moratorium}
    source={r.scheme.officialSource}              // organisation, url, lastVerified
    status={r.scheme.dataStatus}                  // show a badge; DEMO must be clearly labelled
    applyUrl={r.officialApplicationUrl} />        // PM-SURAJ hand-off
));
```

Rendering rules: show `null` financial values as "Information currently unavailable — please verify with the official source"; show `not_matched` in a neutral (not alarming) tone with the `explanation`; always show the `disclaimer`; never derive a percentage or ranking badge from `semanticSimilarity`.

CORS: only origins listed in the backend's `FRONTEND_URL` are allowed (`GET`, `POST`, `OPTIONS`; headers `Authorization`, `Content-Type`).
For authenticated calls: `Authorization: Bearer ${await firebaseUser.getIdToken()}`.

## Auth and saved schemes

During local development the backend defaults to `AUTH_MODE=dev`: any bearer token is accepted as
a user id, so you can build the "save this scheme" / profile UI immediately without Firebase set up.

```ts
// Dev mode: any stable string works as a "logged in" identity.
const devToken = "dev:" + currentUserNickname;
// Production: const devToken = await firebaseUser.getIdToken();

await fetch(`${API_BASE_URL}/api/users/me/saved-schemes`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Authorization: `Bearer ${devToken}` },
  body: JSON.stringify({ schemeId: "term-loan" }),
});
```

Switch the backend to `AUTH_MODE=firebase` before deploying — `dev` mode refuses to start when
`APP_ENV=production`, so this isn't something you can accidentally ship.
