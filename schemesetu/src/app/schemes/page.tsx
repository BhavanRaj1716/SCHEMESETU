'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { VERIFIED_SCHEMES } from '@/services/mockData/schemes';
import { DemoDataBadge } from '@/components/ui/DemoDataBadge';
import { IS_MOCK_MODE } from '@/services/apiClient';
import {
  Search,
  Filter,
  Calculator,
  Calendar,
  Percent,
  Banknote,
  FileCheck,
  Building2,
  Sparkles,
  X,
  Volume2,
} from 'lucide-react';
import { VoiceSearchButton } from '@/components/common/VoiceSearchButton';
import { SchemeAudioNarrator } from '@/components/common/SchemeAudioNarrator';
import { getRecommendations } from '@/services/recommendationService';

// Multilingual keywords dictionary for instant, accurate matching across 12 Indian languages + English
const SCHEME_KEYWORDS: Record<string, string[]> = {
  els: [
    'education', 'degree', 'college', 'university', 'study', 'engineering', 'btech', 'medical',
    'mbbs', 'ms', 'mba', 'abroad', 'higher education', 'student', 'fees', 'course', 'tuition',
    'foreign', 'scholarship', 'masters', 'phd',
    // Hindi
    'शिक्षा', 'पढ़ाई', 'कॉलेज', 'विश्वविद्यालय', 'इंजीनियरिंग', 'विदेश', 'छात्र', 'डिग्री', 'उच्च शिक्षा', 'फीस',
    // Tamil
    'கல்வி', 'படிப்பு', 'கல்லூரி', 'வெளிநாடு', 'பல்கலைக்கழகம்',
    // Telugu
    'చదువు', 'విద్యా', 'కాలేజీ', 'విదేశీ విద్య', 'ఉన్నత విద్య',
    // Bengali
    'শিক্ষা', 'পড়াশোনা', 'কলেজ', 'উচ্চশিক্ষা', 'বিদেশ',
    // Marathi
    'शिक्षण', 'महाविद्यालय', 'उच्च शिक्षण', 'परदेश', 'अभ्यास',
    // Gujarati
    'શિક્ષણ', 'કોલેજ', 'વિદેશ', 'અભ્યાસ',
    // Kannada
    'ವಿದ್ಯಾಭ್ಯಾಸ', 'ಕಾಲೇಜು', 'ಉನ್ನತ ಶಿಕ್ಷಣ', 'ವಿದೇಶ',
    // Malayalam
    'വിദ്യാഭ്യാസം', 'കോളേജ്', 'വിദേശ പഠനം',
    // Punjabi
    'ਵਿੱਦਿਆ', 'ਪੜ੍ਹਾਈ', 'ਕਾਲਜ', 'ਵਿਦੇਸ਼',
    // Odia
    'ଶିକ୍ଷା', 'ପାଠପଢା', 'କଲେଜ', 'ବିଦେଶ',
    // Urdu
    'تعلیم', 'کالج', 'یونیورسٹی', 'اعلیٰ تعلیم', 'بیرون ملک',
  ],
  'term-loan': [
    'term loan', 'tractor', 'farming', 'agriculture', 'commercial vehicle', 'truck', 'auto',
    'dairy', 'cattle', 'cows', 'buffalo', 'poultry', 'industry', 'factory', 'machinery',
    'manufacturing', 'enterprise', 'large project', 'big business', 'transport', 'tempo', 'bus',
    // Hindi
    'ट्रैक्टर', 'कृषि', 'खेती', 'कारखाना', 'मशीन', 'गाड़ी', 'वाहन', 'उद्योग', 'डेयरी', 'पशुपालन', 'गाय', 'भैंस', 'पोल्ट्री', 'व्यापार', 'बड़ा लोन', 'टर्म लोन',
    // Tamil
    'விவசாயம்', 'டிராக்டர்', 'தொழிற்சாலை', 'வாகனம்', 'பால் பண்ணை', 'மாடு', 'இயந்திரம்',
    // Telugu
    'ట్రాక్టర్', 'వ్యవసాయం', 'పరిశ్రమ', 'వాహనం', 'పాడి పరిశ్రమ', 'గేదెలు', 'యంత్రాలు',
    // Bengali
    'ট্যাক্টর', 'কৃষি', 'ট্রাক্টর', 'শিল্প', 'গাড়ি', 'পশুপালন', 'ডেয়ারি',
    // Marathi
    'ट्रॅक्टर', 'शेती', 'कारखाना', 'वाहन', 'दुग्ध व्यवसाय', 'उद्योग', 'यंत्र',
    // Gujarati
    'ટ્રેક્ટર', 'ખેતી', 'ઉદ્યોગ', 'વાહન', 'ડેરી', 'પશુપાલન',
    // Kannada
    'ಟ್ರಾಕ್ಟರ್', 'ಕೃಷಿ', 'ಉದ್ಯಮ', 'ವಾಹನ', 'ಡೈರಿ', 'ಯಂತ್ರ',
    // Malayalam
    'ട്രാക്ടർ', 'കൃഷി', 'വ്യവസായം', 'വാഹനം', 'ഡയറി ഫാം',
    // Punjabi
    'ਟਰੈਕਟਰ', 'ਖੇਤੀਬਾੜੀ', 'ਕਾਰਖਾਨਾ', 'ਗੱਡੀ', 'ਡੇਅਰੀ',
    // Odia
    'ଟ୍ରାକ୍ଟର', 'କୃଷି', 'ଶିଳ୍ପ', 'ଗାଡ଼ି', 'ଡାଏରୀ',
    // Urdu
    'ٹریکٹر', 'کاشتکاری', 'گاڑی', 'ڈیری فارم', 'صنعت', 'مشینری',
  ],
  'udyam-nidhi': [
    'udyam', 'udyam nidhi', 'small enterprise', '5 lakh', 'shop', 'boutique', 'tailoring',
    'sewing machine', 'garment', 'retail', 'services', 'sanitation', 'cleanliness', 'safai',
    'equipment', 'street vendor', 'grocery', 'kirana', 'mechanic', 'salon', 'mobile repair',
    // Hindi
    'उद्यम', 'दुकान', 'सिलाई', 'दर्जी', 'सफाई', 'स्वच्छता', 'लघु उद्योग', 'किराना', 'कपड़ा', 'सफाई कर्मचारी', 'सफाई उपकरण', 'ई-रिक्शा', '५ लाख',
    // Tamil
    'கடை', 'தையல்', 'தையல் இயந்திரம்', 'சிறு தொழில்', 'தூய்மை பணியாளர்',
    // Telugu
    'దుకాణం', 'కుట్టు మిషన్', 'చిన్న పరిశ్రమ', 'శుభ్రతా కార్మికులు',
    // Bengali
    'দোকান', 'দর্জি', 'সেলাই মেশিন', 'ছোট ব্যবসা', 'পরিচ্ছন্নতাকর্মী',
    // Marathi
    'दुकान', 'शिलाई मशीन', 'लघु उद्योग', 'स्वच्छता कर्मचारी', 'किराणा',
    // Gujarati
    'દુકાન', 'સિલાઈ મશીન', 'નાનો ઉદ્યોગ', 'સફાઈ કામદાર',
    // Kannada
    'ಅಂಗಡಿ', 'ಹೊಲಿಗೆ ಯಂತ್ರ', 'ಸಣ್ಣ ಉದ್ದಿಮೆ', 'ಸ್ವಚ್ಛತಾ ಸಿಬ್ಬಂದಿ',
    // Malayalam
    'കട', 'തയ്യൽ മെഷീൻ', 'ചെറുകിട സംരംഭം', 'ശുചീകരണ തൊഴിലാളി',
    // Punjabi
    'ਦੁਕਾਨ', 'ਸਿਲਾਈ ਮਸ਼ੀਨ', 'ਛੋਟਾ ਕਾਰੋਬਾਰ', 'ਸਫਾਈ ਸੇਵਕ',
    // Odia
    'ଦୋକାନ', 'ସିଲେଇ ମେସିନ', 'କ୍ଷୁଦ୍ର ଶିଳ୍ପ', 'ସଫେଇ କର୍ମଚାରୀ',
    // Urdu
    'دکان', 'سلائی مشین', 'چھوٹا کاروبار', 'صفائی کا سامان',
  ],
  mfs: [
    'micro finance', 'small loan', 'micro loan', '1.4 lakh', 'shg', 'self help group',
    'petty shop', 'vegetable vendor', 'fruit vendor', 'tea stall', 'women loan', 'micro credit',
    // Hindi
    'लघु ऋण', 'छोटा लोन', 'स्वयं सहायता समूह', 'सब्जी', 'फल विक्रेता', 'चाय की दुकान', 'महिला समूह', 'माइक्रो फाइनेंस',
    // Tamil
    'சிறு கடன்', 'சுய உதவிக் குழு', 'காய்கறி கடை', 'பெண்கள் குழு',
    // Telugu
    'చిన్న రుణం', 'స్వయం సహాయక బృందం', 'కూరగాయల వ్యాపారం',
    // Bengali
    'ক্ষুদ্র ঋণ', 'স্বনির্ভর দল', 'সবজি বিক্রেতা', 'চা দোকান',
    // Marathi
    'लघु कर्ज', 'स्वयं सहाय्यता गट', 'भाजी विक्रेता', 'सूक्ष्म वित्त',
    // Gujarati
    'નાની લોન', 'સ્વ સહાય જૂથ', 'શાકભાજી વિક્રેતા',
    // Kannada
    'ಕಿರು ಸಾಲ', 'ಸ್ವಸಹಾಯ ಸಂಘ', 'ತರಕಾರಿ ವ್ಯಾಪಾರ',
    // Malayalam
    'ചെറുകിട വായ്പ', 'സ്വയം സഹായ സംഘം', 'പച്ചക്കറി കച്ചവടം',
    // Punjabi
    'ਛੋਟਾ ਕਰਜ਼ਾ', 'ਸਵੈ ਸਹਾਇਤਾ ਗਰੁੱਪ', 'ਸਬਜ਼ੀ ਵਿਕਰੇਤਾ',
    // Odia
    'କ୍ଷୁଦ୍ର ଋଣ', 'ସ୍ୱୟଂ ସହାୟକ ଗୋଷ୍ଠୀ', 'ପରିବା ବ୍ୟବସାୟ',
    // Urdu
    'چھوٹا قرضہ', 'مائیکرو فنانس', 'سبزی فروش',
  ],
  aajeevika: [
    'aajeevika', 'nbfc', 'mfi', 'livelihood', 'rural women', 'artisan', 'handicraft',
    'pottery', 'weaver', 'handloom', 'rural business', 'micro enterprise finance',
    // Hindi
    'आजीविका', 'रोजगार', 'कारीगर', 'हस्तशिल्प', 'बुनकर', 'ग्रामीण महिला', 'हथकरघा', 'एनबीएफसी',
    // Tamil
    'வாழ்வாதாரம்', 'கைவினைஞர்', 'நெசவாளர்', 'கிராமப்புற பெண்கள்',
    // Telugu
    'జీవనోపాధి', 'చేతివృత్తులు', 'చేనేత', 'గ్రామీణ మహిళలు',
    // Bengali
    'জীবিকা', 'হস্তশিল্প', 'তাঁতি', 'গ্রামীণ মহিলা',
    // Marathi
    'उपजीविका', 'हस्तकला', 'विणकर', 'ग्रामीण महिला', 'रोजगार',
    // Gujarati
    'રોજગાર', 'હસ્તકલા', 'કારીગર', 'ગ્રામીણ મહિલા',
    // Kannada
    'ಉಪಜೀವನ', 'ಕರಕುಶಲ', 'ನೇಯ್ಗೆ', 'ಗ್ರಾಮೀಣ ಮಹಿಳೆಯರು',
    // Malayalam
    'ഉപജീവനം', 'കരകൗശലം', 'നെയ്ത്ത്', 'ഗ്രാമീണ സ്ത്രീകൾ',
    // Punjabi
    'ਰੋਜ਼ਗਾਰ', 'ਦਸਤਕਾਰੀ', 'ਜੁਲਾਹੇ', 'ਪੇਂਡੂ ਔਰਤਾਂ',
    // Odia
    'ଜୀବିକା', 'ହସ୍ତତନ୍ତ', 'କାରିଗର', 'ଗ୍ରାମୀଣ ମହିଳା',
    // Urdu
    'روزگار', 'دستکاری', 'دیہی خواتین', 'ہنر مند',
  ],
};

