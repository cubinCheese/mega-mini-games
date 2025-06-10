class Game {
    constructor() {
        this.score = 0;
        this.gameOver = false;
    }

    calculateScore(currentScore) {
        // Default scoring logic (override in subclass)
        return currentScore + 10;
    }

    init() {
        // Start or restart the game (override as needed)
        this.score = 0;
        this.gameOver = false;
    }

    update() {
        // Main game update loop (override in subclass)
    }
}

export default Game;