"""
chatbot/models.py
Chat sessions and message history.
"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class ChatSession(models.Model):
    """
    A single conversation thread between a user and the AI.
    Supports multilingual context.
    """
    LANGUAGE_CHOICES = [('en', 'English'), ('yo', 'Yoruba'), ('ha', 'Hausa')]

    user      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title     = models.CharField(max_length=255, blank=True, default='New Chat')
    language  = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Chat Session'

    def __str__(self):
        return f'{self.user.get_short_name()} – {self.title}'

    def get_message_count(self):
        return self.messages.count()


class ChatMessage(models.Model):
    """Individual message within a chat session."""

    class Role(models.TextChoices):
        USER      = 'user',      'User'
        ASSISTANT = 'assistant', 'Assistant'
        SYSTEM    = 'system',    'System'

    session    = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    role       = models.CharField(max_length=10, choices=Role.choices)
    content    = models.TextField()
    language   = models.CharField(max_length=2, default='en')

    # Optional metadata from AI response
    tokens_used   = models.PositiveIntegerField(default=0)
    response_time = models.FloatField(default=0.0, help_text='Seconds')
    is_voice      = models.BooleanField(default=False, help_text='Was this sent via voice?')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']
        verbose_name = 'Chat Message'

    def __str__(self):
        return f'[{self.role}] {self.content[:60]}'


class ChatFeedback(models.Model):
    """User feedback (thumbs up/down) on AI responses."""

    class Rating(models.IntegerChoices):
        THUMBS_DOWN = -1, 'Thumbs Down'
        THUMBS_UP   =  1, 'Thumbs Up'

    message  = models.OneToOneField(ChatMessage, on_delete=models.CASCADE, related_name='feedback')
    user     = models.ForeignKey(User, on_delete=models.CASCADE)
    rating   = models.SmallIntegerField(choices=Rating.choices)
    comment  = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Chat Feedback'

    def __str__(self):
        return f'Feedback on msg {self.message.id}: {self.rating}'
