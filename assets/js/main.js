const games = [
    { id: 'mlbb', name: 'Mobile Legends', file: 'mlbb.js' },
    { id: 'ff', name: 'Free Fire', file: 'ff.js' },
    { id: 'pubgm', name: 'PUBG Mobile', file: 'pubgm.js' },
];

const dropdownBtn = document.getElementById('game-dropdown-btn');
const dropdown = document.getElementById('game-dropdown');
const selectedText = document.getElementById('selected-game-text');

function loadGame(game) {
    document.querySelectorAll('.game-script').forEach(s => s.remove());

    document.getElementById('game-content').innerHTML =
        `<div class="text-gray-500">Memuat ${game.name}...</div>`;

    const script = document.createElement('script');
    script.src = `assets/js/games/${game.file}`;
    script.className = 'game-script';
    document.body.appendChild(script);
}

// toggle dropdown
dropdownBtn.onclick = () => {
    dropdown.classList.toggle('hidden');
};

// render list game
games.forEach(game => {
    const item = document.createElement('div');
    item.className =
        'px-4 py-2 cursor-pointer hover:bg-indigo-100';
    item.textContent = game.name;

    item.onclick = () => {
        selectedText.textContent = game.name;
        dropdown.classList.add('hidden');
        loadGame(game);
    };

    dropdown.appendChild(item);
});

// klik di luar dropdown → tutup
document.addEventListener('click', (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
    }
});
