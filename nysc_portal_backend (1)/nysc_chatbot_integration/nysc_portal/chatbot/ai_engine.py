"""
chatbot/ai_engine.py
─────────────────────────────────────────────────────────────────────────────
NYSC AI Chatbot Engine
======================
Architecture (3-tier priority system):
  1. EXACT PATTERN MATCH  → Greetings, thanks, portal links (instant)
  2. FAQ SIMILARITY MATCH → Knowledge base search using keyword scoring
  3. GEMINI AI            → Google Gemini 1.5 Flash (free tier, generous limits)
  4. ENHANCED FALLBACK    → Rich rule-based NYSC responses (always works)

No database, no auth, no user storage. Fully stateless.

HOW TO ADD MORE TRAINING DATA:
  → Edit chatbot/knowledge/nysc_faq.json  (add Q&A entries)
  → Edit chatbot/knowledge/training_data.json  (add greeting patterns)
  → The chatbot automatically picks up changes on next request (JSON reload)
─────────────────────────────────────────────────────────────────────────────
"""

import json
import re
import time
import os
import math
from pathlib import Path
from django.conf import settings

# ── Paths ─────────────────────────────────────────────────────
KNOWLEDGE_DIR = Path(__file__).parent / 'knowledge'
FAQ_FILE = KNOWLEDGE_DIR / 'nysc_faq.json'
TRAINING_FILE = KNOWLEDGE_DIR / 'training_data.json'
PROMPT_FILE = KNOWLEDGE_DIR / 'system_prompt.txt'


