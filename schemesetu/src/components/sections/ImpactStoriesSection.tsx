'use client';

import Image from 'next/image';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { Quote, MapPin, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

interface Story {
  name: string;
  location: string;
  role: string;
  scheme: string;
  schemeId: string;
  loanAmount: string;
  interestRate: string;
  quote: string;
  impact: string;
  imageUrl: string;
  tag: string;
}

const STORIES: Story[] = [
  {
    name: 'Smt. Kavitha Selvam',
    location: 'Madurai, Tamil Nadu',
    role: 'Garment & Tailoring Unit Owner',
    scheme: 'Micro Finance Scheme (MFS)',
    schemeId: 'mfs',
    loanAmount: '₹1,25,000',
    interestRate: '6.5% p.a.',
    quote:
      'With subsidized credit from TAHDCO under NSFDC, I purchased two commercial sewing machines and now employ three women from my neighborhood.',
    impact: 'Expanded from 1 manual machine to a 4-person micro apparel workshop.',
    imageUrl:
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80', // Indian woman artisan / textiles
    tag: 'Women Empowerment',
  },
  {
    name: 'Shri Rajesh Sonawane',
    location: 'Nashik, Maharashtra',
    role: 'Automobile Service & Fabrication',
    scheme: 'Term Loan Scheme',
    schemeId: 'term-loan',
    loanAmount: '₹4,50,000',
    interestRate: '8.0% p.a.',
    quote:
      'The 6-month moratorium gave me enough time to procure hydraulic lifting machinery and set up my garage without repayment pressure from day one.',
    impact: 'Established an independent modern vehicle servicing center.',
    imageUrl:
      'https://images.unsplash.com/photo-1618258385455-e44229535523?auto=format&fit=crop&w=600&q=80', // Indian technician / mechanic entrepreneur
    tag: 'Technical Enterprise',
  },
  {
    name: 'Priya Kumari',
    location: 'Varanasi, Uttar Pradesh',
    role: 'B.Tech (Computer Science) Student',
    scheme: 'Educational Loan Scheme',
    schemeId: 'els',
    loanAmount: '₹7,50,000',
    interestRate: '6.5% p.a.',
    quote:
      'NSFDC education financing covered my 4-year engineering tuition and hostel fees with repayment starting only 1 year after graduation.',
    impact: 'Secured full funding for engineering without private high-interest loans.',
    imageUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80', // Student in university / college
    tag: 'Higher Education',
  },
  {
    name: 'Pratibha Mahila SHG',
    location: 'Jaipur, Rajasthan',
    role: 'Organic Dairy & Dairy Cooperative',
    scheme: 'Aajeevika MFY (NBFC-MFI Channel)',
    schemeId: 'aajeevika',
    loanAmount: '₹1,40,000 / member',
    interestRate: '15.0% p.a.',
    quote:
      'Through our local MFI partner, our 10-member group procured dairy livestock and chilled storage equipment to supply directly to city collection centers.',
    impact: 'Doubled monthly household income across 10 rural families.',
    imageUrl:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80', // Rural Indian enterprise / empowerment
    tag: 'Grassroots SHG',
  },
];

export function ImpactStoriesSection() {
  return (
    <section className="py-16 sm:py-24 bg-off-white/80 border-t border-neutral-grey/15 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <AnimatedSection className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-green/10 text-forest-green">
            <CheckCircle2 size={14} />
            Real Beneficiary Journeys
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-deep-indigo">
            Empowering Scheduled Caste Entrepreneurs & Students
          </h2>
          <p className="text-sm text-neutral-grey leading-relaxed">
            Illustrative impact scenarios demonstrating how concessional interest rates, moratorium grace periods, and channel partners translate into self-reliance (Atmanirbhar Bharat).
          </p>
        </AnimatedSection>

        {/* Story Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {STORIES.map((story, idx) => (
            <AnimatedSection key={story.name} delay={idx * 0.1}>
              <div className="bg-white rounded-2xl border border-neutral-grey/20 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col sm:flex-row h-full group">
                {/* Photo Column */}
                <div className="sm:w-2/5 relative h-56 sm:h-auto overflow-hidden bg-deep-indigo/10 shrink-0">
                  <Image
                    src={story.imageUrl}
                    alt={story.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep-indigo/80 via-transparent to-transparent sm:hidden" />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-deep-indigo/90 text-white backdrop-blur-md">
                    {story.tag}
                  </span>
                </div>

                {/* Content Column */}
                <div className="p-6 sm:w-3/5 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-grey mb-1">
                      <MapPin size={13} className="text-muted-ochre" />
                      <span>{story.location}</span>
                    </div>

                    <h3 className="text-base font-bold text-deep-indigo">
                      {story.name}
                    </h3>
                    <p className="text-xs font-medium text-muted-ochre">
                      {story.role}
                    </p>

                    <div className="my-3 p-3 bg-off-white rounded-lg border border-neutral-grey/15 text-xs text-near-black/85 relative">
                      <Quote size={14} className="text-deep-indigo/30 mb-1" />
                      <p className="italic leading-relaxed">{story.quote}</p>
                    </div>

                    <p className="text-[11px] text-forest-green font-semibold">
                      ✓ Impact: {story.impact}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-neutral-grey/15 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-neutral-grey block">Sanctioned Terms</span>
                      <span className="font-bold text-deep-indigo">
                        {story.loanAmount} @ {story.interestRate}
                      </span>
                    </div>

                    <Link
                      href={`/schemes/${story.schemeId}`}
                      className="inline-flex items-center gap-1 font-semibold text-deep-indigo hover:text-muted-ochre transition-colors text-xs"
                    >
                      View Scheme <ArrowUpRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
