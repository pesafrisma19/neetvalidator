// File: /api/game/honor-of-kings.js
// Validasi Honor of Kings via api.elitedias.com

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
      message: "ID akun game harus diisi."
    });
  }
  
  try {
    console.log(`🔍 Validasi Honor of Kings via EliteDias - ID: ${id}`);
    
    // 4. Request body untuk API EliteDias
    // Dari data Anda: {game: "hok", userid: "17167993430277182188"}
    const requestBody = {
      game: "hok",        // Game code untuk Honor of Kings
      userid: id.trim()   // User ID dari parameter
    };
    
    // 5. Kirim request ke API EliteDias
    const response = await fetch('https://api.elitedias.com/checkid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://elitedias.com',
        'Referer': 'https://elitedias.com/',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(requestBody),
      timeout: 10000
    });
    
    // 6. Parse response JSON
    const json = await response.json();
    
    console.log('🔍 EliteDias API Response:', {
      status: response.status,
      valid: json.valid,
      name: json.name,
      openid: json.openid
    });
    
    // 7. Cek jika response valid
    // Response format: {"valid":"valid","name":"Ꭰarkness23","openid":"17167993430277182188"}
    if (json.valid === "valid" && json.name) {
      const username = json.name;
      const userId = json.openid || id;
      
      // ✅ SUCCESS - Format response untuk website Anda
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: username,
          user_id: userId,
          zone_id: zone || '-',      // EliteDias tidak return zone
          game: 'Honor of Kings',
          source: 'elitedias-api'
        }
      });
    }
    
    // 8. Handle error response
    let errorMessage = "ID tidak valid";
    
    if (json.valid === "invalid") {
      errorMessage = "ID Honor of Kings tidak ditemukan";
    } else if (json.valid === "error") {
      errorMessage = "Error pada server validasi";
    } else if (json.message) {
      errorMessage = json.message;
    }
    
    return res.status(200).json({
      code: 404,
      status: false,
      message: `❌ ${errorMessage}`
    });
    
  } catch (error) {
    // 9. Penanganan network/timeout error
    console.error('💥 Error mengambil data Honor of Kings:', error.message);
    
    let errorMessage = "Gagal terhubung ke server validasi";
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      errorMessage = "Timeout - server tidak merespon";
    } else if (error.message.includes('fetch failed')) {
      errorMessage = "Tidak dapat terhubung ke API EliteDias";
    } else if (error.message.includes('JSON')) {
      errorMessage = "Format response tidak valid";
    }
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
