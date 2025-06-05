import os
from flask import Flask, jsonify, render_template

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/brick-images')
def brick_images():
    folder = os.path.join(app.static_folder, 'images/brick-game-images')
    files = [
        f'images/brick-game-images/{f}'
        for f in os.listdir(folder)
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
    ]
    return jsonify(files)

@app.route('/api/snake-images')
def snake_images():
    folder = os.path.join(app.static_folder, 'images/snake-game-images')
    files = [
        f'images/snake-game-images/{f}'
        for f in os.listdir(folder)
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))
    ]
    return jsonify(files)

if __name__ == '__main__':
    app.run(debug=True)
