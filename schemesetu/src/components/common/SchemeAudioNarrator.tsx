'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';
import type { Scheme } from '@/types/scheme';

interface SchemeAudioNarratorProps {
  scheme: Scheme;
  className?: string;
  variant?: 'compact' | 'full';
}

export interface VoiceLangConfig {
  locale: string;
  name: string;
  nativeName: string;
  voicePrefixes: string[];
}

export const NARRATOR_LANGUAGES: Record<string, VoiceLangConfig> = {
  hi: { locale: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', voicePrefixes: ['hi', 'hindi', 'madhur', 'swara', 'kalpana', 'hemant'] },
  en: { locale: 'en-IN', name: 'English', nativeName: 'English', voicePrefixes: ['en-in', 'en', 'rishi', 'neerja', 'heera', 'india', 'indian'] },
  ta: { locale: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', voicePrefixes: ['ta', 'tamil', 'valluvar', 'pallavi'] },
  te: { locale: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', voicePrefixes: ['te', 'telugu', 'mohan', 'shruti'] },
  bn: { locale: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', voicePrefixes: ['bn', 'bengali', 'bashkar', 'tanisha'] },
  mr: { locale: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', voicePrefixes: ['mr', 'marathi', 'aarohi', 'manohar'] },
  gu: { locale: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', voicePrefixes: ['gu', 'gujarati', 'dhwani', 'niranjan'] },
  kn: { locale: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', voicePrefixes: ['kn', 'kannada', 'gagan', 'sapna'] },
  ml: { locale: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം', voicePrefixes: ['ml', 'malayalam', 'midhun', 'sobhana'] },
  pa: { locale: 'pa-IN', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', voicePrefixes: ['pa', 'punjabi', 'gurpreet'] },
  or: { locale: 'or-IN', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', voicePrefixes: ['or', 'odia', 'oriya'] },
  ur: { locale: 'ur-IN', name: 'Urdu', nativeName: 'اردو', voicePrefixes: ['ur', 'urdu', 'salman', 'uzma'] },
};

function formatLakhSpoken(val?: number, lang = 'hi'): string {
  if (!val) {
    if (lang === 'en') return 'specified guidelines';
    if (lang === 'ta') return 'குறிப்பிட்ட விதிமுறைகளின்படி';
    if (lang === 'te') return 'నిర్దేశించిన నిబంధనల ప్రకారం';
    if (lang === 'bn') return 'নির্দিষ্ট নির্দেশিকা অনুসারে';
    if (lang === 'mr') return 'नियमांनुसार';
    if (lang === 'gu') return 'નિયમો અનુસાર';
    if (lang === 'kn') return 'ನಿಯಮಗಳ ಪ್ರಕಾರ';
    if (lang === 'ml') return 'മാർഗ്ഗനിർദ്ദേശങ്ങൾ അനുസരിച്ച്';
    if (lang === 'pa') return 'ਨਿਯਮਾਂ ਅਨੁਸਾਰ';
    if (lang === 'or') return 'ନିୟମ ଅନୁସାରେ';
    if (lang === 'ur') return 'قواعد کے مطابق';
    return 'निर्धारित नियमों के अनुसार';
  }

  if (val >= 10000000) {
    const cr = (val / 10000000).toFixed(val % 10000000 === 0 ? 0 : 2);
    switch (lang) {
      case 'ta': return `${cr} கோடி ரூபாய்`;
      case 'te': return `${cr} కోట్లు రూపాయలు`;
      case 'bn': return `${cr} কোটি টাকা`;
      case 'mr': return `${cr} कोटी रुपये`;
      case 'gu': return `${cr} કરોડ રૂપિયા`;
      case 'kn': return `${cr} ಕೋಟಿ ರೂಪಾಯಿ`;
      case 'ml': return `${cr} കോടി രൂപ`;
      case 'pa': return `${cr} ਕਰੋੜ ਰੁਪਏ`;
      case 'or': return `${cr} କୋଟି ଟଙ୍କା`;
      case 'ur': return `${cr} کروڑ روپے`;
      case 'en': return `${cr} crore rupees`;
      case 'hi':
      default: return `${cr} करोड़ रुपये`;
    }
  }
  if (val >= 100000) {
    const lakhs = (val / 100000).toFixed(val % 100000 === 0 ? 0 : 2);
    switch (lang) {
      case 'ta': return `${lakhs} லட்சம் ரூபாய்`;
      case 'te': return `${lakhs} లక్ష రూపాయలు`;
      case 'bn': return `${lakhs} লক্ষ টাকা`;
      case 'mr': return `${lakhs} लाख रुपये`;
      case 'gu': return `${lakhs} લાખ રૂપિયા`;
      case 'kn': return `${lakhs} ಲಕ್ಷ ರೂಪಾಯಿ`;
      case 'ml': return `${lakhs} ലക്ഷം രൂപ`;
      case 'pa': return `${lakhs} ਲੱਖ ਰੁਪਏ`;
      case 'or': return `${lakhs} ଲକ୍ଷ ଟଙ୍କା`;
      case 'ur': return `${lakhs} لاکھ روپے`;
      case 'en': return `${lakhs} lakh rupees`;
      case 'hi':
      default: return `${lakhs} लाख रुपये`;
    }
  }
  return lang === 'en' ? `${val.toLocaleString('en-IN')} rupees` : `${val.toLocaleString('en-IN')} रुपये`;
}

export function buildTunedNarrationScript(scheme: Scheme, langCode: string): string {
  const maxLoanSpoken = formatLakhSpoken(scheme.financialDetails.maxLoanAmount, langCode);
  const maxLoanEn = formatLakhSpoken(scheme.financialDetails.maxLoanAmount, 'en');
  const rate = scheme.financialDetails.interestRate ?? 6;
  const tenureMonths = scheme.financialDetails.repaymentPeriodMonths ?? 60;
  const tenureYears = Math.round(tenureMonths / 12);

  switch (langCode) {
    case 'hi':
      return `योजना का ऑडियो विवरण। योजना का नाम है: ${scheme.name}। यह योजना नेशनल शेड्यूल्ड कास्ट्स फाइनेंस एंड डेवलपमेंट कारपोरेशन द्वारा संचालित है। इसके अंतर्गत अधिकतम ऋण सीमा ${maxLoanSpoken} तक है। रियायती ब्याज दर केवल ${rate} प्रतिशत प्रति वर्ष है। ऋण चुकाने की अधिकतम अवधि ${tenureYears} वर्ष तक है। आवेदन के लिए मुख्य दस्तावेज हैं: अनुसूचित जाति प्रमाण पत्र, 5 लाख रुपये से कम का पारिवारिक आय प्रमाण पत्र, आधार कार्ड, बैंक पासबुक और व्यवसाय का कोटेशन। आप आधिकारिक पीएम-सूरज पोर्टल पर ऑनलाइन आवेदन कर सकते हैं।`;

    case 'ta':
      return `திட்டத்தின் ஆடியோ விவரம். திட்டத்தின் பெயர்: ${scheme.name}. இந்த திட்டம் தேசிய தாழ்த்தப்பட்டோர் நிதி மற்றும் மேம்பாட்டுக் கழகத்தால் வழங்கப்படுகிறது. அதிகபட்ச கடன் வரம்பு ${maxLoanSpoken}. சலுகை வட்டி விகிதம் ஆண்டுக்கு ${rate} சதவீதம் மட்டுமே. திருப்பிச் செலுத்தும் காலம் ${tenureYears} ஆண்டுகள் வரை. தேவையான ஆவணங்கள்: பட்டியல் சாதி சான்றிதழ், 5 லட்சத்திற்கு குறைவான குடும்ப வருமான சான்றிதழ் மற்றும் ஆதார் அட்டை. பி எம் சூரஜ் போர்ட்டலில் விண்ணப்பிக்கலாம்.`;

    case 'te':
      return `పథకం ఆడియో వివరాలు. పథకం పేరు: ${scheme.name}. గరిష్ట రుణ పరిమితి ${maxLoanSpoken} వరకు. రాయితీ వడ్డీ రేటు సంవత్సరానికి ${rate} శాతం మాత్రమే. రుణం తిరిగి చెల్లించే కాలం ${tenureYears} సంవత్సరాల వరకు ఉంటుంది. అవసరమైన పత్రాలు: ఎస్సీ కుల ధ్రువీకరణ పత్రం, 5 లక్షల లోపు కుటుంబ ఆదాయ ధ్రువీకరణ పత్రం మరియు ఆధార్ కార్డు. మీరు పీఎం-సూరజ్ పోర్టల్ ద్వారా దరఖాస్తు చేసుకోవచ్చు.`;

    case 'bn':
      return `প্রকল্পের অডিও বিবরণ। প্রকল্পের নাম: ${scheme.name}। সর্বোচ্চ ঋণের সীমা ${maxLoanSpoken} পর্যন্ত। সুদের হার বছরে মাত্র ${rate} শতাংশ। ঋণ পরিশোধের মেয়াদ ${tenureYears} বছর পর্যন্ত। প্রয়োজনীয় নথিপত্র: এসসি জাতিগত শংসাপত্র, ৫ লক্ষ টাকার নিচে পারিবারিক আয়ের শংসাপত্র এবং আধার কার্ড। পিএম-সুরজ পোর্টালে অনলাইন আবেদন করা যাবে।`;

    case 'mr':
      return `योजनेचा ऑडिओ तपशील. योजनेचे नाव आहे: ${scheme.name}. कमाल कर्ज मर्यादा ${maxLoanSpoken} पर्यंत आहे. सवलतीचा व्याजदर दरवर्षी फक्त ${rate} टक्के आहे. कर्ज परतफेडीचा कालावधी ${tenureYears} वर्षांपर्यंत आहे. आवश्यक कागदपत्रे: जातीचा दाखला, ५ लाखांपेक्षा कमी उत्पन्नाचा दाखला आणि आधार कार्ड. पीएम-सूरज पोर्टलवर ऑनलाइन अर्ज करू शकता.`;

    case 'gu':
      return `યોજનાની વિગતો. યોજનાનું નામ: ${scheme.name}. મહત્તમ લોન મર્યાદા ${maxLoanSpoken} સુધી છે. વ્યાજ દર વાર્ષિક માત્ર ${rate} ટકા છે. લોન પરત કરવાની મુદત ${tenureYears} વર્ષ સુધીની છે. જરૂરી દસ્તાવેજો: જાતિનું પ્રમાણપત્ર, ૫ લાખથી ઓછી વાર્ષિક આવકનું પ્રમાણપત્ર અને આધાર કાર્ડ. પીએમ-સૂરજ પોર્ટલ પર અરજી કરો.`;

    case 'kn':
      return `ಯೋಜನೆಯ ಆಡಿಯೋ ವಿವರ. ಯೋಜನೆಯ ಹೆಸರು: ${scheme.name}. ಗರಿಷ್ಠ ಸಾಲದ ಮಿತಿ ${maxLoanSpoken} ವರೆಗೆ. ಬಡ್ಡಿ ದರ ವಾರ್ಷಿಕ ಕೇವಲ ${rate} ಪ್ರತಿಶತ. ಮರುಪಾವತಿ ಅವಧಿ ${tenureYears} ವರ್ಷಗಳವರೆಗೆ. ಅಗತ್ಯ ದಾಖಲೆಗಳು: ಜಾತಿ ಪ್ರಮಾಣಪತ್ರ, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಆಧಾರ್ ಕಾರ್ಡ್.`;

    case 'ml':
      return `പദ്ധതി വിവരണം. പദ്ധതിയുടെ പേര്: ${scheme.name}. പരമാവധി വായ്പാ പരിധി ${maxLoanSpoken} വരെ. പലിശ നിരക്ക് പ്രതിവർഷം ${rate} ശതമാനം മാത്രം. തിരിച്ചടവ് കാലാവധി ${tenureYears} വർഷം വരെ. ആവശ്യമായ രേഖകൾ: ജാതി സർട്ടിഫിക്കറ്റ്, വരുമാന സർട്ടിഫിക്കറ്റ്, ആധാർ കാർഡ്.`;

    case 'pa':
      return `ਸਕੀਮ ਦਾ ਆਡੀਓ ਵੇਰਵਾ। ਸਕੀਮ ਦਾ ਨਾਮ ਹੈ: ${scheme.name}। ਵੱਧ ਤੋਂ ਵੱਧ ਕਰਜ਼ਾ ਸੀਮਾ ${maxLoanSpoken} ਤੱਕ ਹੈ। ਵਿਆਜ ਦਰ ਸਾਲਾਨਾ ਸਿਰਫ਼ ${rate} ਫ਼ੀਸਦੀ ਹੈ। ਕਰਜ਼ਾ ਮੋੜਨ ਦੀ ਮਿਆਦ ${tenureYears} ਸਾਲ ਤੱਕ ਹੈ। ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼: ਜਾਤੀ ਸਰਟੀਫਿਕੇਟ, ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਆਧਾਰ ਕਾਰਡ।`;

    case 'or':
      return `ଯୋଜନାର ବିବରଣୀ। ଯୋଜନାର ନାମ: ${scheme.name}। ସର୍ବାଧିକ ଋଣ ସୀମା ${maxLoanSpoken} ପର୍ଯ୍ୟନ୍ତ। ସୁଧ ହାର ବାର୍ଷିକ ମାତ୍ର ${rate} ପ୍ରତିଶତ। ପରିଶୋଧ ଅବଧି ${tenureYears} ବର୍ଷ ପର୍ଯ୍ୟନ୍ତ। ଆବଶ୍ୟକୀୟ କାଗଜପତ୍ର: ଜାତି ପ୍ରମାଣପତ୍ର, ଆୟ ପ୍ରମାଣପତ୍ର ଏବଂ ଆଧାର କାର୍ଡ।`;

    case 'ur':
      return `اسکیم کی آڈیو تفصیلات۔ اسکیم کا نام: ${scheme.name}۔ قرض کی زیادہ سے زیادہ حد ${maxLoanSpoken} تک ہے۔ رعایتی شرح سود سالانہ صرف ${rate} فیصد ہے۔ قرض کی واپسی کی مدت ${tenureYears} سال تک ہے۔ ضروری دستاویزات: ذات کا سرٹیفکیٹ، آمدنی کا سرٹیفکیٹ اور آدھار کارڈ۔`;

    case 'en':
    default:
      return `Audio overview for ${scheme.name}, operated by the National Scheduled Castes Finance and Development Corporation. The maximum loan limit is up to ${maxLoanEn}. Concessional interest rate is ${rate} percent per annum, with a repayment tenure of up to ${tenureYears} years. Mandatory documents include your Scheduled Caste community certificate, annual family income certificate below 5 lakh rupees, Aadhaar card, and bank passbook. You can apply directly through the official PM-SURAJ national portal.`;
  }
}

export function SchemeAudioNarrator({
  scheme,
  className = '',
  variant = 'compact',
}: SchemeAudioNarratorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [activeLang, setActiveLang] = useState('hi');
  const [speechRate, setSpeechRate] = useState<number>(0.9); // 0.9x natural clear cadence
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with website translation cookie and load system voices
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSupported(false);
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          setAvailableVoices(voices);
        }
      } catch {
        /* ignore */
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const match = document.cookie.match(/(?:^|;\s*)googtrans=([^;]*)/);
    if (match && match[1]) {
      const parts = decodeURIComponent(match[1]).split('/');
      const code = parts[parts.length - 1];
      if (code && NARRATOR_LANGUAGES[code]) {
        setActiveLang(code);
      }
    }
  }, []);

  // Cleanup on unmount or page change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const findBestVoice = (langCode: string, voicesList: SpeechSynthesisVoice[]): { voice: SpeechSynthesisVoice | null; isFallback: boolean } => {
    if (!voicesList || !voicesList.length) return { voice: null, isFallback: true };
    const config = NARRATOR_LANGUAGES[langCode] || NARRATOR_LANGUAGES.en;
    const targetLocale = config.locale.toLowerCase().replace('_', '-');
    const langPrefix = langCode.toLowerCase();

    // 1. Exact locale match (e.g. 'ta-in' or 'hi-in')
    let found = voicesList.find((v) => v.lang.toLowerCase().replace('_', '-') === targetLocale);
    if (found) return { voice: found, isFallback: false };

    // 2. Language prefix match (e.g. 'ta-TN', 'ta')
    found = voicesList.find((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      return vLang.startsWith(langPrefix + '-') || vLang === langPrefix;
    });
    if (found) return { voice: found, isFallback: false };

    // 3. Name or native name substring match
    for (const prefix of config.voicePrefixes) {
      found = voicesList.find((v) => v.name.toLowerCase().includes(prefix.toLowerCase()) || v.lang.toLowerCase().includes(prefix.toLowerCase()));
      if (found) return { voice: found, isFallback: false };
    }
    found = voicesList.find((v) => v.name.toLowerCase().includes(config.name.toLowerCase()) || v.name.includes(config.nativeName));
    if (found) return { voice: found, isFallback: false };

    // 4. Fallback to Indian English (en-IN) voice if target is non-English, or default English voice
    const indianEngVoice = voicesList.find((v) => v.lang.toLowerCase().replace('_', '-').includes('en-in') || v.name.toLowerCase().includes('india'));
    if (indianEngVoice) return { voice: indianEngVoice, isFallback: true };

    const defaultEngVoice = voicesList.find((v) => v.lang.toLowerCase().startsWith('en')) || voicesList[0] || null;
    return { voice: defaultEngVoice, isFallback: true };
  };

  const handleTogglePlay = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isPlaying) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    } else {
      window.speechSynthesis.cancel();

      const voicesList = availableVoices.length ? availableVoices : window.speechSynthesis.getVoices();
      if (voicesList.length && !availableVoices.length) {
        setAvailableVoices(voicesList);
      }

      const { voice, isFallback } = findBestVoice(activeLang, voicesList);

      // If no native voice for target language exists on this OS/browser,
      // fallback to English script so English TTS reads complete English words cleanly
      const effectiveLang = (isFallback && activeLang !== 'en') ? 'en' : activeLang;
      const script = buildTunedNarrationScript(scheme, effectiveLang);

      const utterance = new SpeechSynthesisUtterance(script);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        const config = NARRATOR_LANGUAGES[effectiveLang] || NARRATOR_LANGUAGES.en;
        utterance.lang = config.locale;
      }

      utterance.rate = speechRate;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      utterance.onerror = (e) => {
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis notification:', e.error);
        }
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStop = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const changeLanguage = (code: string) => {
    setActiveLang(code);
    setShowLangMenu(false);
    if (isPlaying) {
      handleStop();
    }
  };

  if (!isSupported) {
    return null;
  }

  const langInfo = NARRATOR_LANGUAGES[activeLang] || NARRATOR_LANGUAGES.en;

  if (variant === 'compact') {
    return (
      <div className={`relative inline-flex items-center gap-1.5 notranslate ${className}`} translate="no" ref={containerRef}>
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          title={isPlaying && !isPaused ? 'Pause narration' : `Listen to scheme details in ${langInfo.name} (${langInfo.nativeName})`}
          aria-label={`Listen to ${scheme.name} in ${langInfo.name}`}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            isPlaying && !isPaused
              ? 'bg-deep-indigo text-white shadow-md ring-2 ring-deep-indigo/30'
              : isPaused
              ? 'bg-amber-100 text-amber-900 border border-amber-300'
              : 'bg-off-white hover:bg-neutral-grey/15 text-deep-indigo border border-neutral-grey/25'
          }`}
        >
          {isPlaying && !isPaused ? (
            <>
              <span className="flex items-center gap-0.5">
                <span className="w-1 h-3 bg-red-400 animate-pulse rounded-full" />
                <span className="w-1 h-4 bg-white animate-bounce rounded-full" />
                <span className="w-1 h-2 bg-red-400 animate-pulse rounded-full" />
              </span>
              <Pause size={12} className="ml-0.5" />
              <span>Pause</span>
            </>
          ) : isPaused ? (
            <>
              <Play size={12} />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Volume2 size={13} className="text-muted-ochre" />
              <span>{langInfo.nativeName}</span>
            </>
          )}
        </button>

        {/* Language selector trigger */}
        <button
          type="button"
          onClick={() => setShowLangMenu(!showLangMenu)}
          title="Change audio language"
          className="px-1.5 py-1 text-[10px] font-bold uppercase rounded bg-off-white hover:bg-gray-200 text-neutral-grey border border-neutral-grey/25 transition-colors"
        >
          {langInfo.nativeName ? activeLang.toUpperCase() : 'HI'}
        </button>

        {/* Stop button when active */}
        {isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            title="Stop audio playback"
            aria-label="Stop audio"
            className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
          >
            <VolumeX size={14} />
          </button>
        )}

        {/* Language dropdown */}
        {showLangMenu && (
          <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-white shadow-2xl border border-gray-200 py-1.5 z-50 text-left animate-in fade-in slide-in-from-top-1 duration-150 notranslate" translate="no">
            <div className="px-3 py-1 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Narrator Voice
              </span>
              <span className="text-[9px] font-semibold text-deep-indigo bg-deep-indigo/10 px-1 rounded">
                12 Indian Langs
              </span>
            </div>
            <div className="max-h-52 overflow-y-auto py-1">
              {Object.entries(NARRATOR_LANGUAGES).map(([code, item]) => {
                const isSelected = activeLang === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => changeLanguage(code)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors ${
                      isSelected
                        ? 'bg-deep-indigo/10 text-deep-indigo font-bold'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[12px]">{item.nativeName}</span>
                    <span className="text-[10px] text-gray-400">({item.name})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full-width variant (e.g. for /schemes/[id] page)
  return (
    <div
      className={`p-4 bg-gradient-to-r from-deep-indigo/5 via-off-white to-deep-indigo/10 border border-deep-indigo/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 notranslate shadow-xs ${className}`}
      translate="no"
      ref={containerRef}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
          isPlaying && !isPaused ? 'bg-deep-indigo text-white shadow-md animate-pulse' : 'bg-deep-indigo/10 text-deep-indigo'
        }`}>
          <Volume2 size={20} className={isPlaying && !isPaused ? 'text-amber-300' : ''} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-deep-indigo">
              Audio Scheme Narrator (आवाज़ में योजना सुनें)
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-green/10 text-forest-green border border-forest-green/20">
              WCAG 2.1 Assistive
            </span>
          </div>
          <p className="text-xs text-neutral-grey mt-0.5">
            Clear voice narration in <strong>{langInfo.name} ({langInfo.nativeName})</strong> for key loan limits, rates & documents.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {/* Language selector */}
        <select
          value={activeLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-white border border-neutral-grey/25 text-near-black text-xs font-semibold rounded-lg px-2.5 py-2 focus:outline-none focus:ring-1 focus:ring-deep-indigo cursor-pointer shadow-2xs"
          aria-label="Select audio narration language"
        >
          {Object.entries(NARRATOR_LANGUAGES).map(([code, item]) => (
            <option key={code} value={code}>
              {item.nativeName} ({item.name})
            </option>
          ))}
        </select>

        {/* Speed toggle */}
        <button
          type="button"
          onClick={() => {
            const nextRate = speechRate === 0.9 ? 1.0 : speechRate === 1.0 ? 0.8 : 0.9;
            setSpeechRate(nextRate);
          }}
          title="Toggle speech rate"
          className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-white border border-neutral-grey/25 text-neutral-grey hover:text-near-black"
        >
          {speechRate}x
        </button>

        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={handleTogglePlay}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs ${
            isPlaying && !isPaused
              ? 'bg-deep-indigo text-white shadow-md ring-2 ring-deep-indigo/30'
              : isPaused
              ? 'bg-amber-600 text-white'
              : 'bg-muted-ochre hover:bg-muted-ochre/90 text-white'
          }`}
        >
          {isPlaying && !isPaused ? (
            <>
              <Pause size={14} />
              <span>Pause</span>
            </>
          ) : isPaused ? (
            <>
              <Play size={14} />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Play size={14} />
              <span>Listen Now</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            type="button"
            onClick={handleStop}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 bg-white"
            title="Stop audio playback"
            aria-label="Stop audio"
          >
            <VolumeX size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
