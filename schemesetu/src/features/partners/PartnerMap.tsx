'use client';

import { useEffect, useRef, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  LayerGroup,
  LayersControl,
  ScaleControl,
  ZoomControl,
  useMap,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { ChannelPartner } from '@/types/partner';
import { APP_CONFIG } from '@/config/app';
import {
  ExternalLink,
  Phone,
  Clock,
  CheckCircle2,
  Navigation,
} from 'lucide-react';

const { BaseLayer, Overlay } = LayersControl;

// Custom pin icons color-coded by Partner Type (8 official categories)
const getPartnerColor = (type: string): string => {
  switch (type) {
    case 'State Channelizing Agencies (SCAs)':
    case 'SCA/CA':
      return '#152B4D'; // deep-indigo
    case 'Public Sector Banks (PSBs)':
      return '#0E7490'; // deep-cyan
    case 'Regional Rural Banks (RRBs)':
      return '#059669'; // emerald
    case 'NBFC–Micro Finance Institutions (NBFC-MFIs)':
    case 'NBFC-MFI':
      return '#C77B33'; // muted-ochre
    case 'Co-operative Banks':
    case 'Cooperative Bank':
      return '#2F6B4F'; // forest-green
    case 'Small Finance Banks (SFBs)':
    case 'Small Finance Bank':
      return '#7C3AED'; // violet
    case 'Cooperative Societies':
    case 'Cooperative Society':
      return '#D97706'; // amber
    case 'Other Agencies & SIDBI':
      return '#B45309'; // warm brown
    default:
      return '#152B4D';
  }
};

const createPartnerPinIcon = (type: string, isSelected: boolean) => {
  const color = getPartnerColor(type);
  const size = isSelected ? 36 : 28;

  return L.divIcon({
    className: 'custom-partner-marker',
    html: `
      <div style="
        background-color: ${color};
        color: white;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        ${isSelected ? 'outline: 3px solid #C77B33; outline-offset: 2px;' : ''}
      ">
        <div style="transform: rotate(45deg); display: flex; align-items: center; justify-content: center;">
          <svg width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21h18"/>
            <path d="M5 21V7l8-4v18"/>
            <path d="M19 21V11l-6-3"/>
            <path d="M9 9h1"/>
            <path d="M9 13h1"/>
            <path d="M9 17h1"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

function MapController({
  selectedPartner,
  radiusKm,
}: {
  selectedPartner: ChannelPartner | null;
  radiusKm: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPartner && selectedPartner.latitude && selectedPartner.longitude) {
      const zoomLevel = radiusKm ? (radiusKm <= 10 ? 13 : radiusKm <= 25 ? 11 : 9) : 12;
      map.flyTo([selectedPartner.latitude, selectedPartner.longitude], zoomLevel, {
        duration: 1.2,
      });
    }
  }, [selectedPartner, radiusKm, map]);

  return null;
}

interface PartnerMapProps {
  partners: ChannelPartner[];
  selectedPartner: ChannelPartner | null;
  onSelectPartner: (partner: ChannelPartner) => void;
  radiusKm: number | null;
}

export default function PartnerMap({
  partners,
  selectedPartner,
  onSelectPartner,
  radiusKm,
}: PartnerMapProps) {
  const markerRefs = useRef<Record<string, L.Marker>>({});

  // Auto-open popup on selected partner
  useEffect(() => {
    if (selectedPartner && markerRefs.current[selectedPartner.id]) {
      markerRefs.current[selectedPartner.id].openPopup();
    }
  }, [selectedPartner]);

  // Center on selected partner or center of India
  const initialCenter: [number, number] = useMemo(() => {
    if (selectedPartner) return [selectedPartner.latitude, selectedPartner.longitude];
    if (partners.length > 0) return [partners[0].latitude, partners[0].longitude];
    return [20.5937, 78.9629]; // India Center
  }, [selectedPartner, partners]);

  const schemeLabels: Record<string, string> = {
    mfs: 'MFS (₹1.40L)',
    'term-loan': 'Term Loan (₹50L)',
    aajeevika: 'Aajeevika (₹1.40L)',
    'udyam-nidhi': 'Udyam Nidhi (₹5L)',
    els: 'Education Loan (₹40L)',
  };

  return (
    <div className="w-full h-full min-h-[500px] lg:min-h-[640px] rounded-2xl overflow-hidden border border-neutral-grey/25 shadow-md relative z-0">
      <MapContainer
        center={initialCenter}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        zoomControl={false}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ height: '100%', minHeight: '500px', width: '100%' }}
      >
        <MapController selectedPartner={selectedPartner} radiusKm={radiusKm} />
        
        {/* Controls */}
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" metric={true} imperial={false} />

        {/* Base Layers & Overlays */}
        <LayersControl position="topright">
          {/* Base Layer 1: OpenStreetMap Standard (Fast Buffered CDN) */}
          <BaseLayer checked name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              minZoom={4}
              maxZoom={18}
              keepBuffer={8}
              updateWhenZooming={false}
              updateWhenIdle={false}
            />
          </BaseLayer>

          {/* Base Layer 2: CartoDB Positron / Clean Light (Ultra-fast CDN) */}
          <BaseLayer name="CartoDB Clean Light">
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              minZoom={4}
              maxZoom={18}
              keepBuffer={8}
              updateWhenZooming={false}
              updateWhenIdle={false}
            />
          </BaseLayer>

          {/* Overlay 1: Channel Partner Markers */}
          <Overlay checked name="Channel Partners">
            <LayerGroup>
              {partners.map((partner) => {
                const isSelected = selectedPartner?.id === partner.id;

                return (
                  <Marker
                    key={partner.id}
                    position={[partner.latitude, partner.longitude]}
                    icon={createPartnerPinIcon(partner.type, isSelected)}
                    ref={(el) => {
                      if (el) markerRefs.current[partner.id] = el;
                    }}
                    eventHandlers={{
                      click: () => onSelectPartner(partner),
                    }}
                  >
                    <Popup className="custom-leaflet-popup" minWidth={280} maxWidth={320}>
                      <div className="p-2 space-y-3 text-xs">
                        {/* Header */}
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider"
                              style={{ backgroundColor: getPartnerColor(partner.type) }}
                            >
                              {partner.type}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-forest-green font-semibold">
                              <CheckCircle2 size={12} /> {partner.verificationStatus}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-deep-indigo leading-snug">
                            {partner.name}
                          </h4>
                          <p className="text-neutral-grey text-[11px] mt-0.5">
                            {partner.address}
                          </p>
                        </div>

                        {/* Supported Schemes Pills */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-semibold text-neutral-grey uppercase tracking-wider block">
                            Supported Schemes:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {partner.supportedSchemes.map((sid) => (
                              <span
                                key={sid}
                                className="px-1.5 py-0.5 rounded bg-off-white text-[10px] font-semibold text-deep-indigo border border-neutral-grey/20"
                              >
                                {schemeLabels[sid] || sid}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Contact & Hours */}
                        <div className="bg-off-white p-2 rounded-lg border border-neutral-grey/15 space-y-1 text-[11px] text-near-black/80">
                          {partner.contactPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone size={12} className="text-muted-ochre shrink-0" />
                              <span>{partner.contactPhone}</span>
                            </div>
                          )}
                          {partner.workingHours && (
                            <div className="flex items-center gap-1.5 text-neutral-grey text-[10px]">
                              <Clock size={12} className="shrink-0" />
                              <span>{partner.workingHours}</span>
                            </div>
                          )}
                        </div>

                        {/* Verification timestamp & Action Buttons */}
                        <div className="pt-2 border-t border-neutral-grey/20 space-y-2">
                          <div className="text-[10px] text-neutral-grey">
                            Last verified: {partner.lastVerifiedDate} (NSFDC Registry)
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={APP_CONFIG.urls.pmSuraj}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md bg-[#FF9933] hover:bg-[#e08527] text-white font-bold text-[11px] transition-colors shadow-sm"
                            >
                              Apply on PM-SURAJ <ExternalLink size={11} />
                            </a>

                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${partner.latitude},${partner.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-md bg-deep-indigo hover:bg-deep-indigo/90 text-white font-semibold text-[11px] transition-colors"
                            >
                              <Navigation size={11} /> Directions
                            </a>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </LayerGroup>
          </Overlay>

          {/* Overlay 2: Search Radius Visualization Circle */}
          {radiusKm && selectedPartner && (
            <Overlay checked name={`Search Radius (${radiusKm} km)`}>
              <LayerGroup>
                <Circle
                  center={[selectedPartner.latitude, selectedPartner.longitude]}
                  radius={radiusKm * 1000} // meters
                  pathOptions={{
                    color: '#C77B33',
                    fillColor: '#C77B33',
                    fillOpacity: 0.12,
                    weight: 2,
                    dashArray: '6, 6',
                  }}
                />
              </LayerGroup>
            </Overlay>
          )}
        </LayersControl>
      </MapContainer>
    </div>
  );
}
