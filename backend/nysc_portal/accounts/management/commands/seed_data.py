"""
Management command: python manage.py seed_data
Populates the database with sample NYSC content for development.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from nysc_content.models import Category, Article, FAQ, StateInformation, Announcement

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample NYSC data for development'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING('Seeding NYSC Portal database…'))

        # ── Super user ─────────────────────────────────────────
        if not User.objects.filter(email='admin@nyscportal.ng').exists():
            User.objects.create_superuser(
                email='admin@nyscportal.ng',
                password='Admin@1234',
                first_name='Admin',
                last_name='User',
            )
            self.stdout.write(self.style.SUCCESS('✓ Superuser created: admin@nyscportal.ng / Admin@1234'))

        # ── Sample corps member ────────────────────────────────
        if not User.objects.filter(email='corps@example.com').exists():
            user = User.objects.create_user(
                email='corps@example.com',
                password='Corps@1234',
                first_name='Amaka',
                last_name='Okonkwo',
            )
            profile = user.profile
            profile.state_code = 'LA/2025A/0001'
            profile.batch = 'A'
            profile.service_year = 2025
            profile.state_of_deployment = 'LA'
            profile.ppa_name = 'Lagos State Ministry of Education'
            profile.save()
            self.stdout.write(self.style.SUCCESS('✓ Sample corps member created: corps@example.com / Corps@1234'))

        # ── Categories ─────────────────────────────────────────
        categories_data = [
            ('Registration', '📋', 'NYSC registration and call-up letter information'),
            ('Camp Life',    '🏕️', 'Orientation camp preparation and tips'),
            ('Allowances',   '💰', 'Financial information and payment details'),
            ('Redeployment', '📍', 'Posting, relocation and redeployment process'),
            ('CDS',          '🤝', 'Community Development Service information'),
            ('Exemption',    '📄', 'NYSC exemption application process'),
        ]
        for name, icon, desc in categories_data:
            Category.objects.get_or_create(name=name, defaults={'icon': icon, 'description': desc})
        self.stdout.write(self.style.SUCCESS(f'✓ {len(categories_data)} categories created'))

        # ── FAQs ───────────────────────────────────────────────
        reg_cat = Category.objects.get(name='Registration')
        faqs = [
            ('How do I register for NYSC?',
             'Visit portal.nysc.org.ng and follow the online registration steps. '
             'Your institution must first complete your NYSC clearance.', 'en'),
            ('When is NYSC registration open?',
             'Registration is opened by NYSC after your institution submits your details. '
             'Check the NYSC portal for current batch dates.', 'en'),
            ('Bawo ni mo ṣe le forúkọ sílẹ̀ fún NYSC?',
             'Ẹ lọ sí portal.nysc.org.ng kí ẹ sì tẹ̀lé àwọn ìtọ́sọ́nà náà.', 'yo'),
            ('Yaya zan yi rajista ta NYSC?',
             'Ziyarci portal.nysc.org.ng ka bi umarnin da aka bayar.', 'ha'),
        ]
        for q, a, lang in faqs:
            FAQ.objects.get_or_create(question=q, defaults={'answer': a, 'language': lang, 'category': reg_cat})
        self.stdout.write(self.style.SUCCESS(f'✓ {len(faqs)} FAQs created'))

        # ── State information ──────────────────────────────────
        states = [
            ('LA', 'Lagos', 'NYSC Lagos State Secretariat, Alausa Ikeja', 'Iyana Ipaja Orientation Camp'),
            ('AB', 'Abia', 'NYSC Abia State Secretariat, Umuahia', 'Umunna Orientation Camp'),
            ('KN', 'Kano', 'NYSC Kano State Secretariat, Kano', 'Kusalla Orientation Camp'),
            ('FC', 'FCT – Abuja', 'NYSC FCT Secretariat, Wuse, Abuja', 'Kubwa Orientation Camp'),
            ('RI', 'Rivers', 'NYSC Rivers State Secretariat, Port Harcourt', 'Nonwa-Gbam Orientation Camp'),
        ]
        for code, name, addr, camp in states:
            StateInformation.objects.get_or_create(state_code=code, defaults={
                'state_name': name,
                'secretariat_address': addr,
                'orientation_camp': camp,
            })
        self.stdout.write(self.style.SUCCESS(f'✓ {len(states)} states seeded'))

        # ── Announcement ───────────────────────────────────────
        Announcement.objects.get_or_create(
            title='Welcome to NYSC AI Portal',
            defaults={
                'content': 'The enhanced NYSC AI Portal is now live. Get instant answers to all your NYSC questions powered by artificial intelligence.',
                'priority': 'high',
                'is_active': True,
            }
        )
        self.stdout.write(self.style.SUCCESS('✓ Welcome announcement created'))
        self.stdout.write(self.style.SUCCESS('\n🎉 Database seeding complete!'))
