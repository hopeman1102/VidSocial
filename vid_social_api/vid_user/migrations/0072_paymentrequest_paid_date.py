# Generated by Django 4.2.7 on 2024-02-01 13:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0071_requestcoinclaim_paid_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymentrequest',
            name='paid_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]