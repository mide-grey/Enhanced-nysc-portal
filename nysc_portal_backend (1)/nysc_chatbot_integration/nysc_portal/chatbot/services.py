"""
chatbot/services.py
AI response generation logic.
Falls back to rule-based responses when OpenAI key is not set.
"""

import time
import re
from django.conf import settings

# ─────────────────────────────────────────────────────────────────────────────
#  Rule-based knowledge base (fallback when no OpenAI key)
# ─────────────────────────────────────────────────────────────────────────────
NYSC_KNOWLEDGE = {
    'en': {
        'registration': (
            "To register for NYSC:\n"
            "1. Visit portal.nysc.org.ng\n"
            "2. Click 'Online Registration' and create an account\n"
            "3. Upload required documents (degree certificate, passport photo, birth certificate)\n"
            "4. Complete your biodata form accurately\n"
            "5. Print your call-up letter after approval\n\n"
            "Registration is initiated by your institution. Ensure your NYSC clearance is completed before graduation."
        ),
        'allowance': (
            "The NYSC monthly allowance (stipend) is currently ₦33,000 as approved by the Federal Government.\n\n"
            "Payment is made directly into your registered NYSC bank account. "
            "Your Place of Primary Assignment (PPA) may provide additional allowances."
        ),
        'camp': (
            "NYSC Orientation Camp essentials to pack:\n"
            "• White shorts and white T-shirts (at least 3 pairs)\n"
            "• White canvas shoes / trainers\n"
            "• Bedding: mattress, pillow, mosquito net\n"
            "• Toiletries and personal hygiene items\n"
            "• Prescription medications\n"
            "• Call-up letter + valid ID documents\n"
            "• Padlock for your locker\n"
            "• Torchlight/flashlight\n\n"
            "Camp lasts approximately 3 weeks. Avoid bringing valuables or large amounts of cash."
        ),
        'relocation': (
            "To apply for redeployment/relocation:\n"
            "1. Log in to the NYSC portal\n"
            "2. Navigate to the 'Redeployment' section\n"
            "3. Select your reason (medical, marriage, security concerns, etc.)\n"
            "4. Upload supporting documents\n"
            "5. Submit and await approval (typically 2–4 weeks)\n\n"
            "Valid reasons include: medical conditions, marriage to a serving corps member, and security concerns."
        ),
        'cds': (
            "Community Development Service (CDS) is mandatory for all corps members.\n\n"
            "You must join a CDS group in your state of deployment and attend weekly meetings. "
            "Available groups include Health, Education, Agriculture, Technology, and Legal Aid CDS.\n\n"
            "Attendance directly affects your passing-out certificate."
        ),
        'callup': (
            "Your call-up letter is issued after your institution submits your details to NYSC.\n\n"
            "To access it:\n"
            "1. Visit portal.nysc.org.ng\n"
            "2. Log in with your credentials\n"
            "3. Navigate to 'Call-Up Letter'\n"
            "4. Download and print\n\n"
            "Keep your call-up letter safe throughout your service year."
        ),
        'exemption': (
            "You may qualify for NYSC exemption if:\n"
            "• You are 30 years or older at graduation\n"
            "• Your degree is from a foreign institution not recognized by NUC\n"
            "• You have a permanent disability\n\n"
            "Apply via the NYSC portal under 'Exemption Application' with supporting documents."
        ),
        'default': (
            "I'm your NYSC AI Assistant! I can help you with:\n\n"
            "• Registration and call-up letter\n"
            "• Orientation camp preparation\n"
            "• Monthly allowance details\n"
            "• Redeployment / relocation\n"
            "• CDS groups and requirements\n"
            "• Exemption applications\n"
            "• PPA information\n\n"
            "What would you like to know?"
        ),
    },
    'yo': {
        'default': (
            "Ẹ káàbọ̀! Èmi ni olùrànlọ́wọ́ NYSC AI rẹ. "
            "Mo lè ràn yín lọ́wọ́ nípa ìforúkọsilẹ̀ NYSC, owó oṣù, àti ohun mìíràn. "
            "Ẹ jọ̀wọ́ béèrè ìbéèrè rẹ."
        ),
        'allowance': "Owó oṣùù NYSC jẹ́ ₦33,000 gẹ́gẹ́ bí ìjọba àpapọ̀ ti fọwọ́ sí.",
        'registration': "Láti forúkọ sílẹ̀ fún NYSC, ẹ lọ sí portal.nysc.org.ng kí ẹ sì tẹ̀lé àwọn ìtọ́sọ́nà tí a pèsè sílẹ̀.",
    },
    'ha': {
        'default': (
            "Barka da zuwa! Ni ne mataimakiyar AI ta NYSC. "
            "Zan iya taimaka ka game da rajista, alawus-alawus, da sauran batutuwan NYSC. "
            "Don Allah tambayi tambayarka."
        ),
        'allowance': "Alawus-alawus na wata-wata na NYSC shine ₦33,000 kamar yadda gwamnatin tarayya ta amince.",
        'registration': "Don yin rajista a NYSC, ziyarci shafin yanar gizon portal.nysc.org.ng ka bi umarnin da aka bayar.",
    },
}

