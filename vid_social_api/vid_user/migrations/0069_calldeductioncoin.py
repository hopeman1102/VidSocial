# Generated by Django 4.2.7 on 2024-02-01 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0068_giftmanagement_gifts_processed'),
    ]

    operations = [
        migrations.CreateModel(
            name='CallDeductionCoin',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('coin', models.CharField(blank=True, max_length=50, null=True)),
            ],
        ),
    ]
