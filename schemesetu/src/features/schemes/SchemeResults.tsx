'use client';

import type { RecommendationResponse } from '@/types/recommendation';
import { SchemeCard } from './SchemeCard';
import { ErrorState } from '@/components/ui/ErrorState';
import {
  ArrowLeft,
  ExternalLink,
  Info,
  ShieldAlert,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { APP_CONFIG } from '@/config/app';
import Link from 'next/link';
import { useState } from 'react';

interface SchemeResultsProps {
  response: RecommendationResponse | null;
  onBack: () => void;
}

export function SchemeResults({ response, onBack }: SchemeResultsProps) {
  const [showOther, setShowOther] = useState(false);

  if (!response || !response.recommendations || response.recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-grey hover:text-deep-indigo transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Search
        </button>
        <ErrorState
          variant="no_scheme"
          onModify={onBack}
        />
      </div>
    );
  }

  const { recommendations, timestamp } = response;
  const formattedTime = new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Partition: eligible (isEligible true, or isEligible undefined = semantic) vs. explicitly ineligible
  const eligibleRecs = recommendations.filter((r) => r.isEligible !== false);
  const ineligibleRecs = recommendations.filter((r) => r.isEligible === false);

  // Determine whether any eligible recommendation has a digital path available
  const allOffline =
    eligibleRecs.length > 0 &&
    eligibleRecs.every(
      (r) => r.applicationPath === 'offline' || r.applicationPath === undefined,
    ) &&
    eligibleRecs.some((r) => r.applicationPath === 'offline');

  return (
    <div className="space-y-8">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-grey/15">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-grey hover:text-deep-indigo transition-colors"
        >
          <ArrowLeft size={16} />
          Modify Search Criteria
        </button>

        <div className="text-xs text-neutral-grey">
          <span className="font-semibold text-deep-indigo">{eligibleRecs.length}</span>{' '}
          potentially suitable {eligibleRecs.length === 1 ? 'scheme' : 'schemes'} found
          {ineligibleRecs.length > 0 && (
            <> · <span className="text-neutral-grey">{ineligibleRecs.length} other</span></>
          )}
          {' '}• Checked at {formattedTime}
        </div>
      </div>

      {/* Mandatory Regulatory & Hand-off Callout */}
      <div className="bg-deep-indigo/5 border border-deep-indigo/15 rounded-xl p-4 sm:p-5 flex items-start gap-3.5">
        <Info className="text-deep-indigo shrink-0 mt-0.5" size={20} />
        <div className="text-xs sm:text-sm text-near-black/80 space-y-1 leading-relaxed">
          <p className="font-semibold text-deep-indigo">
            Important Information About Concessional Schemes
          </p>
          <p>
            This portal assists in discovering eligible schemes and calculating estimated terms.
            Actual sanction, interest subsidies, and disbursement are handled by authorized State
            Channelizing Agencies (SCAs) and channel partners via the official Government of India
            PM-SURAJ portal.
          </p>
          <p className="text-neutral-grey">
            Full document verification happens on the official application — this only helps us
            recommend the right scheme.
          </p>
        </div>
      </div>

      {/* ── Eligible Schemes ──────────────────────────────────────────────────── */}
      {eligibleRecs.length > 0 ? (
        <section aria-labelledby="eligible-schemes-heading">
          <h2
            id="eligible-schemes-heading"
            className="text-xs font-semibold uppercase tracking-widest text-forest-green mb-4 flex items-center gap-2"
          >
            <span className="inline-block w-2 h-2 rounded-full bg-forest-green" aria-hidden="true" />
            Potentially Suitable for You
          </h2>
          <div className="space-y-6">
            {eligibleRecs.map((rec) => (
              <SchemeCard key={rec.scheme.id} recommendation={rec} isDemoData={response.isDemoData} />
            ))}
          </div>
        </section>
      ) : (
        <div className="rounded-xl border border-neutral-grey/20 bg-off-white p-6 text-sm text-near-black/70 text-center">
          No schemes matched all your criteria. See the other NSFDC schemes below, or{' '}
          <button
            onClick={onBack}
            className="text-deep-indigo underline font-medium hover:text-muted-ochre transition-colors"
          >
            modify your details
          </button>
          .
        </div>
      )}

      {/* ── Other NSFDC Schemes (ineligible) ─────────────────────────────────── */}
      {ineligibleRecs.length > 0 && (
        <section aria-labelledby="other-schemes-heading">
          <button
            id="other-schemes-heading"
            onClick={() => setShowOther((v) => !v)}
            aria-expanded={showOther}
            className="w-full flex items-center justify-between gap-3 py-3 border-t border-neutral-grey/20 text-sm font-medium text-neutral-grey hover:text-deep-indigo transition-colors group"
          >
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-neutral-grey/40 group-hover:bg-deep-indigo/40 transition-colors" aria-hidden="true" />
              Other NSFDC schemes
              <span className="inline-flex items-center justify-center text-xs font-semibold rounded-full bg-neutral-grey/10 px-2 py-0.5">
                {ineligibleRecs.length}
              </span>
            </span>
            {showOther ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showOther && (
            <div className="mt-4 space-y-6">
              <p className="text-xs text-neutral-grey bg-neutral-grey/5 border border-neutral-grey/15 rounded-lg px-4 py-3">
                The following schemes are offered by NSFDC but did not match one or more of your
                entered criteria. They are shown for reference only.
              </p>
              {ineligibleRecs.map((rec) => (
                <SchemeCard key={rec.scheme.id} recommendation={rec} isDemoData={response.isDemoData} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Official Channel Handoff Banner — conditional on path */}
      {eligibleRecs.length > 0 && (
        <div className="bg-deep-indigo rounded-xl p-6 sm:p-8 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90">
              <ShieldAlert size={14} />
              {allOffline ? 'Visit a Channel Partner' : 'Official Government Channel'}
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Ready to apply?</h3>
            <p className="text-sm text-white/70 max-w-xl">
              {allOffline
                ? 'Your case needs to be handled in person. Find your nearest authorized channel partner and bring the relevant documents.'
                : 'Proceed to the official PM-SURAJ portal (Ministry of Social Justice and Empowerment) to submit your application directly to authorized channel partners.'}
            </p>
          </div>

          {allOffline ? (
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/partners"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-muted-ochre hover:bg-muted-ochre/90 text-white font-semibold text-sm transition-colors whitespace-nowrap shadow-sm"
              >
                <Users size={16} />
                Find Channel Partners
              </Link>
              <a
                href={APP_CONFIG.urls.pmSuraj}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/60 hover:text-white/90 underline transition-colors"
              >
                Also available on PM-SURAJ portal
                <ExternalLink size={11} className="inline ml-1" />
              </a>
            </div>
          ) : (
            <a
              href={APP_CONFIG.urls.pmSuraj}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-muted-ochre hover:bg-muted-ochre/90 text-white font-semibold text-sm transition-colors whitespace-nowrap shadow-sm"
            >
              Open PM-SURAJ Portal
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
