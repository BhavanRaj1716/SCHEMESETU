'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { ChannelPartner } from '@/types/partner';
import { getPartners } from '@/services/partnerService';
import { PartnerCard } from './PartnerCard';
import { PartnerFilters } from './PartnerFilters';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { APP_CONFIG } from '@/config/app';
import {
  ExternalLink,
  MapPin,
  List,
  Map as MapIcon,
  ShieldAlert,
  Info,
} from 'lucide-react';

// Dynamic import for Leaflet map component with SSR disabled
const DynamicPartnerMap = dynamic(() => import('./PartnerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] lg:min-h-[640px] bg-off-white rounded-2xl border border-neutral-grey/20 flex flex-col items-center justify-center text-neutral-grey text-sm gap-2">
      <MapPin size={28} className="animate-bounce text-deep-indigo" />
      <span className="font-semibold text-deep-indigo">Loading Interactive Leaflet Map...</span>
      <span className="text-xs text-neutral-grey">Initializing OpenStreetMap tiles & layers</span>
    </div>
  ),
});

interface PartnerLocatorProps {
  initialScheme?: string;
}

export function PartnerLocator({ initialScheme = 'all' }: PartnerLocatorProps) {
  const [allPartners, setAllPartners] = useState<ChannelPartner[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<string>(initialScheme);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<ChannelPartner | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'map' | 'list'>('both');

  // Lazy-load the 70 KB partners dataset only when this component mounts (/partners page)
  useEffect(() => {
    getPartners().then((partners) => {
      // Ensure we always have an array even if API returns unexpected shape
      const list = Array.isArray(partners) ? partners : [];
      setAllPartners(list);
      setSelectedPartner(list[0] || null);
    });
  }, []);

  // Derive unique states from loaded partners (no extra API call needed)
  const availableStates = useMemo(
    () => Array.from(new Set(allPartners.map((p) => p.state))).sort(),
    [allPartners]
  );

  // Derive districts from loaded partners, filtered by selected state
  const availableDistricts = useMemo(() => {
    const source =
      selectedState === 'all'
        ? allPartners
        : allPartners.filter((p) => p.state === selectedState);
    return Array.from(new Set(source.map((p) => p.district))).sort();
  }, [allPartners, selectedState]);

  // Filtered partners
  const filteredPartners = useMemo(() => {
    return allPartners.filter((partner) => {
      const matchesSearch =
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesScheme =
        selectedScheme === 'all' || partner.supportedSchemes.includes(selectedScheme);

      const matchesType =
        selectedType === 'all' || partner.type === selectedType;

      const matchesState =
        selectedState === 'all' || partner.state === selectedState;

      const matchesDistrict =
        selectedDistrict === 'all' || partner.district === selectedDistrict;

      return (
        matchesSearch &&
        matchesScheme &&
        matchesType &&
        matchesState &&
        matchesDistrict
      );
    });
  }, [allPartners, searchQuery, selectedScheme, selectedType, selectedState, selectedDistrict]);

  const handleReset = () => {
    setSearchQuery('');
    setSelectedScheme('all');
    setSelectedType('all');
    setSelectedState('all');
    setSelectedDistrict('all');
    setRadiusKm(null);
    setSelectedPartner(allPartners[0] || null);
  };

  const handlePartnerSelect = (partner: ChannelPartner) => {
    setSelectedPartner(partner);
  };

  return (
    <div className="space-y-6">
      {/* Official Channel Clarification Banner */}
      <div className="bg-deep-indigo/5 border border-deep-indigo/15 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs sm:text-sm text-near-black/85">
        <Info size={20} className="text-deep-indigo shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-deep-indigo text-sm">
            Interactive NSFDC Channel Partner Locator (Leaflet & OpenStreetMap)
          </p>
          <p className="text-near-black/80 leading-relaxed">
            Channel partners (State Channelizing Agencies, NBFC-MFIs, and Cooperative Banks) disburse and service NSFDC loans under PM-SURAJ. Use the map to explore authorized branches in your state or district.
          </p>
        </div>
      </div>

      {/* Mobile View Toggle */}
      <div className="flex lg:hidden items-center justify-between bg-white p-1.5 rounded-xl border border-neutral-grey/25 shadow-sm">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'list'
              ? 'bg-deep-indigo text-white shadow-sm'
              : 'text-neutral-grey hover:text-near-black'
          }`}
        >
          <List size={14} />
          List ({filteredPartners.length})
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'map'
              ? 'bg-deep-indigo text-white shadow-sm'
              : 'text-neutral-grey hover:text-near-black'
          }`}
        >
          <MapIcon size={14} />
          Interactive Map
        </button>
      </div>

      {/* Main Two-Panel Layout (Left: Filters & Cards, Right: Leaflet Map) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Filters + Partner Results List */}
        <div
          className={`lg:col-span-5 xl:col-span-5 space-y-4 ${
            activeTab === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Filters Component */}
          <PartnerFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedScheme={selectedScheme}
            setSelectedScheme={setSelectedScheme}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedState={selectedState}
            setSelectedState={setSelectedState}
            selectedDistrict={selectedDistrict}
            setSelectedDistrict={setSelectedDistrict}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            onReset={handleReset}
            availableStates={availableStates}
            availableDistricts={availableDistricts}
          />

          {/* Results Counter & Demo Badge */}
          <div className="flex items-center justify-between px-1 text-xs text-neutral-grey">
            <span>
              Found <strong className="text-deep-indigo font-bold">{filteredPartners.length}</strong> authorized channel {filteredPartners.length === 1 ? 'partner' : 'partners'}
            </span>
            {filteredPartners.some((p) => p.isDemoData) && <DemoDataBadge />}
          </div>

          {/* Partner Cards Scrollable Container */}
          <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPartners.length === 0 ? (
              <div className="bg-white rounded-2xl border border-neutral-grey/20 p-8 text-center space-y-3">
                <MapPin size={28} className="mx-auto text-neutral-grey" />
                <h4 className="text-sm font-bold text-deep-indigo">
                  No partners found matching your filters
                </h4>
                <p className="text-xs text-neutral-grey max-w-xs mx-auto">
                  Try clearing the district filter or selecting &quot;All States&quot; to see available agencies nationwide.
                </p>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-bold text-deep-indigo border border-deep-indigo/30 rounded-lg hover:bg-off-white"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredPartners.map((partner) => (
                <PartnerCard
                  key={partner.id}
                  partner={partner}
                  isSelected={selectedPartner?.id === partner.id}
                  onSelect={() => handlePartnerSelect(partner)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Interactive Leaflet Map with Layers, Radius Circle, & Scale */}
        <div
          className={`lg:col-span-7 xl:col-span-7 h-[520px] lg:h-[720px] sticky top-20 ${
            activeTab === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          <DynamicPartnerMap
            partners={filteredPartners}
            selectedPartner={selectedPartner}
            onSelectPartner={handlePartnerSelect}
            radiusKm={radiusKm}
          />
        </div>
      </div>

      {/* Official Channel Handoff Callout */}
      <div className="bg-deep-indigo rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl mt-8">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 mb-1">
            <ShieldAlert size={14} className="text-[#FF9933]" />
            Official Application Submission
          </div>
          <h3 className="text-lg sm:text-xl font-bold">Ready to approach your nearest partner?</h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-xl">
            You don&apos;t need to visit physical offices. Submit your application directly through the official Government of India PM-SURAJ single-window portal.
          </p>
        </div>
        <a
          href={APP_CONFIG.urls.pmSuraj}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FF9933] hover:bg-[#e08527] text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg whitespace-nowrap"
        >
          Apply via PM-SURAJ Portal
          <ExternalLink size={15} />
        </a>
      </div>
    </div>
  );
}
