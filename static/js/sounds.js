class SoundManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
    }
    
    // Simple beep sounds using Web Audio API
    playSound(type) {
        if (!this.enabled) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            gainNode.gain.value = this.volume;
            
            switch(type) {
                case 'move':
                    oscillator.frequency.value = 200;
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.05);
                    break;
                case 'rotate':
                    oscillator.frequency.value = 300;
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.08);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.08);
                    break;
                case 'lock':
                    oscillator.frequency.value = 150;
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.1);
                    break;
                case 'clear':
                    oscillator.frequency.value = 500;
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.2);
                    break;
                case 'tetris':
                    // Multiple tones for Tetris clear
                    [500, 600, 700, 800].forEach((freq, i) => {
                        const osc = audioContext.createOscillator();
                        const gain = audioContext.createGain();
                        osc.connect(gain);
                        gain.connect(audioContext.destination);
                        osc.frequency.value = freq;
                        gain.gain.value = this.volume;
                        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        osc.start(audioContext.currentTime + i * 0.05);
                        osc.stop(audioContext.currentTime + 0.3 + i * 0.05);
                    });
                    break;
                case 'gameOver':
                case 'gameover':
                    oscillator.frequency.value = 100;
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.5);
                    break;
            }
        } catch(e) {
            console.log('Sound error:', e);
        }
    }
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
    
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
    }
}

const soundManager = new SoundManager();

// Helper functions for easy access
function playSound(type) {
    soundManager.playSound(type);
}

function toggleSound() {
    return soundManager.toggle();
}

function setSoundVolume(volume) {
    soundManager.setVolume(volume);
}

function initSounds() {
    console.log('🔊 Sound system initialized');
    return soundManager;
}

