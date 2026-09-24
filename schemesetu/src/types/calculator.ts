/**
 * Financial Calculator Types
 */

export interface EMIInput {
  loanAmount: number;
  annualInterestRate: number;
  tenureMonths: number;
  moratoriumMonths: number;
  /** Whether interest accrues during the moratorium period */
  interestAccruesDuringMoratorium: boolean;
}

export interface EMIResult {
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  /** Interest accumulated during the moratorium (if applicable) */
  moratoriumInterest: number;
  /** The effective principal after adding moratorium interest (if accrued) */
  effectivePrincipal: number;
  schedule: RepaymentScheduleEntry[];
}

export interface RepaymentScheduleEntry {
  /** Quarter number (1-based) */
  quarter: number;
  /** Opening balance for this quarter */
  openingBalance: number;
  /** Principal component of the quarterly payment */
  principalPaid: number;
  /** Interest component of the quarterly payment */
  interestPaid: number;
  /** Total quarterly payment */
  totalPayment: number;
  /** Closing balance after this quarter */
  closingBalance: number;
}
