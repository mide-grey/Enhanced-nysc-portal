"""voice_assistant URL routing."""

from django.urls import path
from .views import VoiceQueryView, TextToSpeechView, VoiceHistoryView

app_name = 'voice_assistant'

urlpatterns = [
    path('query/',   VoiceQueryView.as_view(),  name='voice-query'),
    path('tts/',     TextToSpeechView.as_view(), name='tts'),
    path('history/', VoiceHistoryView.as_view(), name='voice-history'),
]
