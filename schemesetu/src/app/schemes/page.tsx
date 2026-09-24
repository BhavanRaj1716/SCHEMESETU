'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VERIFIED_SCHEMES } from '@/services/mockData/schemes';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { IS_MOCK_MODE } from '@/services/apiClient';
import {
  Search,
  Filter,
  Calculator,
  Calendar,
  Percent,
  Banknote,
  FileCheck,
  Building2,
} from 'lucide-react';

export default function SchemeDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPartnerType, setSelectedPartnerType] = useState<string>('all');

  const categories = ['all', 'Micro Enterprise', 'Enterprise Finance', 'Education'];
  const partnerTypes = [
    'all',
    'State Channelizing Agencies (SCAs)',
    'Public Sector Banks (PSBs)',
    'Regional Rural Banks (RRBs)',
    'NBFC–Micro Finance Institutions (NBFC-MFIs)',
    'Co-operative Banks',
    'Small Finance Banks (SFBs)',
    'Cooperative Societies',
    'Other Agencies & SIDBI',
  ];

  const filteredSchemes = VERIFIED_SCHEMES.filter((scheme) => {
    const matchesSearch =
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || scheme.category === selectedCategory;

    const matchesPartner =
      selectedPartnerType === 'all' ||
      scheme.channelPartnerTypes.includes(selectedPartnerType);

    return matchesSearch && matchesCategory && matchesPartner;
  });

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'N/A';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              NSFDC Concessional Credit Schemes Directory
            </h1>
            {IS_MOCK_MODE && <DemoDataBadge />}
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
            Explore all {VERIFIED_SCHEMES.length} concessional credit schemes offered by the National Scheduled Castes Finance and Development Corporation (NSFDC). Verified against official NSFDC records.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-grey"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search schemes by name, keyword, or purpose..."
                className="w-full pl-10 pr-4 py-2.5 bg-off-white border border-neutral-grey/25 rounded-lg text-sm text-near-black placeholder:text-neutral-grey focus:outline-none focus:ring-2 focus:ring-deep-indigo"
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-neutral-grey shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-off-white border border-neutral-grey/25 rounded-lg px-3 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
                  aria-label="Filter by scheme category"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedPartnerType}
                onChange={(e) => setSelectedPartnerType(e.target.value)}
                className="bg-off-white border border-neutral-grey/25 rounded-lg px-3 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
                aria-label="Filter by channel partner type"
              >
                {partnerTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt === 'all' ? 'All Partner Channels' : pt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scheme Listings */}
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-grey/20 p-6">
            <p className="text-neutral-grey text-sm mb-4">
              No schemes match your current search and filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPartnerType('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-deep-indigo border border-deep-indigo/30 rounded-lg hover:bg-off-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-xl border border-neutral-grey/20 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-ochre">
                      {scheme.shortName}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-off-white text-neutral-grey border border-neutral-grey/15">
                      {scheme.category}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-deep-indigo mb-2">
                    {scheme.name}
                  </h2>
                  <p className="text-xs text-neutral-grey mb-4 line-clamp-2">
                    {scheme.description}
                  </p>

                  {/* Quick specs grid — 3 compact cells + full-width Channel Partners row */}
                  <div className="py-3 border-y border-neutral-grey/15 text-xs mb-4 space-y-2.5">
                    {/* Row 1: Max Loan · Interest Rate · Tenure */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Banknote size={14} className="text-muted-ochre shrink-0" />
                        <div className="min-w-0">
                          <p className="text-neutral-grey text-[10px]">Max Loan</p>
                          <p className="font-semibold text-near-black truncate">
                            {formatCurrency(scheme.financialDetails.maxLoanAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Percent size={14} className="text-forest-green shrink-0" />
                        <div className="min-w-0">
                          <p className="text-neutral-grey text-[10px]">Interest Rate</p>
                          <p className="font-semibold text-near-black truncate">
                            {scheme.financialDetails.interestRate}% p.a.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar size={14} className="text-deep-indigo shrink-0" />
                        <div className="min-w-0">
                          <p className="text-neutral-grey text-[10px]">Tenure</p>
                          <p className="font-semibold text-near-black truncate">
                            {scheme.financialDetails.repaymentPeriod?.split(',')[0] || 'Up to 5 yrs'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Channel Partners — full width, each on its own line */}
                    <div className="flex items-start gap-1.5">
                      <Building2 size={14} className="text-neutral-grey shrink-0 mt-0.5" />
                      <div>
                        <p className="text-neutral-grey text-[10px] mb-1">Channel Partners</p>
                        <ul className="space-y-0.5">
                          {scheme.channelPartnerTypes.map((partner) => (
                            <li key={partner} className="font-semibold text-near-black leading-snug">
                              {partner}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-grey">
                    <span>Source: {scheme.officialSource.organization}</span>
                    <span>Verified: {scheme.officialSource.lastVerified}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-deep-indigo text-white text-xs font-semibold hover:bg-deep-indigo/90 transition-colors"
                    >
                      <FileCheck size={14} />
                      View Details
                    </Link>
                    <Link
                      href={`/calculator?amount=${scheme.financialDetails.maxLoanAmount ?? 200000}&rate=${scheme.financialDetails.interestRate ?? 6}&tenure=${scheme.financialDetails.repaymentPeriodMonths ? scheme.financialDetails.repaymentPeriodMonths / 12 : 5}&moratorium=${scheme.financialDetails.moratoriumMonths ?? 6}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-grey/25 text-deep-indigo text-xs font-semibold hover:bg-off-white transition-colors"
                    >
                      <Calculator size={14} />
                      Calculator
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
