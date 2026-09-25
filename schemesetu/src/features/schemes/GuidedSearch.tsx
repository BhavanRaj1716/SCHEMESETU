'use client';

import { useState } from 'react';
import type {
  RecommendationRequest,
  BusinessType,
  ActivityType,
  PurposeCategory,
  EducationInput,
} from '@/types/recommendation';
import { CourseCombobox } from '@/components/ui/CourseCombobox';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Tractor,
  Wrench,
  Factory,
  Sparkles,
  Globe2,
  MapPin,
  Clock,
  Building2,
} from 'lucide-react';

/** Minimum plausible annual income — UX guard against obvious mis-keys */
const MIN_ANNUAL_INCOME = 12000;

/** Minimum thresholds for financial requirements */
const MIN_PROJECT_COST = 10000;
const MIN_LOAN_AMOUNT = 5000;

interface GuidedSearchProps {
  onSubmit: (request: RecommendationRequest) => void;
}

type StepKey = '1a' | '1b' | '2' | '3';

const FINANCING_OPTIONS: {
  value: BusinessType;
  title: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'new',
    title: 'Start a new business',
    description: 'Launch a new business venture or micro-enterprise',
    icon: Briefcase,
  },
  {
    value: 'existing',
    title: 'Expand an existing business',
    description: 'Grow or scale a business you already run',
    icon: TrendingUp,
  },
  {
    value: 'education',
    title: 'Education',
    description: 'Finance a professional or technical course',
    icon: GraduationCap,
  },
];

