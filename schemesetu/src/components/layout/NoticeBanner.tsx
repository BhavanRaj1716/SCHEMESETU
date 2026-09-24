'use client';

import { APP_CONFIG } from '@/config/app';
import { Info } from 'lucide-react';

export function NoticeBanner() {
  return (
    <div
      className="bg-deep-indigo/5 border-t border-b border-deep-indigo/10 px-4 py-3"
      role="alert"
      aria-label="Important notice about scheme information"
    >
      <div className="max-w-6xl mx-auto flex items-start gap-3">
        <Info
          size={16}
          className="text-deep-indigo mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm text-deep-indigo/80 leading-relaxed">
          {APP_CONFIG.disclaimers.schemeTerms}
        </p>
      </div>
    </div>
  );
}
