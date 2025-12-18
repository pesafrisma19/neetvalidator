// File: /api/game/supersus.js (VERSI DIPERBAIKI)
import axios from 'axios';

export default async function handler(req, res) {
  // 1. SET HEADER - PENTING!
  res.setHeader('Content-Type', 'application/json');
  
  const { id, zone } = req.query;
  
  // 2. VALIDASI INPUT
  if (!id || !/^\d+$/.test(id)) {
    // ✅ RESPONSE FORMAT SESUAI WEBSITE ANDA
    return res.status(200).json({
      code: 400,           // HARUS ADA "code"
      status: false,       // boolean false
      message: "ID harus berupa angka"
    });
  }
  
  // 3. LOGIKA SCRAPING (sama dengan sebelumnya)
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
    
    // 4. RESPONSE SUKSES - FORMAT YANG BENAR
    if (nickname) {
      return res.status(200).json({
        code: 200,           // ✅ HARUS ADA, nilai 200
        status: true,        // ✅ boolean true
        data: {
          username: nickname  // ✅ HANYA "username", tidak perlu field lain
        }
      });
    } else {
      return res.status(200).json({
        code: 404,           // ✅ code 404 untuk "not found"
        status: false,
        message: "Nickname tidak ditemukan"
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    
    // 5. RESPONSE ERROR - FORMAT YANG BENAR
    return res.status(200).json({
      code: 500,           // ✅ code 500 untuk server error
      status: false,
      message: `Error: ${error.message}`
    });
  }
}