const ACTIVITY_OPTIONS: {
  value: ActivityType;
  label: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    value: 'agriculture',
    label: 'Agriculture & Allied',
    description: 'Farming, dairy, poultry, fisheries',
    icon: Tractor,
  },
  {
    value: 'services',
    label: 'Services',
    description: 'Transport, repairs, retail, trades',
    icon: Wrench,
  },
  {
    value: 'industrial',
    label: 'Industrial / Manufacturing',
    description: 'Small-scale production, artisan units',
    icon: Factory,
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Any other income-generating activity',
    icon: Sparkles,
  },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Chandigarh', 'Dadra & Nagar Haveli and Daman & Diu', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const INDIAN_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': ['Alluri Sitharama Raju','Anakapalli','Anantapur','Annamayya','Bapatla','Chittoor','East Godavari','Eluru','Guntur','Kakinada','Krishna','Kurnool','Nandyal','NTR','Palnadu','Parvathipuram Manyam','Prakasam','Sri Potti Sri Ramulu Nellore','Sri Sathya Sai','Srikakulam','Tirupati','Visakhapatnam','Vizianagaram','West Godavari','YSR Kadapa'],
  'Arunachal Pradesh': ['Anjaw','Changlang','Dibang Valley','East Kameng','East Siang','Itanagar Capital Complex','Kamle','Kra Daadi','Kurung Kumey','Lepa Rada','Lohit','Longding','Lower Dibang Valley','Lower Siang','Lower Subansiri','Namsai','Pakke-Kessang','Papum Pare','Shi Yomi','Siang','Tawang','Tirap','Upper Dibang Valley','Upper Siang','Upper Subansiri','West Kameng','West Siang'],
  'Assam': ['Bajali','Baksa','Barpeta','Biswanath','Bongaigaon','Cachar','Charaideo','Chirang','Darrang','Dhemaji','Dhubri','Dibrugarh','Dima Hasao','Goalpara','Golaghat','Hailakandi','Hojai','Jorhat','Kamrup Metropolitan','Kamrup','Karbi Anglong','Karimganj','Kokrajhar','Lakhimpur','Majuli','Morigaon','Nagaon','Nalbari','Sivasagar','Sonitpur','South Salmara-Mankachar','Tamulpur','Tinsukia','Udalguri','West Karbi Anglong'],
  'Bihar': ['Araria','Arwal','Aurangabad','Banka','Begusarai','Bhagalpur','Bhojpur','Buxar','Darbhanga','East Champaran','Gaya','Gopalganj','Jamui','Jehanabad','Kaimur','Katihar','Khagaria','Kishanganj','Lakhisarai','Madhepura','Madhubani','Munger','Muzaffarpur','Nalanda','Nawada','Patna','Purnia','Rohtas','Saharsa','Samastipur','Saran','Sheikhpura','Sheohar','Sitamarhi','Siwan','Supaul','Vaishali','West Champaran'],
  'Chhattisgarh': ['Balod','Baloda Bazar','Balrampur','Bastar','Bemetara','Bijapur','Bilaspur','Dantewada','Dhamtari','Durg','Gariaband','Gaurela-Pendra-Marwahi','Janjgir-Champa','Jashpur','Kanker','Khairagarh-Chhuikhadan-Gandai','Kondagaon','Korba','Koriya','Mahasamund','Manendragarh','Mohla-Manpur','Mungeli','Narayanpur','Raigarh','Raipur','Rajnandgaon','Sarangarh-Bilaigarh','Sukma','Surajpur','Surguja'],
  'Chandigarh': ['Chandigarh'],
  'Dadra & Nagar Haveli and Daman & Diu': ['Dadra & Nagar Haveli','Daman','Diu'],
  'Delhi': ['Central Delhi','East Delhi','New Delhi','North Delhi','North East Delhi','North West Delhi','Shahdara','South Delhi','South East Delhi','South West Delhi','West Delhi'],
  'Goa': ['North Goa','South Goa'],
  'Gujarat': ['Ahmedabad','Amreli','Anand','Aravalli','Banaskantha','Bharuch','Bhavnagar','Botad','Chhota Udaipur','Dahod','Dang','Devbhoomi Dwarka','Gandhinagar','Gir Somnath','Jamnagar','Junagadh','Kheda','Kutch','Mahisagar','Mehsana','Morbi','Narmada','Navsari','Panchmahal','Patan','Porbandar','Rajkot','Sabarkantha','Surat','Surendranagar','Tapi','Vadodara','Valsad'],
  'Haryana': ['Ambala','Bhiwani','Charkhi Dadri','Faridabad','Fatehabad','Gurugram','Hisar','Jhajjar','Jind','Kaithal','Karnal','Kurukshetra','Mahendragarh','Nuh','Palwal','Panchkula','Panipat','Rewari','Rohtak','Sirsa','Sonipat','Yamunanagar'],
  'Himachal Pradesh': ['Bilaspur','Chamba','Hamirpur','Kangra','Kinnaur','Kullu','Lahaul & Spiti','Mandi','Shimla','Sirmaur','Solan','Una'],
  'Jammu & Kashmir': ['Anantnag','Bandipora','Baramulla','Budgam','Doda','Ganderbal','Jammu','Kathua','Kishtwar','Kulgam','Kupwara','Poonch','Pulwama','Rajouri','Ramban','Reasi','Samba','Shopian','Srinagar','Udhampur'],
  'Jharkhand': ['Bokaro','Chatra','Deoghar','Dhanbad','Dumka','East Singhbhum','Garhwa','Giridih','Godda','Gumla','Hazaribagh','Jamtara','Khunti','Koderma','Latehar','Lohardaga','Pakur','Palamu','Ramgarh','Ranchi','Sahebganj','Seraikela-Kharsawan','Simdega','West Singhbhum'],
  'Karnataka': ['Bagalkot','Ballari','Belagavi','Bengaluru Rural','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Ramanagara','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayapura','Yadgir'],
  'Kerala': ['Alappuzha','Ernakulam','Idukki','Kannur','Kasaragod','Kollam','Kottayam','Kozhikode','Malappuram','Palakkad','Pathanamthitta','Thiruvananthapuram','Thrissur','Wayanad'],
  'Ladakh': ['Kargil','Leh'],
  'Lakshadweep': ['Lakshadweep'],
  'Madhya Pradesh': ['Agar Malwa','Alirajpur','Anuppur','Ashoknagar','Balaghat','Barwani','Betul','Bhind','Bhopal','Burhanpur','Chhatarpur','Chhindwara','Damoh','Datia','Dewas','Dhar','Dindori','Guna','Gwalior','Harda','Hoshangabad','Indore','Jabalpur','Jhabua','Katni','Khandwa','Khargone','Mandla','Mandsaur','Morena','Narsinghpur','Neemuch','Niwari','Panna','Raisen','Rajgarh','Ratlam','Rewa','Sagar','Satna','Sehore','Seoni','Shahdol','Shajapur','Sheopur','Shivpuri','Sidhi','Singrauli','Tikamgarh','Ujjain','Umaria','Vidisha'],
  'Maharashtra': ['Ahmednagar','Akola','Amravati','Aurangabad','Beed','Bhandara','Buldhana','Chandrapur','Dhule','Gadchiroli','Gondia','Hingoli','Jalgaon','Jalna','Kolhapur','Latur','Mumbai City','Mumbai Suburban','Nagpur','Nanded','Nandurbar','Nashik','Osmanabad','Palghar','Parbhani','Pune','Raigad','Ratnagiri','Sangli','Satara','Sindhudurg','Solapur','Thane','Wardha','Washim','Yavatmal'],
  'Manipur': ['Bishnupur','Chandel','Churachandpur','Imphal East','Imphal West','Jiribam','Kakching','Kamjong','Kangpokpi','Noney','Pherzawl','Senapati','Tamenglong','Tengnoupal','Thoubal','Ukhrul'],
  'Meghalaya': ['East Garo Hills','East Jaintia Hills','East Khasi Hills','Eastern West Khasi Hills','North Garo Hills','Ri Bhoi','South Garo Hills','South West Garo Hills','South West Khasi Hills','West Garo Hills','West Jaintia Hills','West Khasi Hills'],
  'Mizoram': ['Aizawl','Champhai','Hnahthial','Khawzawl','Kolasib','Lawngtlai','Lunglei','Mamit','Saiha','Saitual','Serchhip'],
  'Nagaland': ['Chumoukedima','Dimapur','Kiphire','Kohima','Longleng','Mokokchung','Mon','Niuland','Noklak','Peren','Phek','Shamator','Tseminyü','Tuensang','Wokha','Zunheboto'],
  'Odisha': ['Angul','Balangir','Balasore','Bargarh','Bhadrak','Boudh','Cuttack','Deogarh','Dhenkanal','Gajapati','Ganjam','Jagatsinghpur','Jajpur','Jharsuguda','Kalahandi','Kandhamal','Kendrapara','Kendujhar','Khordha','Koraput','Malkangiri','Mayurbhanj','Nabarangpur','Nayagarh','Nuapada','Puri','Rayagada','Sambalpur','Subarnapur','Sundargarh'],
  'Puducherry': ['Karaikal','Mahe','Puducherry','Yanam'],
  'Punjab': ['Amritsar','Barnala','Bathinda','Faridkot','Fatehgarh Sahib','Fazilka','Ferozepur','Gurdaspur','Hoshiarpur','Jalandhar','Kapurthala','Ludhiana','Mansa','Moga','Mohali','Muktsar','Pathankot','Patiala','Rupnagar','Sangrur','Shaheed Bhagat Singh Nagar','Tarn Taran'],
  'Rajasthan': ['Ajmer','Alwar','Banswara','Baran','Barmer','Bharatpur','Bhilwara','Bikaner','Bundi','Chittorgarh','Churu','Dausa','Dholpur','Dungarpur','Ganganagar','Hanumangarh','Jaipur','Jaisalmer','Jalore','Jhalawar','Jhunjhunu','Jodhpur','Karauli','Kota','Nagaur','Pali','Pratapgarh','Rajsamand','Sawai Madhopur','Sikar','Sirohi','Tonk','Udaipur'],
  'Sikkim': ['East Sikkim','North Sikkim','Pakyong','Soreng','South Sikkim','West Sikkim'],
  'Tamil Nadu': ['Ariyalur','Chengalpattu','Chennai','Coimbatore','Cuddalore','Dharmapuri','Dindigul','Erode','Kallakurichi','Kancheepuram','Kanyakumari','Karur','Krishnagiri','Madurai','Mayiladuthurai','Nagapattinam','Namakkal','Nilgiris','Perambalur','Pudukkottai','Ramanathapuram','Ranipet','Salem','Sivaganga','Tenkasi','Thanjavur','Theni','Thoothukudi','Tiruchirappalli','Tirunelveli','Tirupathur','Tiruppur','Tiruvallur','Tiruvannamalai','Tiruvarur','Vellore','Viluppuram','Virudhunagar'],
  'Telangana': ['Adilabad','Bhadradri Kothagudem','Hanamkonda','Hyderabad','Jagtial','Jangaon','Jayashankar Bhupalpally','Jogulamba Gadwal','Kamareddy','Karimnagar','Khammam','Komaram Bheem Asifabad','Mahabubabad','Mahbubnagar','Mancherial','Medak','Medchal-Malkajgiri','Mulugu','Nagarkurnool','Nalgonda','Narayanpet','Nirmal','Nizamabad','Peddapalli','Rajanna Sircilla','Ranga Reddy','Sangareddy','Siddipet','Suryapet','Vikarabad','Wanaparthy','Warangal','Yadadri Bhuvanagiri'],
  'Tripura': ['Dhalai','Gomati','Khowai','North Tripura','Sepahijala','Sipahijala','South Tripura','Unokoti','West Tripura'],
  'Uttar Pradesh': ['Agra','Aligarh','Ambedkar Nagar','Amethi','Amroha','Auraiya','Ayodhya','Azamgarh','Baghpat','Bahraich','Ballia','Balrampur','Banda','Barabanki','Bareilly','Basti','Bhadohi','Bijnor','Budaun','Bulandshahr','Chandauli','Chitrakoot','Deoria','Etah','Etawah','Farrukhabad','Fatehpur','Firozabad','Gautam Buddha Nagar','Ghaziabad','Ghazipur','Gonda','Gorakhpur','Hamirpur','Hapur','Hardoi','Hathras','Jalaun','Jaunpur','Jhansi','Kannauj','Kanpur Dehat','Kanpur Nagar','Kasganj','Kaushambi','Kushinagar','Lakhimpur Kheri','Lalitpur','Lucknow','Maharajganj','Mahoba','Mainpuri','Mathura','Mau','Meerut','Mirzapur','Moradabad','Muzaffarnagar','Pilibhit','Pratapgarh','Prayagraj','Raebareli','Rampur','Saharanpur','Sambhal','Sant Kabir Nagar','Shahjahanpur','Shamli','Shravasti','Siddharthnagar','Sitapur','Sonbhadra','Sultanpur','Unnao','Varanasi'],
  'Uttarakhand': ['Almora','Bageshwar','Chamoli','Champawat','Dehradun','Haridwar','Nainital','Pauri Garhwal','Pithoragarh','Rudraprayag','Tehri Garhwal','Udham Singh Nagar','Uttarkashi'],
  'West Bengal': ['Alipurduar','Bankura','Birbhum','Cooch Behar','Dakshin Dinajpur','Darjeeling','Hooghly','Howrah','Jalpaiguri','Jhargram','Kalimpong','Kolkata','Malda','Murshidabad','Nadia','North 24 Parganas','Paschim Bardhaman','Paschim Medinipur','Purba Bardhaman','Purba Medinipur','Purulia','South 24 Parganas','Uttar Dinajpur'],
};

