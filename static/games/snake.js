// snake.js

// Constants and Variables 
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const box = 20; // Size of each box in the grid

let lastUpdateTime = 0;
const snakeSpeed = 10; // moves per second
const moveInterval = 1000 / snakeSpeed;

let snake = [{x: 160, y: 160}]; // Initial position of the snake
let dx = box; // Initial direction (moving right)
let dy = 0; // Initial vertical direction
let food = {x: Math.floor(Math.random() * canvas.width / box) * box, y: Math.floor(Math.random() * canvas.height / box) * box}; // Initial food position
let score = 0; // Initial score
let gameOver = false; // Game over flag

// Update game state: snake movement, collision, food logic
function update() {
  // TODO: Move snake, check collisions, handle food eating
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};
  snake.unshift(head);

  // Check if snake eats food
  if (head.x === food.x && head.y === food.y) {
        food = placeFood(); // Place new food
        score++;
    } else {
    snake.pop(); // Remove the tail if not eating food
  }

    // Check for collisions with walls or self
    if (head.x < 0 || head.x >= canvas.width || 
        head.y < 0 || head.y >= canvas.height || 
        snake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)
    ) {
        gameOver = true;
        showGameOverOverlay();
    } 
    
}

function showGameOverOverlay() {
    const overlay = document.getElementById('game-over-overlay');
    const scoreElem = document.getElementById('final-score');
    if (overlay && scoreElem) {
        scoreElem.textContent = `Your score: ${score}`;
        overlay.style.display = 'flex';
    }
}

function hideGameOverOverlay() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.style.display = 'none';
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


// Draw everything on the canvas
function draw() {
  // TODO: Clear canvas, draw snake and food
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'lime';
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, box - 2, box - 2)); 
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box - 2, box - 2); // Draw food  
}

// Movement keys handling
function handleKeyDown(event) {
    
    if (gameOver && event.code === 'Space') {
        hideGameOverOverlay();
        resetGame();
        return;
    }
    if (gameOver) return; // Ignore other keys if game is over

  // TODO: Change snake direction based on key pressed
  if (event.key === 'w' && dy === 0) {
    dx = 0; dy = -box; 
  } else if (event.key === 's' && dy === 0) {
    dx = 0; dy = box; 
  } else if (event.key === 'a' && dx === 0) {
    dx = -box; dy = 0; 
  } else if (event.key === 'd' && dx === 0) {
    dx = box; dy = 0; 
  }
}


// Initalize game
function init() {
    document.addEventListener('keydown', handleKeyDown);
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
}

// Start the game
init();