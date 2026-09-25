'use client';

import { useEffect, useState, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिंदी' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
  { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' },
  { code: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
  { code: 'or', label: 'Odia', nativeLabel: 'ଓଡ଼ିଆ' },
  { code: 'ur', label: 'Urdu', nativeLabel: 'اردو' },
];

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google?: any;
    googleTranslateElementInit?: () => void;
  }
}

export function LanguageSelector({ isMobile = false }: { isMobile?: boolean }) {
  const [currentLang, setCurrentLang] = useState<string>('en');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read saved cookie on mount
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = decodeURIComponent(match[1]).split('/');
      const savedCode = parts[parts.length - 1];
      if (savedCode && INDIAN_LANGUAGES.some((l) => l.code === savedCode)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentLang(savedCode);
      }
    }
  }, []);

  // Initialize Google Translate script once globally
  useEffect(() => {
    if (document.getElementById('google-translate-script')) return;

    window.googleTranslateElementInit = () => {
      if (window.google?.translate?.TranslateElement) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,hi,ta,te,bn,mr,gu,kn,ml,pa,or',
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    const script = document.createElement('script');
    script.id = 'google-translate-script';
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLang(langCode);
    setIsOpen(false);

    // 1. Set Google Translate cookies for both current host and root domain
    const cookieVal = `/en/${langCode}`;
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `googtrans=${cookieVal}; path=/;`;
    const hostParts = window.location.hostname.split('.');
    if (hostParts.length > 1) {
      const domain = '.' + hostParts.slice(-2).join('.');
      // eslint-disable-next-line react-hooks/immutability
      document.cookie = `googtrans=${cookieVal}; domain=${domain}; path=/;`;
    }

    // 2. Trigger translation in the Google Translate select element if present
    const selectElem = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (selectElem) {
      selectElem.value = langCode;
      selectElem.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const selectedOption = INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  if (isMobile) {
    return (
      <div className="pt-2 pb-1 px-3 notranslate" translate="no">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-[#152B4D]">
          <Globe size={14} className="text-[#FF9933]" />
          <span className="notranslate" translate="no">Select Language / भाषा चुनें</span>
        </div>
        <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-gray-50 rounded-lg border border-gray-200 notranslate" translate="no">
          {INDIAN_LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-between px-2.5 py-1.5 text-xs rounded transition-colors text-left notranslate ${
                  isSelected
                    ? 'bg-[#152B4D] text-white font-medium'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-100'
                }`}
                translate="no"
              >
                <span className="notranslate" translate="no">{lang.nativeLabel}</span>
                {isSelected && <Check size={12} className="text-[#FF9933]" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center notranslate" translate="no" ref={dropdownRef}>
      {/* Offscreen container for Google Translate Engine (styled in globals.css) */}
      <div id="google_translate_element" aria-hidden="true" className="notranslate" translate="no" />

      {/* Styled Government Language Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Change website language"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold text-[#152B4D] bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded shadow-2xs transition-all focus:outline-none focus:ring-1 focus:ring-[#FF9933] notranslate"
        translate="no"
      >
        <Globe size={13} className="text-[#FF9933] shrink-0" />
        <span className="tracking-tight notranslate" translate="no">{selectedOption.nativeLabel}</span>
        <ChevronDown size={11} className={`text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-52 rounded-lg bg-white shadow-xl border border-gray-200 py-1 z-50 focus:outline-none animate-in fade-in slide-in-from-top-1 duration-150 notranslate" translate="no">
          <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between notranslate" translate="no">
            <span className="text-[10px] font-bold text-gray-500 tracking-wider uppercase notranslate" translate="no">
              Select Language (भाषा)
            </span>
            <span className="text-[9px] px-1.5 py-0.5 font-medium bg-[#152B4D]/10 text-[#152B4D] rounded notranslate" translate="no">
              11 Languages
            </span>
          </div>
          <div className="max-h-64 overflow-y-auto py-1 divide-y divide-gray-50 notranslate" translate="no">
            {INDIAN_LANGUAGES.map((lang) => {
              const isSelected = currentLang === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left notranslate ${
                    isSelected
                      ? 'bg-[#152B4D]/5 text-[#152B4D] font-bold'
                      : 'text-gray-700 hover:bg-gray-50 font-normal'
                  }`}
                  translate="no"
                >
                  <div className="flex items-center gap-2 notranslate" translate="no">
                    <span className="text-[13px] notranslate font-medium" translate="no">{lang.nativeLabel}</span>
                    <span className="text-[11px] text-gray-400 notranslate" translate="no">({lang.label})</span>
                  </div>
                  {isSelected && <Check size={13} className="text-[#138808] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
