"""
Root URL Configuration – NYSC AI Portal
API versioned under /api/v1/
Swagger UI at /api/docs/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.decorators.cache import never_cache
from django.http import HttpResponse
import mimetypes
import os
from drf_spectacular.views import (
    SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView,
)


def get_static_source_root():
    if settings.STATICFILES_DIRS:
        return os.path.abspath(str(settings.STATICFILES_DIRS[0]))
    return os.path.abspath(str(settings.STATIC_ROOT))


def serve_html(filename):
    """Serve HTML files from the source static directory."""
    @never_cache
    def view(request):
        file_path = os.path.join(get_static_source_root(), filename)
        try:
            return FileResponse(
                open(file_path, 'rb'),
                content_type='text/html',
                charset='utf-8'
            )
        except FileNotFoundError:
            from django.http import HttpResponse
            return HttpResponse(f"<h1>404 - {filename} not found</h1>", status=404)
    return view


def serve_static_file(request, relative_path):
    normalized_path = relative_path.replace('\\', '/').lstrip('/')
    file_path = os.path.abspath(os.path.join(get_static_source_root(), normalized_path))
    if not os.path.exists(file_path):
        return HttpResponse(f"<h1>404 - {normalized_path} not found</h1>", status=404)

    content_type, _ = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'
    with open(file_path, 'rb') as file_handle:
        return HttpResponse(file_handle.read(), content_type=content_type)


def serve_static_asset(filename):
    @never_cache
    def view(request):
        return HttpResponse(f"OK:{filename}", content_type='text/plain')
    return view


api_v1_urlpatterns = [
    path('auth/',          include('accounts.urls')),
    path('chat/',          include('chatbot.urls')),
    path('voice/',         include('voice_assistant.urls')),
    path('content/',       include('nysc_content.urls')),
    path('notifications/', include('notifications_app.urls')),
]

urlpatterns = [
    # Frontend pages
    path('', serve_html('index.html'), name='index'),
    path('chat/', serve_html('chat.html'), name='chat'),
    path('static/css/chat.css', serve_static_asset('css/chat.css')),
    path('static/js/chat.js', serve_static_asset('js/chat.js')),
    path('static/css/login.css', serve_static_asset('css/login.css')),
    path('static/js/login.js', serve_static_asset('js/login.js')),
    path('static/js/page-lang.js', serve_static_asset('js/page-lang.js')),
    path('static/json/nysc_faq.json', serve_static_asset('json/nysc_faq.json')),

    # Admin & API
    path('admin/', admin.site.urls),
    path('api/v1/', include(api_v1_urlpatterns)),
    path('api/schema/', SpectacularAPIView.as_view(),    name='schema'),
    path('api/docs/',   SpectacularSwaggerView.as_view(url_name='schema'),
         name='swagger-ui'),
    path('api/redoc/',  SpectacularRedocView.as_view(url_name='schema'),   name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL,
                          document_root=settings.STATIC_ROOT)

admin.site.site_header = 'NYSC AI Portal Administration'
admin.site.site_title = 'NYSC Portal Admin'
admin.site.index_title = 'Dashboard'
