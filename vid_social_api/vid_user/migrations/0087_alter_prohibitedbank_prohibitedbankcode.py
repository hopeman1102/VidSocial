# Generated by Django 4.2.7 on 2024-03-18 09:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0086_alter_userprofile_language'),
    ]

    operations = [
        migrations.AlterField(
            model_name='prohibitedbank',
            name='prohibitedbankcode',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
