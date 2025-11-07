export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: "API validator aktif!",
      example: "GET /api/game?id=123456"
    });
  }

  if (req.method === 'POST') {
    const { gameId, userId, serverId } = req.body;

    if (!gameId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Harus kirim gameId dan userId"
      });
    }

    // contoh respons dummy
    return res.status(200).json({
      success: true,
      message: `User ID ${userId} di game ${gameId} berhasil divalidasi!`,
      data: { serverId }
    });
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}


export default function handler(req, res) {
  if (req.method === 'GET') {
    const games = [
      { id: 'ml', name: 'Mobile Legends' },
      { id: 'ff', name: 'Free Fire' },
      { id: 'pubg', name: 'PUBG Mobile' }
    ];
    return res.status(200).json({ success: true, data: games });
  }

  res.status(405).json({ success: false, message: 'Method not allowed' });
}
