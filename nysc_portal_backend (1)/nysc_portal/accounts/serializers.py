"""
accounts/serializers.py
Serializers for user registration, login, and profile management.
"""

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import CorpsMemberProfile

User = get_user_model()


# ─────────────────────────────────────────────────────────────────────────────
#  JWT – Custom Token Pair (includes extra user claims)
# ─────────────────────────────────────────────────────────────────────────────
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends JWT payload with user metadata for the frontend."""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['email']      = user.email
        token['full_name']  = user.get_full_name()
        token['role']       = user.role
        token['language']   = user.preferred_language
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        # Add user info alongside the tokens
        data['user'] = {
            'id':         self.user.id,
            'email':      self.user.email,
            'full_name':  self.user.get_full_name(),
            'role':       self.user.role,
            'language':   self.user.preferred_language,
            'is_verified':self.user.is_verified,
        }
        return data


# ─────────────────────────────────────────────────────────────────────────────
#  User Registration
# ─────────────────────────────────────────────────────────────────────────────
class UserRegistrationSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            'email', 'first_name', 'last_name',
            'password', 'confirm_password', 'preferred_language',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('confirm_password'):
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Auto-create a blank profile
        CorpsMemberProfile.objects.create(user=user)
        return user


# ─────────────────────────────────────────────────────────────────────────────
#  Corps Member Profile
# ─────────────────────────────────────────────────────────────────────────────
class CorpsMemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = CorpsMemberProfile
        exclude = ['user']
        read_only_fields = ['created_at', 'updated_at']


# ─────────────────────────────────────────────────────────────────────────────
#  User Detail (read) + Update
# ─────────────────────────────────────────────────────────────────────────────
class UserDetailSerializer(serializers.ModelSerializer):
    profile = CorpsMemberProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'preferred_language', 'is_verified', 'date_joined', 'profile',
        ]
        read_only_fields = ['id', 'email', 'is_verified', 'date_joined', 'role']

    def get_full_name(self, obj):
        return obj.get_full_name()


# ─────────────────────────────────────────────────────────────────────────────
#  Password Change
# ─────────────────────────────────────────────────────────────────────────────
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value
