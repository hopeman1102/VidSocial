# Generated by Django 4.2.7 on 2023-12-15 10:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0027_helpandsupport_created_date_time'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='coinmanagement',
            name='bar_code_image',
        ),
        migrations.RemoveField(
            model_name='coinmanagement',
            name='check_out_url',
        ),
    ]