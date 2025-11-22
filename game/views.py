from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.db.models import Q
from .models import GameSession, Leaderboard, MultiplayerRoom, UserProfile
import json
import random
import string


def home(request):
    # Get top 3 scores for today
    from django.utils import timezone
    from datetime import timedelta
    
    top_scores = Leaderboard.objects.filter(
        timestamp__gte=timezone.now() - timedelta(days=1),
        mode='single'
    ).order_by('-score')[:3]
    
    context = {
        'top_scores': top_scores
    }
    return render(request, 'game/home.html', context)


def play(request):
    return render(request, 'game/play.html')


@require_http_methods(['POST'])
def save_score(request):
    try:
        data = json.loads(request.body)
        username = request.user.username if request.user.is_authenticated else 'Anonymous'
        
        # Create game session
        session = GameSession.objects.create(
            user=request.user if request.user.is_authenticated else None,
            username=username,
            score=data.get('score', 0),
            level=data.get('level', 1),
            lines_cleared=data.get('lines_cleared', 0),
            mode=data.get('mode', 'single'),
            completed=True
        )
        
        # Update leaderboard
        Leaderboard.objects.create(
            username=username,
            score=data['score'],
            level=data['level'],
            lines_cleared=data['lines_cleared'],
            mode=data.get('mode', 'single')
        )
        
        # Update user profile if authenticated
        if request.user.is_authenticated:
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            profile.total_games_played += 1
            profile.total_lines_cleared += data['lines_cleared']
            if data['score'] > profile.high_score:
                profile.high_score = data['score']
            profile.save()
        
        return JsonResponse({'success': True, 'session_id': str(session.session_id)})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


def leaderboard(request):
    mode = request.GET.get('mode', 'single')
    period = request.GET.get('period', 'all')
    
    queryset = Leaderboard.objects.filter(mode=mode)
    
    if period == 'daily':
        from django.utils import timezone
        from datetime import timedelta
        queryset = queryset.filter(timestamp__gte=timezone.now() - timedelta(days=1))
    elif period == 'weekly':
        from django.utils import timezone
        from datetime import timedelta
        queryset = queryset.filter(timestamp__gte=timezone.now() - timedelta(weeks=1))
    
    top_scores = queryset.order_by('-score')[:50]
    
    context = {
        'scores': top_scores,
        'mode': mode,
        'period': period
    }
    return render(request, 'game/leaderboard.html', context)


def multiplayer(request):
    return render(request, 'game/multiplayer.html')


def create_room(request):
    room_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    username = request.user.username if request.user.is_authenticated else f"Player{random.randint(1000, 9999)}"
    
    room = MultiplayerRoom.objects.create(
        room_code=room_code,
        player1=username
    )
    
    # Check if it's an AJAX request
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'room_code': room_code,
            'player1': username
        })
    
    return redirect('game:game_room', room_code=room_code)


def join_room(request, room_code):
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code, status='waiting')
        username = request.user.username if request.user.is_authenticated else f"Player{random.randint(1000, 9999)}"
        
        if not room.player2:
            room.player2 = username
            room.status = 'active'
            room.save()
        
        return redirect('game:game_room', room_code=room_code)
    except MultiplayerRoom.DoesNotExist:
        return redirect('game:multiplayer')


def game_room(request, room_code):
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        username = request.user.username if request.user.is_authenticated else request.session.get('username', 'Anonymous')
        
        context = {
            'room': room,
            'room_code': room_code,
            'username': username
        }
        return render(request, 'game/game_room.html', context)
    except MultiplayerRoom.DoesNotExist:
        return redirect('game:multiplayer')
