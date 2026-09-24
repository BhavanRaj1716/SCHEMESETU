'use client';

import { FlaskConical } from 'lucide-react';

interface DemoDataBadgeProps {
  className?: string;
  label?: string;
}

/**
 * Shown whenever a page or section is backed by mock/demo data.
 * Only render this when isDemoData is true on the API response,
 * or when IS_MOCK_MODE is true (no backend connected).
 */
export function DemoDataBadge({
  className = '',
  label = 'DEMO DATA',
}: DemoDataBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-muted-ochre/10 text-muted-ochre border border-muted-ochre/20 ${className}`}
      role="status"
      aria-label="This section uses simulated demonstration data"
    >
      <FlaskConical size={10} aria-hidden="true" />
      {label}
    </span>
  );
}
