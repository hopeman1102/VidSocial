from channels.generic.websocket import AsyncWebsocketConsumer
import json

class StatusUpdateConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "all_clients"
        self.room_group_name = "test_consumer_group"
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name,
        )
        await self.accept()
        await self.send(text_data=json.dumps({'message': "connected successfully"}))

    async def disconnect(self):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        await self.send(text_data=json.dumps({'message': "disconnected successfully"}))

    async def send_status_update(self, event):
        message = event['message']
        print("message", message)
        await self.send(text_data=json.dumps({'message': message}))
