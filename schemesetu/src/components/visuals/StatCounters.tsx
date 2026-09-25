'use client';

import { useEffect, useRef } from 'react';
import { ShieldCheck, Percent, Banknote, Building2 } from 'lucide-react';

const STATS = [
  {
    icon: Banknote,
    label: 'Max Loan Amount',
    value: 'Up to ₹50 Lakh',
    subtext: 'Term Loan Scheme',
    color: 'text-forest-green',
  },
  {
    icon: Percent,
    label: 'Concessional Interest',
    value: 'From 6.5% p.a.',
    subtext: 'Directly subsidized by NSFDC',
    color: 'text-muted-ochre',
  },
  {
    icon: ShieldCheck,
    label: 'Family Income Ceiling',
    value: '₹5,00,000 / yr',
    subtext: 'Double Poverty Line (DPL)',
    color: 'text-deep-indigo',
  },
  {
    icon: Building2,
    label: 'Authorized Channels',
    value: 'SCAs & Partner Banks',
    subtext: 'Integrated via PM-SURAJ',
    color: 'text-deep-indigo',
  },
];

export function StatCounters() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll<HTMLDivElement>('[data-stat-card]'));

    cards.forEach((card, idx) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = `opacity 0.5s ease ${idx * 0.1}s, transform 0.5s ease ${idx * 0.1}s`;
    });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          cards.forEach((card) => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
          observer.disconnect();
        }
      },
      { rootMargin: '-40px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            data-stat-card
            className="group bg-white rounded-xl border border-neutral-grey/20 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-grey">
                {stat.label}
              </span>
              <div className="p-2 rounded-lg bg-off-white">
                <Icon size={16} className={stat.color} />
              </div>
            </div>

            <div>
              <p className="text-lg sm:text-xl font-bold text-deep-indigo">
                {stat.value}
              </p>
              <p className="text-[11px] text-neutral-grey mt-0.5">
                {stat.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
