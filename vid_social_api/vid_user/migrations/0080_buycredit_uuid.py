# Generated by Django 4.2.7 on 2024-02-26 10:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0079_callsession_user_call_count'),
    ]

    operations = [
        migrations.AddField(
            model_name='buycredit',
            name='uuid',
            field=models.CharField(choices=[('pending', 'Pending'), ('timeout', 'Timeout'), ('success', 'Success'), ('failed', 'Failed')], default='pending', max_length=500),
        ),
    ]
