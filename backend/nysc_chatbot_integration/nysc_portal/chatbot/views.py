"""
chatbot/views.py
API views for chat sessions and messaging.
"""

from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import ChatSession, ChatMessage, ChatFeedback
from .serializers import (
    ChatSessionSerializer, ChatSessionListSerializer,
    ChatMessageSerializer, SendMessageSerializer, ChatFeedbackSerializer,
)
from .services import get_ai_response


# ─── Session List / Create ────────────────────────────────────
class ChatSessionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/v1/chat/sessions/   → list user's sessions
    POST /api/v1/chat/sessions/   → start a new session
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ChatSessionListSerializer
        return ChatSessionSerializer

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ─── Session Detail / Delete ──────────────────────────────────
class ChatSessionDetailView(generics.RetrieveDestroyAPIView):
    """
    GET    /api/v1/chat/sessions/<id>/
    DELETE /api/v1/chat/sessions/<id>/
    """
    serializer_class   = ChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatSession.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False   # soft delete
        instance.save()


# ─── Send Message ─────────────────────────────────────────────
class SendMessageView(APIView):
    """
    POST /api/v1/chat/sessions/<session_id>/message/
    Accepts a user message, gets AI response, persists both.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, session_id):
        session = get_object_or_404(ChatSession, id=session_id, user=request.user, is_active=True)

        serializer = SendMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # 1. Save user message
        user_msg = ChatMessage.objects.create(
            session  = session,
            role     = ChatMessage.Role.USER,
            content  = data['message'],
            language = data['language'],
            is_voice = data.get('is_voice', False),
        )

        # 2. Build conversation history for context
        history = [
            {'role': m.role, 'content': m.content}
            for m in session.messages.exclude(id=user_msg.id).order_by('created_at')
        ]

        # 3. Get AI response
        ai_result = get_ai_response(
            message              = data['message'],
            language             = data['language'],
            conversation_history = history,
        )

        # 4. Save AI message
        ai_msg = ChatMessage.objects.create(
            session       = session,
            role          = ChatMessage.Role.ASSISTANT,
            content       = ai_result['content'],
            language      = data['language'],
            tokens_used   = ai_result['tokens_used'],
            response_time = ai_result['response_time'],
        )

        # 5. Auto-title first exchange
        if session.messages.count() == 2 and session.title == 'New Chat':
            session.title = data['message'][:60]
            session.save()

        return Response(
            {
                'user_message': ChatMessageSerializer(user_msg).data,
                'ai_response':  ChatMessageSerializer(ai_msg).data,
                'source':       ai_result['source'],
            },
            status=status.HTTP_201_CREATED,
        )


# ─── Feedback ─────────────────────────────────────────────────
class ChatFeedbackView(generics.CreateAPIView):
    """POST /api/v1/chat/messages/<message_id>/feedback/"""
    serializer_class   = ChatFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        message = get_object_or_404(
            ChatMessage,
            id=self.kwargs['message_id'],
            session__user=self.request.user,
        )
        serializer.save(user=self.request.user, message=message)
