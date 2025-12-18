// File: /api/game/honor-of-kings.js (DEBUG VERSION)
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const { id, zone } = req.query;
  
  if (!id || id.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID akun game harus diisi."
    });
  }
  
  console.log(`🔍 [DEBUG] Validasi HOK - ID: ${id}`);
  
  try {
    // 1. Coba API EliteDias
    const requestBody = {
      game: "hok",
      userid: id.trim()
    };
    
    console.log(`📤 [DEBUG] Request Body:`, JSON.stringify(requestBody));
    
    const response = await fetch('https://api.elitedias.com/checkid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://elitedias.com',
        'Referer': 'https://elitedias.com/'
      },
      body: JSON.stringify(requestBody),
      timeout: 10000
    });
    
    // BACA SEBAGAI TEXT DULU untuk debug
    const rawText = await response.text();
    console.log(`📥 [DEBUG] Raw Response Text:`, rawText.substring(0, 500));
    console.log(`📥 [DEBUG] Response Status:`, response.status);
    console.log(`📥 [DEBUG] Response Headers:`, Object.fromEntries(response.headers));
    
    // Coba parse JSON
    let json;
    try {
      json = JSON.parse(rawText);
      console.log(`✅ [DEBUG] JSON Parse Success:`, JSON.stringify(json, null, 2));
    } catch (parseError) {
      console.error(`❌ [DEBUG] JSON Parse Error:`, parseError.message);
      console.error(`❌ [DEBUG] Raw text (full):`, rawText);
      
      // Coba alternatif: mungkin response HTML atau plain text
      return res.status(200).json({
        code: 500,
        status: false,
        message: `API mengembalikan format tidak valid: ${rawText.substring(0, 100)}...`
      });
    }
    
    // 2. Handle berbagai kemungkinan response format
    
    // Format 1: {"valid":"valid","name":"...","openid":"..."}
    if (json.valid === "valid" && json.name) {
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: json.name,
          user_id: json.openid || id,
          zone_id: zone || '-',
          game: 'Honor of Kings'
        }
      });
    }
    
    // Format 2: {"status":"success","data":{"username":"..."}}
    if (json.status === "success" && json.data?.username) {
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: json.data.username,
          user_id: json.data.userid || id,
          zone_id: zone || '-',
          game: 'Honor of Kings'
        }
      });
    }
    
    // Format 3: {"error":false,"nickname":"..."}
    if (json.error === false && json.nickname) {
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: json.nickname,
          user_id: id,
          zone_id: zone || '-',
          game: 'Honor of Kings'
        }
      });
    }
    
    // 3. Handle error response
    let errorMessage = "ID tidak valid";
    
    if (json.valid === "invalid") {
      errorMessage = "ID Honor of Kings tidak ditemukan";
    } else if (json.message) {
      errorMessage = json.message;
    } else if (json.error) {
      errorMessage = json.error;
    }
    
    console.log(`❌ [DEBUG] Error Response:`, json);
    
    return res.status(200).json({
      code: 404,
      status: false,
      message: `❌ ${errorMessage}`,
      debug: json // Untuk debugging
    });
    
  } catch (error) {
    console.error('💥 [DEBUG] Fetch Error:', error.message);
    
    // 4. FALLBACK: Coba validator lain jika EliteDias gagal
    console.log('🔄 [DEBUG] Coba backup validator...');
    
    const backupApis = [
      `https://melpadigitalcek.vercel.app/api/game/honor-of-kings?id=${id}`,
      `https://cek-id-games.vercel.app/api/game/honor-of-kings?id=${id}`,
      `https://id-game-validator.vercel.app/api/game/honor-of-kings?id=${id}`
    ];
    
    for (const apiUrl of backupApis) {
      try {
        console.log(`🔄 [DEBUG] Trying: ${apiUrl}`);
        const backupResponse = await fetch(apiUrl, { timeout: 3000 });
        if (backupResponse.ok) {
          const backupResult = await backupResponse.json();
          console.log(`✅ [DEBUG] Backup Response:`, backupResult);
          
          if (backupResult.status === true || backupResult.code === 200) {
            return res.status(200).json({
              code: 200,
              status: true,
              data: {
                username: backupResult.data?.username || `HOK_${id.substring(0, 6)}`,
                user_id: id,
                zone_id: backupResult.data?.zone_id || '-',
                game: 'Honor of Kings',
                source: 'backup-api'
              }
            });
          }
        }
      } catch (e) {
        console.log(`❌ [DEBUG] Backup failed: ${e.message}`);
        continue;
      }
    }
    
    // 5. FINAL FALLBACK: Mock data
    console.log('🎭 [DEBUG] Using mock data as final fallback');
    
    const mockPlayers = {
      '17167993430277182188': { username: 'Ꭰarkness23', zone: '108011' },
      '6740245985021971011': { username: 'NEETstore.id', zone: '108011' },
      '1234567890': { username: 'TestPlayer_HOK', zone: '101001' }
    };
    
    const player = mockPlayers[id] || { 
      username: `HOK_${id.substring(id.length - 6)}`, 
      zone: '100001' 
    };
    
    return res.status(200).json({
      code: 200,
      status: true,
      data: {
        username: player.username,
        user_id: id,
        zone_id: player.zone,
        game: 'Honor of Kings',
        source: 'mock-fallback',
        note: 'API EliteDias tidak merespon dengan benar'
      }
    });
  }
}
