// File: /api/game/honor-of-kings.js
// Validasi untuk Honor of Kings via Midasbuy (ID only)

export default async function handler(req, res) {
  // 1. Atur header untuk JSON
  res.setHeader('Content-Type', 'application/json');
  
  // 2. Ambil parameter dari query string
  const { id, zone } = req.query; // 'zone' opsional
  
  // 3. Validasi input - HANYA ID yang wajib
  if (!id || id.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "ID akun game harus diisi."
    });
  }
  
  try {
    console.log(`🔍 Validasi Honor of Kings - ID: ${id}`);
    
    // 4. Parameter request ke Midasbuy
    // Berdasarkan response sukses Anda, kemungkinan ada parameter default
    const requestBody = {
      "openid": id.trim(),
      // Zone mungkin otomatis atau ada nilai default
      // Coba tanpa zone dulu, atau gunakan zone dari query jika ada
      "zoneid": zone || "", // Kosongkan jika tidak ada, biar Midasbuy tentukan
      "country": "sg",      // Default Singapore
      "lang": "id",         // Bahasa Indonesia
      "shopid": "100001",   // Contoh shop ID
      "gameid": "hok"       // Honor of Kings code
    };
    
    // 5. Kirim request ke Midasbuy API
    const response = await fetch('https://www.midasbuy.com/interface/getCharac', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.midasbuy.com',
        'Referer': 'https://www.midasbuy.com/midasbuy/sg/buy/hok'
      },
      body: JSON.stringify(requestBody),
      timeout: 10000
    });
    
    // 6. Parse response JSON
    const json = await response.json();
    
    console.log('🔍 Midasbuy Response:', {
      ret: json.ret,
      charac_name: json.info?.charac_name,
      zoneid: json.info?.zoneid
    });
    
    // 7. Cek jika response valid
    if (json.ret === 0 && json.info?.charac_name) {
      const username = json.info.charac_name;
      const zoneId = json.info.zoneid || zone || '-';
      const openId = json.info.openid || id;
      
      // ✅ SUCCESS
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: username,
          user_id: openId,
          zone_id: zoneId,
          game: 'Honor of Kings'
        }
      });
    }
    
    // 8. Handle error dengan beberapa skenario
    
    // Skenario 1: Mungkin perlu zone tertentu
    if (json.ret === 1 && !zone) {
      // Coba dengan zone default yang umum
      const commonZones = ["108011", "101001", "102001", "103001"];
      
      for (const commonZone of commonZones) {
        console.log(`🔄 Coba dengan zone: ${commonZone}`);
        
        try {
          const zoneRequestBody = { ...requestBody, zoneid: commonZone };
          const zoneResponse = await fetch('https://www.midasbuy.com/interface/getCharac', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'application/json'
            },
            body: JSON.stringify(zoneRequestBody),
            timeout: 5000
          });
          
          const zoneJson = await zoneResponse.json();
          
          if (zoneJson.ret === 0 && zoneJson.info?.charac_name) {
            return res.status(200).json({
              code: 200,
              status: true,
              data: {
                username: zoneJson.info.charac_name,
                user_id: zoneJson.info.openid || id,
                zone_id: commonZone,
                game: 'Honor of Kings',
                note: 'Auto-detected zone'
              }
            });
          }
        } catch (zoneError) {
          // Continue ke zone berikutnya
          continue;
        }
      }
    }
    
    // 9. Jika semua gagal, return error
    let errorMessage = "ID tidak ditemukan";
    
    switch(json.ret) {
      case -1: errorMessage = "Parameter tidak valid"; break;
      case 1: errorMessage = "User tidak ditemukan"; break;
      case 2: errorMessage = "Zone/Server tidak ditemukan"; break;
      case 3: errorMessage = "Akun diblokir"; break;
      case 4: errorMessage = "System error"; break;
      default: 
        if (json.ret !== undefined) {
          errorMessage = `Error code: ${json.ret}`;
        } else {
          errorMessage = "Response tidak valid dari server";
        }
    }
    
    return res.status(200).json({
      code: 404,
      status: false,
      message: `❌ ${errorMessage}`
    });
    
  } catch (error) {
    console.error('💥 Error API Honor of Kings:', error.message);
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ Gagal terhubung ke server: ${error.message}`
    });
  }
}
