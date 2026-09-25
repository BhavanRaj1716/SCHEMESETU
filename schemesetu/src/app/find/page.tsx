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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<RecommendationRequest | null>(null);

  const handleSearch = async (request: RecommendationRequest) => {
    setLastRequest(request);
    setErrorMessage(null);
    setPageState('loading');
    try {
      const response = await getRecommendations(request);
      setResults(response);
      setPageState('results');
    } catch (error) {
      setPageState('results');
      setResults(null);
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : 'Unable to complete search right now. Please try again.'
      );
    }
  };

  const handleReset = () => {
    setPageState('input');
    setResults(null);
    setErrorMessage(null);
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

        {pageState === 'results' && errorMessage ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Search failed</h2>
            <p className="text-sm text-red-700 mb-4">{errorMessage}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => lastRequest && handleSearch(lastRequest)}
                disabled={!lastRequest}
                className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Retry Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              >
                Back to Search
              </button>
            </div>
          </div>
        ) : (
          pageState === 'results' && (
            <SchemeResults
              response={results}
              onBack={handleReset}
            />
          )
        )}
      </div>
    </div>
  );
}
