'use client';

import { useState, useEffect } from 'react';

const LOADING_STEPS = [
  'Understanding your requirement',
  'Checking against NSFDC schemes',
  'Verifying applicable criteria',
  'Finding nearby channel partners',
];

export function LoadingSequence() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep < LOADING_STEPS.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center justify-center py-20">
      {/* Spinner */}
      <div className="w-10 h-10 border-2 border-deep-indigo/20 border-t-deep-indigo rounded-full animate-spin mb-8" />

      {/* Steps */}
      <div className="space-y-3 w-full max-w-xs">
        {LOADING_STEPS.map((step, index) => (
          <div
            key={step}
            className={`flex items-center gap-3 transition-opacity duration-300 ${
              index <= currentStep ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${
                index < currentStep
                  ? 'bg-forest-green'
                  : index === currentStep
                  ? 'bg-deep-indigo'
                  : 'bg-near-black/10'
              }`}
            >
              {index < currentStep ? (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : index === currentStep ? (
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              ) : null}
            </div>
            <span
              className={`text-sm ${
                index <= currentStep ? 'text-near-black' : 'text-neutral-grey'
              } ${index === currentStep ? 'font-medium' : ''}`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs text-neutral-grey mt-8">
        This does not imply an eligibility determination.
      </p>
    </div>
  );
}
