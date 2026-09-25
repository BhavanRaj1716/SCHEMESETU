'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/config/app';
import { Menu, X, ExternalLink } from 'lucide-react';
import { LanguageSelector } from '@/components/layout/LanguageSelector';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Tricolour accent bar */}
      <div className="flex h-1 w-full">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white border-y border-neutral-200" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="SchemeSetu — Home">
            <div className="w-8 h-8 rounded-md bg-[#152B4D] flex items-center justify-center shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6.5" stroke="#F7F7F5" strokeWidth="1.2" fill="none" />
                <circle cx="9" cy="2" fill="#FF9933" />
                {[0,45,90,135,180,225,270,315].map((deg, i) => {
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 9 + 3.2 * Math.cos(rad);
                  const y1 = 9 + 3.2 * Math.sin(rad);
                  const x2 = 9 + 5.5 * Math.cos(rad);
                  const y2 = 9 + 5.5 * Math.sin(rad);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F7F7F5" strokeWidth="1" />;
                })}
              </svg>
            </div>
            <div>
              <span className="text-[15px] font-bold text-[#152B4D] leading-none tracking-tight">
                {APP_CONFIG.name}
              </span>
              <span className="hidden sm:block text-[10px] text-gray-500 leading-none mt-0.5">
                Government Scheme Discovery
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {APP_CONFIG.nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded transition-colors ${
                    active
                      ? 'text-[#152B4D] font-semibold bg-[#152B4D]/5'
                      : 'text-gray-600 hover:text-[#152B4D] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="block h-0.5 bg-[#FF9933] rounded-full mt-0.5 -mb-0.5" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* In-Page Government Language Selector */}
            <LanguageSelector />

            <a
              href={APP_CONFIG.urls.pmSuraj}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-[#138808] hover:bg-[#0f6b06] rounded shadow-2xs transition-colors"
            >
              <span>PM-SURAJ</span>
              <ExternalLink size={11} className="shrink-0" />
            </a>

            <span className="hidden md:inline-flex items-center h-8 px-2.5 text-[11px] font-semibold text-[#FF9933] border border-[#FF9933]/40 rounded bg-[#FF9933]/5 tracking-wide">
              SIH 2026
            </span>

            {/* Mobile toggle */}
            <button
              className="lg:hidden p-1.5 text-gray-600 hover:text-[#152B4D] rounded transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-gray-100 bg-white"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-2 space-y-0.5">
            {APP_CONFIG.nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm rounded transition-colors ${
                    active
                      ? 'text-[#152B4D] font-semibold bg-[#152B4D]/5 border-l-2 border-[#FF9933]'
                      : 'text-gray-600 hover:text-[#152B4D] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Mobile Language Selector */}
            <LanguageSelector isMobile={true} />

            <div className="pt-2 pb-1 px-3">
              <a
                href={APP_CONFIG.urls.pmSuraj}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-semibold text-white bg-[#138808] hover:bg-[#0f6b06] rounded transition-colors"
              >
                Open PM-SURAJ Portal
                <ExternalLink size={11} />
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
