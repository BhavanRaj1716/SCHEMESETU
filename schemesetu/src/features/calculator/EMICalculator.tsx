'use client';

import { useState, useId } from 'react';
import type { EMIInput, EMIResult } from '@/types/calculator';
import { calculateEMI, formatIndianCurrency } from '@/services/calculatorService';
import { RepaymentBreakdown } from './RepaymentBreakdown';
import { RepaymentScheduleTable } from './RepaymentScheduleTable';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { IS_MOCK_MODE } from '@/services/apiClient';
import { APP_CONFIG } from '@/config/app';
import {
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';

interface PresetOption {
  label: string;
  schemeId: string;
  amount: number;
  rate: number;
  tenureYears: number;
  moratoriumMonths: number;
}

const SCHEME_PRESETS: PresetOption[] = [
  {
    label: 'Micro Finance Scheme (MFS)',
    schemeId: 'mfs',
    amount: 125000,
    rate: 6.5,
    tenureYears: 3,
    moratoriumMonths: 3,
  },
  {
    label: 'Term Loan Scheme',
    schemeId: 'term-loan',
    amount: 250000,
    rate: 8.0,
    tenureYears: 7,
    moratoriumMonths: 6,
  },
  {
    label: 'Udyam Nidhi Yojana',
    schemeId: 'udyam-nidhi',
    amount: 450000,
    rate: 13.0,
    tenureYears: 5,
    moratoriumMonths: 3,
  },
  {
    label: 'Aajeevika MFY (NBFC-MFI)',
    schemeId: 'aajeevika',
    amount: 125000,
    rate: 15.0,
    tenureYears: 3,
    moratoriumMonths: 3,
  },
  {
    label: 'Educational Loan Scheme',
    schemeId: 'els',
    amount: 1000000,
    rate: 6.5,
    tenureYears: 10,
    moratoriumMonths: 12,
  },
];

interface EMICalculatorProps {
  initialAmount?: number;
  initialRate?: number;
  initialTenureYears?: number;
  initialMoratorium?: number;
}

export function EMICalculator({
  initialAmount = 250000,
  initialRate = 8.0,
  initialTenureYears = 7,
  initialMoratorium = 6,
}: EMICalculatorProps) {
  const [loanAmount, setLoanAmount] = useState<number>(initialAmount);
  const [interestRate, setInterestRate] = useState<number>(initialRate);
  const [tenureYears, setTenureYears] = useState<number>(initialTenureYears);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(initialMoratorium);
  const [interestAccrues, setInterestAccrues] = useState<boolean>(true);

  const amountId = useId();
  const rateId = useId();
  const tenureId = useId();
  const moratoriumId = useId();

  const input: EMIInput = {
    loanAmount,
    annualInterestRate: interestRate,
    tenureMonths: tenureYears * 12,
    moratoriumMonths,
    interestAccruesDuringMoratorium: interestAccrues,
  };

  const result: EMIResult = calculateEMI(input);

  const applyPreset = (preset: PresetOption) => {
    setLoanAmount(preset.amount);
    setInterestRate(preset.rate);
    setTenureYears(preset.tenureYears);
    setMoratoriumMonths(preset.moratoriumMonths);
  };

  const handleReset = () => {
    setLoanAmount(initialAmount);
    setInterestRate(initialRate);
    setTenureYears(initialTenureYears);
    setMoratoriumMonths(initialMoratorium);
    setInterestAccrues(true);
  };

  return (
    <div className="space-y-8">
      {/* Preset Quick Fill Bar */}
      <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-deep-indigo uppercase tracking-wider">
            <Sparkles size={14} className="text-muted-ochre" />
            Quick Presets from Verified NSFDC Schemes
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-neutral-grey hover:text-deep-indigo flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={13} />
            Reset to Default
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {SCHEME_PRESETS.map((preset) => (
            <button
              key={preset.schemeId}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                loanAmount === preset.amount &&
                interestRate === preset.rate &&
                tenureYears === preset.tenureYears
                  ? 'bg-deep-indigo text-white border-deep-indigo shadow-sm'
                  : 'bg-off-white text-near-black/80 border-neutral-grey/20 hover:bg-neutral-grey/10'
              }`}
            >
              {preset.label} ({preset.rate}%)
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-neutral-grey/20 p-6 sm:p-7 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-grey/15">
            <h2 className="text-base font-bold text-deep-indigo">
              Financing Parameters
            </h2>
            {IS_MOCK_MODE && <DemoDataBadge />}
          </div>

          {/* Loan Amount */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={amountId} className="font-semibold text-deep-indigo">
                Loan Amount
              </label>
              <span className="font-bold text-deep-indigo text-sm bg-off-white px-2 py-0.5 rounded border border-neutral-grey/15">
                {formatIndianCurrency(loanAmount)}
              </span>
            </div>
            <input
              id={amountId}
              type="range"
              min="20000"
              max="5000000"
              step="10000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
              className="w-full accent-deep-indigo cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-grey">
              <span>₹20,000 (Min)</span>
              <span>₹50 Lakh (Max)</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={rateId} className="font-semibold text-deep-indigo">
                Annual Concessional Rate (% p.a.)
              </label>
              <span className="font-bold text-deep-indigo text-sm bg-off-white px-2 py-0.5 rounded border border-neutral-grey/15">
                {interestRate}% p.a.
              </span>
            </div>
            <input
              id={rateId}
              type="range"
              min="4.0"
              max="18.0"
              step="0.5"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="w-full accent-deep-indigo cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-grey">
              <span>4.0% (Subsidized)</span>
              <span>18.0%</span>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={tenureId} className="font-semibold text-deep-indigo">
                Repayment Tenure (Years)
              </label>
              <span className="font-bold text-deep-indigo text-sm bg-off-white px-2 py-0.5 rounded border border-neutral-grey/15">
                {tenureYears} Years ({tenureYears * 12} Mos)
              </span>
            </div>
            <input
              id={tenureId}
              type="range"
              min="1"
              max="12"
              step="1"
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              className="w-full accent-deep-indigo cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-grey">
              <span>1 Year</span>
              <span>12 Years</span>
            </div>
          </div>

          {/* Moratorium Period */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor={moratoriumId} className="font-semibold text-deep-indigo">
                Moratorium / Grace Period (Months)
              </label>
              <span className="font-bold text-deep-indigo text-sm bg-off-white px-2 py-0.5 rounded border border-neutral-grey/15">
                {moratoriumMonths} Months
              </span>
            </div>
            <input
              id={moratoriumId}
              type="range"
              min="0"
              max="24"
              step="1"
              value={moratoriumMonths}
              onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
              className="w-full accent-deep-indigo cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-grey">
              <span>0 Months (Immediate)</span>
              <span>24 Months</span>
            </div>
          </div>

          {/* Moratorium Interest Accrual Toggle */}
          <div className="p-3.5 bg-off-white rounded-lg border border-neutral-grey/15 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-deep-indigo cursor-pointer">
                Interest Accrual during Moratorium
              </label>
              <input
                type="checkbox"
                checked={interestAccrues}
                onChange={(e) => setInterestAccrues(e.target.checked)}
                className="w-4 h-4 accent-deep-indigo rounded cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-neutral-grey leading-relaxed">
              Defaulted to Yes (conservative). Some schemes capitalize interest during grace period while others require prompt quarterly servicing.
            </p>
          </div>
        </div>

        {/* Results Metrics Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Key Output Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-deep-indigo text-white p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/70">
                  Estimated Monthly EMI
                </span>
                <p className="text-3xl font-extrabold tracking-tight">
                  {formatIndianCurrency(result.monthlyEMI)}
                  <span className="text-xs font-normal text-white/70 ml-1">/mo</span>
                </p>
              </div>
              <p className="text-[11px] text-white/60 mt-4">
                Quarterly installment payable to channel partner: ~{formatIndianCurrency(result.monthlyEMI * 3)}
              </p>
            </div>

            <div className="bg-white border border-neutral-grey/20 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-grey">
                  Total Repayment Amount
                </span>
                <p className="text-2xl font-bold text-deep-indigo">
                  {formatIndianCurrency(result.totalRepayment)}
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-neutral-grey pt-3 border-t border-neutral-grey/15 mt-3">
                <span>Total Interest:</span>
                <span className="font-semibold text-muted-ochre">
                  {formatIndianCurrency(result.totalInterest)}
                </span>
              </div>
            </div>
          </div>

          {/* Extra Metrics summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-white p-3.5 rounded-lg border border-neutral-grey/15 text-xs">
              <span className="text-neutral-grey block text-[11px]">Principal Borrowed</span>
              <span className="font-bold text-deep-indigo text-sm">
                {formatIndianCurrency(loanAmount)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-neutral-grey/15 text-xs">
              <span className="text-neutral-grey block text-[11px]">Moratorium Interest</span>
              <span className="font-bold text-muted-ochre text-sm">
                {formatIndianCurrency(result.moratoriumInterest)}
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-lg border border-neutral-grey/15 text-xs col-span-2 sm:col-span-1">
              <span className="text-neutral-grey block text-[11px]">Total Duration</span>
              <span className="font-bold text-forest-green text-sm">
                {tenureYears * 12 + moratoriumMonths} Months
              </span>
            </div>
          </div>

          {/* Compliance Disclaimer */}
          <div className="bg-off-white border border-neutral-grey/15 rounded-lg p-3.5 flex items-start gap-2.5 text-xs text-neutral-grey">
            <Info size={16} className="text-deep-indigo shrink-0 mt-0.5" />
            <p>
              Illustrative calculation based on standard mathematical amortization formulas. Official interest calculation, subsidies, processing charges (if any), and exact repayment terms are determined by the respective State Channelizing Agency or bank upon sanction via PM-SURAJ.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Amortization Charts */}
      <RepaymentBreakdown result={result} loanAmount={loanAmount} />

      {/* Schedule Table */}
      <RepaymentScheduleTable schedule={result.schedule} />

      {/* Ready to apply callout */}
      <div className="bg-deep-indigo rounded-xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/90 mb-1">
            <ShieldAlert size={14} />
            Official Application Portal
          </div>
          <h3 className="text-lg font-bold">Satisfied with these estimates?</h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl">
            Proceed to the official PM-SURAJ portal to start your application with these loan preferences.
          </p>
        </div>
        <a
          href={APP_CONFIG.urls.pmSuraj}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-muted-ochre hover:bg-muted-ochre/90 text-white font-semibold text-xs sm:text-sm transition-colors whitespace-nowrap shadow-sm"
        >
          Apply on PM-SURAJ Portal
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
