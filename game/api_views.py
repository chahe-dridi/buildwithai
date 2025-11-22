"""
API views for multiplayer game polling
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
import json
from .models import MultiplayerRoom, GameSession


@login_required
@require_http_methods(["GET"])
def room_status(request, room_code):
    """Get current room status"""
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        
        # Get player states from cache/session
        player1_state = request.session.get(f'room_{room_code}_player1_state', {})
        player2_state = request.session.get(f'room_{room_code}_player2_state', {})
        
        return JsonResponse({
            'status': room.status,
            'player1': room.player1,
            'player2': room.player2,
            'player1_ready': room.player1_ready,
            'player2_ready': room.player2_ready,
            'current_turn': room.current_turn,
            'player1_state': player1_state,
            'player2_state': player2_state
        })
    except MultiplayerRoom.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def update_game_state(request, room_code):
    """Update player's game state"""
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        data = json.loads(request.body)
        
        username = request.user.username
        
        # Store game state in session based on which player you are
        state_data = {
            'score': data.get('score', 0),
            'level': data.get('level', 1),
            'lines': data.get('lines', 0),
            'board': data.get('board', []),
            'gameOver': data.get('gameOver', False)
        }
        
        if room.player1 == username:
            request.session[f'room_{room_code}_player1_state'] = state_data
        elif room.player2 == username:
            request.session[f'room_{room_code}_player2_state'] = state_data
        
        request.session.modified = True
        
        return JsonResponse({'success': True})
    except MultiplayerRoom.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def player_ready(request, room_code):
    """Mark player as ready"""
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        username = request.user.username
        
        if room.player1 == username:
            room.player1_ready = True
        elif room.player2 == username:
            room.player2_ready = True
        
        # Start game if both players are ready
        if room.player1_ready and room.player2_ready and room.status == 'waiting':
            room.status = 'active'
        
        room.save()
        
        return JsonResponse({
            'success': True,
            'status': room.status,
            'both_ready': room.player1_ready and room.player2_ready
        })
    except MultiplayerRoom.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)
