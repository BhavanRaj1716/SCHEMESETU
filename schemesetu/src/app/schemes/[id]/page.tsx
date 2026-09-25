'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VERIFIED_SCHEMES } from '@/services/mockData/schemes';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { IS_MOCK_MODE } from '@/services/apiClient';
import { APP_CONFIG } from '@/config/app';
import {
  ArrowLeft,
  ExternalLink,
  Calculator,
  MapPin,
  CheckSquare,
  Square,
  ShieldCheck,
  FileText,
  Calendar,
  Percent,
  Banknote,
  Building2,
} from 'lucide-react';
import { SchemeAudioNarrator } from '@/components/common/SchemeAudioNarrator';

interface SchemeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const resolvedParams = use(params);
  const scheme = VERIFIED_SCHEMES.find((s) => s.id === resolvedParams.id);

  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});

  if (!scheme) {
    notFound();
  }

  const toggleDoc = (idx: number) => {
    setCheckedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'N/A';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  const { financialDetails, officialSource } = scheme;
  const checkedCount = Object.values(checkedDocs).filter(Boolean).length;
  const totalDocs = scheme.requiredDocuments.length;

  return (
    <div className="min-h-[80vh] pb-16">
      {/* Header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <Link
            href="/schemes"
            className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Scheme Directory
          </Link>

          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted-ochre/20 text-muted-ochre border border-muted-ochre/30">
                {scheme.shortName}
              </span>
              <span className="text-xs text-white/60">• {scheme.category}</span>
            </div>
            {IS_MOCK_MODE && <DemoDataBadge />}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            {scheme.name}
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-3xl">
            {scheme.purpose}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Audio Read-Aloud Accessibility Narrator */}
        <SchemeAudioNarrator scheme={scheme} variant="full" />

        {/* Description & Objective */}
        <section className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-deep-indigo">Scheme Objective & Overview</h2>
          <p className="text-sm text-near-black/85 leading-relaxed">
            {scheme.description}
          </p>
          <div className="bg-off-white rounded-lg p-4 border border-neutral-grey/15 text-xs text-neutral-grey flex items-start gap-2">
            <ShieldCheck size={16} className="text-forest-green shrink-0 mt-0.5" />
            <div>
              <span>Verified Government Scheme: Concessional interest rates are directly subsidized by NSFDC. Beneficiaries must belong to Scheduled Caste (SC) living within the prescribed family income ceiling.</span>
            </div>
          </div>
        </section>

        {/* Financial Terms Breakdown */}
        <section className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-deep-indigo flex items-center justify-between">
            <span>Financial Terms & Conditions</span>
            <span className="text-xs font-normal text-neutral-grey">Official NSFDC Limits</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-off-white rounded-lg border border-neutral-grey/15">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Banknote size={15} />
                <span>Max Project Cost</span>
              </div>
              <p className="text-lg font-bold text-deep-indigo">
                {formatCurrency(financialDetails.maxProjectCost)}
              </p>
            </div>

            <div className="p-4 bg-off-white rounded-lg border border-neutral-grey/15">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Banknote size={15} />
                <span>Max NSFDC Loan</span>
              </div>
              <p className="text-lg font-bold text-deep-indigo">
                {formatCurrency(financialDetails.maxLoanAmount)}
              </p>
            </div>

            <div className="p-4 bg-off-white rounded-lg border border-neutral-grey/15">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Percent size={15} />
                <span>Interest Rate</span>
              </div>
              <p className="text-lg font-bold text-deep-indigo">
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

            <div className="p-4 bg-off-white rounded-lg border border-neutral-grey/15">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Calendar size={15} />
                <span>Repayment Period</span>
              </div>
              <p className="text-sm font-bold text-deep-indigo">
                {financialDetails.repaymentPeriod || 'Up to 5 years'}
              </p>
            </div>

            <div className="p-4 bg-off-white rounded-lg border border-neutral-grey/15">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <FileText size={15} />
                <span>Moratorium Period</span>
              </div>
              <p className="text-sm font-bold text-deep-indigo">
                {financialDetails.moratorium || 'Up to 6 months'}
              </p>
              {financialDetails.moratoriumNote && (
                <p className="text-[10px] text-neutral-grey mt-0.5">
                  {financialDetails.moratoriumNote}
                </p>
              )}
            </div>

            <div className="p-4 bg-off-white rounded-lg border border-neutral-grey/15">
              <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                <Building2 size={15} />
                <span>Funding Coverage</span>
              </div>
              <p className="text-sm font-bold text-deep-indigo">
                {financialDetails.coverage || 'Up to 90% of Project Cost'}
              </p>
            </div>
          </div>

          <div className="bg-off-white/60 p-3.5 rounded-lg border border-neutral-grey/15 text-xs text-neutral-grey flex items-center justify-between">
            <span>Interest during moratorium: Subject to partner policy (defaults to standard accrual calculation)</span>
            <Link
              href={`/calculator?amount=${financialDetails.maxLoanAmount ?? 200000}&rate=${financialDetails.interestRate ?? 6}&tenure=${financialDetails.repaymentPeriodMonths ? financialDetails.repaymentPeriodMonths / 12 : 5}&moratorium=${financialDetails.moratoriumMonths ?? 6}`}
              className="inline-flex items-center gap-1 font-semibold text-deep-indigo hover:text-muted-ochre"
            >
              <Calculator size={13} />
              Calculate Repayment Schedule
            </Link>
          </div>
        </section>

        {/* Eligibility Criteria */}
        <section className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-deep-indigo">Eligibility Criteria</h2>
          <div className="space-y-3">
            {scheme.eligibility.map((rule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-off-white border border-neutral-grey/15 flex items-start gap-3"
              >
                <div className="p-1 rounded-full bg-forest-green/10 text-forest-green mt-0.5">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-deep-indigo">
                    {rule.criterion}
                  </h3>
                  <p className="text-xs text-near-black/80 mt-0.5">
                    {rule.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Document Checklist */}
        <section className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-deep-indigo">
                Required Documents Checklist
              </h2>
              <p className="text-xs text-neutral-grey mt-0.5">
                Prepare and tick off these documents before submitting on PM-SURAJ
              </p>
            </div>
            <div className="text-xs font-semibold px-3 py-1 bg-deep-indigo/10 text-deep-indigo rounded-full">
              {checkedCount} of {totalDocs} prepared
            </div>
          </div>

          <div className="space-y-2">
            {scheme.requiredDocuments.map((doc, idx) => {
              const isChecked = !!checkedDocs[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDoc(idx)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-colors flex items-center gap-3 ${
                    isChecked
                      ? 'bg-forest-green/5 border-forest-green/30 text-near-black'
                      : 'bg-off-white border-neutral-grey/20 text-near-black/80 hover:bg-neutral-grey/5'
                  }`}
                >
                  {isChecked ? (
                    <CheckSquare size={18} className="text-forest-green shrink-0" />
                  ) : (
                    <Square size={18} className="text-neutral-grey shrink-0" />
                  )}
                  <span className={`text-xs sm:text-sm ${isChecked ? 'font-medium' : ''}`}>
                    {doc}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Authorized Channel Partners */}
        <section className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-8 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-deep-indigo">
            Authorized Channel Partners
          </h2>
          <p className="text-xs text-neutral-grey">
            This scheme is disbursed and serviced through the following official partner channels:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {scheme.channelPartnerTypes.map((type, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-deep-indigo/5 text-deep-indigo border border-deep-indigo/15"
              >
                {type}
              </span>
            ))}
          </div>
        </section>

        {/* Official Source & Attestation */}
        <div className="p-4 bg-off-white rounded-xl border border-neutral-grey/20 flex flex-wrap items-center justify-between text-xs text-neutral-grey gap-2">
          <div className="min-w-0 flex-1 truncate">
            Official Source:{' '}
            <a
              href={officialSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-deep-indigo font-medium underline hover:text-muted-ochre truncate"
              title={officialSource.url}
            >
              {officialSource.organization}
            </a>
          </div>
          <div className="shrink-0">Last Verified: {officialSource.lastVerified}</div>
        </div>

        {/* Action Handoff Footer */}
        <div className="bg-deep-indigo rounded-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Apply for this Scheme</h3>
            <p className="text-xs sm:text-sm text-white/70">
              Applications are officially processed on the Government of India PM-SURAJ portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <a
              href={APP_CONFIG.urls.pmSuraj}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 bg-muted-ochre hover:bg-muted-ochre/90 text-white font-semibold text-xs sm:text-sm rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Apply via PM-SURAJ Portal
              <ExternalLink size={15} />
            </a>
            <Link
              href={`/partners?scheme=${scheme.id}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm rounded-lg transition-colors whitespace-nowrap"
            >
              <MapPin size={15} />
              Find Local Partner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
