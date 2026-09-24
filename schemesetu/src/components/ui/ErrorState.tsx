'use client';

import { APP_CONFIG } from '@/config/app';
import { AlertTriangle } from 'lucide-react';

type ErrorVariant =
  | 'no_scheme'
  | 'no_partner'
  | 'data_unavailable'
  | 'api_error';

interface ErrorStateProps {
  variant: ErrorVariant;
  onRetry?: () => void;
  onBrowse?: () => void;
  onModify?: () => void;
}

const ERROR_CONTENT: Record<
  ErrorVariant,
  { title: string; message: string }
> = {
  no_scheme: {
    title: 'No Relevant Scheme Found',
    message:
      'No relevant scheme was identified from the information provided. You may modify your details or browse the full scheme directory.',
  },
  no_partner: {
    title: 'No Matching Partner Found',
    message:
      'No matching authorized partner was found in the current verified dataset. Try broadening your search filters or check the official NSFDC partner directory.',
  },
  data_unavailable: {
    title: 'Data Unavailable',
    message: APP_CONFIG.disclaimers.dataUnavailable,
  },
  api_error: {
    title: 'Could Not Retrieve Information',
    message:
      'We couldn\'t retrieve the latest information. Please try again or check nsfdc.nic.in directly.',
  },
};

export function ErrorState({
  variant,
  onRetry,
  onBrowse,
  onModify,
}: ErrorStateProps) {
  const { title, message } = ERROR_CONTENT[variant];

  return (
    <div
      className="flex flex-col items-center text-center px-6 py-12 max-w-md mx-auto"
      role="alert"
    >
      <div className="w-12 h-12 rounded-full bg-muted-ochre/10 flex items-center justify-center mb-4">
        <AlertTriangle size={24} className="text-muted-ochre" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-near-black mb-2">{title}</h3>
      <p className="text-sm text-neutral-grey leading-relaxed mb-6">
        {message}
      </p>
      <div className="flex items-center gap-3">
        {onModify && (
          <button
            onClick={onModify}
            className="px-4 py-2 text-sm font-medium text-deep-indigo border border-deep-indigo/20 rounded-lg hover:bg-deep-indigo/5 transition-colors"
          >
            Modify Details
          </button>
        )}
        {onBrowse && (
          <button
            onClick={onBrowse}
            className="px-4 py-2 text-sm font-medium text-deep-indigo border border-deep-indigo/20 rounded-lg hover:bg-deep-indigo/5 transition-colors"
          >
            Browse Directory
          </button>
        )}
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 text-sm font-medium text-white bg-deep-indigo rounded-lg hover:bg-deep-indigo/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
