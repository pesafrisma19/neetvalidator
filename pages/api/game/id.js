export default function handler(req, res) {
  const { id } = req.query;
  const games = {
    ml: { id: 'ml', name: 'Mobile Legends', provider: 'Moonton' },
    ff: { id: 'ff', name: 'Free Fire', provider: 'Garena' },
    pubg: { id: 'pubg', name: 'PUBG Mobile', provider: 'Krafton' },
  };

  if (req.method === 'GET') {
    const game = games[id];
    if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
    return res.status(200).json({ success: true, data: game });
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
