# SchemeSetu — Frontend ↔ Backend API Contract

> **For the backend developer.**
> This document defines the REST API endpoints the frontend expects.
> The frontend service layer (`src/services/`) calls these endpoints when
> `NEXT_PUBLIC_API_URL` is set. Until then it runs in mock mode.

---

## Base URL

Set `NEXT_PUBLIC_API_URL` in the frontend's `.env.local` to your server's base URL.

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

All paths below are relative to that base.

---

## Common Conventions

- All responses are `Content-Type: application/json`.
- Monetary values are **integers in paise** OR **floats in rupees** — pick one and document it here. The frontend currently uses **rupees as floats** (e.g. `125000.0`).
- Dates are ISO 8601 strings (`"2026-09-21"`).
- `isDemoData: boolean` must be present on any response that contains simulated/unverified data.
- On error, return `{ "error": "<message>" }` with an appropriate HTTP status code.

---

## 1. Scheme Recommendations

### `POST /api/schemes/recommend`

The core endpoint. Accepts a user's requirement (either free-text or structured) and returns a ranked list of relevant schemes with eligibility checks.

**Request body — Semantic mode:**
```json
{
  "mode": "semantic",
  "query": "I need ₹3 lakh to start a small dairy business."
}
```

**Request body — Guided mode:**
```json
{
  "mode": "guided",
  "purpose": "start_business",
  "estimatedProjectCost": 300000,
  "loanAmountRequired": 270000,
  "annualFamilyIncome": 180000,
  "state": "Tamil Nadu",
  "district": "Madurai",
  "age": 32,
  "category": "SC",
  "educationLevel": "12th_pass"
}
```

`purpose` values: `start_business | expand_business | education | agriculture | services | other`

**Response:**
```json
{
  "recommendations": [
    {
      "scheme": { /* Scheme object — see Section 2 */ },
      "relevanceReason": "Your project cost of ₹3 lakh falls in the Term Loan band.",
      "eligibilityChecks": [
        {
          "criterion": "Annual Family Income",
          "status": "matched",
          "explanation": "Your income of ₹1.8 lakh is within the ₹5,00,000 ceiling."
        },
        {
          "criterion": "Caste Category",
          "status": "needs_verification",
          "explanation": "SC category — a valid caste certificate will be required."
        }
      ],
      "requiresVerification": true
    }
  ],
  "timestamp": "2026-09-21T10:30:00.000Z",
  "isDemoData": false
}
```

`status` values: `matched | not_matched | needs_verification`

---

## 2. Scheme Directory

### `GET /api/schemes`

Returns all schemes. Optional query params for filtering.

**Query params:**
- `category` — e.g. `Micro Enterprise`, `Enterprise Finance`, `Education`

**Response:** `Scheme[]` (see Scheme shape below)

---

### `GET /api/schemes/:id`

Returns a single scheme by ID.

**Response:** `Scheme` or `404`

---

### Scheme Object Shape

```json
{
  "id": "mfs",
  "name": "Micro Finance Scheme",
  "shortName": "MFS",
  "category": "Micro Enterprise",
  "purpose": "Small/micro business activities with project cost up to ₹1.40 lakh",
  "description": "...",
  "eligibility": [
    {
      "criterion": "Caste Category",
      "description": "Must belong to Scheduled Caste (SC) community...",
      "field": "category",
      "value": "SC"
    }
  ],
  "financialDetails": {
    "maxLoanAmount": 125000,
    "maxProjectCost": 140000,
    "interestRate": 6.5,
    "interestRateAlt": null,
    "interestRateNote": null,
    "repaymentPeriod": "3 years, quarterly instalments",
    "repaymentPeriodMonths": 36,
    "moratorium": "3 months",
    "moratoriumMonths": 3,
    "moratoriumNote": null,
    "coverage": "90% of project cost",
    "interestDuringMoratorium": null
  },
  "requiredDocuments": [
    "Scheduled Caste certificate issued by competent authority",
    "..."
  ],
  "officialSource": {
    "organization": "NSFDC",
    "url": "https://nsfdc.nic.in/scheme",
    "lastVerified": "2026-09-21"
  },
  "channelPartnerTypes": [
    "State Channelizing Agencies (SCAs)",
    "Public Sector Banks (PSBs)"
  ]
}
```

---

## 3. Channel Partners

### `GET /api/partners`

Returns channel partners. All query params are optional.

**Query params:**
- `schemeId` — filter by supported scheme (e.g. `mfs`, `term-loan`)
- `partnerType` — e.g. `State Channelizing Agencies (SCAs)`
- `state` — e.g. `Tamil Nadu`
- `district` — e.g. `Madurai`

**Response:** `ChannelPartner[]`

---

### `GET /api/partners/:id`

Returns a single partner by ID.

**Response:** `ChannelPartner` or `404`

---

### `GET /api/partners/states`

Returns a sorted list of all states that have at least one partner.

**Response:** `string[]`

---

### `GET /api/partners/districts?state=Tamil+Nadu`

Returns a sorted list of districts in the given state that have at least one partner.

**Response:** `string[]`

---

### ChannelPartner Object Shape

```json
{
  "id": "sca-tahdco-01",
  "name": "Tamil Nadu Adi Dravidar Housing & Development Corporation (TAHDCO)",
  "type": "State Channelizing Agencies (SCAs)",
  "shortType": "SCA",
  "state": "Tamil Nadu",
  "district": "Chennai",
  "address": "No. 31, 2nd Lane, Cenotaph Road, Teynampet, Chennai - 600018",
  "latitude": 13.0389,
  "longitude": 80.2468,
  "supportedSchemes": ["mfs", "term-loan", "els"],
  "contactPhone": "044-24310244",
  "contactEmail": "tahdco.ho@tn.gov.in",
  "workingHours": "Mon - Fri: 9:30 AM - 5:30 PM",
  "website": null,
  "verificationStatus": "Verified Official Partner",
  "lastVerifiedDate": "2026-09-21",
  "isDemoData": false
}
```

`type` must be one of:
- `State Channelizing Agencies (SCAs)`
- `Public Sector Banks (PSBs)`
- `Regional Rural Banks (RRBs)`
- `NBFC–Micro Finance Institutions (NBFC-MFIs)`
- `Co-operative Banks`
- `Small Finance Banks (SFBs)`
- `Cooperative Societies`
- `Other Agencies & SIDBI`

---

## 4. CORS

The backend must allow requests from the frontend origin.
During development: `http://localhost:3000`
In production: the deployed frontend domain.

---

## 5. What the Backend Must NOT Do

- Never fabricate financial values, interest rates, or eligibility criteria.
- Never return `isDemoData: false` for data that has not been verified against an official source.
- The `officialSource.url` and `officialSource.lastVerified` fields must always be present and accurate.
