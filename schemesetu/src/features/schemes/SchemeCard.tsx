'use client';

import type { SchemeRecommendation } from '@/types/scheme';
import { APP_CONFIG } from '@/config/app';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import {
  ExternalLink,
  Calculator,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Calendar,
  Percent,
  Banknote,
  ShieldCheck,
  Wifi,
  WifiOff,
  Users,
} from 'lucide-react';
import Link from 'next/link';

interface SchemeCardProps {
  recommendation: SchemeRecommendation;
  isDemoData?: boolean;
}

export function SchemeCard({ recommendation, isDemoData }: SchemeCardProps) {
  const {
    scheme,
    relevanceReason,
    eligibilityChecks,
    requiresVerification,
    isEligible,
    applicationPath,
    applicationPathReason,
  } = recommendation;
  const { financialDetails, officialSource } = scheme;
  const isDigital = applicationPath === 'digital';
  const isOffline = applicationPath === 'offline';
  // isEligible === false means the engine ran and determined a hard fail;
  // isEligible === undefined means it wasn't deterministically evaluated (semantic search).
  const isExplicitlyIneligible = isEligible === false;

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'N/A';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow ${
        isExplicitlyIneligible
          ? 'border-neutral-grey/15 opacity-60'
          : 'border-neutral-grey/20 hover:shadow-md'
      }`}
    >
      {/* Top Banner */}
      <div className="bg-deep-indigo/5 px-6 py-4 border-b border-neutral-grey/15 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isExplicitlyIneligible ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-grey/10 text-neutral-grey">
              <AlertCircle size={14} aria-hidden="true" />
              Eligibility criteria not met
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-forest-green/10 text-forest-green">
              <ShieldCheck size={14} aria-hidden="true" />
              Potentially Suitable
            </span>
          )}
          {requiresVerification && !isExplicitlyIneligible && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted-ochre/15 text-muted-ochre">
              <HelpCircle size={13} aria-hidden="true" />
              Requires Verification
            </span>
          )}
        </div>
        {isDemoData && <DemoDataBadge />}
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Header Title */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-ochre">
              {scheme.shortName}
            </span>
            <span className="text-xs text-neutral-grey">• {scheme.category}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-deep-indigo">
            {scheme.name}
          </h2>
          <p className="text-sm text-neutral-grey mt-2 leading-relaxed">
            {scheme.description}
          </p>
        </div>

        {/* Why this appears */}
        <div className="bg-off-white p-4 rounded-lg border border-neutral-grey/15 text-sm">
          <h3 className="font-semibold text-deep-indigo text-xs uppercase tracking-wider mb-1">
            Why this is relevant to your requirement
          </h3>
          <p className="text-near-black/80">{relevanceReason}</p>
        </div>

        {/* ── Application path banner ─────────────────────────────────────── */}
        {applicationPath && applicationPathReason && (
          <div
            className={`flex items-start gap-3 p-4 rounded-lg border ${
              isDigital
                ? 'bg-forest-green/5 border-forest-green/25'
                : 'bg-muted-ochre/5 border-muted-ochre/25'
            }`}
          >
            {isDigital ? (
              <Wifi size={18} className="text-forest-green shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <WifiOff size={18} className="text-muted-ochre shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${
                isDigital ? 'text-forest-green' : 'text-muted-ochre'
              }`}>
                {isDigital ? 'Digital Application Available' : 'In-Person Application Required'}
              </p>
              <p className="text-sm text-near-black/80">{applicationPathReason}</p>
            </div>
          </div>
        )}

        {/* Financial Highlights Grid */}
        <div>
          <h3 className="font-semibold text-deep-indigo text-xs uppercase tracking-wider mb-3">
            Financial Terms & Concessions
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-off-white/60 rounded-lg border border-neutral-grey/10">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Banknote size={14} />
                <span>Max Loan</span>
              </div>
              <p className="text-base font-bold text-deep-indigo">
                {formatCurrency(financialDetails.maxLoanAmount)}
              </p>
            </div>

            <div className="p-3 bg-off-white/60 rounded-lg border border-neutral-grey/10">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Percent size={14} />
                <span>Interest Rate</span>
              </div>
              <p className="text-base font-bold text-deep-indigo">
                {financialDetails.interestRate}% p.a.
                {financialDetails.interestRateAlt && (
                  <span className="text-xs font-normal text-neutral-grey ml-1">
                    / {financialDetails.interestRateAlt}%
                  </span>
                )}
              </p>
              {financialDetails.interestRateNote && (
                <p className="text-[10px] text-neutral-grey mt-0.5">
                  {financialDetails.interestRateNote}
                </p>
              )}
            </div>

            <div className="p-3 bg-off-white/60 rounded-lg border border-neutral-grey/10">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Calendar size={14} />
                <span>Repayment</span>
              </div>
              <p className="text-base font-bold text-deep-indigo">
                {financialDetails.repaymentPeriod || 'Up to 5-10 yrs'}
              </p>
            </div>

            <div className="p-3 bg-off-white/60 rounded-lg border border-neutral-grey/10">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <FileText size={14} />
                <span>Moratorium</span>
              </div>
              <p className="text-base font-bold text-deep-indigo">
                {financialDetails.moratorium || 'Up to 6 mos'}
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility Criteria Status */}
        {eligibilityChecks && eligibilityChecks.length > 0 && (
          <div>
            <h3 className="font-semibold text-deep-indigo text-xs uppercase tracking-wider mb-3">
              Eligibility Verification Status
            </h3>
            <ul className="space-y-2.5">
              {eligibilityChecks.map((check, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg border border-neutral-grey/15 text-sm"
                >
                  {check.status === 'matched' && (
                    <CheckCircle2
                      size={18}
                      className="text-forest-green shrink-0 mt-0.5"
                      aria-label="Criteria matched"
                    />
                  )}
                  {check.status === 'needs_verification' && (
                    <HelpCircle
                      size={18}
                      className="text-muted-ochre shrink-0 mt-0.5"
                      aria-label="Requires verification"
                    />
                  )}
                  {check.status === 'not_matched' && (
                    <AlertCircle
                      size={18}
                      className="text-red-500 shrink-0 mt-0.5"
                      aria-label="Criteria not matched"
                    />
                  )}
                  <div>
                    <span className="font-semibold text-deep-indigo">
                      {check.criterion}:{' '}
                    </span>
                    <span className="text-near-black/80">{check.explanation}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Source Citation */}
        <div className="pt-2 border-t border-neutral-grey/15 flex flex-wrap items-center justify-between text-xs text-neutral-grey gap-2">
          <div className="min-w-0 flex-1 truncate">
            Official Source:{' '}
            <a
              href={officialSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-indigo font-medium underline hover:text-muted-ochre transition-colors truncate"
              title={officialSource.url}
            >
              {officialSource.organization}
            </a>
          </div>
          <div className="shrink-0">Last verified: {officialSource.lastVerified}</div>
        </div>

        {/* Actions — only shown for eligible/semantic cards; ineligible cards show a hint instead */}
        {isExplicitlyIneligible ? (
          <div className="pt-4 text-xs text-neutral-grey bg-neutral-grey/5 rounded-lg px-4 py-3">
            This scheme did not pass one or more eligibility criteria based on your inputs. Review
            the checks above or{' '}
            <span className="text-deep-indigo font-medium">modify your search</span> for a better
            match.
          </div>
        ) : (
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isOffline ? (
              // Offline path: Partner locator is primary, PM-SURAJ is secondary
              <>
                <Link
                  href={`/partners?scheme=${scheme.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-indigo text-white font-medium text-sm hover:bg-deep-indigo/90 shadow-sm transition-colors"
                >
                  <Users size={15} aria-hidden="true" />
                  Find Nearest Channel Partner
                </Link>
                <a
                  href={APP_CONFIG.urls.pmSuraj}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-neutral-grey/25 text-deep-indigo font-medium text-sm hover:bg-off-white transition-colors"
                >
                  PM-SURAJ Portal
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </>
            ) : (
              // Digital path or no-path (semantic results): PM-SURAJ is primary
              <a
                href={APP_CONFIG.urls.pmSuraj}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-indigo text-white font-medium text-sm hover:bg-deep-indigo/90 shadow-sm transition-colors"
              >
                Apply via Official PM-SURAJ Portal
                <ExternalLink size={15} aria-hidden="true" />
              </a>
            )}

            <Link
              href={`/calculator?amount=${financialDetails.maxLoanAmount ?? 200000}&rate=${financialDetails.interestRate ?? 6}&tenure=${financialDetails.repaymentPeriodMonths ? financialDetails.repaymentPeriodMonths / 12 : 5}&moratorium=${financialDetails.moratoriumMonths ?? 6}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-neutral-grey/25 text-deep-indigo font-medium text-sm hover:bg-off-white transition-colors"
            >
              <Calculator size={15} aria-hidden="true" />
              Calculate EMI
            </Link>

            {!isOffline && (
              <Link
                href={`/partners?scheme=${scheme.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-neutral-grey/25 text-deep-indigo font-medium text-sm hover:bg-off-white transition-colors"
              >
                <MapPin size={15} aria-hidden="true" />
                Find Partners
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
