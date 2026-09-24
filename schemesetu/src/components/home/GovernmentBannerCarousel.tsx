'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { APP_CONFIG } from '@/config/app';

interface Slide {
  id: number;
  hindiSlogan: string;
  englishSlogan: string;
  subHindi: string;
  subEnglish: string;
  tagline: string;
  headline: string;
  subtext: string;
  ctaText: string;
  ctaLink: string;
  isExternal?: boolean;
  themeColor: string;
  accentGradient: string;
  badgeText: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    hindiSlogan: '“अन्त्योदय का संकल्प, अमृतकाल का प्रतिबिंब”',
    englishSlogan: '“Antyodaya ka Sankalp, Amritkaal ka Pratibimb”',
    subHindi: 'विकसित भारत @ 2047',
    subEnglish: 'Viksit Bharat @ 2047',
    tagline: 'सामाजिक न्याय और अधिकारिता मंत्रालय • भारत सरकार',
    headline: 'Chintan Shivir & Concessional Credit Outreach',
    subtext: 'Strengthening grassroots economic empowerment for Scheduled Caste entrepreneurs and artisans through NSFDC concessional credit schemes.',
    ctaText: 'Find Your Scheme',
    ctaLink: '/find',
    themeColor: 'from-[#0d1e38] via-[#152B4D] to-[#1e3a66]',
    accentGradient: 'from-[#FF9933] via-white to-[#138808]',
    badgeText: 'National Initiative',
  },
  {
    id: 2,
    hindiSlogan: '“सशक्त समाज, समर्थ भारत”',
    englishSlogan: '“PM-SURAJ: Unified Credit Access”',
    subHindi: 'एकल खिड़की ऋण पोर्टल',
    subEnglish: 'National Single Window Credit',
    tagline: 'Ministry of Social Justice & Empowerment • Govt. of India',
    headline: 'PM-SURAJ One-Stop Portal Gateway',
    subtext: 'Direct application and tracking for NSFDC, NSKFDC, and NBCFDC schemes through authorized State Channelizing Agencies and partner banks.',
    ctaText: 'Apply on PM-SURAJ Portal',
    ctaLink: APP_CONFIG.urls.pmSuraj,
    isExternal: true,
    themeColor: 'from-[#11243f] via-[#1a365d] to-[#234e82]',
    accentGradient: 'from-[#FF9933] via-white to-[#138808]',
    badgeText: 'Official Portal',
  },
  {
    id: 3,
    hindiSlogan: '“शिक्षा से सशक्तिकरण, हुनर से स्वावलंबन”',
    englishSlogan: '“Skill, Education & Enterprise”',
    subHindi: 'रियायती ब्याज दरें (6.5% से)',
    subEnglish: 'Concessional Rates from 6.5%',
    tagline: 'National Scheduled Castes Finance & Development Corporation (NSFDC)',
    headline: 'Micro Finance & Education Loan Schemes',
    subtext: 'Financial support up to ₹50 Lakh for businesses, machinery, and higher education with generous moratorium grace periods.',
    ctaText: 'Explore Scheme Directory',
    ctaLink: '/schemes',
    themeColor: 'from-[#0b1b33] via-[#152B4D] to-[#173e43]',
    accentGradient: 'from-[#FF9933] via-white to-[#138808]',
    badgeText: 'Direct Benefit',
  },
  {
    id: 4,
    hindiSlogan: '“पारदर्शी ऋण, सुगम प्रक्रिया”',
    englishSlogan: '“Transparent Repayment & Calculator”',
    subHindi: 'सटीक ईएमआई और किस्त गणना',
    subEnglish: 'Quarterly Amortization Simulation',
    tagline: 'SchemeSetu Decision Support Layer',
    headline: 'Simulate Your Exact Loan Repayment Terms',
    subtext: 'Calculate quarterly installments, moratorium interest, and total repayment before submitting your application to channel partners.',
    ctaText: 'Open EMI Calculator',
    ctaLink: '/calculator',
    themeColor: 'from-[#14233c] via-[#152B4D] to-[#263e52]',
    accentGradient: 'from-[#FF9933] via-white to-[#138808]',
    badgeText: 'Smart Simulator',
  },
];