export default function SchemeDirectoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPartnerType, setSelectedPartnerType] = useState<string>('all');
  const [semanticRankings, setSemanticRankings] = useState<Record<string, number>>({});

  const categories = ['all', 'Micro Enterprise', 'Enterprise Finance', 'Education'];
  const partnerTypes = [
    'all',
    'State Channelizing Agencies (SCAs)',
    'Public Sector Banks (PSBs)',
    'Regional Rural Banks (RRBs)',
    'NBFC–Micro Finance Institutions (NBFC-MFIs)',
    'Co-operative Banks',
    'Small Finance Banks (SFBs)',
    'Cooperative Societies',
    'Other Agencies & SIDBI',
  ];

  // Call backend semantic search if active when query is typed or spoken
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 3) {
      setSemanticRankings({});
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await getRecommendations({ mode: 'semantic', query: trimmed });
        if (res && res.recommendations) {
          const map: Record<string, number> = {};
          res.recommendations.forEach((rec, idx) => {
            map[rec.scheme.id] = (res.recommendations.length - idx) * 20;
          });
          setSemanticRankings(map);
        }
      } catch {
        // Fallback to client-side keywords
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredSchemes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const queryTokens = q ? q.split(/\s+/).filter(Boolean) : [];

    const scored = VERIFIED_SCHEMES.map((scheme) => {
      let score = 0;
      let matchedReason = '';

      if (q) {
        // 1. Direct text match
        if (scheme.name.toLowerCase().includes(q)) score += 100;
        if (scheme.shortName.toLowerCase().includes(q)) score += 90;
        if (scheme.purpose.toLowerCase().includes(q)) score += 60;
        if (scheme.description.toLowerCase().includes(q)) score += 40;

        // 2. Multilingual keywords match
        const schemeKeywords = SCHEME_KEYWORDS[scheme.id] || [];
        for (const token of queryTokens) {
          for (const kw of schemeKeywords) {
            if (kw.toLowerCase().includes(token) || token.includes(kw.toLowerCase())) {
              score += 75;
              if (!matchedReason) {
                matchedReason = kw;
              }
            }
          }
        }

        // 3. Backend AI embeddings similarity score
        if (semanticRankings[scheme.id]) {
          score += semanticRankings[scheme.id];
        }
      } else {
        score = 1; // Default neutral score when no query
      }

      const matchesCategory =
        selectedCategory === 'all' || scheme.category === selectedCategory;

      const matchesPartner =
        selectedPartnerType === 'all' ||
        scheme.channelPartnerTypes.includes(selectedPartnerType);

      const isValid = (q === '' || score > 0) && matchesCategory && matchesPartner;

      return {
        scheme,
        score,
        matchedReason,
        isValid,
      };
    });

    const activeList = scored.filter((item) => item.isValid);

    if (q) {
      activeList.sort((a, b) => b.score - a.score);
    }

    return activeList;
  }, [searchQuery, selectedCategory, selectedPartnerType, semanticRankings]);

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return 'N/A';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 2)} Lakh`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  return (
    <div className="min-h-[80vh]">
      {/* Header */}
      <div className="bg-deep-indigo text-white py-10 sm:py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              NSFDC Concessional Credit Schemes Directory
            </h1>
            {IS_MOCK_MODE && <DemoDataBadge />}
          </div>
          <p className="text-white/60 text-sm leading-relaxed max-w-2xl">
            Explore all {VERIFIED_SCHEMES.length} concessional credit schemes offered by the National Scheduled Castes Finance and Development Corporation (NSFDC). Verified against official NSFDC records.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Filters and Search Bar */}
        <div className="bg-white rounded-xl border border-neutral-grey/20 p-5 shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-grey"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by voice or text (e.g. 'ट्रैक्टर', 'dairy', 'education', 'सिलाई')..."
                className="w-full pl-10 pr-28 py-2.5 bg-off-white border border-neutral-grey/25 rounded-lg text-sm text-near-black placeholder:text-neutral-grey focus:outline-none focus:ring-2 focus:ring-deep-indigo"
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-neutral-grey hover:text-near-black rounded"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
                <VoiceSearchButton
                  onTranscript={(text) => setSearchQuery(text)}
                  onInterimTranscript={(text) => setSearchQuery(text)}
                />
              </div>
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-neutral-grey shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-off-white border border-neutral-grey/25 rounded-lg px-3 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
                  aria-label="Filter by scheme category"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedPartnerType}
                onChange={(e) => setSelectedPartnerType(e.target.value)}
                className="bg-off-white border border-neutral-grey/25 rounded-lg px-3 py-2 text-xs font-medium text-near-black focus:outline-none focus:ring-2 focus:ring-deep-indigo"
                aria-label="Filter by channel partner type"
              >
                {partnerTypes.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt === 'all' ? 'All Partner Channels' : pt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-neutral-grey border-t border-gray-100 pt-2">
              <span className="flex items-center gap-1.5 font-medium text-deep-indigo">
                <Sparkles size={14} className="text-muted-ochre" />
                Showing {filteredSchemes.length} results matching &quot;{searchQuery}&quot;
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-muted-ochre font-semibold hover:underline"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>

        {/* Scheme Listings */}
        {filteredSchemes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-grey/20 p-6">
            <p className="text-neutral-grey text-sm mb-4">
              No schemes match your current search and filter criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedPartnerType('all');
              }}
              className="px-4 py-2 text-xs font-semibold text-deep-indigo border border-deep-indigo/30 rounded-lg hover:bg-off-white"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSchemes.map(({ scheme, score, matchedReason }) => (
              <div
                key={scheme.id}
                className="bg-white rounded-xl border border-neutral-grey/20 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative overflow-hidden"
              >
                {searchQuery && score >= 50 && (
                  <div className="absolute top-0 right-0 bg-forest-green/10 text-forest-green px-3 py-1 rounded-bl-xl text-[10px] font-bold flex items-center gap-1 border-l border-b border-forest-green/20">
                    <Sparkles size={11} />
                    {matchedReason ? `Matched '${matchedReason}'` : 'Top Relevant'}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2 pr-16 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-ochre">
                        {scheme.shortName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-off-white text-neutral-grey border border-neutral-grey/15">
                        {scheme.category}
                      </span>
                    </div>
                    <SchemeAudioNarrator scheme={scheme} variant="compact" />
                  </div>

                  <h2 className="text-lg font-bold text-deep-indigo mb-2">
                    {scheme.name}
                  </h2>
                  <p className="text-xs text-neutral-grey mb-4 line-clamp-2">
                    {scheme.description}
                  </p>

                  {/* Quick specs grid */}
                  <div className="py-3 border-y border-neutral-grey/15 text-xs mb-4 space-y-2.5">
                    {/* Row 1: Max Loan · Interest Rate · Tenure */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Banknote size={14} className="text-muted-ochre shrink-0" />
                        <div className="min-w-0">
                          <p className="text-neutral-grey text-[10px]">Max Loan</p>
                          <p className="font-semibold text-near-black truncate">
                            {formatCurrency(scheme.financialDetails.maxLoanAmount)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Percent size={14} className="text-forest-green shrink-0" />
                        <div className="min-w-0">
                          <p className="text-neutral-grey text-[10px]">Interest Rate</p>
                          <p className="font-semibold text-near-black truncate">
                            {scheme.financialDetails.interestRate}% p.a.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 min-w-0">
                        <Calendar size={14} className="text-deep-indigo shrink-0" />
                        <div className="min-w-0">
                          <p className="text-neutral-grey text-[10px]">Tenure</p>
                          <p className="font-semibold text-near-black truncate">
                            {scheme.financialDetails.repaymentPeriod?.split(',')[0] || 'Up to 5 yrs'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Channel Partners */}
                    <div className="flex items-start gap-1.5">
                      <Building2 size={14} className="text-neutral-grey shrink-0 mt-0.5" />
                      <div>
                        <p className="text-neutral-grey text-[10px] mb-1">Channel Partners</p>
                        <ul className="space-y-0.5">
                          {scheme.channelPartnerTypes.map((partner) => (
                            <li key={partner} className="font-semibold text-near-black leading-snug">
                              {partner}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-[11px] text-neutral-grey">
                    <span>Source: {scheme.officialSource.organization}</span>
                    <span>Verified: {scheme.officialSource.lastVerified}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/schemes/${scheme.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-deep-indigo text-white text-xs font-semibold hover:bg-deep-indigo/90 transition-colors"
                    >
                      <FileCheck size={14} />
                      View Details
                    </Link>
                    <Link
                      href={`/calculator?amount=${scheme.financialDetails.maxLoanAmount ?? 200000}&rate=${scheme.financialDetails.interestRate ?? 6}&tenure=${scheme.financialDetails.repaymentPeriodMonths ? scheme.financialDetails.repaymentPeriodMonths / 12 : 5}&moratorium=${scheme.financialDetails.moratoriumMonths ?? 6}`}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-neutral-grey/25 text-deep-indigo text-xs font-semibold hover:bg-off-white transition-colors"
                    >
                      <Calculator size={14} />
                      Calculator
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
