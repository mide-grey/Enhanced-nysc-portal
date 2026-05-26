from django.contrib import admin
from .models import ChatSession, ChatMessage, ChatFeedback

class MessageInline(admin.TabularInline):
    model = ChatMessage
    extra = 0
    readonly_fields = ['role', 'content', 'tokens_used', 'response_time', 'created_at']

@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display  = ['user', 'title', 'language', 'is_active', 'updated_at']
    list_filter   = ['language', 'is_active']
    search_fields = ['user__email', 'title']
    inlines       = [MessageInline]

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = ['session', 'role', 'language', 'tokens_used', 'created_at']
    list_filter   = ['role', 'language']
