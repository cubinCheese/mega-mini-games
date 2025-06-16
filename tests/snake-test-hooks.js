// Access game variables/functions via window or by referencing them directly if they are global


// Simulate a win state for Snake
window.testVictoryState = function() {
    if (typeof snakeGame.SnakeOverlayManager.show === "function") {
        window.gameOver = true;
    }
};

// simulate a lose state for Snake
window.testLoseState = function() {
    if (typeof snakeGame.SnakeOverlayManager.show === "function") {
        window.gameOver = true;
    }
};