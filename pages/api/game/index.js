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
