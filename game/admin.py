from django.contrib import admin
from .models import UserProfile, GameSession, Leaderboard, MultiplayerRoom


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'high_score', 'total_games_played', 'total_lines_cleared', 'created_at']
    search_fields = ['user__username']
    list_filter = ['created_at']
    readonly_fields = ['created_at']


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = ['username', 'score', 'level', 'lines_cleared', 'mode', 'completed', 'created_at']
    list_filter = ['mode', 'completed', 'created_at']
    search_fields = ['username', 'user__username']
    readonly_fields = ['session_id', 'created_at']
    ordering = ['-score', '-created_at']


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['username', 'score', 'level', 'lines_cleared', 'mode', 'timestamp']
    list_filter = ['mode', 'timestamp']
    search_fields = ['username']
    ordering = ['-score']


@admin.register(MultiplayerRoom)
class MultiplayerRoomAdmin(admin.ModelAdmin):
    list_display = ['room_code', 'player1', 'player2', 'status', 'winner', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['room_code', 'player1', 'player2']
    readonly_fields = ['created_at']
