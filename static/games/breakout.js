class Paddle {
    constructor(canvas) {
        this.width = 80;
        this.height = 16;
        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 6;
        this.dx = 0;
    }

    moveLeft() {
        this.dx = -this.speed;
    }

    moveRight() {
        this.dx = this.speed;
    }

    stop() {
        this.dx = 0;
    }

    update(canvas) {
        this.x += this.dx;
        // Prevent going out of bounds
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }

    draw(ctx) {
        ctx.fillStyle = "#3498db";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Ball {
    constructor(canvas) {
        this.radius = 8;
        this.x = canvas.width / 2;
        this.y = canvas.height - 40;
        this.speed = 4;
        this.dx = this.speed;
        this.dy = -this.speed;
        this.trail = []; // Store previous positions for the trail
        this.maxTrail = 20; // Number of trail segments
    }

    update() {
        // Add current position to the trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) {
            this.trail.shift();
        }
        this.x += this.dx;
        this.y += this.dy;
    }

    draw(ctx) {
        // Draw the lightning-like trail
        for (let i = 0; i < this.trail.length - 1; i++) {
            const p1 = this.trail[i];
            const p2 = this.trail[i + 1];
            const alpha = (i + 1) / this.trail.length;
            ctx.save();
            ctx.strokeStyle = `rgba(173,216,230,${alpha * 0.7})`; // light blue, fading
            ctx.shadowColor = `rgba(0,255,255,${alpha})`;
            ctx.shadowBlur = 10 * alpha;
            ctx.lineWidth = 2 + 2 * (1 - alpha);
            ctx.beginPath();
            // Add a little jaggedness for lightning effect
            const midX = (p1.x + p2.x) / 2 + (Math.random() - 0.5) * 6 * (1 - alpha);
            const midY = (p1.y + p2.y) / 2 + (Math.random() - 0.5) * 6 * (1 - alpha);
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(midX, midY);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.restore();
        }

        // Draw the ball
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "#e74c3c";
        ctx.shadowColor = "#00ffff";
        ctx.shadowBlur = 18;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.closePath();
    }
}

// Class Representing a single brick in the game
class Brick {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.destroyed = false;
    }

    draw(ctx) {
        if (!this.destroyed) {
            ctx.fillStyle = "#f1c40f";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Game {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.paddle = new Paddle(canvas);
        this.ball = new Ball(canvas);
        this.bricks = [];
        this.rows = 5;
        this.cols = 7;
        this.brickWidth = 48;
        this.brickHeight = 20;
        this.initBricks();
        this.running = true;
        this.score = 0;
    }


    // Initialize individual bricks into a grid
    initBricks() {
        this.bricks = [];
        const gap = 8;
        const totalBricksWidth = this.cols * this.brickWidth + (this.cols - 1) * gap;
        const offsetX = (this.canvas.width - totalBricksWidth) / 2;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const x = col * (this.brickWidth + gap) + offsetX;
                const y = row * (this.brickHeight + gap) + 40;
                this.bricks.push(new Brick(x, y, this.brickWidth, this.brickHeight));
            }
        }
    }

    update() {
        this.paddle.update(this.canvas);
        this.ball.update();

        // Ball-boundary collision
        // Left (west) boundary
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.dx *= -1;
        }
        // Right (east) boundary
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.dx *= -1;
        }
        // Top (north) boundary
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.dy *= -1;
        }
        // Bottom (south) boundary (ball bounces off)
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            //this.ball.y = this.canvas.height - this.ball.radius;
            //this.ball.dy *= -1;

            this.running = false;
            this.showEndStateOverlay(false);
        }

        // Paddle collision
        if (
            this.ball.y + this.ball.radius >= this.paddle.y &&
            this.ball.y + this.ball.radius <= this.paddle.y + this.paddle.height &&
            this.ball.x + this.ball.radius >= this.paddle.x &&
            this.ball.x - this.ball.radius <= this.paddle.x + this.paddle.width &&
            this.ball.dy > 0 // Only bounce if moving downward
        ) {
            this.ball.y = this.paddle.y - this.ball.radius; // Place ball above paddle
            this.ball.dy *= -1;

            // Optional: add some "english" based on where the ball hits the paddle
            const hitPos = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            this.ball.dx = this.ball.speed * hitPos;
        }

        // Brick collision
        for (let brick of this.bricks) {
            if (!brick.destroyed) {
                // Simple AABB collision
                if (
                    this.ball.x + this.ball.radius > brick.x &&
                    this.ball.x - this.ball.radius < brick.x + brick.width &&
                    this.ball.y + this.ball.radius > brick.y &&
                    this.ball.y - this.ball.radius < brick.y + brick.height
                ) {
                    brick.destroyed = true;

                    // Ball bounce logic: determine which side was hit
                    // Calculate overlap on x and y
                    const overlapLeft = this.ball.x + this.ball.radius - brick.x;
                    const overlapRight = brick.x + brick.width - (this.ball.x - this.ball.radius);
                    const overlapTop = this.ball.y + this.ball.radius - brick.y;
                    const overlapBottom = brick.y + brick.height - (this.ball.y - this.ball.radius);
                    const minOverlapX = Math.min(overlapLeft, overlapRight);
                    const minOverlapY = Math.min(overlapTop, overlapBottom);

                    // Bounce on the axis with the smallest overlap
                    if (minOverlapX < minOverlapY) {
                        this.ball.dx *= -1;
                    } else {
                        this.ball.dy *= -1;
                    }
                    break; // Only handle one brick per frame
                }
            }
        }
        
        // Extra boundary: "death zone" behind the paddle
        const deathZoneY = this.paddle.y + this.paddle.height + 10; // 10px below paddle
        if (this.ball.y - this.ball.radius > deathZoneY) {
            this.running = false;
            this.showEndStateOverlay(false); // Always loss state for death zone
            return;
        }

        // Victory condition: all bricks destroyed
        if (this.bricks.every(brick => brick.destroyed)) {
            this.running = false;
            this.showEndStateOverlay(true);
            return;
        }

        // Loss condition: ball goes below paddle
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this.running = false;
            this.showEndStateOverlay(false);
            return;
        }

    }

    showEndStateOverlay(victoryState) {
        const overlay = document.getElementById('game-over-overlay');
        const scoreElem = document.getElementById('final-score');
        const titleElem = document.getElementById('end-state-title');
        if (overlay && scoreElem && titleElem) {
            if (victoryState) {
                titleElem.textContent = "You Win! 🎉";
                scoreElem.textContent = `Final Score: ${this.score}`;
            } else {
                titleElem.textContent = "Game Over!";
                scoreElem.textContent = `Final Score: ${this.score}`;
            }
            overlay.style.display = 'flex';
        }
    }

    reset() {
        this.paddle = new Paddle(this.canvas);
        this.ball = new Ball(this.canvas);
        this.initBricks();
        this.running = true;
        this.score = 0;
        hideGameOverOverlay();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);
        this.bricks.forEach(brick => brick.draw(this.ctx));
    }
}



