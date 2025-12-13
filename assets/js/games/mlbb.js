document.getElementById('game-content').innerHTML = `
    <form id="mlbb-form" class="space-y-4">
        <input id="playerId" type="text"
            placeholder="Player ID MLBB"
            class="w-full border p-3 rounded"
            required>

        <input id="serverId" type="text"
            placeholder="Server (contoh: 1234)"
            class="w-full border p-3 rounded"
            required>

        <button class="w-full bg-indigo-600 text-white py-2 rounded">
            Cek Username
        </button>
    </form>

    <div id="mlbb-result" class="mt-4"></div>
`;

document.getElementById('mlbb-form').onsubmit = async (e) => {
    e.preventDefault();

    const playerId = document.getElementById('playerId').value;
    const serverId = document.getElementById('serverId').value;
    const resultBox = document.getElementById('mlbb-result');

    resultBox.innerHTML = 'Loading...';

    try {
        const res = await fetch(`api/mlbb.php?id=${playerId}&server=${serverId}`);
        const data = await res.json();

        if (data.success) {
            resultBox.innerHTML = `
                <div class="text-green-600 font-bold">
                    Username: ${data.username}
                </div>
            `;
        } else {
            resultBox.innerHTML = `
                <div class="text-red-600">
                    ${data.message}
                </div>
            `;
        }

    } catch (err) {
        resultBox.innerHTML = 'Gagal menghubungi server';
    }
};
