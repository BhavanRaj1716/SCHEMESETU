'use client';

import { APP_CONFIG } from '@/config/app';

export function PrototypeBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md bg-muted-ochre/15 px-2.5 py-1 text-xs font-medium text-muted-ochre border border-muted-ochre/25 ${className}`}
      role="status"
      aria-label="This is a prototype application"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
          fill="currentColor"
        />
      </svg>
      {APP_CONFIG.disclaimers.prototype}
    </span>
  );
}
