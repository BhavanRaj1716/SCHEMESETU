'use client';

import { useState } from 'react';
import type { RepaymentScheduleEntry, YearlyScheduleEntry } from '@/types/calculator';
import { formatIndianCurrency } from '@/services/calculatorService';
import { Calendar, ChevronDown, ChevronUp, Table as TableIcon, Layers } from 'lucide-react';

interface RepaymentScheduleTableProps {
  schedule: RepaymentScheduleEntry[];
  yearlySchedule?: YearlyScheduleEntry[];
}

export function RepaymentScheduleTable({ schedule, yearlySchedule }: RepaymentScheduleTableProps) {
  const [viewMode, setViewMode] = useState<'yearly' | 'quarterly'>('yearly');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  const [showAllQuarters, setShowAllQuarters] = useState(false);

  // Compute yearly schedule if not directly passed
  const yearsData: YearlyScheduleEntry[] = yearlySchedule || (() => {
    const totalYears = Math.ceil(schedule.length / 4);
    const list: YearlyScheduleEntry[] = [];
    for (let y = 1; y <= totalYears; y++) {
      const quartersInYear = schedule.filter((q) => Math.ceil(q.quarter / 4) === y);
      if (!quartersInYear.length) continue;
      list.push({
        year: y,
        openingBalance: quartersInYear[0].openingBalance,
        principalPaid: quartersInYear.reduce((acc, curr) => acc + curr.principalPaid, 0),
        interestPaid: quartersInYear.reduce((acc, curr) => acc + curr.interestPaid, 0),
        totalPayment: quartersInYear.reduce((acc, curr) => acc + curr.totalPayment, 0),
        closingBalance: quartersInYear[quartersInYear.length - 1].closingBalance,
        quarters: quartersInYear,
      });
    }
    return list;
  })();

  const totalYears = yearsData.length;
  const initialQuartersCount = 8;
  const displayedQuarters = showAllQuarters ? schedule : schedule.slice(0, initialQuartersCount);

  const toggleYearExpand = (yearNum: number) => {
    setExpandedYear(expandedYear === yearNum ? null : yearNum);
  };

  return (
    <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header & View Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-neutral-grey/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-deep-indigo/10 text-deep-indigo">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-deep-indigo">
              {viewMode === 'yearly' ? 'Yearly Amortization Schedule' : 'Quarterly Amortization Schedule'}
            </h3>
            <p className="text-xs text-neutral-grey">
              {totalYears} Years Repayment Period ({schedule.length} Quarters)
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="inline-flex p-1 bg-off-white rounded-lg border border-neutral-grey/20 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('yearly')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'yearly'
                ? 'bg-deep-indigo text-white shadow-xs'
                : 'text-neutral-grey hover:text-deep-indigo'
            }`}
          >
            <Calendar size={13} />
            <span>Yearly (Years 1 to {totalYears})</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('quarterly')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'quarterly'
                ? 'bg-deep-indigo text-white shadow-xs'
                : 'text-neutral-grey hover:text-deep-indigo'
            }`}
          >
            <Layers size={13} />
            <span>Quarterly Details</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-off-white border-y border-neutral-grey/15 text-deep-indigo font-semibold">
              <th className="py-3 px-4">{viewMode === 'yearly' ? 'Year' : 'Quarter'}</th>
              <th className="py-3 px-4">Opening Balance</th>
              <th className="py-3 px-4">Principal Repaid</th>
              <th className="py-3 px-4">Interest Paid</th>
              <th className="py-3 px-4">Total Installment</th>
              <th className="py-3 px-4">Year-End Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-grey/10 text-near-black/85">
            {viewMode === 'yearly' ? (
              // YEARLY VIEW (1 to N Years)
              yearsData.map((entry) => {
                const isExpanded = expandedYear === entry.year;
                return (
                  <tr key={entry.year} className="group">
                    <td colSpan={6} className="p-0">
                      <div
                        onClick={() => toggleYearExpand(entry.year)}
                        className={`grid grid-cols-6 items-center cursor-pointer transition-colors py-3 px-4 ${
                          isExpanded ? 'bg-deep-indigo/5 font-medium' : 'hover:bg-off-white/60'
                        }`}
                      >
                        <div className="font-bold text-deep-indigo flex items-center gap-1.5">
                          {entry.quarters.length > 0 && (
                            <button
                              type="button"
                              className="p-0.5 rounded hover:bg-deep-indigo/10 text-neutral-grey"
                              title="Toggle quarterly breakdown"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                          <span>Year {entry.year}</span>
                        </div>
                        <div>{formatIndianCurrency(entry.openingBalance)}</div>
                        <div className="font-semibold text-forest-green">
                          {formatIndianCurrency(entry.principalPaid)}
                        </div>
                        <div className="text-muted-ochre font-medium">
                          {formatIndianCurrency(entry.interestPaid)}
                        </div>
                        <div className="font-bold text-deep-indigo">
                          {formatIndianCurrency(entry.totalPayment)}
                        </div>
                        <div className="font-semibold">
                          {formatIndianCurrency(entry.closingBalance)}
                        </div>
                      </div>

                      {/* Expandable Quarterly Sub-rows */}
                      {isExpanded && entry.quarters && (
                        <div className="bg-off-white/40 border-y border-deep-indigo/10 py-2 pl-6 pr-4 space-y-1 text-xs animate-in fade-in duration-150">
                          <div className="text-[11px] font-bold text-neutral-grey uppercase tracking-wider mb-1">
                            Quarterly Breakdown for Year {entry.year}:
                          </div>
                          {entry.quarters.map((q) => (
                            <div
                              key={q.quarter}
                              className="grid grid-cols-6 py-1 text-neutral-grey hover:text-near-black"
                            >
                              <span className="font-medium text-deep-indigo/80">Quarter {q.quarter}</span>
                              <span>{formatIndianCurrency(q.openingBalance)}</span>
                              <span className="text-forest-green">{formatIndianCurrency(q.principalPaid)}</span>
                              <span className="text-muted-ochre">{formatIndianCurrency(q.interestPaid)}</span>
                              <span className="font-medium text-deep-indigo">{formatIndianCurrency(q.totalPayment)}</span>
                              <span>{formatIndianCurrency(q.closingBalance)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              // QUARTERLY VIEW (Q1, Q2, Q3...)
              displayedQuarters.map((entry) => (
                <tr
                  key={entry.quarter}
                  className="hover:bg-off-white/60 transition-colors"
                >
                  <td className="py-2.5 px-4 font-semibold text-deep-indigo">
                    Quarter {entry.quarter} <span className="text-[10px] text-neutral-grey font-normal">(Yr {Math.ceil(entry.quarter / 4)})</span>
                  </td>
                  <td className="py-2.5 px-4">
                    {formatIndianCurrency(entry.openingBalance)}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-forest-green">
                    {formatIndianCurrency(entry.principalPaid)}
                  </td>
                  <td className="py-2.5 px-4 text-muted-ochre">
                    {formatIndianCurrency(entry.interestPaid)}
                  </td>
                  <td className="py-2.5 px-4 font-semibold text-deep-indigo">
                    {formatIndianCurrency(entry.totalPayment)}
                  </td>
                  <td className="py-2.5 px-4">
                    {formatIndianCurrency(entry.closingBalance)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Show more/fewer quarters toggle if in quarterly mode */}
      {viewMode === 'quarterly' && schedule.length > initialQuartersCount && (
        <div className="pt-2 text-center border-t border-neutral-grey/15">
          <button
            type="button"
            onClick={() => setShowAllQuarters(!showAllQuarters)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-deep-indigo hover:text-muted-ochre transition-colors"
          >
            {showAllQuarters ? (
              <>
                <ChevronUp size={16} />
                Show Fewer Quarters
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                View All {schedule.length} Quarters
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
