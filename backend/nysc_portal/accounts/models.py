"""
accounts/models.py
Custom User model + profile for NYSC corps members.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
from django.utils.translation import gettext_lazy as _


# ─────────────────────────────────────────────────────────────────────────────
#  Custom User Manager
# ─────────────────────────────────────────────────────────────────────────────
class UserManager(BaseUserManager):
    """Manager that uses email as the unique identifier instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('Email address is required.'))
        email = self.normalize_email(email)
        extra_fields.setdefault('is_active', True)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


# ─────────────────────────────────────────────────────────────────────────────
#  Custom User Model
# ─────────────────────────────────────────────────────────────────────────────
class User(AbstractBaseUser, PermissionsMixin):
    """
    Extended user model for NYSC Portal.
    Identifies users by email rather than username.
    """

    class Role(models.TextChoices):
        CORPS_MEMBER   = 'corps_member',   _('Corps Member')
        ADMIN          = 'admin',          _('Admin')
        STATE_DIRECTOR = 'state_director', _('State Director')

    # ── Core fields ──────────────────────────────────────────
    email      = models.EmailField(_('email address'), unique=True, db_index=True)
    first_name = models.CharField(_('first name'), max_length=100)
    last_name  = models.CharField(_('last name'),  max_length=100)
    role       = models.CharField(
        max_length=20, choices=Role.choices, default=Role.CORPS_MEMBER
    )

    # ── Status flags ─────────────────────────────────────────
    is_active       = models.BooleanField(default=True)
    is_staff        = models.BooleanField(default=False)
    is_verified     = models.BooleanField(default=False)   # email verified

    # ── Timestamps ───────────────────────────────────────────
    date_joined = models.DateTimeField(default=timezone.now)
    last_login  = models.DateTimeField(null=True, blank=True)

    # ── Preferred language ───────────────────────────────────
    class Language(models.TextChoices):
        ENGLISH = 'en', _('English')
        YORUBA  = 'yo', _('Yoruba')
        HAUSA   = 'ha', _('Hausa')

    preferred_language = models.CharField(
        max_length=2, choices=Language.choices, default=Language.ENGLISH
    )

    objects  = UserManager()
    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    class Meta:
        verbose_name        = _('user')
        verbose_name_plural = _('users')
        ordering            = ['-date_joined']

    def __str__(self):
        return f'{self.get_full_name()} <{self.email}>'

    def get_full_name(self):
        return f'{self.first_name} {self.last_name}'.strip()

    def get_short_name(self):
        return self.first_name

    @property
    def is_corps_member(self):
        return self.role == self.Role.CORPS_MEMBER


# ─────────────────────────────────────────────────────────────────────────────
#  Corps Member Profile (extends User 1-to-1)
# ─────────────────────────────────────────────────────────────────────────────
class CorpsMemberProfile(models.Model):
    """Detailed NYSC-specific profile attached to each corps member."""

    class BatchChoice(models.TextChoices):
        BATCH_A = 'A', 'Batch A'
        BATCH_B = 'B', 'Batch B'
        BATCH_C = 'C', 'Batch C'

    class ServiceStatus(models.TextChoices):
        PRE_CAMP      = 'pre_camp',      'Pre-Camp'
        ORIENTATION   = 'orientation',   'Orientation Camp'
        PPA           = 'ppa',           'Place of Primary Assignment'
        CDS           = 'cds',           'Community Development Service'
        COMPLETING    = 'completing',     'Completing'
        DISCHARGED    = 'discharged',    'Discharged'

    NIGERIAN_STATES = [
        ('AB', 'Abia'), ('AD', 'Adamawa'), ('AK', 'Akwa Ibom'), ('AN', 'Anambra'),
        ('BA', 'Bauchi'), ('BY', 'Bayelsa'), ('BE', 'Benue'), ('BO', 'Borno'),
        ('CR', 'Cross River'), ('DE', 'Delta'), ('EB', 'Ebonyi'), ('ED', 'Edo'),
        ('EK', 'Ekiti'), ('EN', 'Enugu'), ('GO', 'Gombe'), ('IM', 'Imo'),
        ('JI', 'Jigawa'), ('KD', 'Kaduna'), ('KN', 'Kano'), ('KT', 'Katsina'),
        ('KE', 'Kebbi'), ('KO', 'Kogi'), ('KW', 'Kwara'), ('LA', 'Lagos'),
        ('NA', 'Nasarawa'), ('NI', 'Niger'), ('OG', 'Ogun'), ('ON', 'Ondo'),
        ('OS', 'Osun'), ('OY', 'Oyo'), ('PL', 'Plateau'), ('RI', 'Rivers'),
        ('SO', 'Sokoto'), ('TA', 'Taraba'), ('YO', 'Yobe'), ('ZA', 'Zamfara'),
        ('FC', 'FCT – Abuja'),
    ]

    user             = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    state_code       = models.CharField(max_length=20, blank=True)  # e.g. LA/2025A/0001
    phone_number     = models.CharField(max_length=20, blank=True)
    date_of_birth    = models.DateField(null=True, blank=True)
    gender           = models.CharField(
        max_length=1, choices=[('M', 'Male'), ('F', 'Female')], blank=True
    )
    profile_picture  = models.ImageField(upload_to='profiles/', null=True, blank=True)

    # NYSC specifics
    batch             = models.CharField(max_length=1, choices=BatchChoice.choices, blank=True)
    service_year      = models.PositiveSmallIntegerField(null=True, blank=True)
    state_of_deployment = models.CharField(max_length=2, choices=NIGERIAN_STATES, blank=True)
    ppa_name          = models.CharField(max_length=255, blank=True)
    service_status    = models.CharField(
        max_length=20, choices=ServiceStatus.choices, default=ServiceStatus.PRE_CAMP
    )

    # Institution
    institution_name    = models.CharField(max_length=255, blank=True)
    course_of_study     = models.CharField(max_length=255, blank=True)
    graduation_year     = models.PositiveSmallIntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name        = 'Corps Member Profile'
        verbose_name_plural = 'Corps Member Profiles'

    def __str__(self):
        return f'Profile – {self.user.get_full_name()} ({self.state_code or "No state code"})'


# ─────────────────────────────────────────────────────────────────────────────
#  Email Verification Token
# ─────────────────────────────────────────────────────────────────────────────
class EmailVerificationToken(models.Model):
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_tokens')
    token      = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used    = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Email Verification Token'

    def __str__(self):
        return f'Token for {self.user.email}'