INTENT_PATTERNS = {
    'registration': r'register|registration|sign.?up|portal|apply|how to join',
    'allowance':    r'allowance|stipend|salary|pay|how much|₦|naira|money',
    'camp':         r'pack|bring|camp|orientation|kit|what to take',
    'relocation':   r'relocat|redeployment|transfer|move state|change state',
    'cds':          r'cds|community development|group|weekly meeting',
    'callup':       r'call.?up|callup|letter',
    'exemption':    r'exempt|exemption|age|30 years|foreign degree',
}


def detect_intent(text: str) -> str:
    text = text.lower()
    for intent, pattern in INTENT_PATTERNS.items():
        if re.search(pattern, text):
            return intent
    return 'default'


def get_rule_based_response(message: str, language: str = 'en') -> str:
    """Return a knowledge-base answer for the given message and language."""
    intent   = detect_intent(message)
    lang_kb  = NYSC_KNOWLEDGE.get(language, NYSC_KNOWLEDGE['en'])
    response = lang_kb.get(intent) or NYSC_KNOWLEDGE['en'].get(intent, NYSC_KNOWLEDGE['en']['default'])
    return response


def get_ai_response(message: str, language: str = 'en', conversation_history: list = None) -> dict:
    """
    Try OpenAI first; fall back to rule-based if key is absent or call fails.
    Returns {'content': str, 'tokens_used': int, 'response_time': float, 'source': str}
    """
    start = time.time()

    if settings.OPENAI_API_KEY:
        try:
            from openai import OpenAI
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = (
                "You are an expert NYSC (National Youth Service Corps) AI assistant for Nigeria. "
                "You help corps members with registration, orientation camp, postings, allowances, "
                "CDS, redeployment, and all service-year queries. "
                "Be friendly, accurate, and concise. "
                f"Respond in {'English' if language == 'en' else 'Yoruba' if language == 'yo' else 'Hausa'}."
            )

            messages = [{'role': 'system', 'content': system_prompt}]
            if conversation_history:
                messages.extend(conversation_history[-10:])  # last 10 messages for context
            messages.append({'role': 'user', 'content': message})

            response = client.chat.completions.create(
                model       = settings.CHATBOT_MODEL,
                messages    = messages,
                max_tokens  = settings.CHATBOT_MAX_TOKENS,
                temperature = settings.CHATBOT_TEMPERATURE,
            )

            return {
                'content':       response.choices[0].message.content,
                'tokens_used':   response.usage.total_tokens,
                'response_time': round(time.time() - start, 2),
                'source':        'openai',
            }
        except Exception as e:
            pass  # fall through to rule-based

    # ── Rule-based fallback ───────────────────────────────────
    content = get_rule_based_response(message, language)
    return {
        'content':       content,
        'tokens_used':   0,
        'response_time': round(time.time() - start, 2),
        'source':        'rule_based',
    }
