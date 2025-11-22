# 🎮 Power-ups & Spectator Mode Implementation Plan

## ✅ Completed
1. Database models created (PowerUp model + spectator fields)
2. Migrations applied

## 🚧 To Implement

### Phase 1: Power-ups System (Backend)
- [ ] API endpoints for power-ups
  - GET `/api/room/{code}/powerups/` - Get player's available power-ups
  - POST `/api/room/{code}/powerups/earn/` - Earn power-up (after X lines cleared)
  - POST `/api/room/{code}/powerups/use/` - Use a power-up
  
### Phase 2: Power-ups System (Frontend - Game Logic)
- [ ] Power-up earning system (earn after every 10 lines cleared)
- [ ] Power-up icons & UI display
- [ ] 6 Power-up implementations:
  1. **Time Freeze** ⏸️ - Stop piece descent for 5 seconds
  2. **Line Blaster** 💥 - Clear random line instantly
  3. **Color Bomb** 🎨 - Remove all blocks of one color
  4. **Gravity Reverse** ⬆️ - Pieces float up for 10 seconds
  5. **Piece Transformer** 🔄 - Change current piece shape
  6. **Shadow Clone** 👥 - Duplicate piece to place separately

### Phase 3: Spectator Mode (Backend)
- [ ] API endpoints:
  - POST `/api/room/{code}/spectate/` - Join as spectator
  - GET `/api/room/{code}/spectators/` - Get spectator list
  
### Phase 4: Spectator Mode (Frontend)
- [ ] Spectator join button on multiplayer page
- [ ] Spectator view template (watch-only mode)
- [ ] Real-time updates for spectators
- [ ] Show both players' boards side-by-side
- [ ] Spectator list display
- [ ] Spectator chat (optional)

## 🎯 Features
- Power-ups earned every 10 lines cleared
- Keyboard shortcuts (1-6) to activate power-ups
- Visual effects for each power-up
- Spectators can join with room code
- Spectators see both players in real-time
- Spectator count visible to players

