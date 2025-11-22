import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import MultiplayerRoom


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room_group_name = f'game_{self.room_code}'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Send current room status
        room = await self.get_room()
        if room:
            await self.send(text_data=json.dumps({
                'type': 'room_status',
                'player1': room.player1,
                'player2': room.player2,
                'status': room.status
            }))
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        # Broadcast to room
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'game_message',
                'data': data
            }
        )
    
    async def game_message(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))
    
    @database_sync_to_async
    def get_room(self):
        try:
            return MultiplayerRoom.objects.get(room_code=self.room_code)
        except MultiplayerRoom.DoesNotExist:
            return None
