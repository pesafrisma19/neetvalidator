document.addEventListener('DOMContentLoaded', () => {
  const games = [
    { id: 'mlbb', name: 'Mobile Legends' },
    { id: 'ff', name: 'Free Fire' }
  ];

  const container = document.getElementById('games-container');
  const form = document.getElementById('check-form');

  games.forEach(game => {
    const btn = document.createElement('button');
    btn.textContent = game.name;
    btn.className = 'px-4 py-2 bg-gray-300 rounded';

    btn.onclick = () => {
      alert('Pilih game: ' + game.id);
      form.classList.remove('hidden');
    };

    container.appendChild(btn);
  });
});
