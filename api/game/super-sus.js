// File: /api/game/super-sus.js (VERSI DIPERBAIKI)
import axios from 'axios';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { id, zone } = req.query;
  
  if (!id || !/^\d+$/.test(id)) {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID harus berupa angka"
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
        },
        timeout: 8000
      }
    );
    
    const nickname = response?.data?.data?.name;
    
    if (nickname) {
      // ✅ TAMBAHKAN SEMUA DATA YANG DIBUTUHKAN WEBSITE
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: nickname,
          user_id: id,           // ✅ ID GAME
          zone_id: zone || '-',  // ✅ ZONE
          game: 'Super Sus'      // ✅ NAMA GAME
        }
      });
    } else {
      return res.status(200).json({
        code: 404,
        status: false,
        message: "Nickname tidak ditemukan"
      });
    }
    
  } catch (error) {
    return res.status(200).json({
      code: 500,
      status: false,
      message: `Error: ${error.message}`
    });
  }
}
