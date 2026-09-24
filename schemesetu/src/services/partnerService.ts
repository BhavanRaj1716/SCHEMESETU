/**
 * Partner Service
 *
 * v1 (mock mode):  reads from local demo partner data.
 * v2 (API mode):   calls GET /api/partners
 *
 * Switch between modes by setting/unsetting NEXT_PUBLIC_API_URL in .env.local.
 */

import type { ChannelPartner, PartnerFilters } from '@/types/partner';
import { apiRequest, IS_MOCK_MODE } from './apiClient';
import { DEMO_PARTNERS } from './mockData/partners';

const MOCK_DELAY_MS = 400;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getPartners(filters?: PartnerFilters): Promise<ChannelPartner[]> {
  if (IS_MOCK_MODE) {
    await delay(MOCK_DELAY_MS);
    let results = [...DEMO_PARTNERS];
    if (filters?.schemeId)
      results = results.filter((p) => p.supportedSchemes.includes(filters.schemeId!));
    if (filters?.partnerType)
      results = results.filter((p) => p.type === filters.partnerType);
    if (filters?.state)
      results = results.filter((p) => p.state.toLowerCase() === filters.state!.toLowerCase());
    if (filters?.district)
      results = results.filter((p) => p.district.toLowerCase() === filters.district!.toLowerCase());
    return results;
  }

  return apiRequest<ChannelPartner[]>('/api/partners', {
    params: {
      schemeId: filters?.schemeId,
      partnerType: filters?.partnerType,
      state: filters?.state,
      district: filters?.district,
    },
  });
}

export async function getPartnerById(id: string): Promise<ChannelPartner | null> {
  if (IS_MOCK_MODE) {
    await delay(100);
    return DEMO_PARTNERS.find((p) => p.id === id) ?? null;
  }
  try {
    return await apiRequest<ChannelPartner>(`/api/partners/${id}`);
  } catch {
    return null;
  }
}

export async function getAvailableStates(): Promise<string[]> {
  if (IS_MOCK_MODE) {
    await delay(100);
    return [...new Set(DEMO_PARTNERS.map((p) => p.state))].sort();
  }
  return apiRequest<string[]>('/api/partners/states');
}

export async function getDistrictsForState(state: string): Promise<string[]> {
  if (IS_MOCK_MODE) {
    await delay(100);
    return [
      ...new Set(
        DEMO_PARTNERS.filter((p) => p.state.toLowerCase() === state.toLowerCase()).map(
          (p) => p.district
        )
      ),
    ].sort();
  }
  return apiRequest<string[]>('/api/partners/districts', { params: { state } });
}
