# # celery.py

# from __future__ import absolute_import, unicode_literals
# import os
# from celery import Celery

# # set the default Django settings module for the 'celery' program.
# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vid_social_api.settings')

# # create a Celery instance and configure it using the settings from Django
# app = Celery('vid_social_api')

# # Load task modules from all registered Django app configs.
# app.config_from_object('django.conf:settings', namespace='CELERY')

# # Auto-discover tasks in all installed apps
# app.autodiscover_tasks()


from __future__ import absolute_import, unicode_literals
import os

from celery import Celery
from django.conf import settings
from celery.schedules import crontab
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'vidsocial.settings')

app = Celery('vid_social_api')

app.config_from_object(settings, namespace='CELERY')

app.autodiscover_tasks(['vid_user','vid_worker'])