import { checkMLBB } from './games/mlbb.js';

document.addEventListener('DOMContentLoaded', () => {
  const gamesContainer = document.getElementById('games-container');
  const form = document.getElementById('check-form');
  const resultBox = document.getElementById('result');

  let selectedGame = null;

  // === LIST GAME (TAB / BUTTON) ===
  const mlbbBtn = document.createElement('button');
  mlbbBtn.textContent = 'Mobile Legends';
  mlbbBtn.className = 'px-4 py-2 bg-gray-300 rounded';

  mlbbBtn.onclick = () => {
    selectedGame = 'mlbb';
    form.classList.remove('hidden');
    resultBox.textContent = '';
  };

  gamesContainer.appendChild(mlbbBtn);

  // === SUBMIT FORM ===
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (selectedGame !== 'mlbb') return;

    const userId = document.getElementById('gameId').value;
    const serverId = document.getElementById('serverRegion').value;

    resultBox.textContent = 'Loading...';

    const res = await checkMLBB(userId, serverId);
    resultBox.textContent = JSON.stringify(res, null, 2);
  });
});
