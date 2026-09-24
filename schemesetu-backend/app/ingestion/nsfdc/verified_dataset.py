"""Manually verified NSFDC dataset (manual verification workflow).

Verified on 2026-09-22 by reading the CURRENT official NSFDC pages (each page footer shows "last updated 21.09.2026"):
  - Schemes:     https://nsfdc.nic.in/scheme
  - Eligibility: https://nsfdc.nic.in/eligibility-requirements
  - Activities:  https://nsfdc.nic.in/indicative-activities

All five schemes' figures match the values originally specified for the prototype. Nothing here is LLM-generated.

DISCREPANCIES INTENTIONALLY NOT USED: several secondary/aggregator sites show different numbers for some schemes
(e.g. Educational Loan "₹30 lakh for India / 7% abroad", Aajeevika "11%", income limit "₹3 lakh"). Those are not official
NSFDC pages and appear outdated versus the current official pages above, so they are ignored. If NSFDC changes a value,
edit this file, bump LAST_VERIFIED, and re-run the ingest: the loader records the old value in scheme_source_versions.

`search_aliases` are OUR retrieval synonyms (e.g. "dairy" for the official "Cows / Buffaloes"). They feed embeddings only
and are never displayed as government data.
"""
from datetime import date

LAST_VERIFIED = date(2026, 9, 22)
PAGE_UPDATED = date(2026, 9, 21)  # "last updated" shown in the NSFDC page footer

ORG = "NSFDC"
PMSURAJ = "https://pmsuraj.dosje.gov.in/"
SCHEME_URL = "https://nsfdc.nic.in/scheme"
ELIG_URL = "https://nsfdc.nic.in/eligibility-requirements"
ACT_URL = "https://nsfdc.nic.in/indicative-activities"

AGRI = ["Agricultural Land Purchase", "Hatcheries", "Duckery", "Goat Rearing", "Sheep Farming", "Fisheries", "Ornamental Fish Rearing",
        "Tractors", "Power Tillers", "Cultivation & Processing of Medicinal Plants", "Honey Bee Cultivation", "Irrigation Borewells/Minor Irrigation",
        "Agricultural Implements", "Horticulture", "Sericulture", "Layers / Broilers", "Cows / Buffaloes", "Piggery", "Aquaculture", "Floriculture"]
SMALL_IND = ["Automobile Repair / Servicing Units", "Brick Making", "Bicycle Repairing Shops", "Bicycle Seat Cover Making", "Biogas Plant", "Candle Manufacturing",
             "Car Upholstery & Seat Making", "Cement Solid Blocks", "Coir Industry", "Carpet Manufacturing", "Copperware/Utensils Manufacturing",
             "Exercise Books & Registers Making", "Readymade Garment Manufacturing", "Ginger & Turmeric Processing", "Granite Tiles", "Handmade Paper",
             "Ornaments Polishing Units", "Stone Crushing", "Supari Processing", "Printing Press", "Furniture Making", "Flour Mill", "Soft Toys Making",
             "Handlooms/Powerlooms", "Embroidery/Knitting", "Woollen Garments/Shawls Making", "Hosiery Units", "Jute Fabrics/Bags", "Leather Garments",
             "Leather Processing", "Leather & Rexine Articles", "Lime Kilns", "Plastic Bags Manufacturing", "Potteries", "Handicrafts Making", "Pouch Making",
             "Incense Stick Making", "Rubber Industry", "Shoe/Chappal Manufacturing", "Umbrella Making", "Fiberglass Manufacturing",
             "Mineral Water Bottling Plant", "Oil Mills", "Saw Mills", "Footwear Manufacturing", "Silver Ornaments Making", "Bakery",
             "Bamboo Furniture Making", "Battery Making"]
