"""
chatbot/views_public.py
─────────────────────────────────────────────────────────────────────────────
Public chatbot API views — NO authentication required.
Stateless: messages are NOT stored in any database.
Any visitor can use the chatbot immediately.
─────────────────────────────────────────────────────────────────────────────
"""

import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .ai_engine import get_response


# ─────────────────────────────────────────────────────────────────────────────
#  Main Chat Endpoint  (no auth, no DB)
# ─────────────────────────────────────────────────────────────────────────────
@method_decorator(csrf_exempt, name='dispatch')
class PublicChatView(APIView):
    """
    POST /api/v1/chat/message/

    The primary chatbot endpoint. Accepts a message + optional conversation
    history, returns an AI-generated NYSC response.

    Request Body:
    {
        "message":  "What should I pack for camp?",       // required
        "language": "en",                                  // optional: en/yo/ha
        "history":  [                                      // optional: last N turns
            {"role": "user",      "content": "Hi"},
            {"role": "assistant", "content": "Hello! ..."}
        ]
    }

    Response:
    {
        "response":      "Here's your packing list...",
        "source":        "faq",          // pattern|faq|gemini|fallback
        "response_time": 0.042,
        "faq_id":        "camp_001",     // null if not from FAQ
        "status":        "success"
    }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # ── Parse input ───────────────────────────────────────
        message = (request.data.get('message') or '').strip()
        language = request.data.get('language', 'en')
        history = request.data.get('history', [])

        # Validate
        if not message:
            return Response(
                {'error': 'message field is required.', 'status': 'error'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(message) > 2000:
            return Response(
                {'error': 'Message too long (max 2000 characters).',
                 'status': 'error'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if language not in ('en', 'yo', 'ha', 'ig'):
            language = 'en'

        # Sanitize history
        clean_history = []
        if isinstance(history, list):
            for item in history[-10:]:  # limit to last 10
                if isinstance(item, dict) and 'role' in item and 'content' in item:
                    clean_history.append({
                        'role':    str(item['role'])[:20],
                        'content': str(item['content'])[:1000],
                    })

        # ── Get AI response ───────────────────────────────────
        result = get_response(
            user_message=message,
            conversation_history=clean_history,
            language=language,
        )

        return Response({
            'response':      result['response'],
            'source':        result['source'],
            'response_time': result['response_time'],
            'faq_id':        result.get('faq_id'),
            'status':        'success',
        })


# ─────────────────────────────────────────────────────────────────────────────
#  Knowledge Base Admin Endpoint (view available FAQs)
# ─────────────────────────────────────────────────────────────────────────────
class FAQListView(APIView):
    """
    GET /api/v1/chat/faqs/
    Returns all FAQ entries from the knowledge base.
    Useful for debugging and for building FAQ UI pages.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .ai_engine import load_faqs
        faqs = load_faqs()
        category = request.query_params.get('category')

        if category:
            faqs = [f for f in faqs if f.get('category') == category]

        # Return lightweight version (no full answer text by default)
        full = request.query_params.get('full', 'false').lower() == 'true'
        if not full:
            faqs = [
                {
                    'id':       f.get('id'),
                    'category': f.get('category'),
                    'question': f.get('question'),
                    'keywords': f.get('keywords', []),
                }
                for f in faqs
            ]

        return Response({'faqs': faqs, 'count': len(faqs)})


# ─────────────────────────────────────────────────────────────────────────────
#  Health Check Endpoint
# ─────────────────────────────────────────────────────────────────────────────
class ChatHealthView(APIView):
    """
    GET /api/v1/chat/health/
    Returns chatbot system status — useful for testing connectivity.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from .ai_engine import load_faqs, load_custom_responses
        import os
        from django.conf import settings

        faqs = load_faqs()
        custom = load_custom_responses()
        has_gemini = bool(
            getattr(settings, 'GEMINI_API_KEY', '') or
            os.environ.get('GEMINI_API_KEY', '')
        )

        return Response({
            'status':           'online',
            'faq_count':        len(faqs),
            'custom_patterns':  len(custom),
            'gemini_enabled':   has_gemini,
            'ai_tier_order':    ['pattern_match', 'faq_search', 'gemini_ai', 'rule_fallback'],
            'languages':        ['en', 'yo', 'ha', 'ig'],
            'message':          'NYSC AI Chatbot is running!',
        })
