# Generated by Django 4.2.7 on 2024-01-04 06:16

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0053_prohibitedbank_prohibited_bank_exist'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='prohibitedbank',
            name='prohibited_bank_exist',
        ),
    ]