// Overlay helpers (not in a class)
function hideGameOverOverlay() {
    const overlay = document.getElementById('game-over-overlay');
    if (overlay) overlay.style.display = 'none';
}

function setupRestartButton(game) {
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
        const restartFn = () => {
            if (!game.running) {
                hideGameOverOverlay();
                game.reset();
                gameLoop(); // Restart the game loop after reset
            }
        };
        restartBtn.addEventListener('touchstart', function(e) { e.preventDefault(); restartFn(); }, {passive: false});
        restartBtn.addEventListener('click', restartFn);
        document.addEventListener('keydown', function(e) {
            if (!game.running && e.code === 'Enter') {
                restartFn();
            }
        });
    }
}

function setupPaddleControls(game) {
    const keysDown = new Set();

    document.addEventListener('keydown', (e) => {
        if (e.repeat) return; // Ignore auto-repeat
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
            keysDown.add('left');
            game.paddle.moveLeft();
        }
        if (['ArrowRight', 'd', 'D'].includes(e.key)) {
            keysDown.add('right');
            game.paddle.moveRight();
        }
    });

    document.addEventListener('keyup', (e) => {
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
            keysDown.delete('left');
        }
        if (['ArrowRight', 'd', 'D'].includes(e.key)) {
            keysDown.delete('right');
        }
        // If neither left nor right is held, stop the paddle
        if (!keysDown.has('left') && !keysDown.has('right')) {
            game.paddle.stop();
        } else if (keysDown.has('left')) {
            game.paddle.moveLeft();
        } else if (keysDown.has('right')) {
            game.paddle.moveRight();
        }
    });

    // Touch/click button controls
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); game.paddle.moveLeft(); }, {passive: false});
        btnLeft.addEventListener('mousedown', () => game.paddle.moveLeft());
        btnLeft.addEventListener('touchend', () => game.paddle.stop());
        btnLeft.addEventListener('mouseup', () => game.paddle.stop());
        btnLeft.addEventListener('mouseleave', () => game.paddle.stop());
    }
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); game.paddle.moveRight(); }, {passive: false});
        btnRight.addEventListener('mousedown', () => game.paddle.moveRight());
        btnRight.addEventListener('touchend', () => game.paddle.stop());
        btnRight.addEventListener('mouseup', () => game.paddle.stop());
        btnRight.addEventListener('mouseleave', () => game.paddle.stop());
    }
}



//Example usage (to be placed in your main script):
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const game = new Game(canvas, ctx);
// After creating your game instance:
setupPaddleControls(game);
setupRestartButton(game);
function gameLoop() {
    game.update();
    game.draw();
    if (game.running) {
        requestAnimationFrame(gameLoop);
    }
}
gameLoop();