import pytest

def test_snake_victory_overlay(page):
    page.goto("http://localhost:5000/static/games/snake.html")
    # Simulate a win (you may want to expose a JS function for this in snake.js)
    page.evaluate("testVictoryState()")
    # Wait for overlay to appear
    page.wait_for_selector("#game-over-overlay", state="visible")
    # Check for victory text
    title = page.inner_text("#end-state-title")
    assert "You Win" in title

def test_snake_lose_overlay(page):
    page.goto("http://localhost:5000/static/games/snake.html")
    # Simulate a loss (you may want to expose a JS function for this in snake.js)
    page.evaluate("gameOver = true; showEndStateOverlay(false);")
    page.wait_for_selector("#game-over-overlay", state="visible")
    title = page.inner_text("#end-state-title")
    assert "Game Over" in title