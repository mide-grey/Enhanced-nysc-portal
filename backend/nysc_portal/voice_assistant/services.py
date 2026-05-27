"""
voice_assistant/services.py
Speech-to-text and text-to-speech utilities.
"""

import os, io, time
from django.conf import settings


def speech_to_text(audio_file, language: str = 'en') -> dict:
    """
    Convert an uploaded audio file to text.
    Uses SpeechRecognition library (Google STT backend, free tier).
    """
    try:
        import speech_recognition as sr

        lang_map = {'en': 'en-NG', 'yo': 'yo-NG', 'ha': 'ha-NG'}
        recognizer = sr.Recognizer()

        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)

        text = recognizer.recognize_google(audio_data, language=lang_map.get(language, 'en-NG'))
        return {'success': True, 'text': text, 'language': language}
    except Exception as e:
        return {'success': False, 'text': '', 'error': str(e)}


def text_to_speech(text: str, language: str = 'en') -> bytes | None:
    """
    Convert text to speech audio (MP3 bytes) using gTTS.
    Returns None on failure.
    """
    try:
        from gtts import gTTS
        lang_map = {'en': 'en', 'yo': 'yo', 'ha': 'ha'}
        tts = gTTS(text=text, lang=lang_map.get(language, 'en'), slow=False)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
        return buf.read()
    except Exception:
        return None
