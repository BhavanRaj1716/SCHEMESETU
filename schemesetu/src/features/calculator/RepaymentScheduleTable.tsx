'use client';

import { useState } from 'react';
import type { RepaymentScheduleEntry } from '@/types/calculator';
import { formatIndianCurrency } from '@/services/calculatorService';
import { ChevronDown, ChevronUp, Table as TableIcon } from 'lucide-react';

interface RepaymentScheduleTableProps {
  schedule: RepaymentScheduleEntry[];
}

export function RepaymentScheduleTable({ schedule }: RepaymentScheduleTableProps) {
  const [showAll, setShowAll] = useState(false);
  const initialCount = 8;
  const displayedSchedule = showAll ? schedule : schedule.slice(0, initialCount);

  return (
    <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <TableIcon size={18} className="text-deep-indigo" />
          <h3 className="text-base font-bold text-deep-indigo">
            Quarterly Amortization Schedule
          </h3>
        </div>
        <span className="text-xs text-neutral-grey">
          {schedule.length} Quarters (Quarterly Repayment Cycle)
        </span>
      </div>

      <div className="overflow-x-auto -mx-5 sm:mx-0">
        <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[550px]">
          <thead>
            <tr className="bg-off-white border-y border-neutral-grey/15 text-deep-indigo font-semibold">
              <th className="py-3 px-4">Quarter</th>
              <th className="py-3 px-4">Opening Balance</th>
              <th className="py-3 px-4">Principal</th>
              <th className="py-3 px-4">Interest</th>
              <th className="py-3 px-4">Total Instalment</th>
              <th className="py-3 px-4">Closing Balance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-grey/10 text-near-black/85">
            {displayedSchedule.map((entry) => (
              <tr
                key={entry.quarter}
                className="hover:bg-off-white/60 transition-colors"
              >
                <td className="py-2.5 px-4 font-semibold text-deep-indigo">
                  Q{entry.quarter}
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
            ))}
          </tbody>
        </table>
      </div>

      {schedule.length > initialCount && (
        <div className="pt-2 text-center border-t border-neutral-grey/15">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-deep-indigo hover:text-muted-ochre transition-colors"
          >
            {showAll ? (
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
