# Generated by Django 4.2.7 on 2023-11-28 09:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0002_alter_userprofile_options_alter_userprofile_managers_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
    ]
