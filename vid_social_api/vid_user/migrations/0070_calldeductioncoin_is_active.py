# Generated by Django 4.2.7 on 2024-02-01 11:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0069_calldeductioncoin'),
    ]

    operations = [
        migrations.AddField(
            model_name='calldeductioncoin',
            name='is_active',
            field=models.BooleanField(default=True),
        ),
    ]