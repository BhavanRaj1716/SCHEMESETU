"""DEMO channel partners.

These are SIMULATED records for demonstrating the partner search UI. They are NOT real organisations, addresses
or coordinates, and every record is labelled data_status = "DEMO". Replace with verified records from the official
NSFDC channel-partner list (https://nsfdc.nic.in/our-channel-partners) when a verified download/manual entry exists.

The scheme mapping mirrors the delivery channels stated on the NSFDC scheme pages:
MFS/Term Loan via SCAs/CAs, Aajeevika via NBFC-MFIs, Udyam Nidhi via cooperative banks/societies and small finance banks.
"""
from datetime import date

_D = dict(official_source=None, source_document="DEMO record - simulated for demonstration only", last_verified_at=date(2026, 9, 22), data_status="DEMO")

# Note: TAHDCO (the real, VERIFIED Tamil Nadu State Channelizing Agency) is loaded separately from
# app/ingestion/nsfdc/verified_partners.py, so no DEMO "SCA" row is duplicated here.
PARTNERS = [
    dict(id="demo-sca-cbe", name="DEMO - SCA District Office (Coimbatore)", type="SCA", state="Tamil Nadu", district="Coimbatore",
         address="DEMO address (not a real location) - illustrates a district-level office; TAHDCO's HQ is the VERIFIED record", latitude=11.0168, longitude=76.9558, supported_schemes=["micro-finance-scheme", "term-loan", "educational-loan-scheme"], **_D),
    dict(id="demo-mfi-cbe", name="DEMO - NBFC-MFI Branch (Coimbatore)", type="NBFC-MFI", state="Tamil Nadu", district="Coimbatore",
         address="DEMO address (not a real location)", latitude=11.0045, longitude=76.9616, supported_schemes=["aajeevika-micro-finance-yojana"], **_D),
    dict(id="demo-coop-cbe", name="DEMO - Cooperative Bank Branch (Coimbatore)", type="Cooperative Bank", state="Tamil Nadu", district="Coimbatore",
         address="DEMO address (not a real location)", latitude=11.0296, longitude=76.9702, supported_schemes=["udyam-nidhi-yojana"], **_D),
    dict(id="demo-sfb-mdu", name="DEMO - Small Finance Bank Branch (Madurai)", type="Small Finance Bank", state="Tamil Nadu", district="Madurai",
         address="DEMO address (not a real location)", latitude=9.9252, longitude=78.1198, supported_schemes=["udyam-nidhi-yojana"], **_D),
    dict(id="demo-psb-cbe", name="DEMO - Public Sector Bank Branch (Coimbatore)", type="PSB", state="Tamil Nadu", district="Coimbatore",
         address="DEMO address (not a real location)", latitude=10.9985, longitude=76.9629, supported_schemes=["educational-loan-scheme"], **_D),
]
