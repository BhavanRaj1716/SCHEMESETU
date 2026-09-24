'use client';

import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';
import { NoticeBanner } from '@/components/layout/NoticeBanner';
import { GovernmentBannerCarousel } from '@/components/home/GovernmentBannerCarousel';
import { AnnouncementsTicker } from '@/components/home/AnnouncementsTicker';
import { StatCounters } from '@/components/visuals/StatCounters';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import {
  MicroEnterpriseIcon,
  TermLoanIcon,
  EducationIcon,
  CooperativeIcon,
} from '@/components/visuals/CategoryIllustrations';
import {
  ClipboardCheck,
  Calculator,
  MapPin,
  ExternalLink,
  FileCheck,
  Eye,
  BarChart3,
  ShieldCheck,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function HomePage() {
  const categories = [
    {
      title: 'Micro Enterprises & Small Shops',
      desc: 'Quick working capital and equipment financing for small businesses up to ₹1.40 Lakh.',
      icon: MicroEnterpriseIcon,
      schemeId: 'mfs',
      rate: '6.5% p.a.',
      maxCost: '₹1.40 Lakh',
      accentColor: 'border-l-4 border-[#FF9933]',
    },
    {
      title: 'Term Loans & Large Machinery',
      desc: 'Manufacturing, agriculture, machinery, and commercial activities up to ₹50 Lakh.',
      icon: TermLoanIcon,
      schemeId: 'term-loan',
      rate: '8.0% p.a.',
      maxCost: '₹50.00 Lakh',
      accentColor: 'border-l-4 border-[#152B4D]',
    },
    {
      title: 'Higher & Technical Education',
      desc: 'Professional engineering, medical, and degree courses in India and abroad.',
      icon: EducationIcon,
      schemeId: 'els',
      rate: '6.5% p.a.',
      maxCost: '₹40.00 Lakh',
      accentColor: 'border-l-4 border-[#2F6B4F]',
    },
    {
      title: 'Cooperative & SFB Channels',
      desc: 'Direct credit through Cooperative Banks, Societies, and Small Finance Banks.',
      icon: CooperativeIcon,
      schemeId: 'udyam-nidhi',
      rate: '13% - 15% p.a.',
      maxCost: '₹5.00 Lakh',
      accentColor: 'border-l-4 border-[#C77B33]',
    },
  ];

  return (
    <>
      {/* ============================================================
          Government Official Banner Carousel (Auto-rotates every 3s)
          ============================================================ */}
      <GovernmentBannerCarousel />

      {/* ============================================================
          Announcements Ticker Bar (Govt Style)
          ============================================================ */}
      <AnnouncementsTicker />

      {/* ============================================================
          Quick Action Bar & Live Stat Counters
          ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10">
        <StatCounters />
      </section>

      {/* ============================================================
          Explore by Scheme Category
          ============================================================ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-ochre">
              Structured Credit Discovery
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-deep-indigo">
              Explore Schemes by Loan Category
            </h2>
            <p className="text-sm text-neutral-grey">
              Select your requirement to view verified interest rates, project cost limits, and authorized partners.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <AnimatedSection key={cat.schemeId} delay={idx * 0.1}>
                  <Link
                    href={`/schemes/${cat.schemeId}`}
                    className={`block bg-white rounded-xl border border-neutral-grey/20 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all h-full flex flex-col justify-between group ${cat.accentColor}`}
                  >
                    <div>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="p-2.5 rounded-lg bg-off-white">
                          <Icon className="w-8 h-8" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-forest-green/10 text-forest-green">
                          {cat.rate}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-deep-indigo group-hover:text-muted-ochre transition-colors mb-2">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-neutral-grey leading-relaxed mb-4">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-neutral-grey/15 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-neutral-grey block text-[10px]">Max Project Cost</span>
                        <span className="font-bold text-deep-indigo">{cat.maxCost}</span>
                      </div>
                      <span className="font-semibold text-deep-indigo flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Details <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          5-Step Journey (Roadmap with Animated Cards)
          ============================================================ */}
      <section className="bg-white py-16 sm:py-20 border-y border-neutral-grey/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-ochre">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-deep-indigo">
              Your 5-Step Path to Concessional Credit
            </h2>
            <p className="text-sm text-neutral-grey">
              We guide you from initial discovery to being pre-informed and prepared for the official PM-SURAJ portal.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                step: '01',
                title: 'Describe Requirement',
                desc: 'Tell us your business idea, required project cost, or education plans in plain language or guided questions.',
                icon: MessageSquareText,
              },
              {
                step: '02',
                title: 'Check Eligibility',
                desc: 'We match your inputs against official criteria: income ceiling, category status, and cost bands.',
                icon: ClipboardCheck,
              },
              {
                step: '03',
                title: 'Calculate Real Costs',
                desc: 'Simulate monthly EMIs, quarterly installments, and moratorium interest with transparent math.',
                icon: Calculator,
              },
              {
                step: '04',
                title: 'Locate Partner',
                desc: 'Find authorized State Channelizing Agencies, NBFC-MFIs, or cooperative banks near your district.',
                icon: MapPin,
              },
              {
                step: '05',
                title: 'Apply on PM-SURAJ',
                desc: 'Proceed directly to the official government portal with pre-verified details and complete documents.',
                icon: ExternalLink,
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={item.step} delay={idx * 0.1}>
                  <div className="bg-off-white rounded-xl border border-neutral-grey/15 p-5 h-full flex flex-col justify-between hover:border-deep-indigo/30 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-black text-deep-indigo/25">
                          {item.step}
                        </span>
                        <div className="p-2 rounded-lg bg-deep-indigo/5 text-deep-indigo">
                          <Icon size={18} />
                        </div>
                      </div>
                      <h3 className="text-sm font-bold text-deep-indigo mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-neutral-grey leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          Trust Section: "Information You Can Verify"
          ============================================================ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-green">
              Trust & Transparency
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-deep-indigo">
              Information You Can Verify
            </h2>
            <p className="text-sm text-neutral-grey">
              Built on transparency, factual data provenance, and clear ethical boundaries.
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FileCheck,
                title: 'Official Sources',
                desc: 'Every interest rate, loan ceiling, and moratorium period cites the official NSFDC source page and verification date.',
              },
              {
                icon: Eye,
                title: 'Transparent Criteria',
                desc: 'We show you exactly which criteria you meet, which need checking, and what documents are required before you apply.',
              },
              {
                icon: BarChart3,
                title: 'Financial Clarity',
                desc: 'See full quarterly amortization schedules and interest during grace periods so there are no surprises.',
              },
              {
                icon: ShieldCheck,
                title: 'Zero Intermediaries',
                desc: 'We never accept applications or collect processing fees. You apply directly on the official Government of India PM-SURAJ portal.',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <AnimatedSection key={idx} delay={idx * 0.1}>
                  <div className="bg-white rounded-xl border border-neutral-grey/20 p-6 shadow-sm h-full space-y-3 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-lg bg-forest-green/10 text-forest-green flex items-center justify-center">
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-bold text-deep-indigo">
                      {item.title}
                    </h3>
                    <p className="text-xs text-neutral-grey leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================
          Official Channel Handoff Banner
          ============================================================ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <AnimatedSection>
          <div className="bg-deep-indigo rounded-2xl p-8 sm:p-12 text-white flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
            <div className="space-y-3 text-center lg:text-left relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90">
                <CheckCircle2 size={14} className="text-muted-ochre" />
                Official Application Gateway
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Know what you need? Apply directly on PM-SURAJ.
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                If you already know which NSFDC scheme fits your requirements, you can apply right now through the Ministry of Social Justice and Empowerment&apos;s official single-window portal.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto relative z-10">
              <a
                href={APP_CONFIG.urls.pmSuraj}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#FF9933] hover:bg-[#e08527] text-white font-bold text-sm transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Open PM-SURAJ Portal
                <ExternalLink size={16} />
              </a>
              <Link
                href="/find"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors border border-white/20 whitespace-nowrap"
              >
                Help Me Choose First
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Persistent notice banner */}
      <NoticeBanner />
    </>
  );
}
