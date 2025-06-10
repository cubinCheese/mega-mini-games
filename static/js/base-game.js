class Game {
    constructor() {
        this.score = 0;
    }

    calculateScore(currentScore) {
        // Default scoring logic (can be overridden)
        return currentScore + 10;
    }
}

// export Game class
export default Game;