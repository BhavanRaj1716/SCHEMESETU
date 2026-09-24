# SchemeSetu API Contract (v1.0.0)

Base URL: `http://localhost:8000` (dev) · all endpoints are under `/api`. JSON only. **All JSON keys are camelCase.**
Interactive docs (development only): `/api/docs`, `/api/redoc`, `/openapi.json`.

> **Stability:** the response shapes below are public contracts. Database details never leak. Additive fields may appear;
> treat unknown fields as ignorable. If a breaking change is ever needed it will ship under `/api/v2/...`.

## Ground rules the frontend must respect

1. **Semantic relevance ≠ eligibility.** `semanticSimilarity` is a raw embedding similarity. Never show it as a percentage, score or "match %".
2. **No approval claims.** The API never returns approval probability, guaranteed amounts or scores. `eligibilityOutcome` only says whether any *stated input contradicts a published criterion*.
3. **Show `dataStatus` and provenance.** `VERIFIED` = manually verified from an official page/document; `LIVE` = fetched from an official live API; `DEMO` = simulated, must be visibly labelled and never presented as real.
4. **Unavailable ≠ zero.** A `null` value means "not available from the official source". Show: *Information currently unavailable — please verify with the official source.*
5. **Apply on the official portal.** Link every result to `officialApplicationUrl` (PM-SURAJ).

## Error format (all endpoints)

```json
{ "error": { "code": "INVALID_REQUEST", "message": "projectCost: Input should be greater than 0", "details": { "fields": [ { "field": "projectCost", "message": "Input should be greater than 0" } ] } } }
```

| code | HTTP | meaning |
|---|---|---|
| `INVALID_REQUEST` | 422 (400/404/405 for routing errors) | validation failed |
| `SCHEME_NOT_FOUND` | 404 | unknown scheme id |
| `PARTNER_NOT_FOUND` | 404 | unknown partner id |
| `DATA_UNAVAILABLE` | 503 | database unreachable or no data seeded |
| `SOURCE_UNAVAILABLE` | 503 | reserved: an upstream government source needed by a live-ingestion path is unreachable (not used by request handlers today) |
| `UNAUTHORIZED` | 401 | missing/invalid Firebase ID token, or auth disabled |
| `FORBIDDEN` | 403 | authenticated but not allowed |
| `INTERNAL_ERROR` | 500 | unexpected error (details are logged server-side, never returned) |

## Authentication

Only `/api/auth/*`, `/api/users/me`, and `/api/users/me/saved-*` need auth. Send
`Authorization: Bearer <token>`. Scheme, calculator, partner and health endpoints are public.
The backend never stores passwords, in any mode.

Backend `AUTH_MODE` decides what the token must be:
- `none` — protected endpoints always return `401 UNAUTHORIZED`.
- `dev` (local development) — any non-empty bearer token is accepted as a user id (e.g.
  `Bearer dev:priya`); the same token always maps to the same profile. Never available when the
  backend runs with `APP_ENV=production`.
- `firebase` (production) — token must be a real Firebase ID token
  (`await firebaseUser.getIdToken()` on the frontend).

---

## POST `/api/schemes/recommend`

Pipeline: validate → normalise text → embed → pgvector cosine search → deterministic eligibility rules → verified scheme data.

**Request**

| field | type | rules |
|---|---|---|
| `purpose` | string | **required**, 3–1000 chars; English/Tamil/Hindi |
| `projectCost` | number | optional, > 0 (INR) |
| `loanRequired` | number | optional, > 0; must be ≤ `projectCost` when both given |
| `annualIncome` | number | optional, ≥ 0 (annual **family** income, INR) |
| `state`, `district` | string | optional |
| `age` | integer | optional, 0–120 |
| `beneficiaryCategory` | string | optional, e.g. `"SC"` (`"Scheduled Caste"` accepted) |
| `educationLevel` | string \| null | optional, e.g. `"undergraduate"` |

Missing optional fields yield `needs_verification` checks, never a pass or fail.

**Response 200** (abridged — full payload in [`examples/recommend.response.json`](examples/recommend.response.json))

