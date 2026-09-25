from sentence_transformers import SentenceTransformer
import numpy as np
from pathlib import Path

MODEL = Path(__file__).resolve().parent / "schemesetu_e5_final"

schemes = {
    "MFS": "passage: Micro credit finance for small income-generating units costing up to ₹1.40 lakh. Loan up to 90% of project cost, maximum ₹1.25 lakh per unit.",
    "TL": "passage: Term loans for income-generating units costing more than ₹1.40 lakh and up to ₹50 lakh. Loan up to 90% of project cost, above ₹1.25 lakh and up to ₹45 lakh per unit.",
    "AMY": "passage: Need-based micro finance for small or micro business activities through selected NBFC-MFIs. Loan up to 90% up to ₹1.25 lakh for projects costing up to ₹1.40 lakh.",
    "UNY": "passage: Loans for small or micro activities costing up to ₹5 lakh through cooperative societies, cooperative banks and small finance banks. Loan up to 90% of project cost, up to ₹4.50 lakh.",
    "ELS": "passage: Educational loans for regular full-time professional or technical courses in India or abroad, including engineering, medical, dental, management, law, nursing and doctoral studies. Up to ₹40 lakh or 90% of course fee, whichever is less.",
}

tests = [
    # English
    ("English","I need a small loan for a low-cost tailoring business.","MFS"),
    ("English","I need financing for a business project costing ten lakh rupees.","TL"),
    ("English","I want microfinance through an NBFC-MFI for my livelihood business.","AMY"),
    ("English","I need around three lakh rupees through a cooperative bank for a small unit.","UNY"),
    ("English","I need a loan to pay my engineering college fees.","ELS"),
    # Hindi
    ("Hindi","मुझे छोटे कारोबार के लिए कम राशि का ऋण चाहिए।","MFS"),
    ("Hindi","मुझे दस लाख रुपये की व्यावसायिक परियोजना के लिए ऋण चाहिए।","TL"),
    ("Hindi","मुझे NBFC-MFI के माध्यम से माइक्रोफाइनेंस चाहिए।","AMY"),
    ("Hindi","मुझे सहकारी बैंक से तीन लाख रुपये के छोटे उद्यम के लिए वित्त चाहिए।","UNY"),
    ("Hindi","मुझे इंजीनियरिंग की पढ़ाई की फीस के लिए शिक्षा ऋण चाहिए।","ELS"),
    # Tamil
    ("Tamil","சிறிய சுயதொழிலுக்கு குறைந்த தொகை கடன் வேண்டும்.","MFS"),
    ("Tamil","பத்து லட்சம் செலவாகும் தொழில் திட்டத்திற்கு நிதி வேண்டும்.","TL"),
    ("Tamil","NBFC-MFI மூலம் வாழ்வாதார தொழிலுக்கு மைக்ரோஃபைனான்ஸ் வேண்டும்.","AMY"),
    ("Tamil","கூட்டுறவு வங்கி மூலம் மூன்று லட்சம் சிறு தொழில் நிதி வேண்டும்.","UNY"),
    ("Tamil","என் பொறியியல் படிப்பு கட்டணத்திற்கு கல்விக் கடன் வேண்டும்.","ELS"),
    # Hinglish
    ("Hinglish","Mujhe chhote business ke liye ek small loan chahiye.","MFS"),
    ("Hinglish","Mera business project 10 lakh ka hai, term loan chahiye.","TL"),
    ("Hinglish","Mujhe NBFC-MFI se microfinance chahiye livelihood business ke liye.","AMY"),
    ("Hinglish","Cooperative bank se 3 lakh ka small business loan chahiye.","UNY"),
    ("Hinglish","Mujhe engineering college fees ke liye education loan chahiye.","ELS"),
    # Tanglish
    ("Tanglish","Enakku small self business start panna chinna loan venum.","MFS"),
    ("Tanglish","En business project ten lakh, term loan venum.","TL"),
    ("Tanglish","NBFC-MFI moolama microfinance venum en livelihood business-ku.","AMY"),
    ("Tanglish","Cooperative bank moolama three lakh small business finance venum.","UNY"),
    ("Tanglish","Engineering college fees-ku education loan venum.","ELS"),
    # Noisy / typo queries
    ("Noisy","mujhe tailering biznes start panna loan venum","MFS"),
    ("Noisy","busines project 12 lakhs, term lon needed","TL"),
    ("Noisy","NBFC MFI la microfinanse loan venum","AMY"),
    ("Noisy","co-oprative bank la 4 lakh small enterprize loan","UNY"),
    ("Noisy","engeneering clg fee ku edu loan venum","ELS"),
        # Additional English
    ("English","I need about one lakh rupees to start a tiny home business.","MFS"),
    ("English","My new manufacturing unit requires fifteen lakh rupees.","TL"),
    ("English","I need livelihood microfinance from an NBFC-MFI.","AMY"),
    ("English","I need four lakh rupees for a small enterprise through a cooperative society.","UNY"),
    ("English","I need an education loan for my master's degree in computer science.","ELS"),

    # Additional Hindi
    ("Hindi","मुझे एक छोटे कारोबार के लिए एक लाख रुपये का ऋण चाहिए।","MFS"),
    ("Hindi","मेरी नई व्यावसायिक इकाई के लिए पंद्रह लाख रुपये चाहिए।","TL"),
    ("Hindi","मुझे NBFC-MFI से आजीविका के लिए माइक्रोफाइनेंस चाहिए।","AMY"),
    ("Hindi","मुझे सहकारी संस्था से चार लाख रुपये का छोटा व्यवसाय ऋण चाहिए।","UNY"),
    ("Hindi","मुझे कंप्यूटर साइंस में मास्टर डिग्री के लिए शिक्षा ऋण चाहिए।","ELS"),

    # Additional Tamil
    ("Tamil","சிறிய வீட்டுத் தொழிலுக்கு ஒரு லட்சம் ரூபாய் கடன் வேண்டும்.","MFS"),
    ("Tamil","என் புதிய தொழில் திட்டத்திற்கு பதினைந்து லட்சம் ரூபாய் நிதி வேண்டும்.","TL"),
    ("Tamil","NBFC-MFI மூலம் வாழ்வாதாரத்திற்கான மைக்ரோஃபைனான்ஸ் வேண்டும்.","AMY"),
    ("Tamil","கூட்டுறவு சங்கம் மூலம் நான்கு லட்சம் ரூபாய் சிறு தொழில் கடன் வேண்டும்.","UNY"),
    ("Tamil","கணினி அறிவியலில் முதுகலை படிப்புக்கு கல்விக் கடன் வேண்டும்.","ELS"),

    # Additional Hinglish
    ("Hinglish","Mujhe ek lakh ka loan chhote home business ke liye chahiye.","MFS"),
    ("Hinglish","Mere naye business unit ko pandrah lakh rupees finance chahiye.","TL"),
    ("Hinglish","Mujhe NBFC-MFI se livelihood ke liye microfinance chahiye.","AMY"),
    ("Hinglish","Cooperative society se chaar lakh ka small business loan chahiye.","UNY"),
    ("Hinglish","Mujhe computer science masters ke liye education loan chahiye.","ELS"),

    # Additional Tanglish
    ("Tanglish","Enakku one lakh small home business-ku loan venum.","MFS"),
    ("Tanglish","En pudhu business unit-ku fifteen lakh finance venum.","TL"),
    ("Tanglish","NBFC-MFI moolama livelihood-ku microfinance venum.","AMY"),
    ("Tanglish","Cooperative society moolama four lakh small business loan venum.","UNY"),
    ("Tanglish","Computer science masters padikka education loan venum.","ELS"),

    # Additional Noisy
    ("Noisy","small home biz one lakh loan venum","MFS"),
    ("Noisy","new biz unit 15 lakhs finace needed","TL"),
    ("Noisy","NBFC MFI livelihood microfinanse venum","AMY"),
    ("Noisy","co-op society 4 lakh small biz lon","UNY"),
    ("Noisy","computer science masters edu lon needed","ELS"),
    ("Hinglish","Mujhe ghar se chhota tailoring ka kaam shuru karna hai, loan chahiye.","MFS"),
("Hinglish","Ek chhota business start karne ke liye ek lakh ke aas paas finance chahiye.","MFS"),
("Hinglish","Mujhe apni dukaan ke liye chhota business loan chahiye.","MFS"),
("Hinglish","Main low cost self employment ka kaam shuru karna chahta hoon, paisa chahiye.","MFS"),

("Hinglish","Mera project lagbhag 20 lakh ka hai, term finance chahiye.","TL"),
("Hinglish","Manufacturing business ke liye 18 lakh ka term loan chahiye.","TL"),
("Hinglish","Business expand karne ke liye 25 lakh ka loan chahiye.","TL"),
("Hinglish","Mera proposed unit 30 lakh ka hai aur term loan chahiye.","TL"),

("Hinglish","NBFC-MFI ke through livelihood ke liye micro loan chahiye.","AMY"),
("Hinglish","Mujhe NBFC MFI se chhote business ke liye microfinance lena hai.","AMY"),
("Hinglish","Livelihood activity ke liye MFI se micro finance chahiye.","AMY"),
("Hinglish","NBFC-MFI channel se small business funding chahiye.","AMY"),

("Hinglish","Cooperative bank ke through chhote business ke liye loan chahiye.","UNY"),
("Hinglish","Cooperative society se 2 lakh ka business loan chahiye.","UNY"),
("Hinglish","Small enterprise ke liye cooperative bank finance chahiye.","UNY"),
("Hinglish","Cooperative bank se chaar lakh tak ka loan mil sakta hai kya?","UNY"),

("Hinglish","Mujhe BTech ki fees bharne ke liye education loan chahiye.","ELS"),
("Hinglish","Computer engineering course ke liye education loan chahiye.","ELS"),
("Hinglish","Master's degree ke fees ke liye loan chahiye.","ELS"),
("Hinglish","India mein technical course karne ke liye education finance chahiye.","ELS"),

("Tamil","சிறிய தையல் தொழில் தொடங்க குறைந்த அளவு கடன் வேண்டும்.","MFS"),
("Tamil","வீட்டிலிருந்து சிறிய தொழில் தொடங்க ஒரு லட்சம் ரூபாய் கடன் வேண்டும்.","MFS"),
("Tamil","சிறிய சுயதொழிலுக்கு நிதி உதவி தேவை.","MFS"),
("Tamil","ஒரு சிறிய கடை தொடங்க குறைந்த தொகை கடன் வேண்டும்.","MFS"),

("Tamil","என் தொழில் திட்டம் இருபது லட்சம் செலவாகும், காலக்கெடு கடன் வேண்டும்.","TL"),
("Tamil","உற்பத்தி தொழிலுக்கு பதினெட்டு லட்சம் ரூபாய் கடன் வேண்டும்.","TL"),
("Tamil","தொழிலை விரிவுபடுத்த இருபத்தைந்து லட்சம் நிதி வேண்டும்.","TL"),
("Tamil","முப்பது லட்சம் தொழில் திட்டத்திற்கு term loan வேண்டும்.","TL"),

("Tamil","NBFC-MFI மூலம் வாழ்வாதார தொழிலுக்கு சிறு நிதி வேண்டும்.","AMY"),
("Tamil","MFI மூலம் சிறு தொழிலுக்கு microfinance கடன் வேண்டும்.","AMY"),
("Tamil","NBFC-MFI வழியாக சுயதொழிலுக்கு நிதி வேண்டும்.","AMY"),
("Tamil","வாழ்வாதார நடவடிக்கைக்கு MFI micro loan வேண்டும்.","AMY"),

("Tamil","கூட்டுறவு வங்கி மூலம் சிறு தொழிலுக்கு கடன் வேண்டும்.","UNY"),
("Tamil","கூட்டுறவு சங்கம் மூலம் இரண்டு லட்சம் தொழில் கடன் வேண்டும்.","UNY"),
("Tamil","சிறு நிறுவனத்திற்கு கூட்டுறவு வங்கி நிதி வேண்டும்.","UNY"),
("Tamil","கூட்டுறவு வங்கியில் இருந்து நான்கு லட்சம் வரை கடன் வேண்டும்.","UNY"),

("Tamil","BTech படிப்பு கட்டணத்திற்கு கல்விக் கடன் வேண்டும்.","ELS"),
("Tamil","கணினி பொறியியல் படிப்புக்கு கல்வி கடன் வேண்டும்.","ELS"),
("Tamil","முதுகலை படிப்புக்கான கட்டணத்திற்கு கல்விக் கடன் வேண்டும்.","ELS"),
("Tamil","இந்தியாவில் தொழில்நுட்ப படிப்பு படிக்க கல்வி நிதி வேண்டும்.","ELS"),

("Telugu","చిన్న టైలరింగ్ వ్యాపారం ప్రారంభించడానికి చిన్న రుణం కావాలి.","MFS"),
("Telugu","ఇంటి నుంచి చిన్న వ్యాపారం మొదలు పెట్టడానికి ఒక లక్ష రూపాయల రుణం కావాలి.","MFS"),
("Telugu","చిన్న స్వయం ఉపాధి కోసం రుణం కావాలి.","MFS"),
("Telugu","ఒక చిన్న షాప్ ప్రారంభించడానికి తక్కువ మొత్తంలో లోన్ కావాలి.","MFS"),

("Telugu","నా బిజినెస్ ప్రాజెక్ట్ ఇరవై లక్షలు ఖర్చవుతుంది, టర్మ్ లోన్ కావాలి.","TL"),
("Telugu","తయారీ యూనిట్ కోసం పద్దెనిమిది లక్షల రుణం కావాలి.","TL"),
("Telugu","బిజినెస్ విస్తరణ కోసం ఇరవై ఐదు లక్షల ఫైనాన్స్ కావాలి.","TL"),
("Telugu","ముప్పై లక్షల వ్యాపార ప్రాజెక్ట్ కోసం టర్మ్ లోన్ కావాలి.","TL"),

("Telugu","NBFC-MFI ద్వారా జీవనోపాధి వ్యాపారం కోసం మైక్రోఫైనాన్స్ కావాలి.","AMY"),
("Telugu","MFI ద్వారా చిన్న వ్యాపారం కోసం మైక్రో లోన్ కావాలి.","AMY"),
("Telugu","NBFC-MFI నుంచి స్వయం ఉపాధి కోసం ఫైనాన్స్ కావాలి.","AMY"),
("Telugu","జీవనోపాధి కార్యకలాపం కోసం MFI రుణం కావాలి.","AMY"),

("Telugu","కోఆపరేటివ్ బ్యాంక్ ద్వారా చిన్న వ్యాపారానికి రుణం కావాలి.","UNY"),
("Telugu","కోఆపరేటివ్ సొసైటీ ద్వారా రెండు లక్షల బిజినెస్ లోన్ కావాలి.","UNY"),
("Telugu","చిన్న సంస్థ కోసం కోఆపరేటివ్ బ్యాంక్ ఫైనాన్స్ కావాలి.","UNY"),
("Telugu","కోఆపరేటివ్ బ్యాంక్ నుంచి నాలుగు లక్షల వరకు రుణం కావాలి.","UNY"),

("Telugu","BTech చదువు ఫీజు కోసం ఎడ్యుకేషన్ లోన్ కావాలి.","ELS"),
("Telugu","కంప్యూటర్ ఇంజినీరింగ్ కోర్సు కోసం విద్యా రుణం కావాలి.","ELS"),
("Telugu","మాస్టర్స్ డిగ్రీ ఫీజు కోసం ఎడ్యుకేషన్ లోన్ కావాలి.","ELS"),
("Telugu","టెక్నికల్ కోర్సు చదవడానికి ఎడ్యుకేషన్ ఫైనాన్స్ కావాలి.","ELS"),

("Kannada","ಸಣ್ಣ ಟೈಲರಿಂಗ್ ವ್ಯವಹಾರ ಆರಂಭಿಸಲು ಸಾಲ ಬೇಕು.","MFS"),
("Kannada","ಮನೆಯಿಂದ ಸಣ್ಣ ವ್ಯವಹಾರ ಆರಂಭಿಸಲು ಒಂದು ಲಕ್ಷ ರೂಪಾಯಿ ಸಾಲ ಬೇಕು.","MFS"),
("Kannada","ಸಣ್ಣ ಸ್ವಯಂ ಉದ್ಯೋಗಕ್ಕಾಗಿ ಸಾಲ ಬೇಕಾಗಿದೆ.","MFS"),
("Kannada","ಒಂದು ಸಣ್ಣ ಅಂಗಡಿ ಆರಂಭಿಸಲು ಕಡಿಮೆ ಮೊತ್ತದ ಸಾಲ ಬೇಕು.","MFS"),

("Kannada","ನನ್ನ ವ್ಯವಹಾರ ಯೋಜನೆ ಇಪ್ಪತ್ತು ಲಕ್ಷ ರೂಪಾಯಿ, ಟರ್ಮ್ ಲೋನ್ ಬೇಕು.","TL"),
("Kannada","ಉತ್ಪಾದನಾ ಘಟಕಕ್ಕೆ ಹದಿನೆಂಟು ಲಕ್ಷ ಸಾಲ ಬೇಕು.","TL"),
("Kannada","ವ್ಯವಹಾರ ವಿಸ್ತರಣೆಗೆ ಇಪ್ಪತ್ತೈದು ಲಕ್ಷ ಹಣಕಾಸು ಬೇಕು.","TL"),
("Kannada","ಮೂವತ್ತು ಲಕ್ಷದ ವ್ಯವಹಾರ ಯೋಜನೆಗೆ ಟರ್ಮ್ ಲೋನ್ ಬೇಕು.","TL"),

("Kannada","NBFC-MFI ಮೂಲಕ ಜೀವನೋಪಾಯ ವ್ಯವಹಾರಕ್ಕೆ ಮೈಕ್ರೋಫೈನಾನ್ಸ್ ಬೇಕು.","AMY"),
("Kannada","MFI ಮೂಲಕ ಸಣ್ಣ ವ್ಯವಹಾರಕ್ಕೆ ಮೈಕ್ರೋ ಲೋನ್ ಬೇಕು.","AMY"),
("Kannada","NBFC-MFI ಮೂಲಕ ಸ್ವಯಂ ಉದ್ಯೋಗಕ್ಕೆ ಹಣಕಾಸು ಬೇಕು.","AMY"),
("Kannada","ಜೀವನೋಪಾಯ ಚಟುವಟಿಕೆಗೆ MFI ಸಾಲ ಬೇಕಾಗಿದೆ.","AMY"),

("Kannada","ಸಹಕಾರಿ ಬ್ಯಾಂಕ್ ಮೂಲಕ ಸಣ್ಣ ವ್ಯವಹಾರಕ್ಕೆ ಸಾಲ ಬೇಕು.","UNY"),
("Kannada","ಸಹಕಾರಿ ಸಂಘದ ಮೂಲಕ ಎರಡು ಲಕ್ಷದ ವ್ಯವಹಾರ ಸಾಲ ಬೇಕು.","UNY"),
("Kannada","ಸಣ್ಣ ಉದ್ಯಮಕ್ಕೆ ಸಹಕಾರಿ ಬ್ಯಾಂಕ್ ಹಣಕಾಸು ಬೇಕು.","UNY"),
("Kannada","ಸಹಕಾರಿ ಬ್ಯಾಂಕ್‌ನಿಂದ ನಾಲ್ಕು ಲಕ್ಷದವರೆಗೆ ಸಾಲ ಬೇಕು.","UNY"),

("Kannada","BTech ಶುಲ್ಕಕ್ಕಾಗಿ ಶಿಕ್ಷಣ ಸಾಲ ಬೇಕು.","ELS"),
("Kannada","ಕಂಪ್ಯೂಟರ್ ಎಂಜಿನಿಯರಿಂಗ್ ಕೋರ್ಸ್‌ಗೆ ಶಿಕ್ಷಣ ಸಾಲ ಬೇಕು.","ELS"),
("Kannada","ಮಾಸ್ಟರ್ಸ್ ಪದವಿ ಶುಲ್ಕಕ್ಕಾಗಿ ಶಿಕ್ಷಣ ಸಾಲ ಬೇಕು.","ELS"),
("Kannada","ತಾಂತ್ರಿಕ ಕೋರ್ಸ್ ಓದಲು ಶಿಕ್ಷಣ ಹಣಕಾಸು ಬೇಕು.","ELS")
    
]

model = SentenceTransformer(MODEL)

query_texts = ["query: " + q for _, q, _ in tests]
passage_keys = list(schemes.keys())
passage_texts = [schemes[k] for k in passage_keys]

q_emb = model.encode(query_texts, normalize_embeddings=True)
p_emb = model.encode(passage_texts, normalize_embeddings=True)
scores = q_emb @ p_emb.T

correct = 0
ranks = []

print("\n--- SchemeSetu Stress Test ---")
for i, (lang, query, gold) in enumerate(tests):
    order = np.argsort(-scores[i])
    pred = passage_keys[order[0]]
    gold_idx = passage_keys.index(gold)
    rank = int(np.where(order == gold_idx)[0][0]) + 1
    correct += pred == gold
    ranks.append(rank)
    print(f"{lang:7} | Gold={gold:3} | Pred={pred:3} | Rank={rank} | {query}")

print("\n--- Summary ---")
print("Queries tested:", len(tests))
print("Correct:", correct)
print("Top-1 accuracy:", round(correct / len(tests), 4))
print("Average rank:", round(float(np.mean(ranks)), 4))
