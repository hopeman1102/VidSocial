# Generated by Django 4.2.7 on 2024-03-01 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0085_alter_userprofile_language'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='language',
            field=models.CharField(default='en', max_length=150, null=True),
        ),
    ]
