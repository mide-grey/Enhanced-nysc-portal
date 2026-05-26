"""voice_assistant/models.py – Voice query logs."""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class VoiceQuery(models.Model):
    """Records each voice interaction for analytics and debugging."""

    LANGUAGE_CHOICES = [('en', 'English'), ('yo', 'Yoruba'), ('ha', 'Hausa')]
    STATUS_CHOICES   = [
        ('pending',  'Pending'),
        ('success',  'Success'),
        ('failed',   'Failed'),
    ]

    user          = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_queries')
    audio_file    = models.FileField(upload_to='voice/inputs/', blank=True, null=True)
    transcription = models.TextField(blank=True)
    ai_response   = models.TextField(blank=True)
    audio_response= models.FileField(upload_to='voice/outputs/', blank=True, null=True)
    language      = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    status        = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    error_message = models.TextField(blank=True)
    duration_secs = models.FloatField(default=0.0)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Voice Query'

    def __str__(self):
        return f'{self.user.get_short_name()} – {self.language} – {self.status}'
