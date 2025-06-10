class InputManager {
    constructor() {
        this.listeners = [];
    }

    addKeyListener(fn) {
        window.addEventListener('keydown', fn);
        this.listeners.push({ type: 'keydown', fn });
    }

    addButtonListener(buttonId, fn) {
        const btn = document.getElementById(buttonId);
        if (btn) {
            btn.addEventListener('click', fn);
            btn.addEventListener('touchstart', (e) => { e.preventDefault(); fn(); }, { passive: false });
            this.listeners.push({ type: 'button', btn, fn });
        }
    }

    removeAllListeners() {
        for (const l of this.listeners) {
            if (l.type === 'keydown') {
                window.removeEventListener('keydown', l.fn);
            } else if (l.type === 'button') {
                l.btn.removeEventListener('click', l.fn);
                l.btn.removeEventListener('touchstart', l.fn);
            }
        }
        this.listeners = [];
    }
}

export default InputManager;