"""chatbot/serializers.py"""

from rest_framework import serializers
from .models import ChatSession, ChatMessage, ChatFeedback


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ChatMessage
        fields = ['id', 'role', 'content', 'language', 'tokens_used',
                  'response_time', 'is_voice', 'created_at']
        read_only_fields = ['id', 'role', 'tokens_used', 'response_time', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    messages      = ChatMessageSerializer(many=True, read_only=True)
    message_count = serializers.SerializerMethodField()

    class Meta:
        model  = ChatSession
        fields = ['id', 'title', 'language', 'is_active',
                  'created_at', 'updated_at', 'message_count', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatSessionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the sessions list (no messages)."""
    message_count = serializers.SerializerMethodField()

    class Meta:
        model  = ChatSession
        fields = ['id', 'title', 'language', 'is_active', 'updated_at', 'message_count']

    def get_message_count(self, obj):
        return obj.messages.count()


class SendMessageSerializer(serializers.Serializer):
    """Incoming user message payload."""
    message  = serializers.CharField(max_length=2000)
    language = serializers.ChoiceField(choices=['en', 'yo', 'ha'], default='en')
    is_voice = serializers.BooleanField(default=False)


class ChatFeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ChatFeedback
        fields = ['id', 'message', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']
