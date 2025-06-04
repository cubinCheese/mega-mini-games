import { games } from './games.js';

const container = document.getElementById('card-container');

// Prepare an array of promises for all games
const cardPromises = games.map(game => {
  if (!game.imgApi) {
    // No API, resolve immediately with null backgrounds
    return Promise.resolve({ game, cardBackgrounds: null });
  }
  // Fetch backgrounds for this game
  return fetch(game.imgApi)
    .then(res => res.json())
    .then(cardBackgrounds => ({ game, cardBackgrounds }))
    .catch(() => ({ game, cardBackgrounds: null }));
});

Promise.all(cardPromises).then(results => {
  // Now render cards in the original order
  results.forEach(({ game, cardBackgrounds }) => {
    createCard(game, cardBackgrounds);
  });
});

function createCard(game, cardBackgrounds) {
  const card = document.createElement('a');
  card.href = game.href;
  card.className = 'group w-48 h-64 shadow-xl rounded-2xl p-6 hover:bg-blue-100 transition text-center relative overflow-hidden';

  // Pick a random background image from the fetched list, or use a default
  let bgUrl = '';
  if (cardBackgrounds && cardBackgrounds.length > 0) {
    const randomBg = cardBackgrounds[Math.floor(Math.random() * cardBackgrounds.length)];
    bgUrl = `/static/${randomBg}`;
  }
  card.style.backgroundImage = bgUrl ? `url('${bgUrl}')` : '';

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
}
