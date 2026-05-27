"""
nysc_content/models.py
Articles, FAQs, announcements, and state information.
"""

from django.db import models
from django.utils.text import slugify
from django.contrib.auth import get_user_model

User = get_user_model()

LANGUAGE_CHOICES = [('en', 'English'), ('yo', 'Yoruba'), ('ha', 'Hausa')]


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    slug        = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=50, blank=True)  # emoji or icon name
    order       = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['order', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Article(models.Model):
    """NYSC knowledge-base article (supports multilingual content)."""

    class Status(models.TextChoices):
        DRAFT     = 'draft',     'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED  = 'archived',  'Archived'

    category     = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                     null=True, related_name='articles')
    title        = models.CharField(max_length=255)
    slug         = models.SlugField(unique=True, blank=True)
    content      = models.TextField()
    summary      = models.TextField(max_length=500, blank=True)
    language     = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    status       = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    author       = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    views_count  = models.PositiveIntegerField(default=0)
    is_featured  = models.BooleanField(default=False)
    tags         = models.CharField(max_length=300, blank=True,
                                    help_text='Comma-separated tags')
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class FAQ(models.Model):
    """Frequently asked questions with multilingual support."""
    category  = models.ForeignKey(Category, on_delete=models.SET_NULL,
                                  null=True, blank=True, related_name='faqs')
    question  = models.CharField(max_length=500)
    answer    = models.TextField()
    language  = models.CharField(max_length=2, choices=LANGUAGE_CHOICES, default='en')
    order     = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = 'FAQ'

    def __str__(self):
        return self.question[:80]


class StateInformation(models.Model):
    """NYSC state-specific details for each of Nigeria's 36 states + FCT."""
    STATE_CODES = [
        ('AB','Abia'),('AD','Adamawa'),('AK','Akwa Ibom'),('AN','Anambra'),
        ('BA','Bauchi'),('BY','Bayelsa'),('BE','Benue'),('BO','Borno'),
        ('CR','Cross River'),('DE','Delta'),('EB','Ebonyi'),('ED','Edo'),
        ('EK','Ekiti'),('EN','Enugu'),('GO','Gombe'),('IM','Imo'),
        ('JI','Jigawa'),('KD','Kaduna'),('KN','Kano'),('KT','Katsina'),
        ('KE','Kebbi'),('KO','Kogi'),('KW','Kwara'),('LA','Lagos'),
        ('NA','Nasarawa'),('NI','Niger'),('OG','Ogun'),('ON','Ondo'),
        ('OS','Osun'),('OY','Oyo'),('PL','Plateau'),('RI','Rivers'),
        ('SO','Sokoto'),('TA','Taraba'),('YO','Yobe'),('ZA','Zamfara'),
        ('FC','FCT – Abuja'),
    ]

    state_code        = models.CharField(max_length=2, choices=STATE_CODES, unique=True)
    state_name        = models.CharField(max_length=100)
    secretariat_address = models.TextField(blank=True)
    orientation_camp  = models.CharField(max_length=255, blank=True)
    camp_address      = models.TextField(blank=True)
    coordinator_name  = models.CharField(max_length=200, blank=True)
    coordinator_phone = models.CharField(max_length=20, blank=True)
    coordinator_email = models.EmailField(blank=True)
    notes             = models.TextField(blank=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['state_name']
        verbose_name = 'State Information'

    def __str__(self):
        return f'{self.state_name} ({self.state_code})'


class Announcement(models.Model):
    """Portal-wide announcements and alerts."""

    class Priority(models.TextChoices):
        LOW    = 'low',    'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH   = 'high',   'High'
        URGENT = 'urgent', 'Urgent'

    title      = models.CharField(max_length=255)
    content    = models.TextField()
    priority   = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    is_active  = models.BooleanField(default=True)
    start_date = models.DateField(null=True, blank=True)
    end_date   = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'[{self.priority.upper()}] {self.title}'
