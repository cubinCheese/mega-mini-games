// snake.js
import Game from '../js/base-game.js'; // Import the base Game class

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

        // Member variables
        this.lastUpdateTime = 0;
        this.snake = [{ x: 160, y: 160 }];
        this.dx = this.box; // Initial direction (moving right)
        this.dy = 0;        // Initial vertical direction
        this.nextDx = this.dx;
        this.nextDy = this.dy;
        this.food = this.placeFood();
        this.score = 0;
        this.gameOver = false;
        this.useDuck = false;
        this.victoryState = false;
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
        } else if (currentScore >= 50) {
        currentScore += 50;
        } else if (currentScore >= 100) {
        currentScore += 100;
        } else {
        currentScore += 10; // Default score increment
        }
        return currentScore;
    }
}

// Instantiate ONCE, outside of update()
const snakeGameInstance = new SnakeGame();



// Update game state: snake movement, collision, food logic
function update() {
    // Update direction to the next direction
    dx = nextDx; 
    dy = nextDy; 

    // Move snake, check collisions, handle food eating
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);

    // Check if snake eats food
    if (head.x === food.x && head.y === food.y) {
          food = placeFood(); // Place new food
          score += snakeGameInstance.calculateScore(score); // Update score
      } else {
      snake.pop(); // Remove the tail if not eating food
    }
    
    // victory condition: event trigger
    if (snake.length >= totalCells) {
        gameOver = true;
        showEndStateOverlay(true);
        return;
    }

    // Check for collisions with walls or self
    if (head.x < 0 || head.x >= canvas.width || 
        head.y < 0 || head.y >= canvas.height || 
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver = true;
        showEndStateOverlay(false);
        return;
    } 
}

// Show overlay and toggle button after game over
function showEndStateOverlay(victoryState) {
    const overlay = document.getElementById('game-over-overlay');
    const scoreElem = document.getElementById('final-score');
    const toggleBtn = document.getElementById('toggle-appearance');
    const titleElem = document.getElementById('end-state-title'); // Use the id directly

    if (overlay && scoreElem && titleElem) {
        if (victoryState) {
          titleElem.textContent = "You Win! 🎉";
          scoreElem.textContent = `Final Score: ${score}`;
          playConfetti();    // Trigger confetti!
        } else {
          titleElem.textContent = "Game Over!";
          scoreElem.textContent = `Final Score: ${score}`;
        }
        overlay.style.display = 'flex';
    } 

    if (toggleBtn) {
        toggleBtn.style.display = 'inline-block';
        toggleBtn.textContent = useDuck ? "Use 🟩" : "Use 🐤";
        toggleBtn.disabled = false;
    }
}

// Hide overlay and toggle button when restarting
function hideGameOverOverlay() {
    const overlay = document.getElementById('game-over-overlay');   // game over overlay
    const toggleBtn = document.getElementById('toggle-appearance'); // 🟩 or 🐤
    if (overlay) overlay.style.display = 'none';
    if (toggleBtn) toggleBtn.style.display = 'none';
}

// Plays confetti animation
function playConfetti() {
    if (window.confetti) {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}

// Place food at a random position
function placeFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * canvas.width / box) * box,
            y: Math.floor(Math.random() * canvas.height / box) * box
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

// Toggle appearance of snake handler
function handleToggleAppearance() {
    useDuck = !useDuck; // Toggle between duck and lime
    const toggleBtn = document.getElementById('toggle-appearance');
    if (toggleBtn) {
        toggleBtn.textContent = useDuck ? "Use 🟩" : "Use 🐤";
    }
    draw(); // Redraw the game with the new appearance
}

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (useDuck) {
        // draw snake as duck emoji
        ctx.font = `${box + 2}px serif`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        snake.forEach(segment => ctx.fillText('🐤', segment.x, segment.y));

        // draw food as duck egg
        ctx.fillText('🐣', food.x, food.y);

      } else {
        // draw snake as lime square
        ctx.fillStyle = 'lime';
        snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box - 2, box - 2));
        
        // draw food as red square
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x, food.y, box - 2, box - 2);
    }
}

// Movement keys handling
function handleKeyDown(event) {
    if (gameOver && event.code === 'Enter') {
        hideGameOverOverlay();
        resetGame();
        return;
    }
    if (gameOver) return; // Ignore other keys if game is over

    // TODO: Change snake direction based on key pressed
    // In handleKeyDown and addControl:
    if (event.key === 'w' && dy === 0) {
        nextDx = 0; nextDy = -box;
    } else if (event.key === 's' && dy === 0) {
        nextDx = 0; nextDy = box;
    } else if (event.key === 'a' && dx === 0) {
        nextDx = -box; nextDy = 0;
    } else if (event.key === 'd' && dx === 0) {
        nextDx = box; nextDy = 0;
    }
}

// Touch/Click Controls
function setupHardcodedControlButtons() {
    const up    = document.getElementById('btn-up');
    const down  = document.getElementById('btn-down');
    const left  = document.getElementById('btn-left');
    const right = document.getElementById('btn-right');
    const addControl = (el, fn) => {
        if (!el) return;
        el.addEventListener('touchstart', function(e) { e.preventDefault(); fn(); }, {passive: false});
        el.addEventListener('click', fn);
    };
    addControl(up,    () => { if (dy === 0) { nextDx = 0; nextDy = -box; } });
    addControl(down,  () => { if (dy === 0) { nextDx = 0; nextDy = box; } });
    addControl(left,  () => { if (dx === 0) { nextDx = -box; nextDy = 0; } });
    addControl(right, () => { if (dx === 0) { nextDx = box; nextDy = 0; } });
}


// Initalize game
function init() {
    document.addEventListener('keydown', handleKeyDown);
    setupHardcodedControlButtons(); 

    // Add restart button handler for overlay
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
        const restartFn = () => {
            if (gameOver) {
                hideGameOverOverlay();
                resetGame();
            }
        };
        restartBtn.addEventListener('touchstart', function(e) { e.preventDefault(); restartFn(); }, {passive: false});
        restartBtn.addEventListener('click', restartFn);
    }

    // toggle snake appearance
    const toggleBtn = document.getElementById('toggle-appearance');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', handleToggleAppearance);
        toggleBtn.style.display = 'none'; // Hide by default
        toggleBtn.disabled = true;        // Disable by default
    }

    draw();
    requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop(time) {
    if (!gameOver) {
        if (time - lastUpdateTime > moveInterval) {
            update();
            lastUpdateTime = time;
        }
        draw();
    } else {
        draw(); // Still draw the last frame
    }
    requestAnimationFrame(gameLoop);
}

// Optional: reset game state after game over
function resetGame() {
    // TODO: Reset snake position and direction
    gameOver = false;
    score = 0; // Reset score
    food = placeFood(); // Place new food
    snake = [{x: 160, y: 160}]; // Reset snake position
    dx = box; // Reset direction to right
    dy = 0; // Reset vertical direction
    nextDx = dx; 
    nextDy = dy;
}


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
init();