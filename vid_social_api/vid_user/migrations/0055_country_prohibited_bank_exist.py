# Generated by Django 4.2.7 on 2024-01-04 06:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0054_remove_prohibitedbank_prohibited_bank_exist'),
    ]

    operations = [
        migrations.AddField(
            model_name='country',
            name='prohibited_bank_exist',
            field=models.BooleanField(default=False),
        ),
    ]