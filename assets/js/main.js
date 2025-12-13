import { checkMLBB } from './games/mlbb.js';

document
  .getElementById('check-form')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('gameId').value;
    const server = document.getElementById('serverRegion').value;

    const result = await checkMLBB(id, server);

    console.log(result);
    // tampilkan ke UI
  });
