"""ASGI config for nysc_portal project."""
import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nysc_portal.settings')
application = get_asgi_application()
