"""
Root URL Configuration – NYSC AI Portal
Public chatbot at: /api/v1/chat/message/  (no auth)
Swagger UI at: /api/docs/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView,
)

api_v1_urlpatterns = [
    # ── Public chatbot (no auth needed) ──────────────────────
    path('chat/',          include('chatbot.urls')),

    # ── Content (public) ──────────────────────────────────────
    path('content/',       include('nysc_content.urls')),

    # ── Auth (optional features) ──────────────────────────────
    path('auth/',          include('accounts.urls')),

    # ── Voice (optional) ──────────────────────────────────────
    path('voice/',         include('voice_assistant.urls')),

    # ── Notifications (optional) ──────────────────────────────
    path('notifications/', include('notifications_app.urls')),
]

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_urlpatterns)),
    path('api/schema/', SpectacularAPIView.as_view(),    name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = 'NYSC AI Portal Administration'
admin.site.site_title  = 'NYSC Portal Admin'
admin.site.index_title = 'Dashboard'
