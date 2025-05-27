import { games } from './games.js'; // Works when both are in same static/js folder

const container = document.getElementById('card-container');

games.forEach(game => {
  const card = document.createElement('a');
  card.href = game.href;
  card.className = 'w-64 bg-white shadow-xl rounded-2xl p-6 hover:bg-blue-100 transition text-center';
  card.innerHTML = `<h2 class="text-xl font-semibold">${game.emoji} Play ${game.name}</h2><p class="text-gray-600 mt-2">${game.description}</p>`;
  container.appendChild(card);
});
