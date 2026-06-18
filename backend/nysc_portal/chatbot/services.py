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
        'definition': (
            "NYSC stands for the National Youth Service Corps. It is a one-year national service program for Nigerian graduates, designed to build civic responsibility, national unity, and practical work experience.\n\n"
            "As a corps member, you will be deployed to a state, assigned to a Place of Primary Assignment (PPA), and expected to participate in Community Development Service (CDS) activities."
        ),
        'allowance': (
            "The NYSC monthly allowance (stipend) is currently ₦77,000 as approved by the Federal Government.\n\n"
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
        'definition': (
            "NYSC tumọ si National Youth Service Corps. O jẹ́ ìpàdé iṣẹ́ afọ́ kan fún àwọn ọmọ ile Yoruba ti o ti pari-ẹkọ́ọ́lẹ̀, tí a ṣàlàyé láti mú ìdánilójú, ìsopọ̀ ààbò, àti ìmọ̀ iṣẹ́ ìjọba.\n\n"
            "Bí ọmọ ẹgbẹ̀ NYSC, iwọ yoo ni a fi si ipò kan, o si maa ṣe iṣẹ́ ní ibùdó, àti ìkopa ninu iṣẹ́ ìmúlò ìjọba (CDS)."
        ),
        'allowance': "Owó oṣùù NYSC jẹ́ ₦77,000 gẹ́gẹ́ bí ìjọba àpapọ̀ ti fọwọ́ sí.",
        'registration': "Láti forúkọ sílẹ̀ fún NYSC, ẹ lọ sí portal.nysc.org.ng kí ẹ sì tẹ̀lé àwọn ìtọ́sọ́nà tí a pèsè sílẹ̀.",
        'camp': (
            "Àwọn ohun tí o yẹ kí o mú lọ sí NYSC Orientation Camp ni: \n"
            "• Shorts funfun ati T-shirt funfun \n"
            "• Bọ́ọ̀dì, aṣọ ibusun, ati apoti egboogi \n"
            "• Awọn ohun iṣọra ara ẹni \n"
            "• Lẹ́tà call-up ati ID rẹ \n"
            "• Tẹ́lẹ̀ kí o ma ṣetọju ohun ìní tó pọ̀."
        ),
        'relocation': (
            "Láti gbìmọ̀ fun relocation/redeployment, wọlé sí portal NYSC, lọ sí apakan Redeployment, yan ìdí rẹ, àti fi àwọn ìwé ìdánimọ̀ ranṣẹ́. \n"
            "Gbogbo ìbéèrè ni a maa yẹ wo, kó sì lè gba ọsẹ́ méjì sí mẹ́rin."
        ),
        'cds': (
            "CDS jẹ́ apakan pàtàkì ti iṣẹ́ NYSC. O gbọdọ̀ darapọ̀ mọ́ ẹgbẹ CDS kan, kí o sì kópa nínú ìpàdé ọ̀sẹ̀ kan."
        ),
        'callup': (
            "Lẹ́tà call-up NYSC yoo wà lẹ́yìn tí ile-ẹ̀kọ́ rẹ bá fi ìwé rẹ sílẹ̀. Wọlé, lọ sí apakan Call-Up Letter, kí o sì ṣe éjẹ̀."
        ),
        'exemption': (
            "O lè ní ẹtọ ìmúkò NYSC bí o bá jẹ́ ọgọ́rùn-ún ọdún mẹ́tàlá tàbí ẹ̀ka ẹ̀kọ́ rẹ bá jẹ́ ti ilu mìíràn tí NUC kò mọ̀."
        ),
    },
    'ha': {
        'default': (
            "Barka da zuwa! Ni ne mataimakiyar AI ta NYSC. "
            "Zan iya taimaka ka game da rajista, alawus-alawus, da sauran batutuwan NYSC. "
            "Don Allah tambayi tambayarka."
        ),
        'definition': (
            "NYSC na nufin National Youth Service Corps. Wannan shiri ne na aikin shekara guda ga daliban Najeriya, wanda aka tsara don inganta sadarwar al'umma, alaƙa ta ƙasa, da gogewar aiki.\n\n"
            "Kamar wani dan NYSC, za a tura ka zuwa jiha, ka ba da aikin farko (PPA), kuma ana sa ran ka shiga ayyukan CDS."
        ),
        'allowance': "Alawus-alawus na wata-wata na NYSC shine ₦77,000 kamar yadda gwamnatin tarayya ta amince.",
        'registration': "Don yin rajista a NYSC, ziyarci shafin yanar gizon portal.nysc.org.ng ka bi umarnin da aka bayar.",
        'camp': (
            "Don abin da za a shirya domin sansanin NYSC, tabbatar akwai shorts da T-shirt na fari, takalma, kayan wanka, da magunguna idan kana bukata."
        ),
        'relocation': (
            "Don neman canji wurin aiki, shiga portal, je zuwa Redeployment, zaɓi dalili, ka kuma aika takardun da suka dace."
        ),
        'cds': (
            "CDS babban sashi ne na shekarar hidima. Dole ne ka shiga rukuni na CDS kuma ka halarci taron mako-mako."
        ),
        'callup': (
            "Ana ba da wasikar call-up bayan an kammala tsari. Shiga portal, je Call-Up Letter, sannan ka zazzagewa."
        ),
        'exemption': (
            "Kana iya samun keɓancewa idan kana 30 shekaru ko fiye, ko ka kammala karatun ƙasashen waje."
        ),
    },
    'ig': {
        'default': (
            "Ndewo! Abụ m onye enyemaka AI NYSC. "
            "Enwere m ike inyere gị aka gbasara ndebanye, camp, ụgwọ, mgbanwe, CDS, na ihe ndị ọzọ. "
            "Biko jụọ ajụjụ gị."
        ),
        'definition': (
            "NYSC pụtara National Youth Service Corps. Ọ bụ mmemme ọrụ afọ 1 maka ụmụaka na-ahụma nke Nigeria, nke a haziri iji wulite ọrụ obodo, ijikọ mba ọnụ, na ahụmịhe ọrụ.\n\n"
            "Dị ka onye NYSC, a ga-ezipụ gị ga steeti, a ga-enye gị PPA, ma rụọ ọrụ CDS."
        ),
        'registration': (
            "Iji debanye aha NYSC:\n"
            "1. Gaa portal.nysc.org.ng\n"
            "2. Pịa 'Online Registration' ma mepụta akaụntụ\n"
            "3. Bulite akwụkwọ achọrọ (degree certificate, passport photo, birth certificate)\n"
            "4. Hazie biodata gị nke ọma\n"
            "5. Printa call-up letter gị mgbe e kwadoro"
        ),
        'allowance': "Ọnụ ego NYSC kwa ọnwa bụ ₦77,000 dịka gọọmenti etiti kwadoro.",
        'camp': (
            "Ihe ị ga-ebu maka NYSC Orientation Camp:\n"
            "• White shorts na white T-shirts (ọ dịkarịa 3)\n"
            "• White canvas shoes/trainers\n"
            "• Bedding: mattress, pillow, mosquito net\n"
            "• Toiletries na ihe nlekọta onwe\n"
            "• Ịgwụgwọ ọgwụ ọ bụrụ na ịchọ\n"
            "• Call-up letter na akwụkwọ ID\n"
            "• Padlock na flashlight"
        ),
        'relocation': (
            "Iji rịọ redeployment/relocation:\n"
            "1. Banye portal.nysc.org.ng\n"
            "2. Gaa 'Redeployment'\n"
            "3. Họrọ ihe kpatara ya (medical, marriage, security, wdg.)\n"
            "4. Bulite akwụkwọ nkwado\n"
            "5. Nyefee ma chere nkwado"
        ),
        'cds': (
            "CDS bụ ihe a ga-eme n’ime afọ ọrụ. "
            "Ị ga-abanye otu CDS na steeti ị nọ ma sonye na nzukọ izu kwa izu."
        ),
        'callup': (
            "A na-enye call-up letter gị mgbe ụlọ akwụkwọ gị deela NYSC clearance.\n"
            "Banye portal.nysc.org.ng, pịa 'Call-Up Letter', budata ma printa akwụkwọ ahụ."
        ),
        'exemption': (
            "Ị nwere ike nweta NYSC exemption ma:\n"
            "• Ị gụsịrị akwụkwọ mgbe ị gbara 30 afọ ma karịa\n"
            "• Ị zụrụ akwụkwọ ọzọ ụwa nke NUC anaghị akpọ\n"
            "• Ị nwere nkwarụ ebighị ebi"
        ),
    },
}

INTENT_PATTERNS = {
    'registration': r'register|registration|sign.?up|portal|apply|how to join',
    'definition':   r'what is nysc|what is nysc|meaning of nysc|nysc means|what does nysc mean|nysc',
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
    intent = detect_intent(message)
    lang_kb = NYSC_KNOWLEDGE.get(language, NYSC_KNOWLEDGE['en'])
    response = lang_kb.get(intent) or NYSC_KNOWLEDGE['en'].get(
        intent, NYSC_KNOWLEDGE['en']['default'])
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
                f"Respond in {'English' if language == 'en' else 'Yoruba' if language == 'yo' else 'Hausa' if language == 'ha' else 'Igbo'}."
            )

            messages = [{'role': 'system', 'content': system_prompt}]
            if conversation_history:
                # last 10 messages for context
                messages.extend(conversation_history[-10:])
            messages.append({'role': 'user', 'content': message})

            response = client.chat.completions.create(
                model=settings.CHATBOT_MODEL,
                messages=messages,
                max_tokens=settings.CHATBOT_MAX_TOKENS,
                temperature=settings.CHATBOT_TEMPERATURE,
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
