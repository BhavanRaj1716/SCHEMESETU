'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Globe } from 'lucide-react';

export interface VoiceLanguage {
  code: string;
  name: string;
  nativeName: string;
  locale: string;
}

export const SUPPORTED_VOICE_LANGUAGES: VoiceLanguage[] = [
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', locale: 'hi-IN' },
  { code: 'en', name: 'English', nativeName: 'English (India)', locale: 'en-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', locale: 'ta-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', locale: 'te-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', locale: 'bn-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', locale: 'mr-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', locale: 'gu-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', locale: 'kn-IN' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', locale: 'ml-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', locale: 'or-IN' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', locale: 'ur-IN' },
];

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  onInterimTranscript?: (text: string) => void;
  className?: string;
  defaultLangCode?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function VoiceSearchButton({
  onTranscript,
  onInterimTranscript,
  className = '',
  defaultLangCode = 'hi',
  size = 'md',
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>(defaultLangCode);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [interimText, setInterimText] = useState('');
  const [lastSpokenText, setLastSpokenText] = useState('');
// Browser SpeechRecognition API — no official @types package exists
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const latestTranscriptRef = useRef<string>('');
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const resetSilenceTimer = () => {
    clearSilenceTimer();
    // Stop listening 2.5 seconds after user stops speaking (silence gap)
    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          /* ignore */
        }
      }
    }, 2500);
  };

  // Sync speech locale with current active website language cookie
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = decodeURIComponent(match[1]).split('/');
      const savedCode = parts[parts.length - 1];
      if (savedCode && SUPPORTED_VOICE_LANGUAGES.some((l) => l.code === savedCode)) {
        setSelectedLang(savedCode);
      }
    }
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  const initRecognition = () => {
    const SpeechRecognition =
      (window as Window & { SpeechRecognition?: new () => SpeechRecognitionInstance; webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
      (window as Window & { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;

    const activeLangObj =
      SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === selectedLang) ||
      SUPPORTED_VOICE_LANGUAGES[0];
    recognition.lang = activeLangObj.locale;

    recognition.onstart = () => {
      setIsListening(true);
      setInterimText('');
      latestTranscriptRef.current = '';
      resetSilenceTimer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      resetSilenceTimer();
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      const currentLive = finalStr || interimStr;
      if (currentLive) {
        latestTranscriptRef.current = currentLive;
        setInterimText(currentLive);
        if (onInterimTranscript) {
          onInterimTranscript(currentLive);
        }
      }

      if (finalStr) {
        const cleaned = finalStr.trim();
        setLastSpokenText(cleaned);
        onTranscript(cleaned);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech recognition notification:', event.error);
      if (event.error !== 'no-speech') {
        clearSilenceTimer();
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      clearSilenceTimer();
      setIsListening(false);
      // If we had pending interim text that wasn't finalized, emit it now
      if (latestTranscriptRef.current.trim()) {
        const finalFallback = latestTranscriptRef.current.trim();
        setLastSpokenText(finalFallback);
        onTranscript(finalFallback);
      }
      setInterimText('');
    };

    return recognition;
  };

  // Handle outside click for language dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleListening = () => {
    if (isListening) {
      clearSilenceTimer();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { /* ignore */ }
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch { /* ignore */ }
        }
        const recognition = initRecognition();
        if (!recognition) return;
        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  if (!isSupported) {
    return null;
  }

  const activeLang =
    SUPPORTED_VOICE_LANGUAGES.find((l) => l.code === selectedLang) ||
    SUPPORTED_VOICE_LANGUAGES[0];

  const buttonPadding = size === 'sm' ? 'p-1.5' : size === 'lg' ? 'p-3' : 'p-2';
  const iconSize = size === 'sm' ? 15 : size === 'lg' ? 22 : 18;

  return (
    <div className={`relative inline-flex items-center notranslate ${className}`} translate="no" ref={containerRef}>
      {/* Live speech feedback tooltip */}
      {isListening && (
        <div className="absolute bottom-full right-0 mb-2.5 px-3.5 py-2 bg-[#152B4D] text-white text-xs font-semibold rounded-xl shadow-2xl flex items-center gap-2.5 whitespace-nowrap z-50 border border-white/20 animate-in fade-in zoom-in-95">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <div className="flex flex-col">
            <span className="text-[11px] font-medium text-white/90">
              {interimText ? `"${interimText}..."` : `Listening in ${activeLang.nativeName}...`}
            </span>
            <span className="text-[9px] text-white/60 font-normal">
              Speak your requirement clearly into your microphone
            </span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 bg-white/80 p-0.5 rounded-lg border border-neutral-grey/20 shadow-sm backdrop-blur-sm">
        {/* Main Microphone Button */}
        <button
          type="button"
          onClick={toggleListening}
          title={isListening ? 'Click to stop listening' : `Click to speak search in ${activeLang.nativeName} (${activeLang.name})`}
          aria-label={isListening ? 'Stop listening' : `Speak search query in ${activeLang.nativeName}`}
          className={`${buttonPadding} rounded-md transition-all flex items-center justify-center gap-1.5 ${
            isListening
              ? 'bg-red-600 text-white shadow-md ring-2 ring-red-400 animate-pulse font-bold'
              : 'text-deep-indigo hover:text-white hover:bg-deep-indigo transition-colors'
          }`}
        >
          {isListening ? (
            <>
              <MicOff size={iconSize} />
              <span className="text-xs font-bold px-1">Listening...</span>
            </>
          ) : (
            <Mic size={iconSize} />
          )}
        </button>

        {/* Language Badge & Selector Trigger */}
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          title="Click to select voice language"
          className="text-[11px] font-bold px-2 py-1 rounded bg-off-white hover:bg-neutral-grey/15 text-deep-indigo border border-neutral-grey/25 transition-colors flex items-center gap-1"
        >
          <Globe size={11} className="text-neutral-grey" />
          <span className="uppercase">{activeLang.code}</span>
        </button>
      </div>

      {/* Language Selection Dropdown Menu */}
      {showLangMenu && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-white shadow-2xl border border-gray-200 py-1.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150 notranslate" translate="no">
          <div className="px-3 py-1.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Speech Language
            </span>
            <span className="text-[9px] font-semibold text-deep-indigo bg-deep-indigo/10 px-1.5 py-0.5 rounded">
              12 Languages
            </span>
          </div>
          <div className="max-h-60 overflow-y-auto py-1 divide-y divide-gray-50">
            {SUPPORTED_VOICE_LANGUAGES.map((lang) => {
              const isSelected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setSelectedLang(lang.code);
                    setShowLangMenu(false);
                    if (recognitionRef.current) {
                      recognitionRef.current.lang = lang.locale;
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-deep-indigo/10 text-deep-indigo font-bold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-[13px] font-medium">{lang.nativeName}</span>
                  <span className="text-[10px] text-gray-400">({lang.name})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
