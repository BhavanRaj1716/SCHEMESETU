/**
 * Channel Partner Types — Official 8-Tier Taxonomy
 * Recognized under NSFDC & Ministry of Social Justice & Empowerment (PM-SURAJ)
 */

import type { OfficialSource } from './scheme';

export type PartnerType =
  | 'State Channelizing Agencies (SCAs)'
  | 'Public Sector Banks (PSBs)'
  | 'Regional Rural Banks (RRBs)'
  | 'NBFC–Micro Finance Institutions (NBFC-MFIs)'
  | 'Co-operative Banks'
  | 'Small Finance Banks (SFBs)'
  | 'Cooperative Societies'
  | 'Other Agencies & SIDBI';

export interface ChannelPartner {
  id: string;
  name: string;
  type: PartnerType;
  shortType?: string;
  state: string;
  district: string;
  address: string;
  latitude: number;
  longitude: number;
  supportedSchemes: string[];
  contactPhone?: string;
  contactEmail?: string;
  workingHours?: string;
  website?: string;
  verificationStatus: 'Verified Official Partner' | 'Authorized Channel Partner';
  lastVerifiedDate: string;
  officialSource?: OfficialSource;
  /** True for simulated branch locations under official partner agreements */
  isDemoData: boolean;
}

export interface PartnerFilters {
  searchQuery?: string;
  schemeId?: string;
  partnerType?: string;
  state?: string;
  district?: string;
  radiusKm?: number | null;
}
