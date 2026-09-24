'use client';

import { useState } from 'react';
import type { RecommendationRequest } from '@/types/recommendation';
import { Search, ArrowRight } from 'lucide-react';

interface SemanticSearchProps {
  onSubmit: (request: RecommendationRequest) => void;
}

export function SemanticSearch({ onSubmit }: SemanticSearchProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSubmit({ mode: 'semantic', query: query.trim() });
  };

  return (
    <div className="animate-fade-in-up">
      <h2 className="text-lg font-semibold text-near-black mb-1">
        Describe your requirement
      </h2>
      <p className="text-sm text-neutral-grey mb-6 prose-body">
        Tell us in your own words what you need — the kind of activity, how
        much you need, your situation. We&apos;ll check it against the available
        NSFDC schemes.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-4 text-neutral-grey"
            aria-hidden="true"
          />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="I want to start a small dairy business and need around ₹3 lakh."
            rows={4}
            className="w-full pl-10 pr-4 py-3 text-sm border border-near-black/15 rounded-lg bg-white focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20 transition-colors outline-none resize-none leading-relaxed"
            aria-label="Describe your scheme requirement in your own words"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-neutral-grey">
            Your description helps us find schemes relevant to your requirement.
            This is not an eligibility determination.
          </p>
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-muted-ochre text-white rounded-lg hover:bg-muted-ochre/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ml-4"
          >
            Search
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Example queries */}
      <div className="mt-8 pt-6 border-t border-near-black/5">
        <p className="text-xs text-neutral-grey mb-3">Try an example:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1.5 bg-deep-indigo/5 text-deep-indigo rounded-md hover:bg-deep-indigo/10 transition-colors text-left"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLES = [
  'I want to start a small dairy business and need around ₹3 lakh.',
  'I need an education loan for my engineering degree.',
  'I want to open a tailoring shop with ₹1 lakh investment.',
  'I need ₹4 lakh to expand my grocery store.',
];
