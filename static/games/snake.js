// snake.js
import Game from '../js/global-classes/base-game.js';
import InputManager from '../js/global-classes/input-manager.js';
import OverlayManager from '../js/global-classes/overlay-manager.js';
import Renderer from '../js/global-classes/renderer.js';


// Constants and Variables 
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each box in the grid

class SnakeGame extends Game {
    constructor(canvas, ctx, box) {
        super(); // Call the parent Game constructor
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
        this.input = new InputManager();
        this.overlay = new OverlayManager('game-over-overlay', 'end-state-title', 'final-score');
        this.lastUpdateTime = 0;
    }

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

    // Place food at a random position
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

    // Update game state: snake movement, collision, food logic
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

    handleInput(event) {
        if (this.gameOver && event.code === 'Enter') {
            this.overlay.hide();
            this.reset();
            return;
        }
        if (this.gameOver) return;
        if (event.key === 'w' && this.dy === 0) { this.nextDx = 0; this.nextDy = -this.box; }
        else if (event.key === 's' && this.dy === 0) { this.nextDx = 0; this.nextDy = this.box; }
        else if (event.key === 'a' && this.dx === 0) { this.nextDx = -this.box; this.nextDy = 0; }
        else if (event.key === 'd' && this.dx === 0) { this.nextDx = this.box; this.nextDy = 0; }
    }

    setupControls() {
        this.input.addKeyListener(this.handleInput.bind(this));
        this.input.addButtonListener('btn-up', () => { if (this.dy === 0) { this.nextDx = 0; this.nextDy = -this.box; } });
        this.input.addButtonListener('btn-down', () => { if (this.dy === 0) { this.nextDx = 0; this.nextDy = this.box; } });
        this.input.addButtonListener('btn-left', () => { if (this.dx === 0) { this.nextDx = -this.box; this.nextDy = 0; } });
        this.input.addButtonListener('btn-right', () => { if (this.dx === 0) { this.nextDx = this.box; this.nextDy = 0; } });
    }

    // Toggle appearance of snake handler
    handleToggleAppearance() {
        this.useDuck = !this.useDuck; // Toggle between duck and lime
        const toggleBtn = document.getElementById('toggle-appearance');
        if (toggleBtn) {
            toggleBtn.textContent = this.useDuck ? "Use 🟩" : "Use 🐤";
        }
        this.draw(); // Redraw the game with the new appearance
    }

    // Draw everything on the canvas
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.useDuck) {
            this.ctx.font = `${this.box + 2}px serif`;
            this.ctx.textAlign = "left";
            this.ctx.textBaseline = "top";
            this.snake.forEach(segment => this.ctx.fillText('🐤', segment.x, segment.y));
            this.ctx.fillText('🐣', this.food.x, this.food.y);
        } else {
            this.ctx.fillStyle = 'lime';
            this.snake.forEach(segment => this.ctx.fillRect(segment.x, segment.y, this.box - 2, this.box - 2));
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(this.food.x, this.food.y, this.box - 2, this.box - 2);
        }
    }

    // Initalize game
    init() {
        this.lastUpdateTime = 0;
        this.setupControls(); 

        // Add restart button handler for overlay
        const restartBtn = document.getElementById('btn-restart');
        if (restartBtn) {
            const restartFn = () => {
                if (this.gameOver) {
                    this.overlay.hide();
                    this.reset();
                }
            };
            restartBtn.addEventListener('touchstart', function(e) { e.preventDefault(); restartFn(); }, {passive: false});
            restartBtn.addEventListener('click', restartFn);
        }

        // toggle snake appearance
        const toggleBtn = document.getElementById('toggle-appearance');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', this.handleToggleAppearance.bind(this));
            toggleBtn.style.display = 'none'; // Hide by default
            toggleBtn.disabled = true;        // Disable by default
        }

        this.draw();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    // Main game loop
    gameLoop(time) {
        if (!this.gameOver) {
            if (time - this.lastUpdateTime > this.moveInterval) {
                this.update();
                this.lastUpdateTime = time;
            }
            this.draw();
        } else {
            this.draw(); // Still draw the last frame
        }
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    // Optional: reset game state after game over
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

// test functions
function testVictoryState() {
  useDuck = true;
  snake = [];
  score = totalCells + 1;
  for (let y = 0; y < canvas.height; y += box) {
      for (let x = 0; x < canvas.width; x += box) {
          snake.push({ x, y });
      }
  }
};

// testVictoryState();

// Start the game

const snakeGame = new SnakeGame(canvas, ctx, box);
snakeGame.init();