export function GovernmentBannerCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3000); // 3-second auto rotation

    return () => clearInterval(timer);
  }, [isPlaying, nextSlide]);

  const slide = SLIDES[currentSlide];

  return (
    <div className="relative w-full overflow-hidden bg-deep-indigo text-white select-none border-b border-white/10 shadow-lg">
      {/* Top Tricolor Strip */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main Slide Stage */}
      <div
        className={`relative min-h-[360px] sm:min-h-[420px] lg:min-h-[460px] flex items-center justify-center bg-gradient-to-r ${slide.themeColor} transition-all duration-700 ease-in-out px-4 sm:px-12 py-10`}
      >
        {/* Subtle Government Emblem / Chakra Watermark in Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="1.5" fill="none" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="50"
                y1="5"
                x2="50"
                y2="50"
                stroke="white"
                strokeWidth="1"
                transform={`rotate(${i * 15} 50 50)`}
              />
            ))}
          </svg>
        </div>

        {/* Content Container */}
        <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          {/* Left / Center Banner Typography */}
          <div className="lg:col-span-8 space-y-4 text-center lg:text-left">
            {/* National Header Slogan Bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FF9933] text-white shadow-sm">
                {slide.badgeText}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-white/90 font-serif tracking-wide">
                {slide.tagline}
              </span>
            </div>

            {/* Slogans (Hindi & English) */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-3 text-xs sm:text-sm text-[#FF9933] font-medium">
                <span>{slide.hindiSlogan}</span>
                <span className="hidden sm:inline opacity-60">•</span>
                <span>{slide.subHindi}</span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/70 italic">
                {slide.englishSlogan} — {slide.subEnglish}
              </p>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {slide.headline}
            </h2>

            {/* Subtext */}
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {slide.subtext}
            </p>

            {/* CTA Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              {slide.isExternal ? (
                <a
                  href={slide.ctaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF9933] hover:bg-[#e08527] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                >
                  {slide.ctaText}
                  <ExternalLink size={15} />
                </a>
              ) : (
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#FF9933] hover:bg-[#e08527] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105"
                >
                  {slide.ctaText}
                  <ArrowRight size={15} />
                </Link>
              )}

              <Link
                href="/schemes"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium text-xs sm:text-sm backdrop-blur-md border border-white/20 transition-colors"
              >
                Browse All 5 Schemes
              </Link>
            </div>
          </div>

          {/* Right Visual Badge & Graphic Frame */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/25 p-6 rounded-2xl shadow-2xl text-center space-y-3 max-w-xs w-full">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/10 border-2 border-[#FF9933] flex items-center justify-center shadow-inner">
                {/* Ashoka Chakra vector */}
                <svg width="34" height="34" viewBox="0 0 100 100" fill="none">
                  <circle cx="50" cy="50" r="44" stroke="#FF9933" strokeWidth="6" />
                  <circle cx="50" cy="50" r="14" fill="#FF9933" />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="6"
                      x2="50"
                      y2="50"
                      stroke="#FF9933"
                      strokeWidth="3.5"
                      transform={`rotate(${i * 15} 50 50)`}
                    />
                  ))}
                </svg>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs uppercase font-bold tracking-wider text-white">
                  NSFDC Portal
                </span>
                <p className="text-[11px] text-[#FF9933] font-semibold">
                  Govt. of India Enterprise
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-black/25 text-[11px] text-white/80 space-y-1">
                <div className="flex justify-between">
                  <span>Interest Subsidy:</span>
                  <strong className="text-green-400">Up to 90%</strong>
                </div>
                <div className="flex justify-between">
                  <span>Starting Rate:</span>
                  <strong className="text-[#FF9933]">6.5% p.a.</strong>
                </div>
                <div className="flex justify-between">
                  <span>Income Limit:</span>
                  <strong className="text-white">₹5 Lakh/yr</strong>
                </div>
              </div>

              <div className="text-[10px] text-white/60">
                Verified against official nsfdc.nic.in records
              </div>
            </div>
          </div>
        </div>

        {/* Left Arrow Button */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-white/20 z-20 shadow-md"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={22} />
        </button>

        {/* Right Arrow Button */}
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition-colors border border-white/20 z-20 shadow-md"
          aria-label="Next Slide"
        >
          <ChevronRight size={22} />
        </button>

        {/* Bottom Carousel Controls: Dots & Play/Pause */}
        <div className="absolute bottom-3 right-4 sm:right-8 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-6 bg-[#FF9933]' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="text-white/80 hover:text-white pl-1 border-l border-white/20 transition-colors"
            aria-label={isPlaying ? 'Pause auto rotation' : 'Resume auto rotation'}
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
