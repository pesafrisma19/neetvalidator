// File: /api/game/eggy-party.js
// Validasi Eggy Party via NetEase Games API

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
      message: "ID akun game (roleid) harus diisi."
    });
  }
  
  // 4. Eggy Party butuh format roleid khusus
  // Dari data Anda: roleid="84612171", show_roleid="0084612171"
  // Perlu format 8-digit dengan leading zeros
  const formatRoleId = (roleId) => {
    const num = roleId.replace(/[^0-9]/g, '');
    return num.padStart(8, '0');
  };
  
  const formattedId = formatRoleId(id);
  
  try {
    console.log(`🔍 Validasi Eggy Party - ID: ${id} (Formatted: ${formattedId})`);
    
    // 5. Parameter untuk NetEase API
    // Dari URL Anda: /gameclub/eggyparty/15001/login-role
    // 15001 = hostid/region code (Asia/Indonesia)
    const hostId = zone || "15001"; // Default Asia/Indonesia
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const traceId = crypto.randomUUID ? crypto.randomUUID() : `trace_${Date.now()}`;
    
    // 6. Build URL dengan parameter
    const params = new URLSearchParams({
      deviceid: deviceId,
      traceid: traceId,
      timestamp: Date.now().toString(),
      gc_client_version: "1.11.30",
      roleid: formattedId,
      show_roleid: formattedId,
      client_type: "gameclub"
    });
    
    const apiUrl = `https://pay.neteasegames.com/gameclub/eggyparty/${hostId}/login-role?${params}`;
    
    console.log(`📤 Request URL: ${apiUrl.substring(0, 100)}...`);
    
    // 7. Kirim request ke NetEase API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://pay.neteasegames.com/eggyparty/topup',
        'Origin': 'https://pay.neteasegames.com',
        'Accept-Language': 'en-US,en;q=0.9',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-Fetch-Mode': 'cors'
      },
      timeout: 10000
    });
    
    // 8. Parse response JSON
    const json = await response.json();
    
    console.log('🔍 NetEase API Response:', {
      status: response.status,
      code: json.code,
      hasRolename: !!json.data?.rolename,
      rolename: json.data?.rolename
    });
    
    // 9. Cek jika response valid
    // Response format: {"code":"0000","data":{"rolename":"IOS!Peárl",...}}
    if (json.code === "0000" && json.data?.rolename) {
      const nickname = json.data.rolename;
      const roleId = json.data.roleid || json.data.show_roleid || formattedId;
      
      // Decode Unicode characters (contoh: "Pe\u00e1rl" → "Peárl")
      const decodedNickname = nickname.replace(/\\u([\d\w]{4})/gi, 
        (match, grp) => String.fromCharCode(parseInt(grp, 16))
      );
      
      // ✅ SUCCESS
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: decodedNickname,
          user_id: roleId,
          zone_id: json.data.hostid?.toString() || hostId,
          game: 'Eggy Party',
          raw_data: {
            level: json.data.level,
            platform: json.data.platform,
            original_nickname: nickname
          }
        }
      });
    }
    
    // 10. Handle error response
    let errorMessage = "ID tidak valid";
    
    // Error codes dari NetEase
    const errorCodes = {
      "0001": "Parameter tidak valid",
      "0002": "User tidak ditemukan",
      "0003": "Server tidak ditemukan",
      "0004": "Akun diblokir",
      "0005": "System error",
      "0006": "Maintenance",
      "0007": "Rate limit exceeded",
      "0008": "Session expired"
    };
    
    if (json.code && errorCodes[json.code]) {
      errorMessage = errorCodes[json.code];
    } else if (json.msg) {
      errorMessage = json.msg;
    }
    
    // 11. Coba format ID berbeda jika gagal
    if (json.code === "0002" && !id.startsWith("00")) {
      console.log(`🔄 Coba format alternatif untuk ID: ${id}`);
      
      // Coba tanpa formatting atau format berbeda
      const altFormats = [
        id,                           // Asli
        id.padStart(9, '0'),          // 9-digit
        id.padStart(10, '0'),         // 10-digit
        `00${id.replace(/^0+/, '')}`  // Tambah 00 di depan
      ];
      
      for (const altId of altFormats) {
        if (altId === formattedId) continue; // Skip yang sudah dicoba
        
        try {
          const altParams = new URLSearchParams({
            deviceid: deviceId,
            traceid: traceId,
            timestamp: Date.now().toString(),
            gc_client_version: "1.11.30",
            roleid: altId,
            show_roleid: altId,
            client_type: "gameclub"
          });
          
          const altUrl = `https://pay.neteasegames.com/gameclub/eggyparty/${hostId}/login-role?${altParams}`;
          const altResponse = await fetch(altUrl, { timeout: 3000 });
          
          if (altResponse.ok) {
            const altJson = await altResponse.json();
            if (altJson.code === "0000" && altJson.data?.rolename) {
              const decodedName = altJson.data.rolename.replace(/\\u([\d\w]{4})/gi, 
                (match, grp) => String.fromCharCode(parseInt(grp, 16))
              );
              
              return res.status(200).json({
                code: 200,
                status: true,
                data: {
                  username: decodedName,
                  user_id: altJson.data.roleid || altId,
                  zone_id: hostId,
                  game: 'Eggy Party',
                  note: 'Auto-corrected ID format'
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
        code: json.code,
        formatted_id: formattedId
      }
    });
    
  } catch (error) {
    // 12. Penanganan network/timeout error
    console.error('💥 Error mengambil data Eggy Party:', error.message);
    
    let errorMessage = "Gagal terhubung ke server NetEase";
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      errorMessage = "Timeout - server tidak merespon";
    } else if (error.message.includes('fetch failed')) {
      errorMessage = "Tidak dapat terhubung ke API NetEase";
    }
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
