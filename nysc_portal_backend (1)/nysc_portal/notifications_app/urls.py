from django.urls import path
from .views import (
    NotificationListView, NotificationMarkReadView,
    NotificationMarkAllReadView, UnreadCountView,
)

app_name = 'notifications_app'

urlpatterns = [
    path('',               NotificationListView.as_view(),       name='list'),
    path('read-all/',      NotificationMarkAllReadView.as_view(), name='read-all'),
    path('unread-count/',  UnreadCountView.as_view(),             name='unread-count'),
    path('<int:pk>/read/', NotificationMarkReadView.as_view(),    name='mark-read'),
]
