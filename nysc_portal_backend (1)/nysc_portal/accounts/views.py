"""
accounts/views.py
Authentication and user profile API views.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .serializers import (
    CustomTokenObtainPairSerializer,
    UserRegistrationSerializer,
    UserDetailSerializer,
    CorpsMemberProfileSerializer,
    PasswordChangeSerializer,
)
from .models import CorpsMemberProfile

User = get_user_model()


# ─── Login (JWT) ──────────────────────────────────────────────
class LoginView(TokenObtainPairView):
    """
    POST /api/v1/auth/login/
    Returns access + refresh tokens plus user metadata.
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


# ─── Registration ─────────────────────────────────────────────
class RegisterView(generics.CreateAPIView):
    """
    POST /api/v1/auth/register/
    Creates a new user and profile.
    """
    serializer_class   = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Issue JWT tokens immediately on registration
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'message': 'Registration successful. Welcome to NYSC Portal!',
                'access':  str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserDetailSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


# ─── Logout ───────────────────────────────────────────────────
class LogoutView(APIView):
    """
    POST /api/v1/auth/logout/
    Blacklists the refresh token to invalidate the session.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


# ─── Current User ─────────────────────────────────────────────
class MeView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/v1/auth/me/  → return authenticated user data
    PATCH /api/v1/auth/me/ → update name / language preference
    """
    serializer_class   = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ─── Profile ──────────────────────────────────────────────────
class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET   /api/v1/auth/profile/
    PATCH /api/v1/auth/profile/
    """
    serializer_class   = CorpsMemberProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = CorpsMemberProfile.objects.get_or_create(user=self.request.user)
        return profile


# ─── Password Change ──────────────────────────────────────────
class PasswordChangeView(APIView):
    """POST /api/v1/auth/password/change/"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'})
