"""
API views for multiplayer game polling
"""
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json
import random
from .models import MultiplayerRoom, GameSession, PowerUp


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


# ============================================
# POWER-UPS API
# ============================================

@login_required
@require_http_methods(["GET"])
def get_powerups(request, room_code):
    """Get player's available power-ups"""
    try:
        username = request.user.username
        powerups = PowerUp.objects.filter(
            room_code=room_code,
            player=username,
            used=False
        )
        
        powerups_data = [{
            'id': p.id,
            'type': p.power_type,
            'display_name': p.get_power_type_display(),
            'earned_at': p.earned_at.isoformat()
        } for p in powerups]
        
        return JsonResponse({'powerups': powerups_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def earn_powerup(request, room_code):
    """Award a random power-up to player (called after clearing lines)"""
    try:
        data = json.loads(request.body)
        username = request.user.username
        lines_cleared = data.get('lines_cleared', 0)
        
        # Award power-up every 10 lines
        if lines_cleared > 0 and lines_cleared % 10 == 0:
            # Random power-up
            power_types = ['time_freeze', 'line_blaster', 'color_bomb', 
                          'gravity_reverse', 'piece_transformer', 'shadow_clone']
            power_type = random.choice(power_types)
            
            powerup = PowerUp.objects.create(
                room_code=room_code,
                player=username,
                power_type=power_type
            )
            
            return JsonResponse({
                'success': True,
                'earned': True,
                'powerup': {
                    'id': powerup.id,
                    'type': powerup.power_type,
                    'display_name': powerup.get_power_type_display()
                }
            })
        
        return JsonResponse({'success': True, 'earned': False})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
@csrf_exempt
@require_http_methods(["POST"])
def use_powerup(request, room_code):
    """Use a power-up"""
    try:
        data = json.loads(request.body)
        powerup_id = data.get('powerup_id')
        username = request.user.username
        
        powerup = PowerUp.objects.get(
            id=powerup_id,
            room_code=room_code,
            player=username,
            used=False
        )
        
        # Mark as used
        powerup.used = True
        powerup.used_at = timezone.now()
        powerup.save()
        
        return JsonResponse({
            'success': True,
            'type': powerup.power_type,
            'display_name': powerup.get_power_type_display()
        })
    except PowerUp.DoesNotExist:
        return JsonResponse({'error': 'Power-up not found or already used'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# ============================================
# SPECTATOR API
# ============================================

@login_required
@csrf_exempt
@require_http_methods(["POST"])
def join_spectator(request, room_code):
    """Join room as spectator"""
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        
        if not room.allow_spectators:
            return JsonResponse({'error': 'Spectators not allowed'}, status=403)
        
        username = request.user.username
        
        # Check if user is a player
        if username in [room.player1, room.player2]:
            return JsonResponse({'error': 'You are a player, not a spectator'}, status=400)
        
        # Add to spectators list if not already there
        if username not in room.spectators:
            room.spectators.append(username)
            room.save()
        
        return JsonResponse({
            'success': True,
            'spectator_count': len(room.spectators)
        })
    except MultiplayerRoom.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@login_required
@require_http_methods(["GET"])
def get_spectators(request, room_code):
    """Get list of spectators"""
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        
        return JsonResponse({
            'spectators': room.spectators,
            'count': len(room.spectators),
            'allowed': room.allow_spectators
        })
    except MultiplayerRoom.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)


@login_required
@require_http_methods(["GET"])
def spectator_game_state(request, room_code):
    """Get full game state for spectators"""
    try:
        room = MultiplayerRoom.objects.get(room_code=room_code)
        username = request.user.username
        
        # Verify user is a spectator
        if username not in room.spectators:
            return JsonResponse({'error': 'Not a spectator'}, status=403)
        
        # Get both players' states
        player1_state = request.session.get(f'room_{room_code}_player1_state', {})
        player2_state = request.session.get(f'room_{room_code}_player2_state', {})
        
        return JsonResponse({
            'room_code': room.room_code,
            'status': room.status,
            'player1': room.player1,
            'player2': room.player2,
            'player1_state': player1_state,
            'player2_state': player2_state,
            'winner': room.winner,
            'spectator_count': len(room.spectators)
        })
    except MultiplayerRoom.DoesNotExist:
        return JsonResponse({'error': 'Room not found'}, status=404)
