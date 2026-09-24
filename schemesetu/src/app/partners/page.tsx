'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PartnerLocator } from '@/features/partners/PartnerLocator';

function PartnersContent() {
  const searchParams = useSearchParams();
  const initialScheme = searchParams.get('scheme') || 'all';

  return <PartnerLocator initialScheme={initialScheme} />;
}

export default function PartnersPage() {
  return (
    <div className="min-h-[80vh] pb-16">
      {/* Header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Channel Partner Locator
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
            Locate authorized State Channelizing Agencies (SCAs), NBFC-MFIs, and cooperative partner banks that process and service NSFDC concessional loans.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense fallback={<div className="text-center py-12 text-neutral-grey text-sm">Loading partner directory & map...</div>}>
          <PartnersContent />
        </Suspense>
      </div>
    </div>
  );
}
