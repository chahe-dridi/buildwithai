class TetrisGame {
    constructor(canvasId, controlScheme = 'arrows') {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 300;  // 10 blocks * 30px
        this.canvas.height = 600; // 20 blocks * 30px
        this.blockSize = 30;
        
        // Control scheme
        this.controlScheme = controlScheme; // 'arrows' or 'zqsd'
        
        // Game state
        this.board = this.createBoard(10, 20);
        this.currentPiece = null;
        this.nextPieces = [];
        this.heldPiece = null;
        this.canHold = true;
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.gameOver = false;
        this.isPaused = false;
        
        // Timing
        this.dropInterval = 1000; // 1 second
        this.lastDropTime = 0;
        
        // Initialize
        this.generateNextPieces(3);
        this.spawnPiece();
        this.setupControls();
    }
    
    createBoard(width, height) {
        return Array(height).fill().map(() => Array(width).fill(0));
    }
    
    generateNextPieces(count) {
        for (let i = 0; i < count; i++) {
            this.nextPieces.push(getRandomTetromino());
        }
    }
    
    spawnPiece() {
        this.currentPiece = this.nextPieces.shift();
        this.generateNextPieces(1);
        this.canHold = true; // Reset hold ability
        
        // Check if game over
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver = true;
            this.endGame();
        }
    }
    
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        const shape = piece.shape[piece.rotation];
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const newX = piece.x + x + offsetX;
                    const newY = piece.y + y + offsetY;
                    
                    if (newX < 0 || newX >= 10 || newY >= 20) return true;
                    if (newY >= 0 && this.board[newY][newX]) return true;
                }
            }
        }
        return false;
    }
    
    movePiece(direction) {
        if (this.gameOver || this.isPaused) return;
        
        const offsets = { left: -1, right: 1, down: 0 };
        const offsetX = offsets[direction] || 0;
        const offsetY = direction === 'down' ? 1 : 0;
        
        if (!this.checkCollision(this.currentPiece, offsetX, offsetY)) {
            this.currentPiece.x += offsetX;
            this.currentPiece.y += offsetY;
            
            if (direction === 'down') {
                this.score += 1; // Soft drop points
            }
            
            soundManager.playSound('move');
        } else if (direction === 'down') {
            this.lockPiece();
        }
    }
    
    rotatePiece() {
        if (this.gameOver || this.isPaused) return;
        
        const newRotation = (this.currentPiece.rotation + 1) % this.currentPiece.shape.length;
        const oldRotation = this.currentPiece.rotation;
        this.currentPiece.rotation = newRotation;
        
        if (this.checkCollision(this.currentPiece)) {
            this.currentPiece.rotation = oldRotation;
        } else {
            soundManager.playSound('rotate');
        }
    }
    
    rotatePieceCounterClockwise() {
        if (this.gameOver || this.isPaused) return;
        
        const newRotation = this.currentPiece.rotation - 1;
        const oldRotation = this.currentPiece.rotation;
        this.currentPiece.rotation = newRotation < 0 
            ? this.currentPiece.shape.length - 1 
            : newRotation;
        
        if (this.checkCollision(this.currentPiece)) {
            this.currentPiece.rotation = oldRotation;
        } else {
            soundManager.playSound('rotate');
        }
    }
    
    hardDrop() {
        if (this.gameOver || this.isPaused) return;
        
        let dropDistance = 0;
        while (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
            dropDistance++;
        }
        this.score += dropDistance * 2;
        this.lockPiece();
    }
    
    holdPiece() {
        if (!this.canHold || this.gameOver || this.isPaused) return;
        
        if (this.heldPiece === null) {
            // First hold
            this.heldPiece = this.currentPiece;
            this.spawnPiece();
        } else {
            // Swap with held piece
            const temp = this.currentPiece;
            this.currentPiece = this.heldPiece;
            this.currentPiece.x = 3;
            this.currentPiece.y = 0;
            this.currentPiece.rotation = 0;
            this.heldPiece = temp;
        }
        
        this.canHold = false;
        this.renderHeldPiece();
        this.render();
        soundManager.playSound('move');
    }
    
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
        this.clearLines();
        this.spawnPiece();
        this.updateUI();
    }
    
    clearLines() {
        let linesToClear = [];
        
        // Find complete lines
        for (let y = this.board.length - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                linesToClear.push(y);
            }
        }
        
        if (linesToClear.length > 0) {
            // Play sound
            if (linesToClear.length === 4) {
                soundManager.playSound('tetris');
            } else {
                soundManager.playSound('clear');
            }
            
            // Animate line clear
            this.animateLineClear(linesToClear, () => {
                // Remove lines after animation
                linesToClear.forEach(lineY => {
                    this.board.splice(lineY, 1);
                    this.board.unshift(Array(10).fill(0));
                });
                
                this.linesCleared += linesToClear.length;
                this.updateScore(linesToClear.length);
                this.updateLevel();
            });
        }
    }
    
    animateLineClear(lines, callback) {
        let flash = 0;
        const maxFlash = 6;
        
        const flashInterval = setInterval(() => {
            lines.forEach(y => {
                this.board[y] = this.board[y].map(cell => 
                    flash % 2 === 0 ? '#ffffff' : cell
                );
            });
            
            this.render();
            flash++;
            
            if (flash >= maxFlash) {
                clearInterval(flashInterval);
                callback();
            }
        }, 50);
    }
    
    updateScore(linesCleared) {
        const scores = [0, 100, 300, 500, 800];
        this.score += scores[linesCleared] * this.level;
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.linesCleared / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level * 50));
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            // ZQSD Control Scheme (French AZERTY)
            if (this.controlScheme === 'zqsd') {
                switch(e.key.toLowerCase()) {
                    case 'q': // Left
                        e.preventDefault();
                        this.movePiece('left');
                        break;
                    case 'd': // Right
                        e.preventDefault();
                        this.movePiece('right');
                        break;
                    case 's': // Down
                        e.preventDefault();
                        this.movePiece('down');
                        break;
                    case 'z': // Rotate
                        e.preventDefault();
                        this.rotatePiece();
                        break;
                    case ' ': // Hard Drop
                        e.preventDefault();
                        this.hardDrop();
                        break;
                    case 'p': // Pause
                        this.togglePause();
                        break;
                    case 'c': // Hold
                        this.holdPiece();
                        break;
                    case 'a': // Counter-clockwise rotation
                        this.rotatePieceCounterClockwise();
                        break;
                }
            } 
            // Arrow Keys Control Scheme (Default)
            else {
                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.movePiece('left');
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.movePiece('right');
                        break;
                    case 'ArrowDown':
                        e.preventDefault();
                        this.movePiece('down');
                        break;
                    case 'ArrowUp':
                        e.preventDefault();
                        this.rotatePiece();
                        break;
                    case ' ':
                        e.preventDefault();
                        this.hardDrop();
                        break;
                    case 'p':
                    case 'P':
                        this.togglePause();
                        break;
                    case 'c':
                    case 'C':
                        this.holdPiece();
                        break;
                    case 'z':
                    case 'Z':
                        this.rotatePieceCounterClockwise();
                        break;
                }
            }
            this.render();
        });
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const overlay = document.getElementById('pauseOverlay');
        if (overlay) {
            overlay.classList.toggle('hidden');
        }
    }
    
    updateUI() {
        const scoreEl = document.getElementById('score');
        const levelEl = document.getElementById('level');
        const linesEl = document.getElementById('lines');
        
        if (scoreEl) scoreEl.textContent = this.score;
        if (levelEl) levelEl.textContent = this.level;
        if (linesEl) linesEl.textContent = this.linesCleared;
        
        this.renderNextPieces();
        this.renderHeldPiece();
    }
    
    renderNextPieces() {
        const canvas = document.getElementById('nextPieceCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.nextPieces.slice(0, 3).forEach((piece, index) => {
            const shape = piece.shape[0];
            const offsetY = index * 80;
            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillStyle = piece.color;
                        ctx.fillRect(x * 20 + 10, y * 20 + offsetY + 10, 18, 18);
                    }
                });
            });
        });
    }
    
    renderHeldPiece() {
        const canvas = document.getElementById('heldPieceCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (this.heldPiece) {
            const shape = this.heldPiece.shape[0];
            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        ctx.fillStyle = this.heldPiece.color;
                        ctx.fillRect(x * 20 + 10, y * 20 + 10, 18, 18);
                    }
                });
            });
        }
    }
    
    renderGhostPiece() {
        if (!this.currentPiece) return;
        
        // Calculate ghost position
        let ghostY = this.currentPiece.y;
        while (!this.checkCollision(this.currentPiece, 0, ghostY - this.currentPiece.y + 1)) {
            ghostY++;
        }
        
        // Draw ghost piece
        const shape = this.currentPiece.shape[this.currentPiece.rotation];
        this.ctx.fillStyle = this.currentPiece.color + '40'; // Semi-transparent
        shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillRect(
                        (this.currentPiece.x + x) * this.blockSize + 1,
                        (ghostY + y) * this.blockSize + 1,
                        this.blockSize - 2,
                        this.blockSize - 2
                    );
                }
            });
        });
    }
    
    render() {
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
        
        // Draw ghost piece BEFORE current piece
        this.renderGhostPiece();
        
        // Draw current piece
        if (this.currentPiece) {
            const shape = this.currentPiece.shape[this.currentPiece.rotation];
            this.ctx.fillStyle = this.currentPiece.color;
            shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.blockSize + 1,
                            (this.currentPiece.y + y) * this.blockSize + 1,
                            this.blockSize - 2,
                            this.blockSize - 2
                        );
                    }
                });
            });
        }
    }
    
    gameLoop(timestamp) {
        if (this.gameOver) return;
        
        if (!this.isPaused) {
            if (timestamp - this.lastDropTime > this.dropInterval) {
                this.movePiece('down');
                this.lastDropTime = timestamp;
            }
            this.render();
        }
        
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    start() {
        this.updateUI();
        requestAnimationFrame(this.gameLoop.bind(this));
    }
    
    endGame() {
        soundManager.playSound('gameOver');
        
        // Send score to server
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
                mode: 'single'
            })
        }).then(() => {
            const modal = document.getElementById('gameOverModal');
            const finalScore = document.getElementById('finalScore');
            if (modal) modal.classList.remove('hidden');
            if (finalScore) finalScore.textContent = this.score;
        }).catch(err => {
            console.error('Error saving score:', err);
        });
    }
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
