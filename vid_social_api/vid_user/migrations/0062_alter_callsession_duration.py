# Generated by Django 4.2.7 on 2024-01-18 13:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0061_alter_requestcoinclaim_request_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='callsession',
            name='duration',
            field=models.IntegerField(default=0),
        ),
    ]