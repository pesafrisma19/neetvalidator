const games = [
    { id: 'mlbb', name: 'Mobile Legends', file: 'mlbb.js' }
];

const container = document.getElementById('games-container');

function loadGame(game) {
    // hapus script lama
    document.querySelectorAll('.game-script').forEach(s => s.remove());

    // load script baru
    const script = document.createElement('script');
    script.src = `assets/js/games/${game.file}`;
    script.className = 'game-script';
    document.body.appendChild(script);
}

// render tab
games.forEach(game => {
    const btn = document.createElement('button');
    btn.textContent = game.name;
    btn.className = 'px-3 py-2 border-b-2 border-transparent hover:border-indigo-500';

    btn.onclick = () => {
        document.querySelectorAll('#games-container button')
            .forEach(b => b.classList.remove('border-indigo-500'));

        btn.classList.add('border-indigo-500');
        loadGame(game);
    };

    container.appendChild(btn);
});

// auto load MLBB
loadGame(games[0]);
