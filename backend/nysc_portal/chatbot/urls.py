"""chatbot URL routing."""

from django.urls import path
from .views import (
    ChatSessionListCreateView, ChatSessionDetailView,
    SendMessageView, ChatFeedbackView, public_chat_message,
)

app_name = 'chatbot'

urlpatterns = [
    # Public endpoint (no auth)
    path('message/',                         public_chat_message,
         name='public-message'),

    # Authenticated endpoints
    path('sessions/',
         ChatSessionListCreateView.as_view(), name='session-list'),
    path('sessions/<int:pk>/',
         ChatSessionDetailView.as_view(),     name='session-detail'),
    path('sessions/<int:session_id>/message/',
         SendMessageView.as_view(),         name='send-message'),
    path('messages/<int:message_id>/feedback/',
         ChatFeedbackView.as_view(),       name='feedback'),
]
