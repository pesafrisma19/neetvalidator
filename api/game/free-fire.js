// File: /api/game/free-fire.js
import axios from 'axios';

export default async function handler(req, res) {
  // 1. Set header response JSON
  res.setHeader('Content-Type', 'application/json');
  
  // 2. Ambil parameter dari query string
  const { id, zone } = req.query;
  
  // 3. Validasi input
  if (!id || !/^\d+$/.test(id)) {
    return res.status(400).json({
      status: false,
      message: "ID harus diisi dan berupa angka"
    });
  }
  
  // 4. Parameter untuk request ke API Dunia Games
  const params = new URLSearchParams({
    productId: '3',
    itemId: '353',
    catalogId: '376',
    paymentId: '1252',
    gameId: id,
    product_ref: 'CMS',
    product_ref_denom: 'REG',
  });
  
  try {
    // 5. Kirim request ke API Dunia Games (scraping)
    const response = await axios.post(
      'https://api.duniagames.co.id/api/transaction/v1/top-up/inquiry/store',
      params.toString(), // Konversi URLSearchParams ke string
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Referer': 'https://www.duniagames.co.id/',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000 // Timeout 10 detik
      }
    );
    
    console.log('✅ API Response:', response.data);
    
    // 6. Ekstrak nickname dari response
    const nickname = response.data?.data?.gameDetail?.userName;
    
    if (nickname) {
      return res.json({
        status: true,
        data: {
          username: nickname,
          user_id: id,
          zone_id: zone || '-',
          game: 'Free Fire'
        }
      });
    } else {
      return res.json({
        status: false,
        message: "Nickname tidak ditemukan untuk ID tersebut"
      });
    }
    
  } catch (error) {
    // 7. Penanganan error yang baik
    console.error('💥 Error fetching Free Fire data:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    let errorMessage = "Gagal mengambil data Free Fire";
    let httpStatus = 500;
    
    if (error.response) {
      // Server merespon dengan status error
      httpStatus = error.response.status;
      if (error.response.status === 404) {
        errorMessage = "ID Free Fire tidak ditemukan";
      } else if (error.response.status === 429) {
        errorMessage = "Terlalu banyak permintaan. Coba lagi nanti";
      } else {
        errorMessage = `Error ${error.response.status} dari server`;
      }
    } else if (error.request) {
      // Tidak ada response (timeout/network error)
      errorMessage = "Tidak ada respons dari server (timeout)";
    }
    
    return res.status(httpStatus).json({
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
