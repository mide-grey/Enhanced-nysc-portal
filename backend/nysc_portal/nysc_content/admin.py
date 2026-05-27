from django.contrib import admin
from .models import Category, Article, FAQ, StateInformation, Announcement

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order']
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Article)
class ArticleAdmin(admin.ModelAdmin):
    list_display  = ['title', 'category', 'language', 'status', 'is_featured', 'views_count', 'created_at']
    list_filter   = ['status', 'language', 'is_featured', 'category']
    search_fields = ['title', 'content']
    prepopulated_fields = {'slug': ('title',)}

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ['question', 'language', 'category', 'is_active', 'order']
    list_filter  = ['language', 'is_active']

@admin.register(StateInformation)
class StateInformationAdmin(admin.ModelAdmin):
    list_display  = ['state_name', 'state_code', 'orientation_camp', 'coordinator_name']
    search_fields = ['state_name', 'coordinator_name']

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'priority', 'is_active', 'created_at']
    list_filter  = ['priority', 'is_active']
