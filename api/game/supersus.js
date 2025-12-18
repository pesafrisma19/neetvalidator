// File: /api/game/supersus.js
// API untuk validasi ID game Super Sus

export default async function handler(req, res) {
  // 1. Ambil parameter ID dan Zone dari URL query
  // Contoh akses: https://neetvalidator.vercel.app/api/game/supersus?id=13471893
  const { id, zone } = req.query;

  // 2. Validasi input (sama seperti di kode WhatsApp Anda)
  if (!id) {
    return res.status(400).json({
      status: false,
      message: "⚠️ ID wajib diisi. Contoh: /api/game/supersus?id=13471893"
    });
  }

  // 3. Import axios (Pastikan sudah diinstall via npm install axios)
  const axios = require('axios');

  try {
    // 4. Lakukan request ke API Super Sus (sama persis dengan kode WhatsApp Anda)
    const response = await axios.post(
      `https://webpay-api.supersus.io/api/player/${id}`,
      {}, // Body kosong
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://webpay.supersus.io',
          'Referer': 'https://webpay.supersus.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    // 5. Ekstrak nickname dari response
    const nickname = response?.data?.data?.name;

    // 6. Kirim response ke frontend website Anda
    if (nickname) {
      return res.json({
        status: true,
        data: {
          username: nickname,   // Inilah yang akan ditampilkan di halaman
          user_id: id,          // ID yang dimasukkan user
          zone_id: zone || '-'  // Zone (jika ada)
        }
      });
    } else {
      return res.json({
        status: false,
        message: "❌ Nickname tidak ditemukan untuk ID tersebut."
      });
    }

  } catch (error) {
    // 7. Handle error
    console.error("Error fetching Super Sus data:", error);

    const errorMessage = error?.response?.data?.message || error.message;
    
    return res.status(500).json({
      status: false,
      message: `❌ Gagal mengambil data Super Sus: ${errorMessage}`
    });
  }
}
