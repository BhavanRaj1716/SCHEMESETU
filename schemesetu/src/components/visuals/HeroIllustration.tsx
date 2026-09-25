'use client';

export function HeroIllustration() {
  return (
    <div className="relative w-full max-w-lg mx-auto aspect-[4/3] flex items-center justify-center">
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow-rev { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes bob-up { 0%,100% { transform: translateY(-4px); } 50% { transform: translateY(4px); } }
        @keyframes bob-down { 0%,100% { transform: translateY(4px); } 50% { transform: translateY(-4px); } }
        .hero-ring-1 { animation: spin-slow 60s linear infinite; }
        .hero-ring-2 { animation: spin-slow-rev 45s linear infinite; }
        .hero-badge-up { animation: bob-up 4s ease-in-out infinite; }
        .hero-badge-down { animation: bob-down 3.5s ease-in-out infinite; }
      `}</style>
      {/* Background Decorative Rings */}
      <div className="hero-ring-1 absolute inset-0 rounded-full border border-white/10" />
      <div className="hero-ring-2 absolute inset-8 rounded-full border border-dashed border-white/15" />

      {/* Main SVG Composition */}
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-2xl z-10"
      >
        <defs>
          <linearGradient id="heroGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.03" />
          </linearGradient>
          <linearGradient id="ochreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C77B33" />
            <stop offset="100%" stopColor="#E08E45" />
          </linearGradient>
          <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2F6B4F" />
            <stop offset="100%" stopColor="#418F6B" />
          </linearGradient>
        </defs>

        {/* Central Gateway Symbol / Bridge (Setu) */}
        <path
          d="M120 280 C180 200, 300 200, 360 280"
          stroke="url(#ochreGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M140 280 C190 220, 290 220, 340 280"
          stroke="url(#ochreGrad)"
          strokeWidth="2"
          strokeDasharray="4 6"
          fill="none"
        />

        {/* Pillar Left */}
        <rect x="110" y="240" width="20" height="50" rx="4" fill="#F7F7F5" fillOpacity="0.2" />
        {/* Pillar Right */}
        <rect x="350" y="240" width="20" height="50" rx="4" fill="#F7F7F5" fillOpacity="0.2" />

        {/* Base Foundation */}
        <rect x="90" y="285" width="300" height="12" rx="6" fill="#F7F7F5" fillOpacity="0.3" />

        {/* Floating Card 1: Education Financing */}
        <g transform="translate(40, 60)">
          <rect width="140" height="85" rx="12" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <circle cx="28" cy="28" r="14" fill="url(#greenGrad)" />
          {/* Graduation Cap Icon */}
          <path d="M28 20 L38 25 L28 30 L18 25 Z" fill="#FFFFFF" />
          <path d="M22 27 V33 C22 35 34 35 34 33 V27" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
          <text x="50" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Education Loan
          </text>
          <text x="50" y="38" fill="#C77B33" fontSize="9" fontWeight="600" fontFamily="sans-serif">
            6.5% p.a. • Up to ₹40L
          </text>
          <rect x="16" y="55" width="108" height="14" rx="4" fill="rgba(255,255,255,0.1)" />
          <text x="24" y="65" fill="#F7F7F5" fontSize="8" fontFamily="sans-serif">
            Professional & Tech Courses
          </text>
        </g>

        {/* Floating Card 2: Micro Enterprise */}
        <g transform="translate(300, 70)">
          <rect width="140" height="85" rx="12" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <circle cx="28" cy="28" r="14" fill="url(#ochreGrad)" />
          {/* Store / Shop Icon */}
          <path d="M21 24 L24 20 H32 L35 24 V34 H21 Z" fill="#FFFFFF" />
          <rect x="25" y="28" width="6" height="6" fill="#C77B33" />
          <text x="50" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Micro Finance
          </text>
          <text x="50" y="38" fill="#418F6B" fontSize="9" fontWeight="600" fontFamily="sans-serif">
            ₹1.40 Lakh • 90% Cover
          </text>
          <rect x="16" y="55" width="108" height="14" rx="4" fill="rgba(255,255,255,0.1)" />
          <text x="24" y="65" fill="#F7F7F5" fontSize="8" fontFamily="sans-serif">
            Quick Small Business Credit
          </text>
        </g>

        {/* Floating Card 3: Direct Channel / PM-SURAJ Bridge */}
        <g transform="translate(170, 150)">
          <rect width="140" height="90" rx="12" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <circle cx="28" cy="28" r="14" fill="#152B4D" stroke="#C77B33" strokeWidth="2" />
          {/* Verified Check Icon */}
          <path d="M23 28 L27 32 L34 24" stroke="#418F6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <text x="50" y="26" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            PM-SURAJ Ready
          </text>
          <text x="50" y="38" fill="#F7F7F5" fontSize="9" fontFamily="sans-serif">
            Direct SCA Submissions
          </text>
          <rect x="16" y="55" width="108" height="18" rx="5" fill="#C77B33" />
          <text x="26" y="67" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
            Concessional Credit
          </text>
        </g>

        {/* Central Radiant Glow */}
        <circle cx="240" cy="180" r="40" fill="#C77B33" fillOpacity="0.15" filter="blur(20px)" />
      </svg>

      {/* Floating Animated Badges */}
      <div
        className="hero-badge-up absolute -top-2 left-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg text-[11px] text-white flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-forest-green animate-pulse" />
        Official NSFDC Schemes
      </div>

      <div
        className="hero-badge-down absolute -bottom-2 right-6 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full shadow-lg text-[11px] text-white flex items-center gap-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-muted-ochre" />
        Zero Intermediary Handoff
      </div>
    </div>
  );
}
