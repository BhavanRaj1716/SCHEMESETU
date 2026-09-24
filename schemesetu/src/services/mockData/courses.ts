/**
 * Recognized Courses for NSFDC Educational Loan Scheme (ELS)
 *
 * NSFDC provides concessional educational loans for eligible students
 * pursuing full-time professional and technical courses in India or abroad.
 */

export interface RecognizedCourse {
  id: string;
  name: string;
  category: string;
}

export const RECOGNIZED_COURSES: RecognizedCourse[] = [
  // ── Technical & Engineering ──────────────────────────────────────────────
  {
    id: 'eng-btech',
    name: 'Engineering (Diploma / B.Tech / B.E / M.Tech / M.E)',
    category: 'Technical',
  },
  {
    id: 'it-bca-mca',
    name: 'Computer Applications & IT (BCA / MCA / B.Sc IT)',
    category: 'Technical',
  },
  {
    id: 'polytechnic-dip',
    name: 'Polytechnic & Technical Diploma Courses',
    category: 'Technical',
  },
  {
    id: 'arch-barch',
    name: 'Architecture & Planning (B.Arch / M.Arch / B.Plan)',
    category: 'Technical',
  },
  {
    id: 'biotech',
    name: 'Biotechnology / Bioinformatics (B.Sc / M.Sc / B.Tech)',
    category: 'Technical',
  },

  // ── Medical & Healthcare ─────────────────────────────────────────────────
  {
    id: 'med-mbbs',
    name: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
    category: 'Medical',
  },
  {
    id: 'med-bds',
    name: 'BDS / MDS (Dental Surgery)',
    category: 'Medical',
  },
  {
    id: 'med-nursing',
    name: 'Nursing (B.Sc Nursing / M.Sc Nursing / GNM)',
    category: 'Medical',
  },
  {
    id: 'med-pharm',
    name: 'Pharmacy (B.Pharm / M.Pharm / D.Pharm / Pharm.D)',
    category: 'Medical',
  },
  {
    id: 'med-physio',
    name: 'Physiotherapy & Occupational Therapy (BPT / MPT / BOT)',
    category: 'Medical',
  },
  {
    id: 'med-vet',
    name: 'Veterinary Science & Animal Husbandry (B.V.Sc & A.H)',
    category: 'Medical',
  },
  {
    id: 'med-lab-tech',
    name: 'Allied Health Sciences & Medical Lab Tech (BMLT / DMLT)',
    category: 'Medical',
  },
  {
    id: 'med-ayush',
    name: 'AYUSH Courses (BAMS / BHMS / BUMS / BNYS / BSMS)',
    category: 'Medical',
  },

  // ── Management & Commerce ────────────────────────────────────────────────
  {
    id: 'mgmt-mba',
    name: 'Business Administration & Management (MBA / PGDM / MMS)',
    category: 'Management',
  },
  {
    id: 'mgmt-bba',
    name: 'Undergraduate Management (BBA / BMS / BBM)',
    category: 'Management',
  },
  {
    id: 'mgmt-hotel',
    name: 'Hotel Management & Catering Tech (BHM / B.Sc Hospitality)',
    category: 'Management',
  },
  {
    id: 'mgmt-ca',
    name: 'Chartered Accountancy & Finance (CA / CMA / CS / CFA)',
    category: 'Management',
  },

  // ── Professional & Legal ─────────────────────────────────────────────────
  {
    id: 'prof-law',
    name: 'Law & Legal Studies (5-Year Integrated LL.B / LL.M)',
    category: 'Professional',
  },
  {
    id: 'prof-media',
    name: 'Journalism & Mass Communication (BJMC / MJMC)',
    category: 'Professional',
  },
  {
    id: 'prof-design',
    name: 'Fashion & Industrial Design (B.Des / M.Des / NIFT / NID)',
    category: 'Professional',
  },
  {
    id: 'prof-agri',
    name: 'Agricultural Sciences (B.Sc Agriculture / Horticulture / Forestry)',
    category: 'Professional',
  },
  {
    id: 'prof-aviation',
    name: 'Commercial Pilot Training & Aviation Studies',
    category: 'Professional',
  },

  // ── Vocational & Academic ────────────────────────────────────────────────
  {
    id: 'edu-bed',
    name: 'Teacher Education & Pedagogy (B.Ed / M.Ed / D.El.Ed)',
    category: 'Vocational & Academic',
  },
  {
    id: 'acad-phd',
    name: 'Pure Sciences & Doctoral Research (M.Sc / M.Phil / Ph.D)',
    category: 'Vocational & Academic',
  },
  {
    id: 'voc-skill',
    name: 'Advanced Vocational & Skill Diploma (NSQF Level 5+)',
    category: 'Vocational & Academic',
  },
];