# ─────────────────────────────────────────────────────────────────────────────
#  Knowledge Base Loader  (reloads from disk each request — no restart needed)
# ─────────────────────────────────────────────────────────────────────────────
def load_faqs() -> list:
    """Load FAQ entries from JSON file."""
    try:
        with open(FAQ_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('faqs', [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def load_custom_responses() -> list:
    """Load custom greeting/pattern responses."""
    try:
        with open(TRAINING_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data.get('custom_responses', [])
    except (FileNotFoundError, json.JSONDecodeError):
        return []


def load_system_prompt() -> str:
    """Load the AI system prompt from file."""
    try:
        return PROMPT_FILE.read_text(encoding='utf-8')
    except FileNotFoundError:
        return (
            "You are an expert NYSC AI assistant for Nigeria. "
            "Help corps members with registration, camp, allowances, CDS, redeployment, "
            "and all service-year queries. Be friendly, accurate, and use markdown formatting."
        )


# ─────────────────────────────────────────────────────────────────────────────
#  TIER 1 – Exact Pattern Matching (greetings, simple patterns)
# ─────────────────────────────────────────────────────────────────────────────
def match_custom_pattern(user_message: str) -> str | None:
    """Check if message matches any custom training patterns."""
    text = user_message.lower().strip()
    custom = load_custom_responses()

    for entry in custom:
        for pattern in entry.get('patterns', []):
            # Full match or message starts with/is the pattern
            if text == pattern or text.startswith(pattern + ' ') or text.startswith(pattern + ','):
                return entry['response']
            # Short messages that are mostly this pattern
            if pattern in text and len(text) <= len(pattern) + 10:
                return entry['response']
    return None


# ─────────────────────────────────────────────────────────────────────────────
#  TIER 2 – FAQ Similarity Matching (keyword-based TF-IDF-style scoring)
# ─────────────────────────────────────────────────────────────────────────────
def tokenize(text: str) -> list:
    """Simple tokenizer: lowercase, remove punctuation, split."""
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    stop_words = {
        'i', 'me', 'my', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on',
        'at', 'to', 'for', 'of', 'with', 'is', 'it', 'do', 'can', 'how',
        'what', 'when', 'where', 'who', 'why', 'will', 'be', 'are', 'was',
        'were', 'has', 'have', 'had', 'get', 'got', 'that', 'this', 'from',
        'want', 'need', 'please', 'tell', 'me', 'about', 'know', 'want'
    }
    return [w for w in text.split() if w and w not in stop_words and len(w) > 1]


def score_faq(faq: dict, query_tokens: list, original_text: str) -> float:
    """
    Score a FAQ entry against the user's query.
    Uses keyword overlap + question similarity.
    """
    score = 0.0
    query_set = set(query_tokens)
    original_lower = original_text.lower()

    # ── Keyword match (from FAQ's 'keywords' field) ───────────
    faq_keywords = [k.lower() for k in faq.get('keywords', [])]
    for kw in faq_keywords:
        if kw in original_lower:
            # Exact keyword phrase found in original text
            score += 3.0
        else:
            kw_tokens = set(tokenize(kw))
            overlap = query_set & kw_tokens
            if overlap:
                score += len(overlap) * 1.5

    # ── Question word overlap ──────────────────────────────────
    q_tokens = set(tokenize(faq.get('question', '')))
    q_overlap = query_set & q_tokens
    if q_overlap:
        score += len(q_overlap) * 1.0

    # ── Category boost ────────────────────────────────────────
    category = faq.get('category', '').lower()
    category_keywords = {
        'registration': ['register', 'registration', 'sign', 'apply', 'portal'],
        'orientation_camp': ['camp', 'pack', 'bring', 'orientation', 'white'],
        'allowance': ['allowance', 'stipend', 'salary', 'naira', 'money', '₦', 'pay'],
        'redeployment': ['relocate', 'redeploy', 'transfer', 'state', 'move'],
        'cds': ['cds', 'community', 'development', 'service', 'thursday'],
        'ppa': ['ppa', 'assignment', 'workplace', 'employer', 'work', 'posting'],
        'certificate': ['certificate', 'discharge', 'passing', 'pop', 'collect'],
        'exemption': ['exempt', 'exemption', '30', 'age', 'foreign', 'abroad'],
        'clearance': ['clear', 'clearance', 'final'],
    }
    for cat_key, cat_words in category_keywords.items():
        if cat_key in category:
            for cw in cat_words:
                if cw in original_lower:
                    score += 0.5

    return score


def find_best_faq(user_message: str, threshold: float = 2.5) -> dict | None:
    """Find the most relevant FAQ for the user's question."""
    faqs = load_faqs()
    if not faqs:
        return None

    tokens = tokenize(user_message)
    if not tokens:
        return None

    scored = [(faq, score_faq(faq, tokens, user_message)) for faq in faqs]
    scored.sort(key=lambda x: x[1], reverse=True)

    best_faq, best_score = scored[0]
    if best_score >= threshold:
        return best_faq
    return None


# ─────────────────────────────────────────────────────────────────────────────
#  TIER 3 – Google Gemini AI (Free Tier)
# ─────────────────────────────────────────────────────────────────────────────
def call_gemini(user_message: str, conversation_history: list, language: str = 'en') -> str | None:
    """
    Call Google Gemini 1.5 Flash (free tier).
    Returns response text or None on failure.

    FREE TIER limits (as of 2025):
    • 15 requests per minute
    • 1 million tokens per day
    • No credit card required
    Get your API key: https://aistudio.google.com/app/apikey
    """
    api_key = getattr(settings, 'GEMINI_API_KEY',
                      '') or os.environ.get('GEMINI_API_KEY', '')
    if not api_key:
        return None

    try:
        import google.genai as genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        system_prompt = load_system_prompt()

        # Add language instruction
        lang_instruction = {
            'yo': '\n\nIMPORTANT: The user is writing in Yoruba. Respond in Yoruba.',
            'ha': '\n\nIMPORTANT: The user is writing in Hausa. Respond in Hausa.',
            'ig': '\n\nIMPORTANT: The user is writing in Igbo. Respond in Igbo.',
        }.get(language, '')

        full_system = system_prompt + lang_instruction

        # Build conversation turns for context
        contents = []
        for msg in (conversation_history or [])[-8:]:  # last 8 messages for context
            role = 'user' if msg.get('role') == 'user' else 'model'
            contents.append(types.Content(
                role=role,
                parts=[types.Part(text=msg.get('content', ''))]
            ))

        # Add current user message
        contents.append(types.Content(
            role='user',
            parts=[types.Part(text=user_message)]
        ))

        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=full_system,
                max_output_tokens=600,
                temperature=0.7,
            )
        )

        return response.text

    except Exception as e:
        # Log for debugging but don't crash
        print(f"[Gemini Error] {type(e).__name__}: {e}")
        return None


# ─────────────────────────────────────────────────────────────────────────────
#  TIER 4 – Enhanced Rule-Based Fallback (always available, no API needed)
# ─────────────────────────────────────────────────────────────────────────────
FALLBACK_RESPONSES = {
    'registration': (
        "**NYSC Registration Process:**\n\n"
        "1️⃣ Your institution must complete your **NYSC clearance** and submit your details\n"
        "2️⃣ Visit **portal.nysc.org.ng** → 'Online Registration'\n"
        "3️⃣ Fill your biodata form (name must match your certificate exactly!)\n"
        "4️⃣ Upload: degree certificate, passport photo (white background), birth certificate\n"
        "5️⃣ Print your **call-up letter** after approval\n\n"
        "📌 Registration is done in **3 batches per year** (A: Feb-Mar, B: Jul-Aug, C: Oct-Nov)\n\n"
        "Is there a specific part of registration you need help with?"
    ),
    'camp': (
        "**NYSC Orientation Camp — What to Pack:**\n\n"
        "👕 **Clothing:** White shorts × 3, white T-shirts × 3, white canvas shoes, personal clothes\n"
        "🛏️ **Bedding:** Slim mattress, pillow, bedsheet × 2, mosquito net (essential!)\n"
        "🧴 **Toiletries:** Soap, toothbrush, detergent, insect repellent, hand sanitizer\n"
        "📄 **Documents:** Call-up letter × 4 copies, degree cert, birth cert, passport photos × 10\n"
        "💊 **Health:** Personal medications (3-week supply), malaria drugs, paracetamol\n"
        "🔦 **Utilities:** Padlock, flashlight, power bank, plate & cutlery\n\n"
        "⛔ **Leave at home:** Valuables, jewelry, large amounts of cash\n"
        "⏳ Camp lasts **approximately 3 weeks**\n\n"
        "What else would you like to know about camp?"
    ),
    'allowance': (
        "**NYSC Monthly Allowance:**\n\n"
        "💰 The federal government stipend is **₦33,000 per month**\n\n"
        "📅 **Paid around the 27th of each month** into your registered bank account\n\n"
        "🏦 **To receive payment:**\n"
        "• Open an account with a NYSC-approved bank\n"
        "• Link your BVN to the account\n"
        "• Enter your account details accurately on the portal\n\n"
        "💡 Your PPA may also provide additional allowances on top of the federal stipend\n\n"
        "Do you have questions about payment delays or bank account setup?"
    ),
    'relocation': (
        "**NYSC Redeployment / Relocation:**\n\n"
        "📝 **Steps:**\n"
        "1. Log in to portal.nysc.org.ng\n"
        "2. Navigate to **'Redeployment'** section\n"
        "3. Select your reason and upload supporting documents\n"
        "4. Submit and await approval (2–6 weeks)\n\n"
        "✅ **Valid reasons:** Medical condition, marriage to serving corps member, security threats, pregnancy\n"
        "❌ **Invalid:** Personal preference, wanting to be near family\n\n"
        "⚠️ Approval is at NYSC's discretion — not guaranteed\n\n"
        "Would you like more details about any specific redeployment reason?"
    ),
    'cds': (
        "**Community Development Service (CDS):**\n\n"
        "🤝 CDS is **mandatory** — you must join a group and attend every **Thursday**\n\n"
        "👥 **Available groups:** Health, Education, Agriculture, Technology/ICT, Legal Aid, Environment, Sports\n\n"
        "⚠️ **Missing CDS affects:**\n"
        "• Your monthly allowance (can be withheld)\n"
        "• Your passing-out certificate\n"
        "• Your NYSC clearance\n\n"
        "💡 Choose a group that matches your skills or profession for maximum impact!\n\n"
        "Want to know how to choose or change your CDS group?"
    ),
    'certificate': (
        "**NYSC Discharge Certificate:**\n\n"
        "📋 **Requirements:**\n"
        "• Complete 12 months of service\n"
        "• Good CDS attendance\n"
        "• PPA clearance letter\n"
        "• No outstanding disciplinary issues\n"
        "• Attend Passing-Out Parade (POP)\n\n"
        "🎓 **Steps:**\n"
        "1. Clear with CDS group coordinator\n"
        "2. Get PPA clearance letter\n"
        "3. Clear with your LGI (Local Government Inspector)\n"
        "4. Final clearance at state secretariat\n"
        "5. Collect certificate at POP or secretariat\n\n"
        "⚠️ Start clearance **at least 1 month before POP** to avoid delays\n\n"
        "Is there anything specific about clearance or POP you need help with?"
    ),
    'exemption': (
        "**NYSC Exemption:**\n\n"
        "✅ **You qualify for exemption if:**\n"
        "• You are **30 years or older** at graduation\n"
        "• Your degree is from a foreign institution not accredited by NUC\n"
        "• You have a **permanent disability**\n\n"
        "📝 **Apply via:** portal.nysc.org.ng → 'Exemption Application'\n"
        "Upload: birth certificate, medical certificate (if applicable), degree certificate\n\n"
        "📜 You'll receive an **NYSC Exemption Certificate** — equally valid as a discharge certificate for employment\n\n"
        "Do you want to know more about the exemption application process?"
    ),
    'ppa': (
        "**PPA (Place of Primary Assignment):**\n\n"
        "🏢 Your PPA is where you **work** during your service year\n\n"
        "📍 **Types:** Government ministries, schools, hospitals, NGOs, some private companies\n\n"
        "📋 **Assignment:** NYSC assigns your PPA based on your degree and available positions\n\n"
        "🔄 **To change your PPA:**\n"
        "1. Visit your Local Government Inspector (LGI)\n"
        "2. Report the issue (non-functional, unsafe, wrong skill area)\n"
        "3. Request and fill a 'Change of PPA' form\n"
        "4. Continue reporting to old PPA while change is processed\n\n"
        "Need more details about PPA issues or change process?"
    ),
    'default': (
        "Hi! I'm your NYSC AI Assistant. 🇳🇬\n\n"
        "I can help you with:\n\n"
        "📋 **Registration** — Documents, steps, portal guidance\n"
        "🏕️ **Orientation Camp** — What to pack, rules, activities\n"
        "💰 **Allowance** — Monthly stipend, payment dates, banking\n"
        "📍 **Posting & Redeployment** — PPA info, transfer process\n"
        "🤝 **CDS** — Groups, attendance, requirements\n"
        "🎓 **Certificate** — Clearance, POP, discharge certificate\n"
        "📄 **Exemption** — Who qualifies, how to apply\n\n"
        "Just ask your question in plain English — I'm here to help! 😊"
    ),
}

INTENT_MAP = {
    'registration': r'register|registration|sign.?up|portal|apply|call.?up|letter|biodata|batch|document',
    'camp':         r'pack|bring|camp|orientation|kit|what to take|luggage|hostel|drill|uniform|white',
    'allowance':    r'allowance|stipend|salary|pay|how much|₦|naira|money|bank|27th|payment',
    'relocation':   r'relocat|redeployment|redeploy|transfer|move state|change state|another state',
    'cds':          r'cds|community development|group|weekly|thursday|service group|join cds',
    'certificate':  r'certificate|discharge|passing.?out|pop|collect cert|clearance|end of service',
    'exemption':    r'exempt|exemption|30 year|age|foreign.?degree|foreign.?graduate|abroad|overseas',
    'ppa':          r'ppa|place of.?primary|assignment|workplace|employer|posting|where.?work',
}


def get_fallback_response(user_message: str, language: str = 'en') -> str:
    """Detect intent and return the best matching fallback response."""
    text = user_message.lower()

    language_greeting = {
        'yo': "Ẹ káàbọ̀! Èmi ni olùrànlọ́wọ́ NYSC AI rẹ.",
        'ha': "Barka da zuwa! Ni ne mataimakiyar AI ta NYSC.",
        'ig': "Ndewo! Abụ m NYSC AI Assistant gị.",
    }.get(language)

    for intent, pattern in INTENT_MAP.items():
        if re.search(pattern, text):
            resp = FALLBACK_RESPONSES.get(
                intent, FALLBACK_RESPONSES['default'])

            if language_greeting:
                return f"{language_greeting}\n\n{resp}"
            return resp

    if language_greeting:
        return f"{language_greeting}\n\n{FALLBACK_RESPONSES['default']}"

    return FALLBACK_RESPONSES['default']


# ─────────────────────────────────────────────────────────────────────────────
#  MAIN ENTRY POINT
# ─────────────────────────────────────────────────────────────────────────────
def get_response(user_message: str, conversation_history: list = None, language: str = 'en') -> dict:
    """
    Main chatbot response function.
    Returns: {
        'response': str,        # The answer text (supports markdown)
        'source': str,          # 'pattern' | 'faq' | 'gemini' | 'fallback'
        'response_time': float, # Seconds taken
        'faq_id': str | None,   # ID of matched FAQ entry if any
    }
    """
    start = time.time()

    # ── TIER 1: Custom pattern matching ───────────────────────
    pattern_response = match_custom_pattern(user_message)
    if pattern_response:
        return {
            'response':      pattern_response,
            'source':        'pattern',
            'response_time': round(time.time() - start, 3),
            'faq_id':        None,
        }

    # ── TIER 2: FAQ knowledge base matching ───────────────────
    best_faq = find_best_faq(user_message)
    if best_faq:
        return {
            'response':      best_faq['answer'],
            'source':        'faq',
            'response_time': round(time.time() - start, 3),
            'faq_id':        best_faq.get('id'),
        }

    # ── TIER 3: Gemini AI ─────────────────────────────────────
    gemini_response = call_gemini(
        user_message, conversation_history or [], language)
    if gemini_response:
        return {
            'response':      gemini_response,
            'source':        'gemini',
            'response_time': round(time.time() - start, 3),
            'faq_id':        None,
        }

    # ── TIER 4: Rich fallback ─────────────────────────────────
    fallback = get_fallback_response(user_message, language)
    return {
        'response':      fallback,
        'source':        'fallback',
        'response_time': round(time.time() - start, 3),
        'faq_id':        None,
    }
