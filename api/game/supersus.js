const axios = require('axios');

export default async function handler(req, res) {
  const { id, zone } = req.query;
  
  if (!id) {
    return res.status(400).json({
      status: false,
      message: "ID wajib diisi"
    });
  }
  
  try {
    const response = await axios.post(
      `https://webpay-api.supersus.io/api/player/${id}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://webpay.supersus.io',
          'Referer': 'https://webpay.supersus.io/',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    );
    
    const nickname = response?.data?.data?.name;
    
    if (nickname) {
      return res.json({
        status: true,
        data: {
          username: nickname,
          user_id: id,
          zone_id: zone || '-'
        }
      });
    } else {
      return res.json({
        status: false,
        message: "Nickname tidak ditemukan"
      });
    }
    
  } catch (error) {
    const errorMsg = error?.response?.data?.message || error.message;
    return res.status(500).json({
      status: false,
      message: `Gagal mengambil data: ${errorMsg}`
    });
  }
}
