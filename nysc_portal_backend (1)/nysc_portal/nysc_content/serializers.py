"""nysc_content/serializers.py"""

from rest_framework import serializers
from .models import Category, Article, FAQ, StateInformation, Announcement


class CategorySerializer(serializers.ModelSerializer):
    article_count = serializers.SerializerMethodField()
    class Meta:
        model  = Category
        fields = ['id', 'name', 'slug', 'description', 'icon', 'order', 'article_count']
    def get_article_count(self, obj):
        return obj.articles.filter(status='published').count()


class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model  = Article
        fields = ['id', 'title', 'slug', 'summary', 'content', 'category',
                  'category_name', 'language', 'status', 'is_featured',
                  'views_count', 'tags', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'views_count', 'created_at', 'updated_at']


class ArticleListSerializer(serializers.ModelSerializer):
    """Lightweight – no full content."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    class Meta:
        model  = Article
        fields = ['id', 'title', 'slug', 'summary', 'category_name',
                  'language', 'is_featured', 'views_count', 'created_at']


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FAQ
        fields = ['id', 'question', 'answer', 'language', 'category', 'order']


class StateInformationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = StateInformation
        fields = '__all__'


class AnnouncementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Announcement
        fields = ['id', 'title', 'content', 'priority', 'is_active',
                  'start_date', 'end_date', 'created_at']
