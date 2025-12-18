// File: /api/game/magic-chess-go-go.js
// Validasi untuk game "Magic Chess: Go Go"

export default async function handler(req, res) {
  // 1. Atur header untuk JSON
  res.setHeader('Content-Type', 'application/json');
  
  // 2. Ambil parameter dari query string
  const { id, zone } = req.query;
  
  // 3. Validasi input
  if (!id || id.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID harus diisi"
    });
  }
  
  if (!zone || zone.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "Zone/Server ID wajib diisi untuk Magic Chess"
    });
  }
  
  try {
    // 4. Kirim request ke API Mobapay (app_id: 124526 untuk MCGG)
    const response = await fetch(
      `https://api.mobapay.com/api/app_shop?app_id=124526&game_user_key=${encodeURIComponent(id)}&game_server_key=${encodeURIComponent(zone)}&country=ID&language=en`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'x-lang': 'en',
          'origin': 'https://www.mobapay.com',
          'referer': 'https://www.mobapay.com/',
        },
        timeout: 10000
      }
    );
    
    // 5. Parse response JSON
    const json = await response.json();
    
    console.log('🔍 Mobapay MCGG API Response:', {
      code: json.code,
      hasUserInfo: !!json.data?.user_info,
      username: json.data?.user_info?.user_name
    });
    
    // 6. Cek jika response valid (code === 0)
    if (json.code === 0) {
      const username = json.data?.user_info?.user_name || '';
      
      if (username) {
        // ✅ SUCCESS - Format response untuk website
        return res.status(200).json({
          code: 200,
          status: true,
          data: {
            username: username,
            user_id: id,
            zone_id: zone,
            game: 'Magic Chess: Go Go'
          }
        });
      } else {
        // Username kosong meski code 0
        return res.status(200).json({
          code: 404,
          status: false,
          message: "Username tidak ditemukan dalam response"
        });
      }
    }
    
    // 7. Handle berbagai error code dari Mobapay
    let errorMessage = "ID atau Zone tidak valid";
    
    switch(json.code) {
      case 1:
        errorMessage = "Parameter tidak valid";
        break;
      case 2:
        errorMessage = "User game tidak ditemukan";
        break;
      case 3:
        errorMessage = "Server game tidak ditemukan";
        break;
      case 4:
        errorMessage = "Akses ditolak";
        break;
      case 5:
        errorMessage = "Game sedang maintenance";
        break;
      default:
        if (json.code !== undefined) {
          errorMessage = `Error code: ${json.code}`;
        } else {
          errorMessage = "Format response tidak valid";
        }
    }
    
    return res.status(200).json({
      code: 404,
      status: false,
      message: `❌ ${errorMessage}`
    });
    
  } catch (error) {
    // 8. Penanganan network/timeout error
    console.error('💥 Error mengambil data Magic Chess:', error.message);
    
    let errorMessage = "Gagal terhubung ke server";
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      errorMessage = "Timeout - server tidak merespon";
    } else if (error.message.includes('fetch failed')) {
      errorMessage = "Tidak dapat terhubung ke API Mobapay";
    }
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
