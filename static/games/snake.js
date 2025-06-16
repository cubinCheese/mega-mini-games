// snake.js
import Game from '../js/global-classes/base-game.js';
import InputManager from '../js/global-classes/input-manager.js';
import OverlayManager from '../js/global-classes/overlay-manager.js';
import Renderer from '../js/global-classes/renderer.js';


// Constants and Variables 
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each box in the grid

// --- SnakeInputManager ---
class SnakeInputManager extends InputManager {
    constructor(game) {
        super();
        this.game = game;
    }

    setupControls() {
        this.addKeyListener(this.handleInput.bind(this));
        this.addButtonListener('btn-up', () => { if (this.game.dy === 0) { this.game.nextDx = 0; this.game.nextDy = -this.game.box; } });
        this.addButtonListener('btn-down', () => { if (this.game.dy === 0) { this.game.nextDx = 0; this.game.nextDy = this.game.box; } });
        this.addButtonListener('btn-left', () => { if (this.game.dx === 0) { this.game.nextDx = -this.game.box; this.game.nextDy = 0; } });
        this.addButtonListener('btn-right', () => { if (this.game.dx === 0) { this.game.nextDx = this.game.box; this.game.nextDy = 0; } });
    }

    handleInput(event) {
        if (this.game.gameOver && event.code === 'Enter') {
            this.game.overlay.hide();
            this.game.reset();
            return;
        }
        if (this.game.gameOver) return;
        if (event.key === 'w' && this.game.dy === 0) { this.game.nextDx = 0; this.game.nextDy = -this.game.box; }
        else if (event.key === 's' && this.game.dy === 0) { this.game.nextDx = 0; this.game.nextDy = this.game.box; }
        else if (event.key === 'a' && this.game.dx === 0) { this.game.nextDx = -this.game.box; this.game.nextDy = 0; }
        else if (event.key === 'd' && this.game.dx === 0) { this.game.nextDx = this.game.box; this.game.nextDy = 0; }
    }
}

// --- SnakeOverlayManager ---
class SnakeOverlayManager extends OverlayManager {
    constructor() {
        super('game-over-overlay', 'end-state-title', 'final-score');
    }

    show(victory, score) {
        super.show(victory, score);
        // Additional Snake-specific overlay logic can go here if needed
    }
}

// --- SnakeRenderer ---
class SnakeRenderer extends Renderer {
    constructor(canvas, ctx, box, game) {
        super(canvas, ctx);
        this.box = box;
        this.game = game;
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.game.useDuck) {
            this.ctx.font = `${this.box + 2}px serif`;
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "top";
            this.game.snake.forEach(segment => this.ctx.fillText('🐤', segment.x, segment.y));
            this.ctx.fillText('🐣', this.game.food.x, this.game.food.y);
        } else {
            this.ctx.fillStyle = 'lime';
            this.game.snake.forEach(segment => this.ctx.fillRect(segment.x, segment.y, this.box - 2, this.box - 2));
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.game.food.x, this.game.food.y, this.box - 2, this.box - 2);
        }
    }
}

// --- SnakeGame ---
class SnakeGame extends Game {
    constructor(canvas, ctx, box) {
        super();
        this.canvas = canvas;
        this.ctx = ctx;
        this.box = box;
        this.snake = [{ x: 160, y: 160 }];
        this.dx = box; // Initial direction (moving right)
        this.dy = 0;        // Initial vertical direction
        this.nextDx = this.dx;
        this.nextDy = this.dy;
        this.food = this.placeFood();
        this.useDuck = false;
        this.input = new SnakeInputManager(this);
        this.overlay = new SnakeOverlayManager();
        this.renderer = new SnakeRenderer(canvas, ctx, box, this);
        this.lastUpdateTime = 0;
        this.score = 0;
        this.gameOver = false;
    }

    // --- Overridden base class methods first ---

    // Getters for former consts variables
    get snakeSpeed() {
        return 10; // moves per second
    }

    get moveInterval() {
        return 1000 / this.snakeSpeed; // milliseconds per move
    }

    get totalCells() {
        return (this.canvas.width / this.box) * (this.canvas.height / this.box);
    }

    calculateScore(currentScore) {
        // Modified scoring system
        if (currentScore <= 10) {
            currentScore += 10;
        } else if (currentScore >= 100) {
            currentScore += 100;
        } else if (currentScore >= 50) {
            currentScore += 50;
        } else {
            currentScore += 10; // Default score increment
        }
        return currentScore;
    }

    placeFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.canvas.width / this.box) * this.box,
                y: Math.floor(Math.random() * this.canvas.height / this.box) * this.box
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        return newFood;
    }

    update() {
        // Update direction to the next direction
        this.dx = this.nextDx;
        this.dy = this.nextDy;

        // Move snake, check collisions, handle food eating
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        this.snake.unshift(head);

        // Check if snake eats food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.food = this.placeFood(); // Place new food
            this.score += this.calculateScore(this.score); // Use class method for scoring
        } else {
            this.snake.pop(); // Remove the tail if not eating food
        }

        // victory condition: event trigger
        if (this.snake.length >= this.totalCells) {
            this.gameOver = true;
            this.overlay.show(true, this.score);
            return;
        }

        // Check for collisions with walls or self
        if (
            head.x < 0 || head.x >= this.canvas.width ||
            head.y < 0 || head.y >= this.canvas.height ||
            this.snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            this.gameOver = true;
            this.overlay.show(false, this.score);
            return;
        }
    }

    init() {
        this.lastUpdateTime = 0;
        this.input.setupControls(); 

        // Add restart button handler for overlay
        const restartBtn = document.getElementById('btn-restart');
        if (restartBtn) {
            const restartFn = () => {
                if (this.gameOver) {
                    this.overlay.hide();
                    this.reset();
                    // Enable and show toggle appearance button after game over
                    const toggleBtn = document.getElementById('toggle-appearance');
                    if (toggleBtn) {
                        toggleBtn.style.display = '';
                        toggleBtn.disabled = false;
                    }
                }
            };
            restartBtn.addEventListener('touchstart', function(e) { e.preventDefault(); restartFn(); }, {passive: false});
            restartBtn.addEventListener('click', restartFn);
        }

        // toggle snake appearance
        const toggleBtn = document.getElementById('toggle-appearance');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.handleToggleAppearance.bind(this));
            // Only allow toggling when game is not running
            if (!this.gameOver) {
                toggleBtn.style.display = 'none'; // Hide by default during gameplay
                toggleBtn.disabled = true;        // Disable by default during gameplay
            } else {
                toggleBtn.style.display = '';
                toggleBtn.disabled = false;
            }
        }

        this.renderer.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    gameLoop(time) {
        if (!this.gameOver) {
            // Hide and disable toggle during gameplay
            const toggleBtn = document.getElementById('toggle-appearance');
            if (toggleBtn) {
                toggleBtn.style.display = 'none';
                toggleBtn.disabled = true;
            }
            if (time - this.lastUpdateTime > this.moveInterval) {
                this.update();
                this.lastUpdateTime = time;
            }
            this.renderer.draw();
        } else {
            // Show and enable toggle when game is over
            const toggleBtn = document.getElementById('toggle-appearance');
            if (toggleBtn) {
                toggleBtn.style.display = '';
                toggleBtn.disabled = false;
            }
            this.renderer.draw(); // Still draw the last frame
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    // --- Custom SnakeGame methods after base/overridden methods ---

    handleToggleAppearance() {
        this.useDuck = !this.useDuck; // Toggle between duck and lime
        const toggleBtn = document.getElementById('toggle-appearance');
        if (toggleBtn) {
            toggleBtn.textContent = this.useDuck ? "Use 🟩" : "Use 🐤";
        }
        this.renderer.draw(); // Redraw the game with the new appearance
    }

    reset() {
        // TODO: Reset snake position and direction
        this.gameOver = false;
        this.score = 0; // Reset score
        this.food = this.placeFood(); // Place new food
        this.snake = [{x: 160, y: 160}]; // Reset snake position
        this.dx = this.box; // Reset direction to right
        this.dy = 0; // Reset vertical direction
        this.nextDx = this.dx; 
        this.nextDy = this.dy;
    }
}

// Usage:
// Then use snakeGame.update(), snakeGame.draw(), etc. in your game loop.



// testVictoryState();

// Start the game

const snakeGame = new SnakeGame(canvas, ctx, box);
snakeGame.init();

// test functions
function testMyVictoryState() {
  snakeGame.useDuck = true;
  snakeGame.snake = [];
  snakeGame.score = snakeGame.totalCells + 1;
  for (let y = 0; y < canvas.height; y += box) {
      for (let x = 0; x < canvas.width; x += box) {
          snakeGame.snake.push({ x, y });
      }
  }
};

function testMyLoseState() {
    // simply let snake run itself into wall
    // inputManager is "input" under SnakeGame class
    snakeGame.input.handleInput({ code: 'KeyW' }); // Move up
};

// expose test functions to global scope for testing
window.testMyVictoryState = testMyVictoryState;
window.testMyLoseState = testMyLoseState;