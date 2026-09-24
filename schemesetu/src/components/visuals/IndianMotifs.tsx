'use client';

export function TricolorAccent({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-1 w-full rounded-full overflow-hidden ${className}`}>
      <div className="flex-1 bg-[#FF9933]" /> {/* Saffron */}
      <div className="flex-1 bg-white" />     {/* White */}
      <div className="flex-1 bg-[#138808]" /> {/* Green */}
    </div>
  );
}

export function IndianMandalaWatermark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`opacity-5 pointer-events-none ${className}`}
    >
      <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
      <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1" />
      <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="30" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
      <circle cx="100" cy="100" r="10" fill="currentColor" fillOpacity="0.3" />
      
      {/* 8 radiating lotus/chakra spokes */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 100 100)`}>
          <line x1="100" y1="30" x2="100" y2="70" stroke="currentColor" strokeWidth="1" />
          <path d="M100 10 C90 25, 110 25, 100 10 Z" fill="currentColor" fillOpacity="0.4" />
          <circle cx="100" cy="50" r="3" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function WarliArtBorder({ className = '' }: { className?: string }) {
  return (
    <div className={`w-full overflow-hidden flex items-center justify-around opacity-15 py-1 text-deep-indigo ${className}`}>
      {Array.from({ length: 12 }).map((_, i) => (
        <svg key={i} width="24" height="20" viewBox="0 0 24 20" fill="currentColor">
          <circle cx="12" cy="4" r="2.5" />
          <path d="M12 7 L8 14 L16 14 Z" fill="currentColor" />
          <path d="M8 14 L12 20 L16 14 Z" fill="currentColor" />
          <line x1="8" y1="10" x2="4" y2="6" stroke="currentColor" strokeWidth="1.5" />
          <line x1="16" y1="10" x2="20" y2="6" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ))}
    </div>
  );
}
