#!/bin/bash

# Run Django server
python manage.py runserver 0.0.0.0:8000 &

# Run Celery worker
celery -A vidsocial.celery worker --pool=solo -l info &

# Run Daphne
daphne -p 8001 --bind 0.0.0.0 vidsocial.asgi:application &
