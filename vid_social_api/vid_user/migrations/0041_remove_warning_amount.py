# Generated by Django 4.2.7 on 2023-12-29 07:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0040_warning_amount'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='warning',
            name='amount',
        ),
    ]
