"""Deterministic text helpers: normalisation, script-based language detection, intent keywords, INR formatting.

No LLM is involved. Intent detection is a transparent keyword lexicon used ONLY for the
`purpose_category` eligibility rule; semantic relevance comes from embeddings.
"""
import re
import unicodedata

_WS = re.compile(r"\s+")


def normalize_text(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    text = _WS.sub(" ", text).strip()
    return text.lower()


def detect_language(text: str) -> str:
    """Very small script-based detector: 'ta' (Tamil), 'hi' (Devanagari/Hindi) or 'en' (default)."""
    tamil = sum(1 for c in text if "\u0b80" <= c <= "\u0bff")
    deva = sum(1 for c in text if "\u0900" <= c <= "\u097f")
    if tamil and tamil >= deva:
        return "ta"
    if deva:
        return "hi"
    return "en"


EDUCATION_TERMS = (
    "education", "educational", "study", "studies", "course", "college", "tuition", "student", "university",
    "b.tech", "btech", "mbbs", "mba", "engineering degree", "phd", "diploma", "fees", "admission",
    "கல்வி", "படிப்பு", "கல்லூரி", "மாணவர்", "शिक्षा", "पढ़ाई", "पढाई", "कॉलेज", "छात्र",
)
INCOME_TERMS = (
    "business", "shop", "store", "dairy", "cow", "cattle", "buffalo", "milk", "farm", "poultry", "goat", "sheep",
    "fish", "tailor", "vehicle", "auto rickshaw", "taxi", "trade", "trading", "manufactur", "unit", "startup",
    "start a", "self employ", "self-employ", "income generating", "income-generating", "workshop", "bakery",
    "தொழில்", "வியாபார", "கடை", "பால்", "பசு", "எருமை", "व्यवसाय", "कारोबार", "दुकान", "डेयरी", "दूध", "गाय", "भैंस", "धंधा",
)


def detect_intents(normalized_text: str) -> set[str]:
    intents: set[str] = set()
    if any(t in normalized_text for t in EDUCATION_TERMS):
        intents.add("education")
    if any(t in normalized_text for t in INCOME_TERMS):
        intents.add("income_generating")
    return intents


def normalize_category(value: str | None) -> str | None:
    if not value:
        return None
    v = re.sub(r"[^a-z]", "", value.lower())
    aliases = {
        "sc": "SC", "scheduledcaste": "SC", "scheduledcastes": "SC",
        "st": "ST", "scheduledtribe": "ST", "scheduledtribes": "ST",
        "obc": "OBC", "general": "GENERAL", "gen": "GENERAL", "other": "OTHER",
    }
    return aliases.get(v, value.strip().upper())


def format_inr(amount: float | int) -> str:
    """₹2,50,000 style (Indian digit grouping)."""
    n = int(round(float(amount)))
    sign = "-" if n < 0 else ""
    s = str(abs(n))
    if len(s) > 3:
        head, tail = s[:-3], s[-3:]
        groups = []
        while len(head) > 2:
            groups.insert(0, head[-2:])
            head = head[:-2]
        if head:
            groups.insert(0, head)
        s = ",".join(groups + [tail])
    return f"{sign}₹{s}"
