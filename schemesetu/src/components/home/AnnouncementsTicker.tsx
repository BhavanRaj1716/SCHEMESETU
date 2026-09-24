'use client';

import { useState } from 'react';
import { Volume2, Pause, Play } from 'lucide-react';
import Link from 'next/link';

const ANNOUNCEMENTS = [
  {
    id: 1,
    text: 'PM-SURAJ Portal is live for direct online application submission for NSFDC concessional loan schemes.',
    link: 'https://pmsuraj.dosje.gov.in/',
    isExternal: true,
  },
  {
    id: 2,
    text: 'Concessional interest rates start from 6.5% p.a. for Micro Finance and Educational Loan schemes.',
    link: '/schemes',
    isExternal: false,
  },
  {
    id: 3,
    text: 'Double the Poverty Line (DPL) annual family income ceiling set at ₹5,00,000 for eligibility.',
    link: '/help',
    isExternal: false,
  },
  {
    id: 4,
    text: 'Use the SchemeSetu EMI Calculator to simulate quarterly repayments with moratorium periods.',
    link: '/calculator',
    isExternal: false,
  },
];

export function AnnouncementsTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextAnnouncement = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  return (
    <div className="bg-[#e9ecef] border-b border-neutral-grey/25 py-2 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs">
        {/* Left Label */}
        <div className="flex items-center gap-1.5 font-bold text-deep-indigo uppercase tracking-wider shrink-0">
          <Volume2 size={15} className="text-[#FF9933] animate-pulse" />
          <span>Announcements:</span>
        </div>

        {/* Middle Scrolling / Rotating News Item */}
        <div
          className="flex-1 overflow-hidden whitespace-nowrap text-near-black/85"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {ANNOUNCEMENTS[currentIndex].isExternal ? (
            <a
              href={ANNOUNCEMENTS[currentIndex].link}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-deep-indigo hover:underline font-medium"
            >
              {ANNOUNCEMENTS[currentIndex].text}
            </a>
          ) : (
            <Link
              href={ANNOUNCEMENTS[currentIndex].link}
              className="hover:text-deep-indigo hover:underline font-medium"
            >
              {ANNOUNCEMENTS[currentIndex].text}
            </Link>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 shrink-0 text-neutral-grey">
          <button
            onClick={nextAnnouncement}
            className="hover:text-deep-indigo font-bold px-1.5 py-0.5 rounded border border-neutral-grey/30 text-[10px]"
            title="Next announcement"
          >
            Next
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="hover:text-deep-indigo p-1"
            aria-label={isPaused ? 'Resume ticker' : 'Pause ticker'}
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
          </button>
        </div>
      </div>
    </div>
  );
}
