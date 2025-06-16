// Access game variables/functions via window or by referencing them directly if they are global
window.testVictoryState = function() {
    // Simulate a win state for Snake
    // You may need to adjust these lines to match your game's logic and variable names
    if (typeof snakeGame.SnakeOverlayManager.show === "function") {
        window.gameOver = true;
    }
};

window.testLoseState = function() {
    if (typeof snakeGame.SnakeOverlayManager.show === "function") {
        window.gameOver = true;
    }
};