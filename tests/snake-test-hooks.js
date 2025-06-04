// Access game variables/functions via window or by referencing them directly if they are global
window.testVictoryState = function() {
    // Simulate a win state for Snake
    // You may need to adjust these lines to match your game's logic and variable names
    if (typeof showEndStateOverlay === "function") {
        window.gameOver = true;
        window.showEndStateOverlay(true);
    }
};

window.testLoseState = function() {
    if (typeof showEndStateOverlay === "function") {
        window.gameOver = true;
        window.showEndStateOverlay(false);
    }
};