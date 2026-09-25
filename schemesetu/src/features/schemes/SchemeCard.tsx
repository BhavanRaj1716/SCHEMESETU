'use client';

import { useState } from 'react';
import type { SchemeRecommendation } from '@/types/scheme';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { SchemeAudioNarrator } from '@/components/common/SchemeAudioNarrator';
import {
  ExternalLink,
  Calculator,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ClipboardList,
  Copy,
  Check,
  ChevronDown,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

interface SchemeCardProps {
  recommendation: SchemeRecommendation;
  isDemoData?: boolean;
}

export function SchemeCard({ recommendation, isDemoData }: SchemeCardProps) {
  const [showHelper, setShowHelper] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    scheme,
    relevanceReason,
    eligibilityChecks,
    requiresVerification,
    isEligible,
    applicationPath,
    applicationPathReason,
  } = recommendation;
  const { financialDetails } = scheme;
  const isExplicitlyIneligible = isEligible === false;
  const isOffline = applicationPath === 'offline';

  const copyApplicationSummary = () => {
    const summaryText = `--- SCHEMESETU APPLICATION CHECKLIST ---
Scheme Name: ${scheme.name}
Scheme ID/Code: ${scheme.id}
Interest Rate: ${financialDetails.interestRate ?? 6}% p.a. Concessional
Max Loan Limit: ₹${financialDetails.maxLoanAmount?.toLocaleString('en-IN') ?? 'N/A'}
Application Gateway: PM-SURAJ (https://pmsuraj.dosje.gov.in/login)

REQUIRED DOCUMENTS CHECKLIST:
1. Scheduled Caste (SC) Community Certificate
2. Income Certificate (Annual family income ≤ ₹5,00,000)
3. Identity & Address Proof (Aadhaar / Voter ID / PAN)
4. Bank Account Details (Passbook / Cancelled Cheque)
5. Project Report / Business Plan or College Admission Letter`;

    navigator.clipboard.writeText(summaryText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-7 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Top Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

      <div className="space-y-5">
        {/* Header: Title + Badges + Audio Narrator */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#FF9933] uppercase tracking-wider">
                {scheme.category.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold">
                ID: {scheme.id}
              </span>
              {isDemoData && <DemoDataBadge />}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-deep-indigo tracking-tight">
              {scheme.name}
            </h3>
          </div>

          {/* Status Pills & Audio Narrator */}
          <div className="flex items-center gap-2 self-start shrink-0 flex-wrap">
            <SchemeAudioNarrator scheme={scheme} variant="compact" />
            {isExplicitlyIneligible ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                <AlertCircle size={13} />
                Mismatch Found
              </span>
            ) : requiresVerification ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <HelpCircle size={13} />
                Verification Needed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 size={13} />
                Eligible Match
              </span>
            )}
          </div>
        </div>

        {/* Purpose / Description */}
        <p className="text-sm text-near-black/80 leading-relaxed">
          {scheme.purpose || scheme.description}
        </p>

        {/* Financial Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-off-white/80 p-4 rounded-lg border border-neutral-grey/15">
          <div>
            <span className="text-[11px] text-neutral-grey block font-medium">Interest Rate</span>
            <span className="text-sm font-bold text-forest-green">
              {financialDetails.interestRate ?? 6}% p.a.
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-grey block font-medium">Max Loan Limit</span>
            <span className="text-sm font-bold text-deep-indigo">
              ₹{financialDetails.maxLoanAmount ? (financialDetails.maxLoanAmount / 100000).toFixed(2) + ' Lakh' : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-grey block font-medium">Repayment Tenure</span>
            <span className="text-sm font-bold text-near-black">
              {financialDetails.repaymentPeriodMonths ? (financialDetails.repaymentPeriodMonths / 12) + ' Years' : 'Flexible'}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-neutral-grey block font-medium">Grace Period</span>
            <span className="text-sm font-bold text-muted-ochre">
              {financialDetails.moratoriumMonths ? financialDetails.moratoriumMonths + ' Mos' : 'None'}
            </span>
          </div>
        </div>

        {/* Relevance Reason */}
        {relevanceReason && (
          <div className="text-xs bg-deep-indigo/5 border border-deep-indigo/10 p-3 rounded-lg text-near-black/90">
            <span className="font-bold text-deep-indigo block mb-0.5">Why this matches your requirement:</span>
            {relevanceReason}
          </div>
        )}

        {/* Eligibility Checks Checklist */}
        {eligibilityChecks && eligibilityChecks.length > 0 && (
          <div className="space-y-2 border-t border-neutral-grey/15 pt-4">
            <h4 className="text-xs font-bold text-near-black uppercase tracking-wider">
              Statutory Eligibility Verification
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {eligibilityChecks.map((check, idx) => (
                <div
                  key={idx}
                  className="text-xs p-2.5 rounded-lg border border-neutral-grey/10 bg-off-white/40 flex items-start gap-2"
                >
                  {check.status === 'matched' ? (
                    <CheckCircle2 size={15} className="text-forest-green shrink-0 mt-0.5" />
                  ) : check.status === 'not_matched' ? (
                    <AlertCircle size={15} className="text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <HelpCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold text-near-black block">{check.criterion}</span>
                    <span className="text-[11px] text-neutral-grey leading-tight block mt-0.5">
                      {check.explanation}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons & Application Guidance */}
        {!isExplicitlyIneligible && (
          <div className="border-t border-neutral-grey/15 pt-4 space-y-3">
            {/* Direct Bank Visit / Offline Callout for amounts > ₹15 Lakhs or non-digital cases */}
            {isOffline && (
              <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-3.5 text-xs text-amber-950 flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <Building2 size={18} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <span>Direct Bank / Channel Partner Application Required</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 bg-amber-200/80 text-amber-900 rounded font-semibold">
                      In-Person
                    </span>
                  </div>
                  <p className="text-amber-800/95 leading-relaxed text-[11px]">
                    {applicationPathReason ||
                      'For loan amounts exceeding ₹15 Lakh or specialized categories, digital online processing via PM-SURAJ is not applicable. The beneficiary must visit an authorized Channel Partner or Bank branch directly with physical project documents.'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {/* Primary Action Button */}
              {isOffline ? (
                <Link
                  href={`/partners?scheme=${scheme.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-deep-indigo text-white font-semibold text-xs hover:bg-deep-indigo/90 transition-colors shadow-xs"
                >
                  <Building2 size={14} />
                  <span>Visit Channel Partner / Bank</span>
                </Link>
              ) : (
                <a
                  href="https://pmsuraj.dosje.gov.in/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-deep-indigo text-white font-semibold text-xs hover:bg-deep-indigo/90 transition-colors shadow-xs"
                >
                  <span>Apply on PM-SURAJ</span>
                  <ExternalLink size={13} />
                </a>
              )}

              {/* Toggle Document Helper Drawer */}
              <button
                type="button"
                onClick={() => setShowHelper(!showHelper)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-grey/25 bg-off-white hover:bg-neutral-grey/15 text-near-black font-medium text-xs transition-colors"
              >
                <ClipboardList size={14} className="text-[#FF9933]" />
                <span>{showHelper ? 'Hide Checklist' : 'Application Checklist'}</span>
                <ChevronDown size={13} className={`transition-transform ${showHelper ? 'rotate-180' : ''}`} />
              </button>

              <Link
                href={`/calculator?amount=${financialDetails.maxLoanAmount ?? 200000}&rate=${financialDetails.interestRate ?? 6}&tenure=${financialDetails.repaymentPeriodMonths ? financialDetails.repaymentPeriodMonths / 12 : 5}&moratorium=${financialDetails.moratoriumMonths ?? 6}`}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-grey/25 text-deep-indigo font-medium text-xs hover:bg-off-white transition-colors"
              >
                <Calculator size={14} aria-hidden="true" />
                <span>EMI Calc</span>
              </Link>

              {/* Secondary link for offline or online */}
              {isOffline ? (
                <a
                  href="https://pmsuraj.dosje.gov.in/login"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-grey/25 text-deep-indigo font-medium text-xs hover:bg-off-white transition-colors"
                >
                  <span>PM-SURAJ Info</span>
                  <ExternalLink size={12} />
                </a>
              ) : (
                <Link
                  href={`/partners?scheme=${scheme.id}`}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-neutral-grey/25 text-deep-indigo font-medium text-xs hover:bg-off-white transition-colors"
                >
                  <MapPin size={14} aria-hidden="true" />
                  <span>Partners</span>
                </Link>
              )}
            </div>

            {/* Expandable Application Preparation Checklist Drawer */}
            {showHelper && (
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-4 text-xs space-y-3 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-deep-indigo uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ClipboardList size={14} className="text-[#FF9933]" />
                    Documents Required When Applying on PM-SURAJ
                  </span>
                  <button
                    type="button"
                    onClick={copyApplicationSummary}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-gray-100 border border-amber-200 text-deep-indigo font-medium text-[11px] transition-colors shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-700 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Details</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-near-black/85">
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">1.</span>
                    <span><strong>SC Caste Certificate:</strong> Issued by competent revenue authority.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">2.</span>
                    <span><strong>Income Certificate:</strong> Annual family income ≤ ₹5,00,000.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">3.</span>
                    <span><strong>Identity Proof:</strong> Aadhaar Card, Voter ID, or PAN Card.</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="text-emerald-700 font-bold">4.</span>
                    <span><strong>Bank Details:</strong> Savings bank passbook / cancelled cheque.</span>
                  </div>
                  <div className="flex items-start gap-1.5 col-span-1 sm:col-span-2">
                    <span className="text-emerald-700 font-bold">5.</span>
                    <span><strong>Activity Proof:</strong> Quotation for machinery/vehicle or College Admission Letter (for Education Loans).</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px] text-neutral-grey">
                  <span>Step: Click <strong>Apply on PM-SURAJ</strong> $\rightarrow$ Log in with Mobile OTP $\rightarrow$ Select <strong>{scheme.name}</strong>.</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
