'use client';

import { useState } from 'react';
import type { RecommendationRequest } from '@/types/recommendation';
import { Search, ArrowRight, Sparkles } from 'lucide-react';
import { VoiceSearchButton } from '@/components/common/VoiceSearchButton';

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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <h2 className="text-lg font-semibold text-near-black">
          Describe your requirement
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-neutral-grey hidden sm:inline">Voice Search supported in 12 languages:</span>
          <VoiceSearchButton
            onTranscript={(text) => setQuery((prev) => (prev ? `${prev} ${text}` : text))}
            onInterimTranscript={(text) => {
              if (!query) setQuery(text);
            }}
          />
        </div>
      </div>

      <p className="text-sm text-neutral-grey mb-6 prose-body">
        Tell us in your own words (or speak in your native language) what you need — the kind of business or education, how
        much loan you need, and your situation. Our AI model will find the most relevant NSFDC schemes.
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
            placeholder="e.g. 'I want to start a small dairy business and need ₹3 lakh' or 'मुझे सिलाई मशीन की दुकान खोलनी है'"
            rows={4}
            className="w-full pl-10 pr-12 py-3 text-sm border border-near-black/15 rounded-lg bg-white focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20 transition-colors outline-none resize-none leading-relaxed text-near-black"
            aria-label="Describe your scheme requirement in your own words"
          />
          <div className="absolute right-3 bottom-3">
            <VoiceSearchButton
              onTranscript={(text) => setQuery((prev) => (prev ? `${prev} ${text}` : text))}
              onInterimTranscript={(text) => {
                if (!query) setQuery(text);
              }}
              size="sm"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
          <p className="text-xs text-neutral-grey">
            Your description is matched against NSFDC scheme criteria using multilingual neural search.
          </p>
          <button
            type="submit"
            disabled={!query.trim()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium bg-muted-ochre text-white rounded-lg hover:bg-muted-ochre/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            Find Matching Schemes
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Multilingual example queries */}
      <div className="mt-8 pt-6 border-t border-near-black/5">
        <div className="flex items-center gap-1.5 mb-3">
          <Sparkles size={13} className="text-muted-ochre" />
          <p className="text-xs font-semibold text-deep-indigo">Try an example in English or your language:</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.text}
              type="button"
              onClick={() => setQuery(ex.text)}
              className="text-xs px-3 py-1.5 bg-deep-indigo/5 text-deep-indigo rounded-md hover:bg-deep-indigo/10 transition-colors text-left flex items-center gap-1.5"
            >
              <span className="text-[10px] font-bold text-muted-ochre">[{ex.lang}]</span>
              <span>{ex.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const EXAMPLES = [
  { lang: 'EN', text: 'I want to start a small dairy business and need around ₹3 lakh.' },
  { lang: 'HI', text: 'मुझे डेयरी फार्मिंग के लिए ₹3 लाख का लोन चाहिए।' },
  { lang: 'EN', text: 'I need an education loan for higher studies abroad.' },
  { lang: 'HI', text: 'सफाई कर्मचारी उपकरण और ई-रिक्शा खरीदने के लिए लोन।' },
  { lang: 'TA', text: 'விவசாய டிராக்டர் மற்றும் உபகரணங்கள் வாங்க கடன் தேவை.' },
  { lang: 'HI', text: 'सिलाई और बुटीक की दुकान शुरू करने के लिए ₹1 लाख चाहिए।' },
];
