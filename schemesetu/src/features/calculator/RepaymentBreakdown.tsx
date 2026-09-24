'use client';

import { useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { EMIResult } from '@/types/calculator';
import { formatIndianCurrency } from '@/services/calculatorService';

interface RepaymentBreakdownProps {
  result: EMIResult;
  loanAmount: number;
}

export function RepaymentBreakdown({ result, loanAmount }: RepaymentBreakdownProps) {
  const { totalInterest, totalRepayment, schedule } = result;

  // Pie chart data
  const pieData = useMemo(() => [
    { name: 'Principal Amount', value: loanAmount, color: '#152B4D' }, // deep-indigo
    { name: 'Total Interest', value: totalInterest, color: '#C77B33' }, // muted-ochre
  ], [loanAmount, totalInterest]);

  // Area chart data (cumulative over quarters)
  const areaData = useMemo(() => {
    let runningPrincipal = 0;
    let runningInterest = 0;
    const resultData = [];

    for (const entry of schedule) {
      runningPrincipal += entry.principalPaid;
      runningInterest += entry.interestPaid;
      resultData.push({
        name: `Q${entry.quarter}`,
        quarter: entry.quarter,
        principal: Math.round(runningPrincipal),
        interest: Math.round(runningInterest),
        balance: Math.round(entry.closingBalance),
      });
    }

    return resultData;
  }, [schedule]);

  const principalRatio = ((loanAmount / (totalRepayment || 1)) * 100).toFixed(1);
  const interestRatio = ((totalInterest / (totalRepayment || 1)) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart: Proportion */}
        <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-deep-indigo uppercase tracking-wider mb-1">
              Payment Breakdown
            </h3>
            <p className="text-xs text-neutral-grey">
              Principal vs. Interest Distribution
            </p>
          </div>

          <div className="h-56 w-full flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: unknown) => [
                    formatIndianCurrency(Number(value) || 0),
                    '',
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-grey/15 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-deep-indigo" />
                <span className="text-neutral-grey">Principal ({principalRatio}%)</span>
              </div>
              <span className="font-semibold text-deep-indigo">
                {formatIndianCurrency(loanAmount)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-muted-ochre" />
                <span className="text-neutral-grey">Interest ({interestRatio}%)</span>
              </div>
              <span className="font-semibold text-deep-indigo">
                {formatIndianCurrency(totalInterest)}
              </span>
            </div>
          </div>
        </div>

        {/* Area Chart: Repayment Growth */}
        <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-deep-indigo uppercase tracking-wider mb-1">
              Repayment Timeline & Outstanding Balance
            </h3>
            <p className="text-xs text-neutral-grey">
              Cumulative Principal paid & Remaining Loan Balance over quarters
            </p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={areaData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2F6B4F" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2F6B4F" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#152B4D" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#152B4D" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#8A8F98' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#8A8F98' }}
                  tickFormatter={(val) => `₹${val >= 100000 ? (val / 100000).toFixed(0) + 'L' : (val / 1000).toFixed(0) + 'k'}`}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => [
                    formatIndianCurrency(Number(value) || 0),
                    name === 'principal'
                      ? 'Cumulative Principal'
                      : name === 'balance'
                      ? 'Remaining Balance'
                      : 'Cumulative Interest',
                  ]}
                  labelFormatter={(label) => `Quarter: ${label}`}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  height={30}
                  iconType="circle"
                  formatter={(value) => (
                    <span className="text-xs text-near-black">
                      {value === 'principal'
                        ? 'Principal Paid'
                        : value === 'balance'
                        ? 'Remaining Balance'
                        : 'Interest'}
                    </span>
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="principal"
                  stroke="#2F6B4F"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrincipal)"
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="#152B4D"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorBalance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-grey pt-2 border-t border-neutral-grey/15">
            <span>Quarterly calculation model (NSFDC standard)</span>
            <span>Total Duration: {schedule.length * 3} Months</span>
          </div>
        </div>
      </div>
    </div>
  );
}
