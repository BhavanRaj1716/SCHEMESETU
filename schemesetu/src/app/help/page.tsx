'use client';

import { useState } from 'react';
import { APP_CONFIG } from '@/config/app';
import {
  HelpCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Globe,
  Building,
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'About SchemeSetu & PM-SURAJ',
    question: 'What is SchemeSetu and what is its role?',
    answer:
      'SchemeSetu is an intelligent discovery and financial guidance layer designed to help Scheduled Caste beneficiaries find suitable concessional credit schemes from NSFDC, calculate repayment scenarios, and locate authorized channel partners. It is an enhancement tool that hands you off pre-informed to the official Government of India PM-SURAJ portal for the actual loan application.',
  },
  {
    category: 'About SchemeSetu & PM-SURAJ',
    question: 'Does SchemeSetu approve or disburse loans?',
    answer:
      'No. SchemeSetu does not approve loans, accept formal loan applications, or disburse funds. All formal applications, document verification, credit appraisal, and loan sanctioning are conducted strictly by authorized State Channelizing Agencies (SCAs), partner banks, and NBFC-MFIs via the official PM-SURAJ portal.',
  },
  {
    category: 'About SchemeSetu & PM-SURAJ',
    question: 'What is the PM-SURAJ portal?',
    answer:
      'PM-SURAJ (Pradhan Mantri Samajik Utthan evam Rozgar Adharit Jankalyan) is the official single-window credit portal launched in March 2024 by the Ministry of Social Justice and Empowerment (MoSJE), Government of India, enabling beneficiaries from marginalized communities to directly apply for and track concessional credit schemes.',
  },
  {
    category: 'Eligibility & Requirements',
    question: 'Who is eligible for NSFDC credit schemes?',
    answer:
      'Beneficiaries must belong to the Scheduled Caste (SC) community with a valid community certificate issued by the competent revenue authority. For most schemes, the total annual family income must not exceed ₹5,00,000 (DPL ceiling). Specific schemes may also have purpose-related criteria (such as admission in technical/professional courses for Educational Loans).',
  },
  {
    category: 'Eligibility & Requirements',
    question: 'What documents are required to apply?',
    answer:
      'Standard required documents include: (1) Valid Scheduled Caste Certificate, (2) Income Certificate showing annual family income ≤ ₹5,00,000, (3) Identity Proof (Aadhaar Card, Voter ID, or PAN), (4) Address Proof, (5) Bank Account details, (6) Detailed Project Report / Quotation for business activities or Admission Letter & Fee Structure for education loans.',
  },
  {
    category: 'Financial Terms & Repayment',
    question: 'What is a moratorium period and does interest accrue?',
    answer:
      'A moratorium period is a grace period before principal loan repayments begin, allowing you time to establish your business or complete your course. During this time, interest accrual policy varies by scheme and partner guidelines. SchemeSetu provides an interest-accrual toggle in the calculator to simulate conservative repayment estimates.',
  },
  {
    category: 'Financial Terms & Repayment',
    question: 'What is the difference between an SCA, NBFC-MFI, and Cooperative Bank?',
    answer:
      'State Channelizing Agencies (SCAs) are state-government undertakings established specifically for SC welfare that offer the lowest interest rates (e.g., 6.5%–8% p.a.). NBFC-MFIs and Cooperative Banks/SFBs are partner financial institutions that reach areas where SCA branch presence may be limited, offering schemes like Aajeevika MFY and Udyam Nidhi with slightly different interest structures.',
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    'all',
    'About SchemeSetu & PM-SURAJ',
    'Eligibility & Requirements',
    'Financial Terms & Repayment',
  ];

  const filteredFaqs = FAQS.filter(
    (faq) => selectedCategory === 'all' || faq.category === selectedCategory
  );

  return (
    <div className="min-h-[80vh] pb-16">
      {/* Header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle size={20} className="text-muted-ochre" />
            <span className="text-xs uppercase tracking-wider text-white/70 font-semibold">
              Assistance & Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Frequently Asked Questions & Support
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
            Learn how NSFDC concessional loans work, understand eligibility guidelines, and discover how to apply via the official Government of India portal.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Important Clarification Banner */}
        <div className="bg-deep-indigo/5 border border-deep-indigo/15 rounded-xl p-5 flex items-start gap-3.5">
          <ShieldCheck size={22} className="text-deep-indigo shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-near-black/85 space-y-1 leading-relaxed">
            <h2 className="font-bold text-deep-indigo text-sm sm:text-base">
              Important Role Clarification
            </h2>
            <p>
              SchemeSetu is a prototype decision-support tool built for Smart India Hackathon 2026. It does not collect fees, request banking credentials, or accept formal applications. To apply for any scheme, always use the official PM-SURAJ portal.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-deep-indigo text-white shadow-sm'
                  : 'bg-white text-near-black/70 border border-neutral-grey/20 hover:bg-off-white'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl border border-neutral-grey/20 overflow-hidden shadow-sm transition-shadow"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-deep-indigo text-sm sm:text-base hover:bg-off-white/60 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp size={18} className="shrink-0 text-muted-ochre" />
                  ) : (
                    <ChevronDown size={18} className="shrink-0 text-neutral-grey" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-near-black/80 leading-relaxed border-t border-neutral-grey/10">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Official Resources & Helplines */}
        <div className="bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-8 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-deep-indigo">
            Official Government Helplines & Portals
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-off-white border border-neutral-grey/15 space-y-2">
              <div className="flex items-center gap-2 font-bold text-deep-indigo text-sm">
                <Globe size={16} className="text-muted-ochre" />
                <span>PM-SURAJ Official Portal</span>
              </div>
              <p className="text-xs text-neutral-grey">
                Ministry of Social Justice & Empowerment, Govt. of India
              </p>
              <a
                href={APP_CONFIG.urls.pmSuraj}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-deep-indigo hover:text-muted-ochre"
              >
                Visit pmsuraj.dosje.gov.in <ExternalLink size={12} />
              </a>
            </div>

            <div className="p-4 rounded-lg bg-off-white border border-neutral-grey/15 space-y-2">
              <div className="flex items-center gap-2 font-bold text-deep-indigo text-sm">
                <Building size={16} className="text-deep-indigo" />
                <span>NSFDC Head Office</span>
              </div>
              <p className="text-xs text-neutral-grey">
                National Scheduled Castes Finance & Development Corporation
              </p>
              <a
                href={APP_CONFIG.urls.nsfdc}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-deep-indigo hover:text-muted-ochre"
              >
                Visit nsfdc.nic.in <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
