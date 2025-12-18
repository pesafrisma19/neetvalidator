// File: /api/game/honor-of-kings.js
// Validasi untuk game Honor of Kings via API Midasbuy

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
      message: "ID akun game (openid) harus diisi."
    });
  }
  
  // 4. Zone diperlukan untuk API Midasbuy
  // Zone ID bisa seperti "108011" (lihat dari response API)
  if (!zone || zone.trim() === '') {
    return res.status(200).json({
      code: 400,
      status: false,
      message: "Zone/Server ID wajib diisi untuk Honor of Kings."
    });
  }
  
  try {
    console.log(`🔍 Validasi Honor of Kings - ID: ${id}, Zone: ${zone}`);
    
    // 5. POST request ke API Midasbuy
    // Dari data yang Anda dapatkan:
    // - URL: https://www.midasbuy.com/interface/getCharac
    // - Method: POST
    // - Body: JSON dengan parameter tertentu
    const requestBody = {
      // Parameter ini mungkin perlu disesuaikan berdasarkan data yang Anda kirim
      // Berdasarkan referer dan data, kemungkinan body-nya seperti ini:
      "openid": id,
      "zoneid": zone,
      "shopid": "100001", // Contoh, cek dari request asli
      "lang": "id",
      "country": "sg",
      // Tambahkan parameter lain yang diperlukan dari request asli Anda
    };
    
    // 6. Kirim request ke Midasbuy API
    const response = await fetch('https://www.midasbuy.com/interface/getCharac', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Origin': 'https://www.midasbuy.com',
        'Referer': 'https://www.midasbuy.com/midasbuy/sg/buy/hok',
        'Accept-Language': 'id,en-US;q=0.9,en;q=0.8',
        // Cookie mungkin diperlukan untuk sesi yang valid
        // 'Cookie': 'shopcode=midasbuy; ...' // Hati-hati dengan cookie pribadi!
      },
      body: JSON.stringify(requestBody),
      timeout: 10000
    });
    
    // 7. Parse response JSON
    const json = await response.json();
    
    console.log('🔍 Midasbuy API Response:', {
      status: response.status,
      ret: json.ret,
      charac_name: json.info?.charac_name
    });
    
    // 8. Cek jika response valid
    // Dari data Anda: ret: 0 = sukses, info.charac_name berisi username
    if (json.ret === 0 && json.info?.charac_name) {
      const username = json.info.charac_name;
      const zoneId = json.info.zoneid || zone;
      const openId = json.info.openid || id;
      
      // ✅ SUCCESS - Format response untuk website
      return res.status(200).json({
        code: 200,
        status: true,
        data: {
          username: username,
          user_id: openId,      // Gunakan openid dari response
          zone_id: zoneId,      // Gunakan zoneid dari response
          game: 'Honor of Kings',
          raw_info: json.info   // Optional: simpan data lengkap untuk debugging
        }
      });
    }
    
    // 9. Handle berbagai error code dari Midasbuy
    let errorMessage = "ID atau Zone tidak valid";
    
    switch(json.ret) {
      case -1:
        errorMessage = "Parameter tidak valid";
        break;
      case 1:
        errorMessage = "User tidak ditemukan";
        break;
      case 2:
        errorMessage = "Zone/Server tidak ditemukan";
        break;
      case 3:
        errorMessage = "Akun diblokir (banned)";
        break;
      case 4:
        errorMessage = "System error";
        break;
      default:
        if (json.ret !== undefined && json.ret !== 0) {
          errorMessage = `Error code: ${json.ret}`;
        } else if (!json.info?.charac_name) {
          errorMessage = "Username tidak ditemukan dalam response";
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
    // 10. Penanganan network/timeout error
    console.error('💥 Error mengambil data Honor of Kings:', error.message);
    
    let errorMessage = "Gagal terhubung ke server Midasbuy";
    if (error.name === 'TimeoutError' || error.code === 'ECONNABORTED') {
      errorMessage = "Timeout - server Midasbuy tidak merespon";
    } else if (error.message.includes('fetch failed')) {
      errorMessage = "Tidak dapat terhubung ke API Midasbuy";
    } else if (error.message.includes('JSON')) {
      errorMessage = "Format response dari Midasbuy tidak valid";
    }
    
    return res.status(200).json({
      code: 500,
      status: false,
      message: `❌ ${errorMessage}`
    });
  }
}
