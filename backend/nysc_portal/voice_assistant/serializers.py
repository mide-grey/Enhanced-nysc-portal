"""voice_assistant/serializers.py"""

from rest_framework import serializers
from .models import VoiceQuery

class VoiceQuerySerializer(serializers.ModelSerializer):
    class Meta:
        model  = VoiceQuery
        fields = ['id', 'transcription', 'ai_response', 'language', 'status',
                  'duration_secs', 'created_at']
        read_only_fields = ['id', 'transcription', 'ai_response', 'status',
                            'duration_secs', 'created_at']

class VoiceUploadSerializer(serializers.Serializer):
    audio    = serializers.FileField()
    language = serializers.ChoiceField(choices=['en', 'yo', 'ha'], default='en')
