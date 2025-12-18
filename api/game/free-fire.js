// File: /api/game/free-fire.js (VERSI DIPERBAIKI)
import axios from 'axios';

export default async function handler(req, res) {
  // 1. Atur header untuk JSON dan beri status HTTP 200 di semua respons
  res.setHeader('Content-Type', 'application/json');
  
  // 2. Ambil parameter dari query string
  const { id, zone } = req.query;
  
  // 3. Validasi input: harus ada dan berupa angka
  if (!id || !/^\d+$/.test(id)) {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID harus diisi dan berupa angka"
    });
  }
  
  // 4. Parameter untuk request ke API Dunia Games (sama seperti sebelumnya)
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
    // 5. Kirim request ke API Dunia Games
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
    
    console.log('✅ API DuniaGames Response diterima');
    
    // 6. Ekstrak nickname dari respons
    const nickname = response.data?.data?.gameDetail?.userName;
    
    if (nickname) {
      // ✅ FORMAT RESPONS YANG BENAR untuk website Anda
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: nickname,
          user_id: id,           // Pastikan ini ada untuk ID Game
          zone_id: zone || '-',  // Tambahkan data zone
          game: 'Free Fire'      // Tambahkan nama game untuk konteks
        }
      });
    } else {
      // Respons API ada, tetapi tidak ada nickname
      return res.status(200).json({
        code: 404,
        status: false,
        message: "Nickname tidak ditemukan untuk ID tersebut"
      });
    }
    
  } catch (error) {
    // 7. Penanganan error yang lebih baik dengan format yang sesuai
    console.error('💥 Error mengambil data Free Fire:', error.message);
    
    let errorMessage = "Gagal mengambil data Free Fire";
    let responseCode = 500;
    
    if (error.response) {
      // Server merespon dengan status error (4xx, 5xx)
      if (error.response.status === 404) {
        errorMessage = "ID Free Fire tidak ditemukan";
        responseCode = 404;
      } else if (error.response.status === 429) {
        errorMessage = "Terlalu banyak permintaan. Coba lagi nanti";
        responseCode = 429;
      } else {
        errorMessage = `Error ${error.response.status} dari server`;
        responseCode = error.response.status;
      }
    } else if (error.request) {
      // Tidak ada respons (timeout/network error)
      errorMessage = "Tidak ada respons dari server (timeout atau jaringan)";
    } else {
      // Error lain dalam setup request
      errorMessage = `Error: ${error.message}`;
    }
    
    // Tetap kembalikan format JSON yang diharapkan website
    return res.status(200).json({
      code: responseCode,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
