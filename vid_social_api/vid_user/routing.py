from django.urls import path
from vid_user import consumers

websocket_urlpatterns = [
    path('ws/status_update/', consumers.StatusUpdateConsumer.as_asgi()),
]