```json
{
  "requestId": "uuid",
  "dataStatus": "VERIFIED",
  "schemes": [
    {
      "scheme": {
        "id": "term-loan", "schemeCode": "NSFDC-TL", "name": "Term Loan",
        "purpose": "Term loans for income-generating units costing more than ₹1.40 lakh and up to ₹50 lakh.",
        "category": "income_generating", "beneficiaryCategory": ["SC"],
        "financialDetails": {
          "minProjectCost": 140000, "maxProjectCost": 5000000, "minLoanAmount": 125000, "maxLoanAmount": 4500000,
          "coveragePercentage": 90, "interestRate": 8,
          "interestRateText": "Beneficiary pays 8% p.a. (NSFDC charges 4% p.a. from the SCAs/CAs).",
          "interestRateOptions": null,
          "repaymentPeriod": "Quarterly instalments within 7 years, including the moratorium.", "maxRepaymentMonths": 84,
          "moratorium": "6 months (12 months for plantation and construction activities)", "moratoriumMonths": 6
        },
        "officialSource": { "organization": "NSFDC", "url": "https://nsfdc.nic.in/scheme", "document": "NSFDC loan/credit schemes page (nsfdc.nic.in/scheme)", "lastVerified": "2026-09-22", "dataUpdated": "2026-09-21", "dataStatus": "VERIFIED" },
        "officialApplicationUrl": "https://pmsuraj.dosje.gov.in/", "dataStatus": "VERIFIED"
      },
      "relevanceReason": "Retrieved because the stated requirement is semantically related to Term Loan's documented purpose, and there is a purpose match, financial range match, beneficiary category match and state applicability.",
      "relevanceFactors": [ { "factor": "Purpose match", "matched": true, "detail": "..." } ],
      "semanticSimilarity": 0.0996,
      "eligibilityChecks": [
        { "criterion": "Annual family income", "status": "matched", "explanation": "Provided annual family income (₹2,50,000) is within the currently verified requirement (at most ₹5,00,000).", "sourceUrl": "https://nsfdc.nic.in/eligibility-requirements", "effectiveFrom": "2026-01-07", "lastVerified": "2026-09-22" },
        { "criterion": "Scheduled Caste status verification", "status": "needs_verification", "explanation": "..." }
      ],
      "eligibilityOutcome": "NO_MISMATCH_FOUND",
      "eligibilityCounts": { "matched": 7, "notMatched": 0, "needsVerification": 1 },
      "financialFit": { "coveragePercentage": 90, "projectCost": 300000, "maxLoanByCoverage": 270000, "loanRequired": 250000, "withinCoverage": true, "withinSchemeLoanLimit": true },
      "requiresVerification": true,
      "officialApplicationUrl": "https://pmsuraj.dosje.gov.in/"
    }
  ],
  "retrieval": { "normalizedQuery": "dairy business", "detectedLanguage": "en", "embeddingProvider": "sentence-transformers", "embeddingModel": "…", "candidatesConsidered": 4, "minSimilarity": 0.15 },
  "officialApplicationUrl": "https://pmsuraj.dosje.gov.in/",
  "disclaimer": "Information only. SchemeSetu does not approve loans or predict approval. …",
  "generatedAt": "2026-09-22T10:00:00Z"
}
```

Field notes
- `schemes` is ordered: schemes with `NO_MISMATCH_FOUND` first, then by semantic relevance. Schemes that were retrieved but have `MISMATCH_FOUND` are still returned so the UI can explain *why* (see `status: "not_matched"` checks).
- `eligibilityChecks[].status` ∈ `matched | not_matched | needs_verification`.
- `dataStatus` (top level) is `DEMO` if any returned record is DEMO, `LIVE` only if all are LIVE, otherwise `VERIFIED`; `null` when `schemes` is empty.
- `interestRate` is the rate the **beneficiary** pays. It is `null` when it depends on the partner type (Udyam Nidhi Yojana) — use `interestRateOptions`.
- Empty `schemes` (200) means nothing passed the relevance threshold; it is not an error.

Status codes: `200`, `422 INVALID_REQUEST`, `503 DATA_UNAVAILABLE`.

## GET `/api/schemes`

Query: `category`, `purpose` (text match), `state`, `beneficiaryCategory` (all optional). Response: `{ "schemes": [SchemeSummary], "count": n }` (`SchemeSummary` = the `scheme` object above). `200` only.

## GET `/api/schemes/{schemeId}`

