/**
 * Calculator Service — pure math, no API dependency.
 *
 * EMI Formula: P × r × (1+r)^n ÷ ((1+r)^n − 1)
 * where r = monthly rate = annual rate ÷ 12 ÷ 100
 *
 * Moratorium interest accrual is configurable per scheme.
 * NSFDC doesn't publicly confirm this for every scheme,
 * so we make it an explicit parameter.
 */

import type { EMIInput, EMIResult, RepaymentScheduleEntry } from '@/types/calculator';

export function calculateEMI(input: EMIInput): EMIResult {
  const { loanAmount, annualInterestRate, tenureMonths, moratoriumMonths, interestAccruesDuringMoratorium } = input;

  const monthlyRate = annualInterestRate / 12 / 100;

  // Calculate moratorium interest
  let moratoriumInterest = 0;
  let effectivePrincipal = loanAmount;

  if (moratoriumMonths > 0 && interestAccruesDuringMoratorium && monthlyRate > 0) {
    // Simple interest during moratorium (compounded monthly)
    moratoriumInterest = loanAmount * (Math.pow(1 + monthlyRate, moratoriumMonths) - 1);
    effectivePrincipal = loanAmount + moratoriumInterest;
  }

  // Calculate EMI on the effective principal
  let monthlyEMI: number;
  if (monthlyRate === 0) {
    monthlyEMI = effectivePrincipal / tenureMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    monthlyEMI = (effectivePrincipal * monthlyRate * factor) / (factor - 1);
  }

  const totalRepayment = monthlyEMI * tenureMonths + (interestAccruesDuringMoratorium ? 0 : moratoriumInterest);
  const totalInterest = totalRepayment - loanAmount;

  // Generate quarterly repayment schedule
  const schedule = generateQuarterlySchedule(effectivePrincipal, monthlyRate, monthlyEMI, tenureMonths);

  return {
    monthlyEMI: Math.round(monthlyEMI * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
    moratoriumInterest: Math.round(moratoriumInterest * 100) / 100,
    effectivePrincipal: Math.round(effectivePrincipal * 100) / 100,
    schedule,
  };
}

function generateQuarterlySchedule(
  principal: number,
  monthlyRate: number,
  monthlyEMI: number,
  tenureMonths: number
): RepaymentScheduleEntry[] {
  const schedule: RepaymentScheduleEntry[] = [];
  let balance = principal;
  const totalQuarters = Math.ceil(tenureMonths / 3);

  for (let q = 1; q <= totalQuarters; q++) {
    const openingBalance = balance;
    let quarterPrincipal = 0;
    let quarterInterest = 0;

    // Process 3 months per quarter (or remaining months)
    const monthsInQuarter = Math.min(3, tenureMonths - (q - 1) * 3);
    for (let m = 0; m < monthsInQuarter; m++) {
      const interestForMonth = balance * monthlyRate;
      const principalForMonth = monthlyEMI - interestForMonth;
      quarterInterest += interestForMonth;
      quarterPrincipal += principalForMonth;
      balance -= principalForMonth;
    }

    // Avoid floating-point negative near zero
    if (balance < 0.01) balance = 0;

    schedule.push({
      quarter: q,
      openingBalance: Math.round(openingBalance * 100) / 100,
      principalPaid: Math.round(quarterPrincipal * 100) / 100,
      interestPaid: Math.round(quarterInterest * 100) / 100,
      totalPayment: Math.round((quarterPrincipal + quarterInterest) * 100) / 100,
      closingBalance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}

/**
 * Format a number in Indian numbering system (e.g. 3,00,000)
 */
export function formatIndianCurrency(amount: number): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount * 100) / 100);
  const [intPart, decPart] = absAmount.toString().split('.');

  // Indian grouping: last 3 digits, then groups of 2
  let result = '';
  const len = intPart.length;
  if (len <= 3) {
    result = intPart;
  } else {
    result = intPart.slice(len - 3);
    let remaining = intPart.slice(0, len - 3);
    while (remaining.length > 2) {
      result = remaining.slice(remaining.length - 2) + ',' + result;
      remaining = remaining.slice(0, remaining.length - 2);
    }
    if (remaining.length > 0) {
      result = remaining + ',' + result;
    }
  }

  const formatted = decPart ? `${result}.${decPart}` : result;
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
