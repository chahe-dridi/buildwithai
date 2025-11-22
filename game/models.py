from django.db import models
from django.contrib.auth.models import User
import uuid


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    high_score = models.IntegerField(default=0)
    total_games_played = models.IntegerField(default=0)
    total_lines_cleared = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_profiles'

    def __str__(self):
        return f"{self.user.username} - High Score: {self.high_score}"


class GameSession(models.Model):
    session_id = models.CharField(max_length=36, unique=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=50, default='Anonymous')
    score = models.IntegerField(default=0)
    level = models.IntegerField(default=1)
    lines_cleared = models.IntegerField(default=0)
    mode = models.CharField(max_length=20, choices=[
        ('single', 'Single Player'),
        ('multiplayer', 'Multiplayer'),
    ], default='single')
    duration_seconds = models.IntegerField(default=0)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'game_sessions'
        ordering = ['-score', '-created_at']

    def __str__(self):
        return f"{self.username} - {self.score} pts"


class Leaderboard(models.Model):
    username = models.CharField(max_length=50)
    score = models.IntegerField()
    level = models.IntegerField()
    lines_cleared = models.IntegerField()
    mode = models.CharField(max_length=20)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'leaderboard'
        ordering = ['-score']
        indexes = [
            models.Index(fields=['-score', 'mode']),
        ]

    def __str__(self):
        return f"{self.username} - {self.score} pts ({self.mode})"


class MultiplayerRoom(models.Model):
    room_code = models.CharField(max_length=6, unique=True)
    player1 = models.CharField(max_length=50)
    player2 = models.CharField(max_length=50, null=True, blank=True)
    player1_ready = models.BooleanField(default=False)
    player2_ready = models.BooleanField(default=False)
    current_turn = models.CharField(max_length=50, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('waiting', 'Waiting'),
        ('active', 'Active'),
        ('finished', 'Finished'),
    ], default='waiting')
    winner = models.CharField(max_length=50, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'multiplayer_rooms'

    def __str__(self):
        return f"Room {self.room_code} - {self.status}"
