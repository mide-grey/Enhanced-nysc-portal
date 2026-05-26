"""
chatbot/urls.py
Public chatbot routes (no authentication required).
"""

from django.urls import path
from .views_public import PublicChatView, FAQListView, ChatHealthView

app_name = 'chatbot'

urlpatterns = [
    # ── Primary chatbot endpoint (used by frontend) ───────────
    path('message/',  PublicChatView.as_view(),  name='chat-message'),

    # ── Knowledge base browser ────────────────────────────────
    path('faqs/',     FAQListView.as_view(),     name='faq-list'),

    # ── Health / status check ─────────────────────────────────
    path('health/',   ChatHealthView.as_view(),  name='chat-health'),
]
