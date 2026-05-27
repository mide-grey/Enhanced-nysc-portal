"""nysc_content/views.py"""

from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter

from .models import Category, Article, FAQ, StateInformation, Announcement
from .serializers import (
    CategorySerializer, ArticleSerializer, ArticleListSerializer,
    FAQSerializer, StateInformationSerializer, AnnouncementSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/v1/content/categories/"""
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ArticleListView(generics.ListAPIView):
    """GET /api/v1/content/articles/?language=en&category=1&search=camp"""
    serializer_class   = ArticleListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, SearchFilter]
    filterset_fields   = ['language', 'category', 'is_featured', 'status']
    search_fields      = ['title', 'summary', 'tags']

    def get_queryset(self):
        return Article.objects.filter(status='published').select_related('category')


class ArticleDetailView(generics.RetrieveAPIView):
    """GET /api/v1/content/articles/<slug>/"""
    serializer_class   = ArticleSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'

    def get_queryset(self):
        return Article.objects.filter(status='published')

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        return Response(self.get_serializer(instance).data)


class FAQListView(generics.ListAPIView):
    """GET /api/v1/content/faqs/?language=en"""
    serializer_class   = FAQSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['language', 'category']

    def get_queryset(self):
        return FAQ.objects.filter(is_active=True)


class StateListView(generics.ListAPIView):
    """GET /api/v1/content/states/"""
    queryset           = StateInformation.objects.all()
    serializer_class   = StateInformationSerializer
    permission_classes = [permissions.AllowAny]


class StateDetailView(generics.RetrieveAPIView):
    """GET /api/v1/content/states/<state_code>/"""
    queryset           = StateInformation.objects.all()
    serializer_class   = StateInformationSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'state_code'


class AnnouncementListView(generics.ListAPIView):
    """GET /api/v1/content/announcements/"""
    serializer_class   = AnnouncementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Announcement.objects.filter(is_active=True)
