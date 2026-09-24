# SchemeSetu — Frontend Architecture Notes

## Service / API Abstraction Layer

All data access goes through `src/services/`. **Never import mock data directly in pages or components.**

```
Page / Feature Component
        ↓
  Service (schemeService, partnerService, recommendationService)
        ↓
  apiClient.ts  ──── IS_MOCK_MODE? ──── YES → mockData/ (local)
                                    └── NO  → fetch(NEXT_PUBLIC_API_URL + path)
```

### Switching to the real backend

1. Copy `.env.local.example` → `.env.local`
2. Set `NEXT_PUBLIC_API_URL=http://localhost:4000` (or wherever the backend runs)
3. Restart `npm run dev`

That's it. No code changes needed.

### Adding a new API endpoint

1. Add the fetch call in the relevant service file using `apiRequest()`
2. Add the mock fallback in the same `if (IS_MOCK_MODE)` block
3. Document the endpoint shape in `API_CONTRACT.md`

---

## Mock Data Rules

- Mock data lives exclusively in `src/services/mockData/`
- Every mock data file must have a header comment citing its official source and last-verified date
- `isDemoData: true` must be set on every mock object
- `DemoDataBadge` must be shown on any page/section backed by mock data

---

## What NOT to do

- Do not call `fetch()` directly in components or pages
- Do not import from `mockData/` outside of service files
- Do not fabricate financial values, interest rates, or eligibility criteria — use `null` and show the `dataUnavailable` disclaimer from `APP_CONFIG.disclaimers`