SERVICE = ["Departmental Stores", "Beautician", "Band Party", "Fish/Meat Shops", "Petty Shops", "Diagnostic Center / Blood Bank", "Book Binding/Book Shops",
           "Cards Shop", "Clinical Labs", "Stationery Shops", "Cloth Merchant", "Computer Centres", "Computer Hardware & Servicing", "Dental Clinics",
           "Desktop Printing", "Driving School", "Eye Clinics", "Food Packing Unit", "Gas Agency", "Gem Stone Cutting & Polishing", "Photography/Videography",
           "Shopping Complex", "Shuttering", "Spice Grinding", "Spray Painting", "Silk Weaving", "Steel Fabrication", "Sweet Shop", "Tailoring",
           "Water Sports Equipments", "Chemist Shops", "Wooden/Steel Furniture", "Dhabas/Mini Hotels", "Tourist Lodge", "Electrical Items Shop", "Hardware Shop",
           "Electrical Winding", "Welding & Refrigeration", "Vegetable Vending", "Watch Repair/Sales Shop", "Bangle/Cosmetic Shop", "Digital Mixing Lab",
           "Seeds/Fertilizers/Pesticides Shops", "Auto Rickshaws/Auto Load Carrier", "Light Commercial Vehicles/Mini Buses", "Jeeps/Car Taxies",
           "Earth Movers (JCB)", "Laundry/Dry-cleaning Shops", "Machine Shops", "Marble Polishing", "Milk Chilling Centres/Booths", "Garments Shop",
           "Mobile Crane", "Nursing Home/Hospitals", "Nursery School", "Passenger/Fishing Boats", "Public Address System", "Pump Set/Minor Irrigation",
           "Ropeway", "Sales & Servicing of Electric Items", "Supplying Unit", "Commercial Centre (STD/Photocopier/Scanner)", "Tannery", "Tent House/Decorators",
           "Transport Vehicles (Autos, Taxies, LCVs, Buses, Trucks)", "Travel Agency", "TV/Audio-Video/Refrigerator/AC Repair", "Typing School",
           "Tyre Retreading", "Tyre Servicing & Vulcanising", "Xerox/Typing/Lamination Centre", "Internet Cafe", "Cable TV"]
INDICATIVE_ACTIVITIES = AGRI + SMALL_IND + SERVICE

ALIASES_INCOME = ["dairy", "dairy farming", "milk", "cattle", "livestock", "animal husbandry", "small business", "self employment", "shop", "trade", "start a business"]


def _rule(criterion, field, operator, value, description, unit=None, url=ELIG_URL, doc="NSFDC eligibility requirements page", effective_from=None):
    return dict(criterion=criterion, field=field, operator=operator, value=value, unit=unit, description=description,
                source_organization=ORG, source_url=url, source_document=doc, effective_from=effective_from,
                last_verified_at=LAST_VERIFIED, data_status="VERIFIED", amended_from_time_to_time=False)


