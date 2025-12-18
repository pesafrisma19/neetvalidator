// File: api/game/supersus.js
import axios from 'axios';

// Variabel untuk caching sederhana (mengurangi request ke API luar)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // Cache selama 5 menit

export default async function handler(req, res) {
  // 1. Atur header response untuk JSON
  res.setHeader('Content-Type', 'application/json');

  const { id } = req.query; // Ambil ID dari query parameter
  const zone = req.query.zone || '-'; // Zone opsional

  // 2. Validasi input
  if (!id || !/^\d+$/.test(id)) { // Cek apakah ID hanya berisi angka
    return res.status(400).json({
      status: false,
      message: "⚠️ ID harus diisi dan berupa angka."
    });
  }

  // 3. Cek cache terlebih dahulu (untuk performa)
  const cacheKey = `supersus:${id}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
    console.log(`🔄 Mengembalikan data dari cache untuk ID: ${id}`);
    return res.json(cachedData.data);
  }

  // 4. Logika utama scraping (sama dengan kode bot Anda)
  try {
    console.log(`🔍 Memulai fetch untuk ID Super Sus: ${id}`);

    const response = await axios.post(
      `https://webpay-api.supersus.io/api/player/${id}`,
      {}, // Body kosong, sama seperti kode Anda
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://webpay.supersus.io',
          'Referer': 'https://webpay.supersus.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' // User-Agent yang umum
        },
        timeout: 10000 // Timeout 10 detik
      }
    );

    console.log(`📥 Response diterima untuk ID: ${id}`, response.data);

    // 5. Ekstrak nickname (struktur data: response.data.data.name)
    const nickname = response?.data?.data?.name;

    if (!nickname) {
      // Jika tidak ada nickname di response
      return res.json({
        status: false,
        message: "❌ Nickname tidak ditemukan untuk ID tersebut."
      });
    }

    // 6. Format response untuk website validator Anda
    const result = {
      status: true,
      data: {
        username: nickname,
        user_id: id,
        zone_id: zone
      }
    };

    // 7. Simpan ke cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    // 8. Kirim response sukses
    return res.json(result);

  } catch (error) {
    // 9. Penanganan error yang lebih baik
    console.error(`💥 Error saat fetch ID ${id}:`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });

    let errorMessage = "Gagal mengambil data.";
    let httpStatus = 500;

    if (error.response) {
      // Server merespon dengan status error (4xx, 5xx)
      httpStatus = error.response.status;
      if (error.response.status === 404) {
        errorMessage = "ID pemain tidak ditemukan.";
      } else if (error.response.status === 429) {
        errorMessage = "Terlalu banyak permintaan. Coba lagi nanti.";
      } else {
        // Coba ambil pesan error dari response
        errorMessage = error.response.data?.message || `Error ${error.response.status} dari server.`;
      }
    } else if (error.request) {
      // Request dibuat tapi tidak ada response (timeout, network error)
      errorMessage = "Tidak ada respons dari server game (timeout).";
    } else {
      // Error lain dalam setup request
      errorMessage = `Error: ${error.message}`;
    }

    // 10. Kirim response error
    return res.status(httpStatus).json({
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
