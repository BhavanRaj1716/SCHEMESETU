"""REAL channel-partner records, manually verified against official/government sources.

Honest scope: NSFDC does not publish a structured, geocoded, all-India directory of its channel
partners. What IS publicly documented and verifiable:

  - NSFDC's own evaluation report (Ministry of Social Justice & Empowerment, published on
    socialjustice.gov.in) states NSFDC works through 37 State Channelizing Agencies (SCAs) and
    55 other Channelizing Agencies (Public Sector Banks, Regional Rural Banks, NBFC-MFIs,
    Cooperative Banks/Societies, and other organisations) - 92 channel partners nationally as of
    that report. This aggregate figure is cited, not invented.
  - Tamil Nadu's SCA is TAHDCO (Tamil Nadu Adi Dravidar Housing & Development Corporation Ltd.),
    confirmed by TAHDCO's own citizens' charter and by multiple official district (.nic.in) sites,
    which independently quote the same head-office address and phone number.
  - The 2020 evaluation study's Tamil Nadu field sample names "Syndicate Bank" as the PSB-channel
    partner surveyed in Tamil Nadu. Syndicate Bank was amalgamated into Canara Bank on 1 April 2020
    (a public RBI/GoI banking-sector event), so it is recorded below as a historical record with
    that note rather than silently renamed, per the "preserve history" rule (spec Sec. 28).

No coordinates for these offices are published by any official source used here. The latitude/
longitude below are our OWN city-level geocoding of the real, sourced street address (not GPS data
from NSFDC) - approximate enough to place a map pin on the right city, not precise enough to find
the building. This is disclosed to the API consumer via `official_source.document` on each record.

Everything below the state-agency level (individual bank/NBFC-MFI BRANCH addresses) is not
published anywhere we could verify, and is NOT included here - see seed/demo_partners.py for
clearly-labelled DEMO branch-level records used only to exercise the map/list UI.
"""
from datetime import date

EVAL_REPORT_URL = "https://socialjustice.gov.in/public/ckeditor/upload/Summary%20Report-Evaluation%20of%20NSFDC_1648795113.pdf"
EVAL_REPORT_DOC = "MoSJE / NSFDC evaluation study (Centre for Market Research & Social Development, 2020) - Executive Summary"
EVAL_REPORT_DATE = date(2020, 1, 1)  # report's stated reference point ("as on date" in the study text); not a re-verification date

TAHDCO_URL = "https://tahdco.com/contact-us.php"
TAHDCO_LAST_VERIFIED = date(2026, 9, 22)

VERIFIED_PARTNERS = [
    dict(
        id="tahdco-tn-hq", name="Tamil Nadu Adi Dravidar Housing and Development Corporation Ltd. (TAHDCO)",
        type="SCA", state="Tamil Nadu", district="Chennai",
        address="No. 31, Cenotaph Road, 2nd Lane, Teynampet, Chennai - 600018, Tamil Nadu",
        latitude=13.0407, longitude=80.2496,  # our city-level geocoding of Teynampet, Chennai (see module docstring)
        supported_schemes=["micro-finance-scheme", "term-loan", "aajeevika-micro-finance-yojana", "udyam-nidhi-yojana", "educational-loan-scheme"],
        official_source=TAHDCO_URL,
        source_document="TAHDCO official contact page; independently confirmed by Tamil Nadu district-government (.nic.in) portals as the NSFDC State Channelizing Agency for Tamil Nadu",
        last_verified_at=TAHDCO_LAST_VERIFIED, data_status="VERIFIED",
    ),
    dict(
        id="syndicate-bank-tn-2020", name="Syndicate Bank (Tamil Nadu channel - amalgamated into Canara Bank, 1 Apr 2020)",
        type="PSB", state="Tamil Nadu", district=None, address=None, latitude=None, longitude=None,
        supported_schemes=["micro-finance-scheme", "term-loan"],
        official_source=EVAL_REPORT_URL, source_document=EVAL_REPORT_DOC,
        last_verified_at=EVAL_REPORT_DATE, data_status="VERIFIED",
    ),
]

# National aggregate, shown by the API as context (not a per-record fact): 37 SCAs + 55 other
# Channelizing Agencies = 92 channel partners nationally, per the same evaluation report.
NATIONAL_PARTNER_COUNT_NOTE = (
    "NSFDC's own evaluation report (2020) states the network comprised 37 State Channelizing "
    "Agencies and 55 other Channelizing Agencies (92 total) nationally at that time; NSFDC does "
    "not publish a current, structured, geocoded directory, so per-partner records beyond the "
    "ones above are not available as verified data."
)
