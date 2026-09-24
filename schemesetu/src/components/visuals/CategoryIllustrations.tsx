'use client';

export function MicroEnterpriseIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#C77B33" fillOpacity="0.12" />
      <path d="M14 20 L24 13 L34 20 V34 H14 V20 Z" stroke="#C77B33" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M21 34 V25 H27 V34" stroke="#152B4D" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx="24" cy="18" r="2" fill="#C77B33" />
    </svg>
  );
}

export function TermLoanIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#152B4D" fillOpacity="0.1" />
      <rect x="13" y="16" width="22" height="18" rx="3" stroke="#152B4D" strokeWidth="2.5" />
      <path d="M13 22 H35" stroke="#152B4D" strokeWidth="2" />
      <circle cx="19" cy="28" r="2" fill="#C77B33" />
      <path d="M25 28 H30" stroke="#C77B33" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 12 L28 12" stroke="#152B4D" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function EducationIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#2F6B4F" fillOpacity="0.12" />
      <path d="M24 14 L37 20 L24 26 L11 20 L24 14 Z" stroke="#2F6B4F" strokeWidth="2.5" strokeLinejoin="round" fill="#2F6B4F" fillOpacity="0.1" />
      <path d="M16 23 V31 C16 34 32 34 32 31 V23" stroke="#2F6B4F" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M37 20 V28" stroke="#C77B33" strokeWidth="2" strokeLinecap="round" />
      <circle cx="37" cy="29" r="1.5" fill="#C77B33" />
    </svg>
  );
}

export function CooperativeIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#152B4D" fillOpacity="0.08" />
      <path d="M12 28 C12 23 18 20 24 20 C30 20 36 23 36 28" stroke="#152B4D" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="15" r="4" stroke="#152B4D" strokeWidth="2.5" fill="#152B4D" fillOpacity="0.1" />
      <path d="M17 33 L24 37 L31 33" stroke="#C77B33" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
