class OverlayManager {
    constructor(overlayId, titleId, scoreId) {
        this.overlay = document.getElementById(overlayId);
        this.titleElem = document.getElementById(titleId);
        this.scoreElem = document.getElementById(scoreId);
    }

    show(victory, score) {
        if (this.overlay && this.titleElem && this.scoreElem) {
            this.overlay.style.display = 'flex';
            this.titleElem.textContent = victory ? "You Win! 🎉" : "Game Over!";
            this.scoreElem.textContent = `Final Score: ${score}`;
        }
    }

    hide() {
        if (this.overlay) this.overlay.style.display = 'none';
    }
}

export default OverlayManager;