/**
 * Scheme Service
 *
 * v1 (mock mode):  reads from local verified mock data.
 * v2 (API mode):   calls GET /api/schemes and GET /api/schemes/:id
 *
 * Switch between modes by setting/unsetting NEXT_PUBLIC_API_URL in .env.local.
 * Do NOT import mock data anywhere else in the codebase.
 */

import type { Scheme } from '@/types/scheme';
import { apiRequest, IS_MOCK_MODE } from './apiClient';
import { VERIFIED_SCHEMES } from './mockData/schemes';

const MOCK_DELAY_MS = 300;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function getAllSchemes(): Promise<Scheme[]> {
  if (IS_MOCK_MODE) {
    await delay(MOCK_DELAY_MS);
    return VERIFIED_SCHEMES;
  }
  return apiRequest<Scheme[]>('/api/schemes');
}

export async function getSchemeById(id: string): Promise<Scheme | null> {
  if (IS_MOCK_MODE) {
    await delay(MOCK_DELAY_MS);
    return VERIFIED_SCHEMES.find((s) => s.id === id) ?? null;
  }
  try {
    return await apiRequest<Scheme>(`/api/schemes/${id}`);
  } catch {
    return null;
  }
}

export async function getSchemesByCategory(category: string): Promise<Scheme[]> {
  if (IS_MOCK_MODE) {
    await delay(MOCK_DELAY_MS);
    return VERIFIED_SCHEMES.filter((s) => s.category === category);
  }
  return apiRequest<Scheme[]>('/api/schemes', { params: { category } });
}
