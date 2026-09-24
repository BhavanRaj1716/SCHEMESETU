'use client';

import { useState } from 'react';
import { GuidedSearch } from '@/features/schemes/GuidedSearch';
import { SemanticSearch } from '@/features/schemes/SemanticSearch';
import { SchemeResults } from '@/features/schemes/SchemeResults';
import { LoadingSequence } from '@/features/schemes/LoadingSequence';
import type { RecommendationRequest, RecommendationResponse } from '@/types/recommendation';
import { getRecommendations } from '@/services/recommendationService';
import { MessageSquareText, ListChecks } from 'lucide-react';

type SearchMode = 'semantic' | 'guided';
type PageState = 'input' | 'loading' | 'results';

export default function FindSchemePage() {
  const [mode, setMode] = useState<SearchMode>('guided');
  const [pageState, setPageState] = useState<PageState>('input');
  const [results, setResults] = useState<RecommendationResponse | null>(null);

  const handleSearch = async (request: RecommendationRequest) => {
    setPageState('loading');
    try {
      const response = await getRecommendations(request);
      setResults(response);
      setPageState('results');
    } catch {
      setPageState('results');
      setResults(null);
    }
  };

  const handleReset = () => {
    setPageState('input');
    setResults(null);
  };

  return (
    <div className="min-h-[80vh]">
      {/* Page header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
            Find a Suitable Scheme
          </h1>
          <p className="text-white/60 text-sm leading-relaxed prose-body">
            Tell us about your requirement and we&apos;ll check it against the five
            NSFDC concessional credit schemes to find what&apos;s relevant.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {pageState === 'input' && (
          <>
            {/* Mode tabs */}
            <div className="flex items-center gap-1 p-1 bg-near-black/5 rounded-lg mb-8 w-fit">
              <button
                onClick={() => setMode('guided')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'guided'
                    ? 'bg-white text-deep-indigo shadow-sm'
                    : 'text-neutral-grey hover:text-near-black'
                }`}
                aria-pressed={mode === 'guided'}
              >
                <ListChecks size={15} aria-hidden="true" />
                Guided Search
              </button>
              <button
                onClick={() => setMode('semantic')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  mode === 'semantic'
                    ? 'bg-white text-deep-indigo shadow-sm'
                    : 'text-neutral-grey hover:text-near-black'
                }`}
                aria-pressed={mode === 'semantic'}
              >
                <MessageSquareText size={15} aria-hidden="true" />
                Describe Your Requirement
              </button>
            </div>

            {/* Search forms */}
            {mode === 'guided' ? (
              <GuidedSearch onSubmit={handleSearch} />
            ) : (
              <SemanticSearch onSubmit={handleSearch} />
            )}
          </>
        )}

        {pageState === 'loading' && <LoadingSequence />}

        {pageState === 'results' && (
          <SchemeResults
            response={results}
            onBack={handleReset}
          />
        )}
      </div>
    </div>
  );
}
