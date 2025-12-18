// File: /api/game/mobile-legends.js
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
      message: "Zone/Server ID wajib diisi untuk Mobile Legends"
    });
  }
  
  try {
    // 4. Kirim request ke API Mobapay
    const response = await fetch(
      `https://api.mobapay.com/api/app_shop?app_id=100000&game_user_key=${encodeURIComponent(id)}&game_server_key=${encodeURIComponent(zone)}&country=ID&language=en`,
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
    
    console.log('🔍 Mobapay API Response:', {
      code: json.code,
      hasUserInfo: !!json.data?.user_info,
      username: json.data?.user_info?.user_name
    });
    
    // 6. Cek jika response valid dan ada username
    if (json.code === 0 && json.data?.user_info?.code === 0) {
      const username = json.data.user_info.user_name || '';
      
      if (username) {
        // ✅ SUCCESS - Format response sesuai website Anda
        return res.status(200).json({
          code: 200,
          status: true,
          data: {
            username: username,
            user_id: id,
            zone_id: zone,
            game: 'Mobile Legends'
          }
        });
      } else {
        // Username kosong
        return res.status(200).json({
          code: 404,
          status: false,
          message: "Username tidak ditemukan dalam response"
        });
      }
    }
    
    // 7. Handle berbagai error code dari Mobapay
    let errorMessage = "ID atau Zone tidak valid";
    
    if (json.code !== 0) {
      switch(json.code) {
        case 1:
          errorMessage = "Parameter tidak valid";
          break;
        case 2:
          errorMessage = "Game user tidak ditemukan";
          break;
        case 3:
          errorMessage = "Server game tidak ditemukan";
          break;
        case 4:
          errorMessage = "Akses ditolak";
          break;
        default:
          errorMessage = `Error code: ${json.code}`;
      }
    }
    
    return res.status(200).json({
      code: 404,
      status: false,
      message: `❌ ${errorMessage}`
    });
    
  } catch (error) {
    // 8. Penanganan network/timeout error
    console.error('💥 Error mengambil data Mobile Legends:', error.message);
    
    let errorMessage = "Gagal terhubung ke server";
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      errorMessage = "Timeout - server tidak merespon";
    } else if (error.message.includes('fetch failed')) {
      errorMessage = "Tidak dapat terhubung ke API";
    }
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
