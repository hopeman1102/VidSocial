# Generated by Django 4.2.7 on 2023-11-30 07:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0007_paymentrequest_sponser_bank_acc_id_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userprofile',
            name='first_name',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='gender',
            field=models.CharField(choices=[('male', 'Male'), ('female', 'Female')], default='male', max_length=6),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='last_name',
            field=models.CharField(blank=True, max_length=150, null=True),
        ),
    ]