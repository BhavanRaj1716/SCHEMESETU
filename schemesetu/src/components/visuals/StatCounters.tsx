'use client';

import { motion } from 'framer-motion';
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
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-xl border border-neutral-grey/20 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
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
          </motion.div>
        );
      })}
    </div>
  );
}
