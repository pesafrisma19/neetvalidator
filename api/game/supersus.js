const axios = require('axios');

export default async function handler(req, res) {
  const { id, zone } = req.query;
  
  console.log('🔍 Validating Super Sus ID:', id); // Log untuk debugging
  
  if (!id) {
    return res.status(400).json({
      status: false,
      message: "ID wajib diisi"
    });
  }
  
  try {
    // 1. Coba API Super Sus
    const response = await axios.post(
      `https://webpay-api.supersus.io/api/player/${id}`,
      {},
      {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://webpay.supersus.io',
          'Referer': 'https://webpay.supersus.io/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 5000 // Timeout 5 detik
      }
    );
    
    console.log('📦 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(response.data, null, 2));
    
    // 2. Cek apakah response valid
    if (!response.data || typeof response.data !== 'object') {
      console.error('❌ Response tidak valid:', response.data);
      return res.json({
        status: false,
        message: "Format response tidak valid dari server Super Sus"
      });
    }
    
    const nickname = response.data?.data?.name || response.data?.name;
    
    console.log('👤 Nickname found:', nickname);
    
    if (nickname) {
      return res.json({
        status: true,
        data: {
          username: nickname,
          user_id: id,
          zone_id: zone || '-',
          raw_data: response.data // Untuk debugging
        }
      });
    } else {
      return res.json({
        status: false,
        message: "Nickname tidak ditemukan dalam response",
        raw_response: response.data // Untuk debugging
      });
    }
    
  } catch (error) {
    console.error('💥 Error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status
    });
    
    // 3. Handle berbagai jenis error
    if (error.response) {
      // Server merespon dengan status error
      const errorMsg = error.response.data?.message || 
                      error.response.data?.error || 
                      `HTTP ${error.response.status}`;
      
      return res.status(error.response.status).json({
        status: false,
        message: `Server Super Sus error: ${errorMsg}`,
        debug: {
          status: error.response.status,
          data: error.response.data
        }
      });
      
    } else if (error.request) {
      // Request dibuat tapi tidak ada response
      return res.status(504).json({
        status: false,
        message: "Tidak ada response dari server Super Sus (timeout)"
      });
      
    } else {
      // Error lainnya
      return res.status(500).json({
        status: false,
        message: `Error: ${error.message}`
      });
    }
  }
}
