from django.db import migrations
from django.contrib.auth.hashers import make_password

def seed_users(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    
    User.objects.get_or_create(
        username='reviewer_1',
        defaults={
            'email': 'reviewer@example.com',
            'role': 'reviewer',
            'password': make_password('EE003@27')
        }
    )
    
    User.objects.get_or_create(
        username='merchant_draft',
        defaults={
            'email': 'draft@example.com',
            'role': 'merchant',
            'password': make_password('EE003@27')
        }
    )
    
    User.objects.get_or_create(
        username='merchant_review',
        defaults={
            'email': 'review@example.com',
            'role': 'merchant',
            'password': make_password('EE003@27')
        }
    )

    User.objects.get_or_create(
        username='abhi78',
        defaults={
            'email': 'abhi78@example.com',
            'role': 'merchant',
            'password': make_password('EE003@27')
        }
    )

def remove_users(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    User.objects.filter(username__in=['reviewer_1', 'merchant_draft', 'merchant_review', 'abhi78']).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_users, reverse_code=remove_users),
    ]
