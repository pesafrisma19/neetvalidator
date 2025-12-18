// File: /api/game/mobile-legends.js
import axios from 'axios';

export default async function handler(req, res) {
  // 1. Atur header untuk JSON
  res.setHeader('Content-Type', 'application/json');
  
  // 2. Ambil parameter dari query string
  const { id, zone } = req.query;
  
  // 3. Validasi input: ID harus ada dan berupa angka
  if (!id || !/^\d+$/.test(id)) {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID harus diisi dan berupa angka"
    });
  }
  
  // 4. Zone ID wajib untuk Mobile Legends
  if (!zone || zone.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "Zone/Server ID wajib diisi untuk Mobile Legends"
    });
  }
  
  // 5. Parameter untuk request ke API Dunia Games
  const params = new URLSearchParams({
    productId: '1',
    itemId: '2',
    catalogId: '57',
    paymentId: '352',
    gameId: id,
    zoneId: zone,  // Gunakan 'zone' dari parameter query
    product_ref: 'REG',
    product_ref_denom: 'AE',
  });
  
  try {
    // 6. Kirim request ke API Dunia Games
    const response = await axios.post(
      'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
      params.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.duniagames.co.id/',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ API DuniaGames MLBB Response:', response.data?.data?.gameDetail);
    
    // 7. Ekstrak nickname dari response
    const nickname = response.data?.data?.gameDetail?.userName;
    
    if (nickname) {
      // ✅ FORMAT RESPONSE YANG BENAR untuk website Anda
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: nickname,
          user_id: id,
          zone_id: zone,        // Simpan zone yang digunakan
          game: 'Mobile Legends',
          server: zone          // Tambahan info server
        }
      });
    } else {
      return res.status(200).json({
        code: 404,
        status: false,
        message: "Nickname tidak ditemukan untuk ID dan Zone tersebut"
      });
    }
    
  } catch (error) {
    // 8. Penanganan error yang baik
    console.error('💥 Error mengambil data Mobile Legends:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    let errorMessage = "Gagal mengambil data Mobile Legends";
    let responseCode = 500;
    
    if (error.response) {
      // Server merespon dengan status error
      responseCode = error.response.status;
      
      if (error.response.status === 404) {
        errorMessage = "ID atau Zone Mobile Legends tidak ditemukan";
      } else if (error.response.status === 400) {
        errorMessage = "ID atau Zone tidak valid";
      } else if (error.response.status === 429) {
        errorMessage = "Terlalu banyak permintaan. Coba lagi nanti";
      } else {
        errorMessage = `Error ${error.response.status} dari server`;
      }
    } else if (error.request) {
      // Tidak ada response (timeout/network error)
      errorMessage = "Tidak ada respons dari server (timeout)";
    }
    
    return res.status(200).json({
      code: responseCode,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
