"""notifications_app/models.py"""

from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Notification(models.Model):
    class Type(models.TextChoices):
        INFO    = 'info',    'Info'
        SUCCESS = 'success', 'Success'
        WARNING = 'warning', 'Warning'
        ALERT   = 'alert',   'Alert'

    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    type       = models.CharField(max_length=10, choices=Type.choices, default=Type.INFO)
    is_read    = models.BooleanField(default=False)
    link       = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.type}] {self.title} → {self.user.email}'

    @classmethod
    def send(cls, user, title, message, type=Type.INFO, link=''):
        return cls.objects.create(user=user, title=title, message=message,
                                  type=type, link=link)
