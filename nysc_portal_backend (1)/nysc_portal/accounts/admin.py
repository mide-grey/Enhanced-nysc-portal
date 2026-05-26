"""accounts/admin.py"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, CorpsMemberProfile, EmailVerificationToken


class ProfileInline(admin.StackedInline):
    model  = CorpsMemberProfile
    extra  = 0
    can_delete = False


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    inlines         = [ProfileInline]
    list_display    = ['email', 'first_name', 'last_name', 'role', 'is_verified', 'date_joined']
    list_filter     = ['role', 'is_verified', 'is_active', 'preferred_language']
    search_fields   = ['email', 'first_name', 'last_name']
    ordering        = ['-date_joined']
    fieldsets       = (
        (None,              {'fields': ('email', 'password')}),
        ('Personal Info',   {'fields': ('first_name', 'last_name', 'preferred_language')}),
        ('Role & Status',   {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('Permissions',     {'fields': ('groups', 'user_permissions')}),
        ('Timestamps',      {'fields': ('date_joined', 'last_login'), 'classes': ('collapse',)}),
    )
    add_fieldsets   = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2', 'role'),
        }),
    )


@admin.register(CorpsMemberProfile)
class CorpsMemberProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'state_code', 'batch', 'state_of_deployment', 'service_status']
    list_filter   = ['batch', 'state_of_deployment', 'service_status']
    search_fields = ['user__email', 'user__first_name', 'state_code']
