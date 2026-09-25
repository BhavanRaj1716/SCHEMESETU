'use client';

import { useState, useEffect, useRef } from 'react';
import { getRecognizedCourses, type RecognizedCourse } from '@/services/courseService';
import type { EducationInput } from '@/types/recommendation';
import {
  Search,
  Check,
  ChevronsUpDown,
  AlertTriangle,
  X,
  BookOpen,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';

interface CourseComboboxProps {
  value: EducationInput['course'] | null;
  onChange: (value: EducationInput['course'] | null) => void;
}

export function CourseCombobox({ value, onChange }: CourseComboboxProps) {
  const [courses, setCourses] = useState<RecognizedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch recognized courses dynamically on mount — NEVER hardcoded on the frontend
  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRecognizedCourses();
      setCourses(data);
    } catch {
      setError('Official information for this field is currently unavailable — please verify directly with NSFDC.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourses();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter courses by search query (matches course name or category)
  const filteredCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  const isCustomCourse = value !== null && 'requiresVerification' in value;
  const currentDisplayName = value
    ? 'requiresVerification' in value
      ? value.customName
      : value.name
    : '';

  // Select a course from recognized list
  const handleSelectRecognized = (course: RecognizedCourse) => {
    onChange(course);
    setIsOpen(false);
    setSearchQuery('');
  };

  // Select free-text custom course (not in recognized list)
  const handleSelectCustom = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    onChange({
      customName: trimmed,
      requiresVerification: true,
    });
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setSearchQuery('');
  };

  return (
    <div className="w-full" ref={containerRef}>
      {/* ── Loading State ──────────────────────────────────────────────────────── */}
      {loading && (
        <div
          role="status"
          aria-label="Loading recognized courses"
          className="w-full px-4 py-3 rounded-lg border border-near-black/15 bg-near-black/[0.02] flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-deep-indigo border-t-transparent animate-spin" />
            <span className="text-sm text-neutral-grey font-medium">
              Loading recognized courses from portal...
            </span>
          </div>
          <div className="w-4 h-4 bg-near-black/10 rounded" />
        </div>
      )}

      {/* ── Error State ────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{error}</p>
            <button
              type="button"
              onClick={fetchCourses}
              className="mt-2 inline-flex items-center gap-1.5 font-semibold text-deep-indigo hover:underline"
            >
              <RefreshCw size={12} />
              Retry loading courses
            </button>
          </div>
        </div>
      )}

      {/* ── Combobox Trigger & Popover ─────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="relative">
          {/* Trigger Button (shadcn-style) */}
          <button
            id="course-combobox-trigger"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full px-4 py-2.5 text-left text-sm rounded-lg border bg-white flex items-center justify-between transition-colors outline-none focus:ring-1 ${
              isOpen
                ? 'border-deep-indigo ring-deep-indigo/20 ring-1'
                : 'border-near-black/15 hover:border-near-black/30'
            }`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <div className="flex items-center gap-2 truncate pr-2">
              <BookOpen size={16} className="text-neutral-grey shrink-0" />
              {value ? (
                <span className="font-medium text-near-black truncate">
                  {currentDisplayName}
                </span>
              ) : (
                <span className="text-neutral-grey">Search or select a recognized course...</span>
              )}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {value && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClear}
                  onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
                  className="p-1 text-neutral-grey hover:text-near-black rounded transition-colors"
                  aria-label="Clear course selection"
                >
                  <X size={14} />
                </span>
              )}
              <ChevronsUpDown size={16} className="text-neutral-grey" />
            </div>
          </button>

          {/* Popover Content */}
          {isOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-near-black/15 bg-white shadow-xl overflow-hidden animate-fade-in-up">
              {/* Search Input Header */}
              <div className="p-2 border-b border-near-black/10 flex items-center gap-2 bg-near-black/[0.02]">
                <Search size={15} className="text-neutral-grey shrink-0 ml-1.5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to filter (e.g. Nursing, Engineering, MBA)..."
                  className="w-full py-1.5 px-2 text-sm bg-transparent outline-none placeholder:text-neutral-grey text-near-black"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-neutral-grey hover:text-near-black text-xs"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Scrollable Course List */}
              <div className="max-h-64 overflow-y-auto p-1.5 divide-y divide-near-black/5" role="listbox">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((c) => {
                    const isSelected =
                      value !== null && !('requiresVerification' in value) && value.id === c.id;

                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectRecognized(c)}
                        className={`w-full px-3 py-2.5 rounded-lg text-left text-sm flex items-start justify-between gap-2 transition-colors ${
                          isSelected
                            ? 'bg-deep-indigo/10 text-deep-indigo font-semibold'
                            : 'hover:bg-deep-indigo/[0.04] text-near-black'
                        }`}
                        role="option"
                        aria-selected={isSelected}
                      >
                        <div className="flex-1">
                          <div className="font-medium text-near-black">{c.name}</div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-near-black/5 text-neutral-grey">
                            {c.category}
                          </span>
                        </div>
                        {isSelected && <Check size={16} className="text-deep-indigo shrink-0 mt-1" />}
                      </button>
                    );
                  })
                ) : (
                  /* Not-in-list Fallback State */
                  <div className="p-4 text-center">
                    <p className="text-xs text-neutral-grey mb-3">
                      No recognized courses matched &quot;<strong>{searchQuery}</strong>&quot;.
                    </p>
                    {searchQuery.trim() && (
                      <button
                        type="button"
                        onClick={handleSelectCustom}
                        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-deep-indigo text-white hover:bg-deep-indigo/90 transition-colors shadow-sm"
                      >
                        <PlusCircle size={14} />
                        Use &quot;{searchQuery.trim()}&quot; as custom course
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Inline Not-in-list Verification Alert ─────────────────────────────── */}
      {isCustomCourse && (
        <div className="mt-2.5 p-3 rounded-lg bg-amber-50/80 border border-amber-300 text-xs text-amber-900 flex items-start gap-2 animate-fade-in-up">
          <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-amber-950">Manual verification needed: </span>
            This course isn&apos;t in the currently recognized list — eligibility will need manual verification.
          </div>
        </div>
      )}
    </div>
  );
}
