class MultiplayerTetrisGame extends TetrisGame {
    constructor(canvasId, websocket, isPlayer1) {
        super(canvasId);
        this.ws = websocket;
        this.isPlayer1 = isPlayer1;
        this.opponentBoard = null;
    }
    
    // Override lockPiece to send garbage lines
    lockPiece() {
        const shape = this.currentPiece.shape[this.currentPiece.rotation];
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.currentPiece.y + y;
                    const boardX = this.currentPiece.x + x;
                    if (boardY >= 0) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
        
        soundManager.playSound('lock');
        
        const linesCleared = this.countCompletedLines();
        this.clearLines();
        
        // Send garbage to opponent if multiple lines cleared
        if (linesCleared >= 2) {
            this.sendGarbage(linesCleared);
        }
        
        // Send game state to opponent
        this.sendGameState();
        
        this.spawnPiece();
        this.updateUI();
    }
    
    countCompletedLines() {
        let count = 0;
        for (let y = this.board.length - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                count++;
            }
        }
        return count;
    }
    
    sendGarbage(linesCleared) {
        const garbageLines = {
            2: 1,  // Double
            3: 2,  // Triple
            4: 4   // Tetris
        }[linesCleared] || 0;
        
        if (garbageLines > 0 && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'garbage_lines',
                lines: garbageLines,
                sender: this.isPlayer1 ? 'player1' : 'player2'
            }));
        }
    }
    
    receiveGarbage(lines) {
        // Add incomplete garbage lines to bottom of board
        for (let i = 0; i < lines; i++) {
            // Remove top row
            this.board.shift();
            
            // Create garbage line with one random empty space
            const garbageLine = Array(10).fill('#666666');
            const emptyCol = Math.floor(Math.random() * 10);
            garbageLine[emptyCol] = 0;
            
            // Add to bottom
            this.board.push(garbageLine);
        }
        
        this.render();
    }
    
    sendGameState() {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'game_state',
                sender: this.isPlayer1 ? 'player1' : 'player2',
                board: this.board,
                score: this.score,
                level: this.level,
                lines: this.linesCleared
            }));
        }
    }
    
    // Override endGame for multiplayer
    endGame() {
        soundManager.playSound('gameOver');
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'game_over',
                loser: this.isPlayer1 ? 'player1' : 'player2',
                winner: this.isPlayer1 ? 'player2' : 'player1'
            }));
        }
        
        // Save score
        fetch('/game/save-score/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({
                score: this.score,
                level: this.level,
                lines_cleared: this.linesCleared,
                mode: 'multiplayer'
            })
        }).catch(err => {
            console.error('Error saving score:', err);
        });
    }
}

// Opponent Board Renderer
class OpponentBoardRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.blockSize = 30;
        this.board = this.createBoard(10, 20);
    }
    
    createBoard(width, height) {
        return Array(height).fill().map(() => Array(width).fill(0));
    }
    
    updateBoard(boardData) {
        this.board = boardData;
        this.render();
    }
    
    render() {
        if (!this.canvas) return;
        
        // Clear canvas
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.strokeStyle = '#333';
        for (let x = 0; x <= 10; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.blockSize, 0);
            this.ctx.lineTo(x * this.blockSize, 600);
            this.ctx.stroke();
        }
        for (let y = 0; y <= 20; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.blockSize);
            this.ctx.lineTo(300, y * this.blockSize);
            this.ctx.stroke();
        }
        
        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell) {
                    this.ctx.fillStyle = cell;
                    this.ctx.fillRect(
                        x * this.blockSize + 1,
                        y * this.blockSize + 1,
                        this.blockSize - 2,
                        this.blockSize - 2
                    );
                }
            });
        });
    }
}
