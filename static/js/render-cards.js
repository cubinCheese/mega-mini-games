import { games } from './games.js'; // Works when both are in same static/js folder

const container = document.getElementById('card-container');

games.forEach(game => {
  const card = document.createElement('a');
  card.href = game.href;
  card.className = 'group w-48 h-64 shadow-xl rounded-2xl p-6 hover:bg-blue-100 transition text-center relative overflow-hidden';
  card.style.backgroundImage = `url('/static/${game.image}')`;
  card.style.backgroundSize = 'cover';
  card.style.backgroundPosition = 'center';

  card.innerHTML = `
    <div class="absolute inset-0 bg-black bg-opacity-30"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/3 z-10 w-full text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <h2 class="text-xl font-semibold text-white drop-shadow">${game.emoji} Play ${game.name}</h2>
      <p class="text-gray-100 mt-2 drop-shadow">${game.description}</p>
    </div>
  `;
  container.appendChild(card);
});
