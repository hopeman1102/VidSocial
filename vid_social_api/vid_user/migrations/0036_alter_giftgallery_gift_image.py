# Generated by Django 4.2.7 on 2023-12-21 11:10

from django.db import migrations
import vid_user.models


class Migration(migrations.Migration):

    dependencies = [
        ('vid_user', '0035_alter_userprofile_device_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='giftgallery',
            name='gift_image',
            field=vid_user.models.LongTextField(blank=True, null=True),
        ),
    ]
