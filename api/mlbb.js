export default async function handler(req, res) {
  const { user_id, server_id } = req.query;

  if (!user_id || !server_id) {
    return res.status(400).json({
      success: false,
      message: 'user_id dan server_id wajib'
    });
  }

  const url =
    `https://api.mobapay.com/api/app_shop` +
    `?app_id=100000` +
    `&game_user_key=${user_id}` +
    `&game_server_key=${server_id}` +
    `&country=ID` +
    `&language=en`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
        'Origin': 'https://www.mobapay.com',
        'Referer': 'https://www.mobapay.com/',
        'x-lang': 'en'
      }
    });

    const json = await response.json();

    if (json?.data?.user_info?.code === 0) {
      return res.json({
        success: true,
        username: json.data.user_info.user_name
      });
    }

    return res.json({
      success: false,
      message: 'ID tidak ditemukan'
    });

  } catch (e) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghubungi Mobapay',
      error: e.message
    });
  }
}
