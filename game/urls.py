from django.urls import path
from . import views, api_views

app_name = 'game'

urlpatterns = [
    path('', views.home, name='home'),
    path('play/', views.play, name='play'),
    path('game/save-score/', views.save_score, name='save_score'),
    path('leaderboard/', views.leaderboard, name='leaderboard'),
    path('multiplayer/', views.multiplayer, name='multiplayer'),
    path('multiplayer/create/', views.create_room, name='create_room'),
    path('multiplayer/join/<str:room_code>/', views.join_room, name='join_room'),
    path('multiplayer/room/<str:room_code>/', views.game_room, name='game_room'),
    path('multiplayer/spectate/<str:room_code>/', views.spectate_room, name='spectate_room'),
    
    # API endpoints for polling-based multiplayer
    path('api/room/<str:room_code>/status/', api_views.room_status, name='room_status'),
    path('api/room/<str:room_code>/update/', api_views.update_game_state, name='update_game_state'),
    path('api/room/<str:room_code>/ready/', api_views.player_ready, name='player_ready'),
    
    # Power-ups API
    path('api/room/<str:room_code>/powerups/', api_views.get_powerups, name='get_powerups'),
    path('api/room/<str:room_code>/powerups/earn/', api_views.earn_powerup, name='earn_powerup'),
    path('api/room/<str:room_code>/powerups/use/', api_views.use_powerup, name='use_powerup'),
    
    # Spectator API
    path('api/room/<str:room_code>/spectate/', api_views.join_spectator, name='join_spectator'),
    path('api/room/<str:room_code>/spectators/', api_views.get_spectators, name='get_spectators'),
    path('api/room/<str:room_code>/spectator/state/', api_views.spectator_game_state, name='spectator_game_state'),
]