def _common_rules(purpose_category: str):
    return [
        _rule("Beneficiary category", "beneficiary_category", "==", "SC", "The beneficiary must belong to the Scheduled Caste (SC) community."),
        _rule("Annual family income", "annual_family_income", "<=", 500000,
              "Annual family income must not exceed ₹5.00 lakh for credit/loan-based schemes (rural and urban).",
              unit="INR/year", effective_from=date(2026, 1, 7)),
        _rule("Scheduled Caste status verification", "caste_certificate", "manual", None,
              "Scheduled Caste status and all eligibility criteria are verified by the authorised channelizing agency (SCA/CA), which is solely responsible for verification; NSFDC may re-verify."),
        _rule("Purpose of financing", "purpose_category", "==", purpose_category,
              f"The scheme finances {purpose_category.replace('_', ' ')} activities.", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        _rule("Loan up to 90% of project cost", "loan_to_project_cost_ratio", "<=", 0.9,
              "NSFDC provides loans up to 90% of the project cost.", unit="ratio", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        _rule("State applicability", "state", "in", ["ALL_INDIA"],
              "No state restriction is stated on the official scheme page; delivery is through channelizing agencies.", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
    ]


def _income_scheme(**kw):
    base = dict(
        category="income_generating", beneficiary_category=["SC"], state_scope="ALL_INDIA", district_scope="ALL",
        coverage_percentage=90, required_documents=None,
        application_process="Apply through the official PM-SURAJ portal (as directed on the NSFDC scheme page). Proposals are routed via State Channelizing Agencies / Channelizing Agencies, which verify eligibility.",
        official_application_url=PMSURAJ, applicable_activities=INDICATIVE_ACTIVITIES,
        source_organization=ORG, source_url=SCHEME_URL, source_document="NSFDC loan/credit schemes page (nsfdc.nic.in/scheme)",
        last_verified_at=LAST_VERIFIED, data_updated_at=PAGE_UPDATED, data_status="VERIFIED", search_aliases=ALIASES_INCOME,
        eligibility_summary="Scheduled Caste beneficiaries with annual family income up to ₹5.00 lakh (effective 7 Jan 2026), for income-generating activities; eligibility is verified by the authorised channelizing agency.",
    )
    base.update(kw)
    return base


SCHEMES = [
    _income_scheme(
        id="micro-finance-scheme", scheme_code="NSFDC-MFS", name="Micro Finance Scheme (MFS)",
        purpose="Micro credit finance for small income-generating units costing up to ₹1.40 lakh.",
        description="Micro Credit Finance for small units with project cost up to ₹1.40 lakh, delivered through State Channelizing Agencies/Channelizing Agencies. Loan up to 90% of project cost, maximum ₹1.25 lakh per unit.",
        max_project_cost=140000, max_loan_amount=125000, interest_rate=6.5,
        interest_rate_text="Beneficiary pays 6.5% p.a. (NSFDC charges 2.5% p.a. from the SCAs/CAs).",
        repayment_period="Quarterly instalments within a maximum of 3 years from the date of disbursement, including the moratorium.",
        max_repayment_months=36, moratorium="3 months (included in the repayment period)", moratorium_months=3,
        rules=_common_rules("income_generating") + [
            _rule("Project cost", "project_cost", "<=", 140000, "Units costing up to ₹1.40 lakh.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
            _rule("Loan amount", "loan_required", "<=", 125000, "Maximum loan is ₹1.25 lakh per unit.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        ],
    ),
    _income_scheme(
        id="term-loan", scheme_code="NSFDC-TL", name="Term Loan",
        purpose="Term loans for income-generating units costing more than ₹1.40 lakh and up to ₹50 lakh.",
        description="Term loans for units costing more than ₹1.40 lakh and up to ₹50 lakh. Loan up to 90% of project cost, above ₹1.25 lakh and up to ₹45 lakh per unit.",
        min_project_cost=140000, max_project_cost=5000000, min_loan_amount=125000, max_loan_amount=4500000, interest_rate=8,
        interest_rate_text="Beneficiary pays 8% p.a. (NSFDC charges 4% p.a. from the SCAs/CAs).",
        repayment_period="Quarterly instalments within 7 years, including the moratorium.",
        max_repayment_months=84, moratorium="6 months (12 months for plantation and construction activities)", moratorium_months=6,
        rules=_common_rules("income_generating") + [
            _rule("Project cost", "project_cost", "between", {"min": 140000, "max": 5000000, "minExclusive": True},
                  "Units costing more than ₹1.40 lakh and up to ₹50.00 lakh.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
            _rule("Loan amount", "loan_required", "between", {"min": 125000, "max": 4500000, "minExclusive": True},
                  "Term loan is above ₹1.25 lakh and up to ₹45 lakh per unit.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        ],
    ),
    _income_scheme(
        id="aajeevika-micro-finance-yojana", scheme_code="NSFDC-AMY", name="Aajeevika Micro-Finance Yojana",
        purpose="Prompt, need-based micro finance for small/micro business activities through selected NBFC-MFIs.",
        description="Micro finance to eligible Scheduled Caste persons through selected NBFC-MFIs for small/micro business activities. Loan up to 90% (up to ₹1.25 lakh) for projects costing up to ₹1.40 lakh.",
        max_project_cost=140000, max_loan_amount=125000, interest_rate=15,
        interest_rate_text="Beneficiary pays 15% p.a. (NSFDC charges 5% p.a. from the NBFC-MFIs).",
        repayment_period="Quarterly instalments of up to 3 years from the date of each disbursement, including the moratorium.",
        max_repayment_months=36, moratorium="3 months (included in the repayment period)", moratorium_months=3,
        rules=_common_rules("income_generating") + [
            _rule("Project cost", "project_cost", "<=", 140000, "Projects costing up to ₹1.40 lakh.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
            _rule("Loan amount", "loan_required", "<=", 125000, "Loan up to ₹1.25 lakh.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        ],
    ),
    _income_scheme(
        id="udyam-nidhi-yojana", scheme_code="NSFDC-UNY", name="Udyam Nidhi Yojana (UNY)",
        purpose="Loans for small/micro activities costing up to ₹5.00 lakh, through cooperative societies/banks and small finance banks.",
        description="Loans for projects/units costing up to ₹5.00 lakh through Cooperative Societies, Cooperative Banks and Small Finance Banks. Loan up to 90% of project cost, i.e. up to ₹4.50 lakh.",
        max_project_cost=500000, max_loan_amount=450000, interest_rate=None,
        interest_rate_options=[{"label": "Cooperative Banks/Societies", "rate": 13}, {"label": "Small Finance Banks", "rate": 15}],
        interest_rate_text="Beneficiary pays 13% p.a. via Cooperative Banks/Societies or 15% p.a. via Small Finance Banks (NSFDC charges 5% p.a.).",
        repayment_period="Quarterly or half-yearly instalments within a maximum of 5 years, including the moratorium.",
        max_repayment_months=60, moratorium="3 months (included in the repayment period)", moratorium_months=3,
        rules=_common_rules("income_generating") + [
            _rule("Project cost", "project_cost", "<=", 500000, "Projects/units costing up to ₹5.00 lakh.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
            _rule("Loan amount", "loan_required", "<=", 450000, "Loan up to ₹4.50 lakh.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        ],
    ),
    dict(
        id="educational-loan-scheme", scheme_code="NSFDC-ELS", name="Educational Loan Scheme (ELS)",
        purpose="Loans for regular full-time professional/technical courses in India or abroad.",
        category="education", beneficiary_category=["SC"], state_scope="ALL_INDIA", district_scope="ALL",
        description="Educational loans for eligible students pursuing regular full-time professional/technical courses approved by the Government, in India or abroad. Up to ₹40 lakh or 90% of course fee, whichever is less. Covers listed courses such as engineering, medical, dental, management, law, nursing and doctoral studies.",
        eligibility_summary="Scheduled Caste students (annual family income up to ₹5.00 lakh, effective 7 Jan 2026) pursuing recognised full-time professional/technical courses; eligibility is verified by the authorised channelizing agency.",
        max_loan_amount=4000000, coverage_percentage=90, interest_rate=6.5,
        interest_rate_text="Beneficiary pays 6.5% p.a. (NSFDC charges 2.5% p.a. from the CAs).",
        repayment_period="Up to 12 years where repayment has not started; up to 10 years where the loan is disbursed and repayment has started.",
        max_repayment_months=144,
        moratorium="Course period plus 1 year where repayment has not started; up to 6 months where the loan is disbursed and repayment has started.",
        moratorium_months=None, required_documents=None,
        application_process="Apply through the official PM-SURAJ portal (as directed on the NSFDC scheme page).",
        official_application_url=PMSURAJ, applicable_activities=["Engineering (Diploma/B.Tech/B.E/M.Tech/M.E)", "Architecture", "Medical (MBBS/MD/MS)", "Pharmacy", "Dental",
                                                                    "Nursing", "Information Technology (BCA/MCA)", "Management (BBA/MBA)", "Law", "Education (B.Ed/M.Ed)",
                                                                    "Chartered Accountancy", "Company Secretaryship", "Doctoral studies (M.Phil/PhD)"],
        source_organization=ORG, source_url=SCHEME_URL, source_document="NSFDC loan/credit schemes page (nsfdc.nic.in/scheme)",
        last_verified_at=LAST_VERIFIED, data_updated_at=PAGE_UPDATED, data_status="VERIFIED",
        search_aliases=["education loan", "student loan", "college fees", "higher studies", "course fee", "tuition"],
        rules=_common_rules("education") + [
            _rule("Education level", "education_level", "in",
                  ["diploma", "undergraduate", "graduate", "bachelors", "postgraduate", "masters", "doctoral", "doctorate", "phd"],
                  "Covers professional/technical courses from diploma level up to doctoral studies.", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
            _rule("Recognised professional/technical course", "course_recognition", "manual", None,
                  "The course must be a regular full-time professional/technical course approved by the Government at a recognised institution; the authorised agency verifies this.",
                  url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
            _rule("Loan amount", "loan_required", "<=", 4000000, "Up to ₹40 lakh or 90% of the course fee, whichever is less.", unit="INR", url=SCHEME_URL, doc="NSFDC loan/credit schemes page"),
        ],
    ),
]
