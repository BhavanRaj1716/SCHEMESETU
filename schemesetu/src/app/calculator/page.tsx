'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { EMICalculator } from '@/features/calculator/EMICalculator';

function CalculatorContent() {
  const searchParams = useSearchParams();

  const initialAmount = Number(searchParams.get('amount')) || 250000;
  const initialRate = Number(searchParams.get('rate')) || 8.0;
  const initialTenureYears = Number(searchParams.get('tenure')) || 7;
  const initialMoratorium = Number(searchParams.get('moratorium')) || 6;

  return (
    <EMICalculator
      initialAmount={initialAmount}
      initialRate={initialRate}
      initialTenureYears={initialTenureYears}
      initialMoratorium={initialMoratorium}
    />
  );
}

export default function CalculatorPage() {
  return (
    <div className="min-h-[80vh] pb-16">
      {/* Header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-3">
            Concessional Loan Repayment Calculator
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-2xl">
            Simulate monthly EMIs, quarterly installments, moratorium interest, and total repayment schedules for NSFDC concessional credit schemes.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Suspense fallback={<div className="text-center py-12 text-neutral-grey text-sm">Loading financial calculator...</div>}>
          <CalculatorContent />
        </Suspense>
      </div>
    </div>
  );
}