export function GuidedSearch({ onSubmit }: GuidedSearchProps) {
  const [step, setStep] = useState<StepKey>('1a');

  // ── Step 1a — Financing Type ───────────────────────────────────────────────
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');

  // ── Step 1b (Business Branch) — Activity Type ──────────────────────────────
  const [activityType, setActivityType] = useState<ActivityType | ''>('');

  // ── Step 1b (Education Branch) — Study Location, Course, Repayment ─────────
  const [studyLocation, setStudyLocation] = useState<'domestic' | 'abroad' | ''>('');
  const [course, setCourse] = useState<EducationInput['course'] | null>(null);
  const [repaymentStarted, setRepaymentStarted] = useState<boolean | null>(null);

  // ── Step 2 — Financials ─────────────────────────────────────────────────────
  const [projectCost, setProjectCost] = useState('');
  const [projectCostError, setProjectCostError] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanAmountError, setLoanAmountError] = useState('');

  // ── Step 3 — Basic information ──────────────────────────────────────────────
  const [income, setIncome] = useState('');
  const [incomeError, setIncomeError] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [age, setAge] = useState('');
  const [education, setEducation] = useState('');
  const [isExistingDefaulter, setIsExistingDefaulter] = useState<boolean | null>(null);

  const costValue = parseIndianNumber(projectCost);
  const loanValue = parseIndianNumber(loanAmount);
  const incomeValue = parseIndianNumber(income);
  const incomeIsValid = incomeValue >= MIN_ANNUAL_INCOME;

  // Validation rules for financial requirement step
  const validateFinancials = (cost: number, loan: number) => {
    let valid = true;

    if (projectCost !== '' && cost < MIN_PROJECT_COST) {
      setProjectCostError(`Estimated project cost must be at least ₹${MIN_PROJECT_COST.toLocaleString('en-IN')}.`);
      valid = false;
    } else {
      setProjectCostError('');
    }

    if (loanAmount !== '') {
      if (loan < MIN_LOAN_AMOUNT) {
        setLoanAmountError(`Loan amount required must be at least ₹${MIN_LOAN_AMOUNT.toLocaleString('en-IN')}.`);
        valid = false;
      } else if (cost > 0 && loan > cost) {
        setLoanAmountError('Loan amount required cannot exceed the estimated project cost.');
        valid = false;
      } else {
        setLoanAmountError('');
      }
    }

    return valid;
  };

  const handleProjectCostBlur = () => {
    validateFinancials(costValue, loanValue);
  };

  const handleLoanAmountBlur = () => {
    validateFinancials(costValue, loanValue);
  };

  const handleIncomeBlur = () => {
    if (income !== '' && !incomeIsValid) {
      setIncomeError(`Please enter a valid annual income (minimum ₹${MIN_ANNUAL_INCOME.toLocaleString('en-IN')}).`);
    } else {
      setIncomeError('');
    }
  };

  const canAdvance = () => {
    if (step === '1a') {
      return businessType !== '';
    }
    if (step === '1b') {
      if (businessType === 'education') {
        return studyLocation !== '' && course !== null && repaymentStarted !== null;
      }
      return activityType !== '';
    }
    if (step === '2') {
      return (
        projectCost !== '' &&
        loanAmount !== '' &&
        costValue >= MIN_PROJECT_COST &&
        loanValue >= MIN_LOAN_AMOUNT &&
        loanValue <= costValue
      );
    }
    if (step === '3') {
      const ageNum = parseInt(age, 10);
      return (
        income !== '' &&
        incomeIsValid &&
        state !== '' &&
        district.trim() !== '' &&
        age !== '' &&
        ageNum >= 18 &&
        ageNum <= 55 &&
        isExistingDefaulter !== null
      );
    }
    return false;
  };

  const handleNext = () => {
    if (!canAdvance()) return;

    if (step === '1a') {
      setStep('1b');
    } else if (step === '1b') {
      setStep('2');
    } else if (step === '2') {
      setStep('3');
    }
  };

  const handleBack = () => {
    if (step === '1b') {
      setStep('1a');
    } else if (step === '2') {
      setStep('1b');
    } else if (step === '3') {
      setStep('2');
    }
  };

  const handleSubmit = () => {
    if (!businessType || isExistingDefaulter === null || !canAdvance()) return;

    // Map businessType to backward-compatible purpose category
    const purpose: PurposeCategory =
      businessType === 'education'
        ? 'education'
        : businessType === 'new'
        ? 'start_business'
        : 'expand_business';

    const educationDetails: EducationInput | undefined =
      businessType === 'education' && studyLocation && course && repaymentStarted !== null
        ? {
            studyLocation,
            course,
            repaymentStarted,
            repaymentPeriod: repaymentStarted ? 'up to 10 years' : 'up to 12 years',
            moratorium: repaymentStarted ? 'up to 6 months' : 'course period plus 1 year',
          }
        : undefined;

    onSubmit({
      mode: 'guided',
      businessType,
      activityType: businessType === 'education' ? undefined : (activityType as ActivityType),
      educationDetails,
      purpose,
      estimatedProjectCost: costValue,
      loanAmountRequired: loanValue,
      annualFamilyIncome: incomeValue,
      state,
      district,
      age: parseInt(age, 10) || 0,
      category: 'SC', // NSFDC mandate is exclusively for Scheduled Castes
      educationLevel: education,
      isExistingDefaulter,
    });
  };

  // Milestone numbers for the stepper bar: 1 (Financing / Course), 2 (Financials), 3 (Details)
  const activeMilestone = step === '1a' || step === '1b' ? 1 : step === '2' ? 2 : 3;

  return (
    <div>
      {/* Top Stepper Indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[
          { num: 1, label: businessType === 'education' ? 'Course & Study' : 'Financing' },
          { num: 2, label: 'Financials' },
          { num: 3, label: 'Basic Details' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                s.num === activeMilestone
                  ? 'bg-deep-indigo text-white'
                  : s.num < activeMilestone
                  ? 'bg-forest-green text-white'
                  : 'bg-near-black/10 text-neutral-grey'
              }`}
            >
              {s.num < activeMilestone ? '✓' : s.num}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                s.num === activeMilestone ? 'text-deep-indigo font-medium' : 'text-neutral-grey'
              }`}
            >
              {s.label}
              {s.num === 1 && (step === '1a' || step === '1b') && (
                <span className="ml-1 text-[10px] text-deep-indigo/70 font-semibold uppercase">
                  ({step === '1a' ? '1a' : '1b'})
                </span>
              )}
            </span>
            {s.num < 3 && (
              <div
                className={`w-8 h-px ${
                  s.num < activeMilestone ? 'bg-forest-green' : 'bg-near-black/10'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── Step 1a — What are you financing? ───────────────────────────────── */}
      {step === '1a' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-near-black mb-1">
              What are you financing?
            </h2>
            <p className="text-sm text-neutral-grey">
              This decides which loan scheme applies to you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {FINANCING_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = businessType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setBusinessType(opt.value);
                    // Reset branch-specific values when switching
                    if (opt.value === 'education') {
                      setActivityType('');
                    } else {
                      setStudyLocation('');
                      setCourse(null);
                      setRepaymentStarted(null);
                    }
                  }}
                  className={`text-left p-5 rounded-xl border-2 transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-deep-indigo bg-deep-indigo/[0.04] shadow-sm ring-1 ring-deep-indigo/20'
                      : 'border-near-black/10 bg-white hover:border-deep-indigo/30 hover:bg-deep-indigo/[0.02]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors ${
                        isSelected
                          ? 'bg-deep-indigo text-white'
                          : 'bg-near-black/5 text-deep-indigo'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="text-base font-semibold text-near-black mb-1">
                      {opt.title}
                    </div>
                    <div className="text-xs text-neutral-grey leading-relaxed">
                      {opt.description}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-end">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] ${
                        isSelected
                          ? 'bg-deep-indigo border-deep-indigo text-white font-bold'
                          : 'border-near-black/20 text-transparent'
                      }`}
                    >
                      ✓
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 1b (Business Branch) — What kind of activity? ──────────────── */}
      {step === '1b' && businessType !== 'education' && (
        <div className="animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-near-black mb-1">
              What kind of activity is this?
            </h2>
            <p className="text-sm text-neutral-grey">
              This just helps us show you relevant examples — it doesn&apos;t change your loan terms.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ACTIVITY_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = activityType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActivityType(opt.value)}
                  className={`text-left p-4 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-deep-indigo bg-deep-indigo/5 ring-1 ring-deep-indigo/30'
                      : 'border-near-black/15 bg-white hover:border-deep-indigo/30 hover:bg-deep-indigo/[0.02]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center text-sm ${
                          isSelected ? 'bg-deep-indigo text-white' : 'bg-near-black/5 text-deep-indigo'
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className="text-sm font-semibold text-near-black">{opt.label}</span>
                    </div>
                    {isSelected && <CheckCircle2 size={16} className="text-deep-indigo" />}
                  </div>
                  <div className="text-xs text-neutral-grey mt-2 pl-11">{opt.description}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 1b (Education Branch) — Study Location, Course Combobox, Repayment ─ */}
      {step === '1b' && businessType === 'education' && (
        <div className="animate-fade-in-up space-y-6">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-near-black mb-1">
              Educational course details
            </h2>
            <p className="text-sm text-neutral-grey">
              Provide your course and study details for Educational Loan Scheme (ELS) matching.
            </p>
          </div>

          {/* 1. Where will you study? */}
          <div>
            <label className="block text-sm font-medium text-near-black mb-1.5">
              Where will you study?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="study-domestic"
                type="button"
                onClick={() => setStudyLocation('domestic')}
                className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  studyLocation === 'domestic'
                    ? 'border-deep-indigo bg-deep-indigo/5 ring-1 ring-deep-indigo/20'
                    : 'border-near-black/15 hover:border-deep-indigo/30 bg-white'
                }`}
                aria-pressed={studyLocation === 'domestic'}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    studyLocation === 'domestic' ? 'bg-deep-indigo text-white' : 'bg-near-black/5 text-deep-indigo'
                  }`}
                >
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-near-black">Within India</div>
                  <div className="text-[11px] text-neutral-grey">Domestic institutions</div>
                </div>
              </button>

              <button
                id="study-abroad"
                type="button"
                onClick={() => setStudyLocation('abroad')}
                className={`p-3.5 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                  studyLocation === 'abroad'
                    ? 'border-deep-indigo bg-deep-indigo/5 ring-1 ring-deep-indigo/20'
                    : 'border-near-black/15 hover:border-deep-indigo/30 bg-white'
                }`}
                aria-pressed={studyLocation === 'abroad'}
              >
                <div
                  className={`w-8 h-8 rounded-md flex items-center justify-center ${
                    studyLocation === 'abroad' ? 'bg-deep-indigo text-white' : 'bg-near-black/5 text-deep-indigo'
                  }`}
                >
                  <Globe2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-near-black">Abroad</div>
                  <div className="text-[11px] text-neutral-grey">International universities</div>
                </div>
              </button>
            </div>
            <p className="text-xs text-neutral-grey mt-1.5">
              NSFDC ELS finances up to ₹40 lakh or 90% of course fee, whichever is less, for study in India or abroad.
            </p>
          </div>

          {/* 2. What course are you pursuing? — Searchable Combobox */}
          <div>
            <label className="block text-sm font-medium text-near-black mb-1.5">
              What course are you pursuing?
            </label>
            <CourseCombobox value={course} onChange={setCourse} />
            <p className="text-xs text-neutral-grey mt-1.5">
              Select your professional or technical course from official recognized programs.
            </p>
          </div>

          {/* 3. Has loan repayment started? */}
          <div>
            <label className="block text-sm font-medium text-near-black mb-1.5">
              Has loan repayment started?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                id="repayment-no"
                type="button"
                onClick={() => setRepaymentStarted(false)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                  repaymentStarted === false
                    ? 'border-forest-green bg-forest-green text-white'
                    : 'border-near-black/15 bg-white text-near-black hover:border-forest-green/40'
                }`}
                aria-pressed={repaymentStarted === false}
              >
                Not yet started repayment
              </button>
              <button
                id="repayment-yes"
                type="button"
                onClick={() => setRepaymentStarted(true)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors text-center ${
                  repaymentStarted === true
                    ? 'border-deep-indigo bg-deep-indigo text-white'
                    : 'border-near-black/15 bg-white text-near-black hover:border-deep-indigo/40'
                }`}
                aria-pressed={repaymentStarted === true}
              >
                Already repaying
              </button>
            </div>
            <div className="flex items-start gap-2 mt-2 p-2.5 rounded bg-near-black/[0.03] text-xs text-neutral-grey">
              <Clock size={14} className="shrink-0 mt-0.5 text-deep-indigo" />
              {repaymentStarted === false ? (
                <span className="text-near-black font-medium">
                  Repayment period: up to 12 years. Moratorium: course period plus 1 year.
                </span>
              ) : repaymentStarted === true ? (
                <span className="text-near-black font-medium">
                  Repayment period: up to 10 years. Moratorium: up to 6 months.
                </span>
              ) : (
                <span>
                  Select your repayment status to view applicable repayment period and moratorium terms.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2 — Financials ───────────────────────────────────────────────── */}
      {step === '2' && (
        <div className="animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-semibold text-near-black mb-1">
            Financial requirement
          </h2>
          <p className="text-sm text-neutral-grey mb-6">
            Enter your estimated project cost and the loan amount you need.
          </p>

          <div className="space-y-5">
            {/* Estimated Project Cost */}
            <div>
              <label htmlFor="project-cost" className="block text-sm font-medium text-near-black mb-1.5">
                {businessType === 'education' ? 'Total estimated course / education expense' : 'Estimated project cost'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-grey">₹</span>
                <input
                  id="project-cost"
                  type="text"
                  inputMode="numeric"
                  value={projectCost}
                  onChange={(e) => {
                    setProjectCost(formatIndianInput(e.target.value));
                    if (projectCostError) setProjectCostError('');
                  }}
                  onBlur={handleProjectCostBlur}
                  placeholder={businessType === 'education' ? '10,00,000' : '3,00,000'}
                  className={`w-full pl-7 pr-4 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors ${
                    projectCostError
                      ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                      : 'border-near-black/15 focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20'
                  }`}
                />
              </div>
              {projectCostError ? (
                <p className="text-xs text-red-500 mt-1">{projectCostError}</p>
              ) : (
                <p className="text-xs text-neutral-grey mt-1">
                  Minimum threshold: ₹{MIN_PROJECT_COST.toLocaleString('en-IN')}.
                </p>
              )}
            </div>

            {/* Loan Amount Required */}
            <div>
              <label htmlFor="loan-amount" className="block text-sm font-medium text-near-black mb-1.5">
                Loan amount required
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-grey">₹</span>
                <input
                  id="loan-amount"
                  type="text"
                  inputMode="numeric"
                  value={loanAmount}
                  onChange={(e) => {
                    setLoanAmount(formatIndianInput(e.target.value));
                    if (loanAmountError) setLoanAmountError('');
                  }}
                  onBlur={handleLoanAmountBlur}
                  placeholder={businessType === 'education' ? '8,00,000' : '2,50,000'}
                  className={`w-full pl-7 pr-4 py-2.5 text-sm border rounded-lg bg-white outline-none transition-colors ${
                    loanAmountError
                      ? 'border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                      : 'border-near-black/15 focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20'
                  }`}
                />
              </div>
              {loanAmountError ? (
                <p className="text-xs text-red-500 mt-1">{loanAmountError}</p>
              ) : (
                <p className="text-xs text-neutral-grey mt-1">
                  Minimum: ₹{MIN_LOAN_AMOUNT.toLocaleString('en-IN')}. Concessional schemes finance up to 90% of eligible costs.
                </p>
              )}

              {/* Direct Bank Visit / Offline notice for loans > ₹15 Lakhs */}
              {loanValue > 1500000 && !loanAmountError && (
                <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-950 animate-in fade-in slide-in-from-top-1 duration-200">
                  <Building2 size={18} className="text-amber-700 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-900 block text-xs">
                      Direct Bank / Channel Partner Visit Required (Quota &gt; ₹15 Lakh)
                    </span>
                    <p className="text-amber-800/90 leading-relaxed text-[11px]">
                      For loan amounts exceeding <strong>₹15 Lakh</strong>, digital online processing via the PM-SURAJ portal is capped. The beneficiary must visit their nearest authorized Channel Partner / Bank branch directly to submit project appraisal documents in person.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3 — Basic information ────────────────────────────────────────── */}
      {step === '3' && (
        <div className="animate-fade-in-up">
          <h2 className="text-lg sm:text-xl font-semibold text-near-black mb-1">
            Basic details
          </h2>
          <p className="text-sm text-neutral-grey mb-4">
            Provide only what eligibility genuinely requires.
          </p>

          {/* SC Mandate Banner — replaces the redundant Category dropdown */}
          <div className="flex items-start gap-2.5 mb-5 p-3 rounded-lg bg-deep-indigo/[0.04] border border-deep-indigo/15">
            <CheckCircle2 size={16} className="text-deep-indigo shrink-0 mt-0.5" />
            <div className="text-xs text-near-black/85 leading-relaxed">
              <span className="font-semibold text-deep-indigo">Mandate Focus:</span> All NSFDC concessional loan schemes are dedicated to beneficiaries belonging to the <strong>Scheduled Caste (SC)</strong> community. Document verification is completed on the official PM-SURAJ application.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Annual income */}
            <div>
              <label htmlFor="income" className="block text-sm font-medium text-near-black mb-1.5">
                Annual family income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-grey">₹</span>
                <input
                  id="income"
                  type="text"
                  inputMode="numeric"
                  value={income}
                  onChange={(e) => {
                    setIncome(formatIndianInput(e.target.value));
                    if (incomeError) setIncomeError('');
                  }}
                  onBlur={handleIncomeBlur}
                  placeholder="2,50,000"
                  className={`w-full pl-7 pr-4 py-2.5 text-sm border rounded-lg bg-white focus:ring-1 transition-colors outline-none ${
                    incomeError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
                      : 'border-near-black/15 focus:border-deep-indigo focus:ring-deep-indigo/20'
                  }`}
                />
              </div>
              {incomeError && (
                <p className="text-xs text-red-500 mt-1">{incomeError}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-near-black mb-1.5">
                Age (18–55 years)
              </label>
              <input
                id="age"
                type="number"
                min="18"
                max="55"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="22"
                className="w-full px-4 py-2.5 text-sm border border-near-black/15 rounded-lg bg-white focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20 transition-colors outline-none"
              />
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-near-black mb-1.5">
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setDistrict('');
                }}
                className="w-full px-4 py-2.5 text-sm border border-near-black/15 rounded-lg bg-white focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20 transition-colors outline-none"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-near-black mb-1.5">
                District
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                disabled={!state}
                className={`w-full px-4 py-2.5 text-sm border rounded-lg bg-white focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20 transition-colors outline-none ${
                  !state ? 'border-near-black/10 text-neutral-grey cursor-not-allowed bg-near-black/[0.02]' : 'border-near-black/15'
                }`}
              >
                <option value="">{state ? 'Select district' : 'Select a state first'}</option>
                {(INDIAN_DISTRICTS[state] ?? []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {!state && (
                <p className="text-xs text-neutral-grey mt-1">Select your state above to see available districts.</p>
              )}
            </div>

            {/* Education level */}
            <div className="sm:col-span-2">
              <label htmlFor="education" className="block text-sm font-medium text-near-black mb-1.5">
                Current education level
              </label>
              <select
                id="education"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-near-black/15 rounded-lg bg-white focus:border-deep-indigo focus:ring-1 focus:ring-deep-indigo/20 transition-colors outline-none"
              >
                <option value="">Select level</option>
                <option value="below_10th">Below 10th</option>
                <option value="10th_pass">10th Pass</option>
                <option value="12th_pass">12th Pass</option>
                <option value="graduate">Graduate</option>
                <option value="post_graduate">Post Graduate</option>
                <option value="higher_education">Pursuing Higher Education</option>
              </select>
            </div>
          </div>

          {/* Defaulter status toggle */}
          <div className="mt-5">
            <label className="block text-sm font-medium text-near-black mb-1.5">
              Are you currently in default on any loan or financial institution?
            </label>
            <div className="flex gap-3">
              <button
                id="defaulter-yes"
                type="button"
                onClick={() => setIsExistingDefaulter(true)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  isExistingDefaulter === true
                    ? 'bg-red-500 text-white border-red-500'
                    : 'border-near-black/15 text-near-black hover:border-red-300 hover:bg-red-50/50'
                }`}
                aria-pressed={isExistingDefaulter === true}
              >
                Yes
              </button>
              <button
                id="defaulter-no"
                type="button"
                onClick={() => setIsExistingDefaulter(false)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium border transition-colors ${
                  isExistingDefaulter === false
                    ? 'bg-forest-green text-white border-forest-green'
                    : 'border-near-black/15 text-near-black hover:border-forest-green/40 hover:bg-forest-green/5'
                }`}
                aria-pressed={isExistingDefaulter === false}
              >
                No
              </button>
            </div>
            {isExistingDefaulter === true && (
              <p className="text-xs text-red-500 mt-2">
                Applicants currently in default are generally ineligible — the recommendation will reflect this.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-near-black/5">
        {step !== '1a' ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-grey hover:text-near-black transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step !== '3' ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-deep-indigo text-white rounded-lg hover:bg-deep-indigo/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canAdvance()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-muted-ochre text-white rounded-lg hover:bg-muted-ochre/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Find Relevant Schemes
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

/** Parse Indian-formatted number string to number */
function parseIndianNumber(value: string): number {
  return parseInt(value.replace(/,/g, ''), 10) || 0;
}

/** Format input as Indian number (e.g. 3,00,000) */
function formatIndianInput(value: string): string {
  const digits = value.replace(/[^0-9]/g, '');
  if (!digits) return '';
  const num = parseInt(digits, 10);
  return num.toLocaleString('en-IN');
}