Everything in `SchemeSummary` plus `description`, `stateScope`, `districtScope`, `eligibilitySummary`, `requiredDocuments` (`null` if the official page doesn't list them), `applicationProcess`, `applicableActivities`, `eligibilityRules[]` (criterion, field, operator, value, unit, sourceUrl, effectiveFrom/effectiveTo, lastVerified, dataStatus), `sourceHistory[]` (old/new value audit trail), `unavailableFields[]` (camelCase names) and `unavailableMessage`.
Status: `200`, `404 SCHEME_NOT_FOUND`.

## POST `/api/calculator/emi`

| field | rules |
|---|---|
| `principal` | required, > 0 |
| `annualInterestRate` | required, 0–100 (percent) |
| `tenureMonths` | required, integer 1–600 |
| `moratoriumMonths` | optional, default 0, must be < `tenureMonths` |
| `moratoriumInterestTreatment` | optional: `needs_verification` (default) · `interest_only` · `capitalize` · `none` |

`EMI = P·r·(1+r)^n / ((1+r)^n − 1)`, `r = annualRate/12/100`. With the default treatment the official source does not specify moratorium interest behaviour, so the moratorium is ignored and flagged in `assumptions` and `notes`.

```json
// POST {"principal":250000,"annualInterestRate":8,"tenureMonths":84}
{ "emi": 3896.55, "totalInterest": 77310.5, "totalRepayment": 327310.5,
  "assumptions": { "interestRate": 8, "tenureMonths": 84, "frequency": "monthly", "moratoriumMonths": 0, "moratoriumInterestTreatment": "needs_verification" },
  "notes": ["Illustrative monthly-instalment calculation. Actual NSFDC schemes may use quarterly instalments; …", "This is an arithmetic estimate, not a loan offer or approval."] }
```
Status: `200`, `422 INVALID_REQUEST`.

## GET `/api/partners`

Query (all optional): `scheme` (scheme id), `state`, `district`, `type` (`SCA`, `CA`, `PSB`, `RRB`, `NBFC-MFI`, `Cooperative Bank`, `Cooperative Society`, `Small Finance Bank`, `Other`), `latitude`, `longitude`, `radius` (km; requires both coordinates → else `422`). With coordinates, results are sorted nearest first and include `distanceKm`.
Response: `{ "partners": [Partner], "count": n, "notice": string|null }`. `notice` is set when any record is `DEMO`.

`Partner`: `id, name, type, state, district, address, latitude, longitude, supportedSchemes[], officialSource{url,document,lastVerified,dataStatus}, dataStatus, distanceKm, fundHealth{available:false, message}`.
`fundHealth.message` is always *"Partner-level fund-health information is not available in the current verified dataset."* — the API never returns NPA, processing time, approval rate, ranking or reliability data.

> **All partner records shipped with the prototype are `DEMO`** (simulated). Do not present them as real organisations.

## GET `/api/partners/{partnerId}`
Single `Partner`. Status: `200`, `404 PARTNER_NOT_FOUND`.

## GET `/api/health`
```json
{ "status": "ok", "database": "connected", "vectorSearch": "available", "version": "1.0.0" }
```
`vectorSearch`: `available` (pgvector installed), `fallback` (non-PostgreSQL in-process search; tests only), `unavailable`. `status` is `degraded` if the database or pgvector is missing. No secrets are exposed.

## Auth endpoints (Firebase-backed)

| method | path | notes |
|---|---|---|
| POST | `/api/auth/register` | Bearer Firebase ID token → creates profile, `201` + `UserProfile` (idempotent) |
| POST | `/api/auth/login` | Bearer token → verifies, returns `UserProfile` |
| POST | `/api/auth/logout` | stateless acknowledgement; call `signOut()` in Firebase on the client |
| GET | `/api/users/me` | Bearer token → `UserProfile` |

`UserProfile`: `{ id, email, phone, displayName, preferredLanguage, createdAt }`.

## Saved schemes / saved recommendations (auth required)

| method | path | notes |
|---|---|---|
| GET | `/api/users/me/saved-schemes` | `{ savedSchemes: [{ id, scheme: SchemeSummary, createdAt }], count }` |
| POST | `/api/users/me/saved-schemes` | body `{ schemeId }` → `201` + the saved record; idempotent (saving twice doesn't duplicate) |
| DELETE | `/api/users/me/saved-schemes/{schemeId}` | `204`, idempotent |
| GET | `/api/users/me/saved-recommendations` | `{ savedRecommendations: [{ id, requestId, request, response, createdAt }], count }` |
| POST | `/api/users/me/saved-recommendations` | body `{ request: RecommendRequest, response: RecommendResponse }` → `201`; the frontend saves the exact response it already received, not a fresh backend recomputation, so history reflects what the user actually saw |
| DELETE | `/api/users/me/saved-recommendations/{id}` | `204`, idempotent |

Every one of these is scoped to the authenticated user; one user's saved data is never visible to another.
