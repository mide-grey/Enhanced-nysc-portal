"""nysc_content URL routing."""

from django.urls import path
from .views import (
    CategoryListView, ArticleListView, ArticleDetailView,
    FAQListView, StateListView, StateDetailView, AnnouncementListView,
)

app_name = 'nysc_content'

urlpatterns = [
    path('categories/',             CategoryListView.as_view(),    name='categories'),
    path('articles/',               ArticleListView.as_view(),     name='articles'),
    path('articles/<slug:slug>/',   ArticleDetailView.as_view(),   name='article-detail'),
    path('faqs/',                   FAQListView.as_view(),         name='faqs'),
    path('states/',                 StateListView.as_view(),       name='states'),
    path('states/<str:state_code>/',StateDetailView.as_view(),     name='state-detail'),
    path('announcements/',          AnnouncementListView.as_view(),name='announcements'),
]
