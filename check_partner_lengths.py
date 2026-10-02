import sys
sys.path.insert(0, 'schemesetu-backend')

from app.ingestion.nsfdc.verified_partners import VERIFIED_PARTNERS
from seed.demo_partners import PARTNERS

all_partners = list(VERIFIED_PARTNERS) + list(PARTNERS)
cols = {'id': 64, 'name': 255, 'type': 32, 'state': 64, 'district': 64, 'source_document': 255, 'data_status': 16}

issues = []
for p in all_partners:
    for col, maxlen in cols.items():
        val = p.get(col, '')
        if val and len(str(val)) > maxlen:
            issues.append((p['id'], col, len(str(val)), maxlen, str(val)[:80]))

if issues:
    for pid, col, length, maxlen, val in issues:
        print(f"OVER LIMIT: id={pid!r} col={col!r} len={length} max={maxlen}")
        print(f"  value={val!r}")
else:
    print("No column length violations found")
