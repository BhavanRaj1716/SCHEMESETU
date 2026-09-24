'use client';

import { Search, RotateCcw, Compass, MapPin } from 'lucide-react';

interface PartnerFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedScheme: string;
  setSelectedScheme: (scheme: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedState: string;
  setSelectedState: (state: string) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  radiusKm: number | null;
  setRadiusKm: (radius: number | null) => void;
  onReset: () => void;
  availableStates: string[];
  availableDistricts: string[];
}

const SCHEMES_LIST = [
  { id: 'all', name: 'All Schemes' },
  { id: 'mfs', name: 'Micro Finance Scheme (MFS)' },
  { id: 'term-loan', name: 'Term Loan Scheme' },
  { id: 'aajeevika', name: 'Aajeevika MFY' },
  { id: 'udyam-nidhi', name: 'Udyam Nidhi Yojana' },
  { id: 'els', name: 'Educational Loan Scheme' },
];

const PARTNER_TYPES = [
  { id: 'all', name: 'All Partner Channels' },
  { id: 'State Channelizing Agencies (SCAs)', name: 'State Channelizing Agencies (SCAs)' },
  { id: 'Public Sector Banks (PSBs)', name: 'Public Sector Banks (PSBs - SBI, PNB, BOB, etc.)' },
  { id: 'Regional Rural Banks (RRBs)', name: 'Regional Rural Banks (RRBs - Gramin Banks)' },
  { id: 'NBFC–Micro Finance Institutions (NBFC-MFIs)', name: 'NBFC–Micro Finance Institutions (NBFC-MFIs)' },
  { id: 'Co-operative Banks', name: 'Co-operative Banks' },
  { id: 'Small Finance Banks (SFBs)', name: 'Small Finance Banks (SFBs - AU, Equitas, Ujjivan)' },
  { id: 'Cooperative Societies', name: 'Cooperative Societies (PACS)' },
  { id: 'Other Agencies & SIDBI', name: 'Other Agencies & SIDBI' },
];

const RADIUS_OPTIONS = [
  { value: null, label: 'All India' },
  { value: 5, label: '5 km Radius' },
  { value: 10, label: '10 km Radius' },
  { value: 25, label: '25 km Radius' },
  { value: 50, label: '50 km Radius' },
  { value: 100, label: '100 km Radius' },
];

export function PartnerFilters({
  searchQuery,
  setSearchQuery,
  selectedScheme,
  setSelectedScheme,
  selectedType,
  setSelectedType,
  selectedState,
  setSelectedState,
  selectedDistrict,
  setSelectedDistrict,
  radiusKm,
  setRadiusKm,
  onReset,
  availableStates,
  availableDistricts,
}: PartnerFiltersProps) {
  const isFiltered =
    searchQuery !== '' ||
    selectedScheme !== 'all' ||
    selectedType !== 'all' ||
    selectedState !== 'all' ||
    selectedDistrict !== 'all' ||
    radiusKm !== null;

  return (
    <div className="bg-white rounded-2xl border border-neutral-grey/25 p-5 shadow-sm space-y-4">
      {/* Search by name / keyword */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-grey"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by partner name, address, or branch..."
          className="w-full pl-9 pr-4 py-2.5 bg-off-white border border-neutral-grey/25 rounded-xl text-xs sm:text-sm text-near-black placeholder:text-neutral-grey focus:outline-none focus:ring-2 focus:ring-deep-indigo"
        />
      </div>

      {/* Grid of Dropdown Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* State Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-deep-indigo flex items-center gap-1">
            <MapPin size={11} /> State
          </label>
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('all'); // Reset district when state changes
            }}
            className="w-full bg-off-white border border-neutral-grey/25 rounded-lg px-2.5 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
          >
            <option value="all">All States</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* District Filter (Cascading) */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-deep-indigo">
            District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={selectedState === 'all'}
            className="w-full bg-off-white border border-neutral-grey/25 rounded-lg px-2.5 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo disabled:opacity-50"
          >
            <option value="all">
              {selectedState === 'all' ? 'Select state first' : 'All Districts'}
            </option>
            {availableDistricts.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Scheme Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-deep-indigo">
            Supported Scheme
          </label>
          <select
            value={selectedScheme}
            onChange={(e) => setSelectedScheme(e.target.value)}
            className="w-full bg-off-white border border-neutral-grey/25 rounded-lg px-2.5 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
          >
            {SCHEMES_LIST.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Partner Type Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-deep-indigo">
            Partner Channel Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-off-white border border-neutral-grey/25 rounded-lg px-2.5 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
          >
            {PARTNER_TYPES.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Radius Range Selector */}
      <div className="pt-1 space-y-1.5">
        <label className="text-[11px] font-semibold text-deep-indigo flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Compass size={12} className="text-muted-ochre" /> Search Radius Circle
          </span>
          <span className="text-[10px] text-neutral-grey font-normal">
            {radiusKm ? `${radiusKm} km radius visualization` : 'Showing full extent'}
          </span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setRadiusKm(opt.value)}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all ${
                radiusKm === opt.value
                  ? 'bg-deep-indigo text-white border-deep-indigo shadow-sm'
                  : 'bg-off-white text-near-black/75 border-neutral-grey/20 hover:bg-neutral-grey/10'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Action */}
      {isFiltered && (
        <div className="pt-2 border-t border-neutral-grey/15 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-deep-indigo hover:text-muted-ochre transition-colors"
          >
            <RotateCcw size={12} />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
}
