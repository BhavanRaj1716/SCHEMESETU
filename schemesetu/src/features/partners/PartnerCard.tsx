'use client';

import type { ChannelPartner } from '@/types/partner';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { APP_CONFIG } from '@/config/app';
import {
  MapPin,
  Tag,
  Phone,
  Clock,
  CheckCircle2,
  ExternalLink,
  Compass,
} from 'lucide-react';

interface PartnerCardProps {
  partner: ChannelPartner;
  isSelected?: boolean;
  onSelect?: () => void;
}

const getPartnerTypeColor = (type: string) => {
  switch (type) {
    case 'State Channelizing Agencies (SCAs)':
    case 'SCA/CA':
      return 'bg-deep-indigo/10 text-deep-indigo border-deep-indigo/20';
    case 'Public Sector Banks (PSBs)':
      return 'bg-cyan-50 text-cyan-800 border-cyan-200';
    case 'Regional Rural Banks (RRBs)':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    case 'NBFC–Micro Finance Institutions (NBFC-MFIs)':
    case 'NBFC-MFI':
      return 'bg-muted-ochre/15 text-muted-ochre border-muted-ochre/25';
    case 'Co-operative Banks':
    case 'Cooperative Bank':
      return 'bg-forest-green/10 text-forest-green border-forest-green/20';
    case 'Small Finance Banks (SFBs)':
    case 'Small Finance Bank':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Cooperative Societies':
    case 'Cooperative Society':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'Other Agencies & SIDBI':
      return 'bg-amber-50 text-stone-800 border-stone-200';
    default:
      return 'bg-deep-indigo/10 text-deep-indigo border-deep-indigo/20';
  }
};

const schemeLabels: Record<string, string> = {
  mfs: 'Micro Finance (MFS)',
  'term-loan': 'Term Loan',
  aajeevika: 'Aajeevika MFY',
  'udyam-nidhi': 'Udyam Nidhi',
  els: 'Educational Loan',
};

export function PartnerCard({ partner, isSelected, onSelect }: PartnerCardProps) {
  const {
    name,
    type,
    state,
    district,
    address,
    supportedSchemes,
    contactPhone,
    workingHours,
    verificationStatus,
    lastVerifiedDate,
    isDemoData,
  } = partner;

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-2xl border p-5 shadow-sm transition-all cursor-pointer ${
        isSelected
          ? 'border-deep-indigo ring-2 ring-deep-indigo/25 shadow-md bg-deep-indigo/[0.02]'
          : 'border-neutral-grey/20 hover:border-neutral-grey/40 hover:shadow-md'
      }`}
    >
      {/* Top Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPartnerTypeColor(
              type
            )}`}
          >
            {type}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-forest-green font-semibold">
            <CheckCircle2 size={12} />
            {verificationStatus}
          </span>
        </div>
        {isDemoData && <DemoDataBadge />}
      </div>

      {/* Partner Title */}
      <h3 className="text-base font-bold text-deep-indigo mb-1.5 leading-snug">
        {name}
      </h3>

      {/* Address */}
      <div className="flex items-start gap-1.5 text-xs text-near-black/75 mb-3">
        <MapPin size={14} className="text-muted-ochre shrink-0 mt-0.5" />
        <span className="line-clamp-2">{address}</span>
      </div>

      {/* Supported Schemes */}
      <div className="space-y-1 mb-3">
        <span className="text-[10px] font-semibold text-neutral-grey uppercase tracking-wider block">
          Authorized NSFDC Schemes:
        </span>
        <div className="flex flex-wrap gap-1">
          {supportedSchemes.map((sid) => (
            <span
              key={sid}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-off-white text-[11px] font-medium text-deep-indigo border border-neutral-grey/15"
            >
              <Tag size={10} className="text-muted-ochre" />
              {schemeLabels[sid] || sid}
            </span>
          ))}
        </div>
      </div>

      {/* Contact & Hours */}
      <div className="bg-off-white p-2.5 rounded-xl border border-neutral-grey/15 space-y-1 text-xs text-neutral-grey mb-3">
        {contactPhone && (
          <div className="flex items-center gap-1.5 text-near-black/85">
            <Phone size={13} className="text-muted-ochre" />
            <span>{contactPhone}</span>
          </div>
        )}
        {workingHours && (
          <div className="flex items-center gap-1.5 text-[11px]">
            <Clock size={12} />
            <span>{workingHours}</span>
          </div>
        )}
        <div className="text-[10px] text-neutral-grey/80 pt-0.5">
          District: <strong className="text-deep-indigo">{district}</strong>, {state} • Verified: {lastVerifiedDate}
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="pt-2 border-t border-neutral-grey/15 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
          className="inline-flex items-center gap-1 text-xs font-bold text-deep-indigo hover:text-muted-ochre transition-colors"
        >
          <Compass size={14} />
          Focus on Map
        </button>

        <a
          href={APP_CONFIG.urls.pmSuraj}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted-ochre hover:bg-muted-ochre/90 text-white font-bold text-[11px] shadow-sm transition-colors"
        >
          Apply via PM-SURAJ <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}
