# Generated by Django 4.2.7 on 2023-12-12 08:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0019_favorite_is_active'),
    ]

    operations = [
        migrations.CreateModel(
            name='Temptable',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('json_data', models.TextField(blank=True, null=True)),
            ],
        ),
    ]