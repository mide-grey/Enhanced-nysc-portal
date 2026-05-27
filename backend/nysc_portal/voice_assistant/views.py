"""voice_assistant/views.py"""

import time
from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import HttpResponse

from .models import VoiceQuery
from .serializers import VoiceQuerySerializer, VoiceUploadSerializer
from .services import speech_to_text, text_to_speech
from chatbot.services import get_ai_response


class VoiceQueryView(APIView):
    """
    POST /api/v1/voice/query/
    Accepts audio file -> transcribes -> gets AI answer -> returns text + audio.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = VoiceUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        audio    = serializer.validated_data['audio']
        language = serializer.validated_data['language']
        start    = time.time()

        query = VoiceQuery.objects.create(
            user=request.user, language=language, audio_file=audio
        )

        # 1. Speech -> Text
        stt_result = speech_to_text(query.audio_file.file, language)
        if not stt_result['success']:
            query.status = 'failed'
            query.error_message = stt_result.get('error', 'STT failed')
            query.save()
            return Response(
                {'error': 'Could not transcribe audio. Please try again.'},
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        query.transcription = stt_result['text']

        # 2. Get AI response
        ai_result = get_ai_response(stt_result['text'], language)
        query.ai_response   = ai_result['content']
        query.status        = 'success'
        query.duration_secs = round(time.time() - start, 2)
        query.save()

        return Response({
            'transcription': query.transcription,
            'ai_response':   query.ai_response,
            'duration':      query.duration_secs,
            'query_id':      query.id,
        })


class TextToSpeechView(APIView):
    """
    POST /api/v1/voice/tts/
    Body: { "text": "...", "language": "en" }
    Returns: audio/mpeg binary stream.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        text     = request.data.get('text', '').strip()
        language = request.data.get('language', 'en')

        if not text:
            return Response({'error': 'text field is required.'}, status=400)

        audio_bytes = text_to_speech(text, language)
        if audio_bytes is None:
            return Response({'error': 'TTS conversion failed.'}, status=500)

        return HttpResponse(audio_bytes, content_type='audio/mpeg')


class VoiceHistoryView(generics.ListAPIView):
    """GET /api/v1/voice/history/"""
    serializer_class   = VoiceQuerySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return VoiceQuery.objects.filter(user=self.request.user)
