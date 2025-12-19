// File: /api/game/blood-strike.js
// Validasi Blood Strike via NetEase API

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { id, zone } = req.query;
  
  // ⭐ PERHATIAN: Blood Strike ada 2 format ID:
  // 1. show_roleid: "584951547755" (numerik)
  // 2. roleid: "BKyCA8YBTxEGyqW3" (alphanumeric)
  // API terima yang numerik sebagai parameter
  
  if (!id || id.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID Blood Strike harus diisi"
    });
  }
  
  try {
    console.log(`🔍 Validasi Blood Strike - ID: ${id}`);
    
    // Clean ID: hapus semua non-numerik (karena butuh show_roleid numerik)
    const numericId = id.replace(/[^0-9]/g, '');
    
    if (!numericId) {
      return res.status(200).json({
        code: 400,
        status: false,
        message: "ID harus mengandung angka (contoh: 584951547755)"
      });
    }
    
    // Parameter untuk NetEase API
    // Note: hostid = -1 (auto-detect) atau zone specific
    const hostId = zone || "-1"; // "-1" untuk auto-detect
    
    const params = new URLSearchParams({
      deviceid: `bs_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      traceid: `trace_${Date.now()}`,
      timestamp: Date.now().toString(),
      gc_client_version: "1.11.30",
      roleid: numericId, // ⭐ Parameter roleid adalah show_roleid numerik
      client_type: "gameclub"
    });
    
    const apiUrl = `https://pay.neteasegames.com/gameclub/bloodstrike/${hostId}/login-role?${params}`;
    
    console.log(`📤 API URL: ${apiUrl.substring(0, 80)}...`);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://pay.neteasegames.com/BloodStrike/topup',
        'Origin': 'https://pay.neteasegames.com',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });
    
    // Parse response
    const json = await response.json();
    
    console.log('🔍 Blood Strike Response:', {
      code: json.code,
      hasRolename: !!json.data?.rolename,
      roleid: json.data?.roleid,
      show_roleid: json.data?.show_roleid,
      hostid: json.data?.hostid
    });
    
    // Response format: {"code":"0000","data":{"rolename":"VON-LYCAON愛",...}}
    if (json.code === "0000" && json.data?.rolename) {
      const nickname = json.data.rolename;
      
      // Decode Unicode (contoh: "VON-LYCAON\u611b" → "VON-LYCAON愛")
      const decodedNickname = nickname.replace(/\\u([\d\w]{4})/gi, 
        (match, grp) => String.fromCharCode(parseInt(grp, 16))
      );
      
      // ⭐ DAPATKAN ZONE DARI RESPONSE
      // hostid: 12002 = Zone tertentu (Asia/Global)
      let zoneName = "Global";
      if (json.data.hostid === 12002) zoneName = "Asia";
      if (json.data.hostid === 12001) zoneName = "Global";
      
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: decodedNickname,
          user_id: json.data.show_roleid || numericId, // ⭐ TAMPILKAN show_roleid
          role_id: json.data.roleid || '', // Alphanumeric ID internal
          zone_id: zoneName, // Auto-detected zone
          actual_hostid: json.data.hostid,
          game: 'Blood Strike',
          note: 'Blood Strike - NetEase FPS Game'
        }
      });
    }
    
    // Error handling
    let errorMessage = "ID tidak ditemukan";
    const errorCodes = {
      "0001": "Parameter tidak valid",
      "0002": "Akun tidak ditemukan",
      "0003": "Server tidak tersedia", 
      "0004": "Akun diblokir",
      "0006": "Server maintenance",
      "0007": "Rate limit exceeded"
    };
    
    if (json.code && errorCodes[json.code]) {
      errorMessage = errorCodes[json.code];
    } else if (json.msg) {
      errorMessage = json.msg;
    }
    
    // ⭐ COBA HOSTID LAIN JIKA -1 GAGAL
    if (json.code === "0002" && hostId === "-1") {
      console.log('🔄 Coba hostid spesifik...');
      
      const altHostIds = ["12001", "12002", "12003", "12004"];
      
      for (const altHostId of altHostIds) {
        try {
          const altParams = new URLSearchParams({
            deviceid: `bs_alt_${Date.now()}`,
            traceid: `trace_alt_${Date.now()}`,
            timestamp: Date.now().toString(),
            gc_client_version: "1.11.30",
            roleid: numericId,
            client_type: "gameclub"
          });
          
          const altUrl = `https://pay.neteasegames.com/gameclub/bloodstrike/${altHostId}/login-role?${altParams}`;
          const altResponse = await fetch(altUrl, { timeout: 3000 });
          
          if (altResponse.ok) {
            const altJson = await altResponse.json();
            if (altJson.code === "0000" && altJson.data?.rolename) {
              const decoded = altJson.data.rolename.replace(/\\u([\d\w]{4})/gi, 
                (match, grp) => String.fromCharCode(parseInt(grp, 16))
              );
              
              let detectedZone = "Unknown";
              if (altHostId === "12001") detectedZone = "Global";
              if (altHostId === "12002") detectedZone = "Asia";
              
              return res.status(200).json({
                code: 200,
                status: true,
                data: {
                  username: decoded,
                  user_id: altJson.data.show_roleid || numericId,
                  zone_id: detectedZone,
                  actual_hostid: parseInt(altHostId),
                  game: 'Blood Strike',
                  note: `Auto-detected zone: ${detectedZone}`
                }
              });
            }
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    return res.status(200).json({
      code: 404,
      status: false,
      message: `❌ ${errorMessage}`,
      debug: {
        input_id: id,
        numeric_id: numericId,
        api_code: json.code
      }
    });
    
  } catch (error) {
    console.error('💥 Blood Strike Error:', error.message);
    
    let errorMessage = "Gagal terhubung ke server Blood Strike";
    if (error.name === 'TimeoutError') {
      errorMessage = "Timeout - server tidak merespon";
    }
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
