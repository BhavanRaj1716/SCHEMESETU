"""
Hinglish & Transliterated Query Evaluation for SchemeSetu Model
Tests how well the fine-tuned model handles Hindi written in English script (Hinglish).
"""
import torch
from sentence_transformers import SentenceTransformer, util
from pathlib import Path

BASE_MODEL_NAME = "intfloat/multilingual-e5-small"
TUNED_MODEL_PATH = Path(__file__).resolve().parent / "schemesetu_e5_final"

print("=" * 70)
print("  SchemeSetu Hinglish / Transliterated Query Benchmark")
print("=" * 70)

base_model = SentenceTransformer(BASE_MODEL_NAME)
tuned_model = SentenceTransformer(TUNED_MODEL_PATH)

hinglish_test_cases = [
    {
        "description": "Sanitation / Safai Karamchari machinery (Hinglish)",
        "query": "mujhe safai karmachari ke liye mechanized cleaning machine kharidne loan chahiye",
        "english_equivalent": "I am a sanitation worker needing a loan to buy mechanized cleaning machinery",
        "target_scheme": "Swachhta Udyami Yojana (SUY) - Financial assistance for mechanized cleaning equipment for safai karamcharis.",
        "irrelevant_scheme": "Educational Loan Scheme (ELS) - Financial assistance for higher professional education."
    },
    {
        "description": "Artisan Woman Micro Loan (Hinglish)",
        "query": "mahila artisan ko kapde silai aur handloom ke liye chota loan chahiye kam byaaj par",
        "english_equivalent": "Woman artisan needs small loan for tailoring handloom at low interest rate",
        "target_scheme": "Mahila Adhikarita Yojana / Micro Credit Finance (MCF) - Small concessional credit for women micro enterprises.",
        "irrelevant_scheme": "Green Business Scheme - Financial support for solar energy rooftop and e-vehicles."
    },
    {
        "description": "Higher Education Abroad (Hinglish)",
        "query": "videsh me higher education padhai ke liye education loan chahiye SC student",
        "english_equivalent": "SC student needing education loan for higher education studies abroad",
        "target_scheme": "Educational Loan Scheme for Higher Studies abroad for SC students.",
        "irrelevant_scheme": "Swachhta Udyami Yojana - Mechanized cleaning and sanitation vehicle loan."
    },
    {
        "description": "Solar Energy / Green Business (Hinglish)",
        "query": "chhat par solar panel lagane aur battery e-rickshaw ke liye sarkari loan",
        "english_equivalent": "Government loan for installing rooftop solar panels and battery e-rickshaw",
        "target_scheme": "Green Business Scheme (GBS) - Financial assistance for solar energy and eco-friendly battery vehicles.",
        "irrelevant_scheme": "Educational Loan Scheme for professional degrees abroad."
    }
]

for idx, tc in enumerate(hinglish_test_cases, 1):
    q_hinglish = tc["query"]
    q_english = tc["english_equivalent"]
    target = tc["target_scheme"]
    irrel = tc["irrelevant_scheme"]
    
    # Tuned model on Hinglish
    t_hing_q = tuned_model.encode(q_hinglish, convert_to_tensor=True)
    t_eng_q = tuned_model.encode(q_english, convert_to_tensor=True)
    t_target_emb = tuned_model.encode(target, convert_to_tensor=True)
    t_irrel_emb = tuned_model.encode(irrel, convert_to_tensor=True)
    
    # Base model on Hinglish
    b_hing_q = base_model.encode(q_hinglish, convert_to_tensor=True)
    b_target_emb = base_model.encode(target, convert_to_tensor=True)
    b_irrel_emb = base_model.encode(irrel, convert_to_tensor=True)
    
    # Sim scores
    b_pos = float(util.cos_sim(b_hing_q, b_target_emb)[0][0])
    b_neg = float(util.cos_sim(b_hing_q, b_irrel_emb)[0][0])
    b_margin = b_pos - b_neg
    
    t_pos = float(util.cos_sim(t_hing_q, t_target_emb)[0][0])
    t_neg = float(util.cos_sim(t_hing_q, t_irrel_emb)[0][0])
    t_margin = t_pos - t_neg
    
    # Cross-lingual alignment (Hinglish vs English equivalent query)
    cross_sim = float(util.cos_sim(t_hing_q, t_eng_q)[0][0])
    
    print(f"\nTest #{idx}: {tc['description']}")
    print(f"  Hinglish Input : \"{q_hinglish}\"")
    print(f"  Base Model     : Match = {b_pos:.4f} | Distractor = {b_neg:.4f} | Margin = {b_margin:+.4f}")
    print(f"  Fine-Tuned     : Match = {t_pos:.4f} | Distractor = {t_neg:.4f} | Margin = {t_margin:+.4f}")
    print(f"  Query Fidelity : Similarity between Hinglish query and English equivalent = {cross_sim:.4f}")
