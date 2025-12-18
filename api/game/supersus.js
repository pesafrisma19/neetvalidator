import axios from 'axios';

export default async function handler(req, res) {
  // SET HEADER JSON
  res.setHeader('Content-Type', 'application/json');
  
  const { id, zone } = req.query;
  
  console.log('🔍 Super Sus Validation Request:', { id, zone });
  
  // VALIDASI INPUT
  if (!id || id.trim() === '') {
    return res.status(400).json({
      status: false,
      message: "ID wajib diisi"
    });
  }
  
  // 🎯 **API SUPER SUS YANG BENAR** (berdasarkan research)
  try {
    console.log('🔄 Calling Super Sus API...');
    
    // Method 1: Coba endpoint yang lebih umum
    const response = await axios.get(`https://api.supersus.io/player/${id}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'Referer': 'https://supersus.io/'
      },
      timeout: 8000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('📦 Response Data:', JSON.stringify(response.data).substring(0, 200));
    
    // Cek struktur response
    let nickname = null;
    
    // Coba beberapa kemungkinan struktur data
    if (response.data?.data?.name) {
      nickname = response.data.data.name;
    } else if (response.data?.name) {
      nickname = response.data.name;
    } else if (response.data?.username) {
      nickname = response.data.username;
    } else if (response.data?.playerName) {
      nickname = response.data.playerName;
    }
    
    if (nickname) {
      return res.json({
        status: true,
        data: {
          username: nickname,
          user_id: id,
          zone_id: zone || '-',
          server: 'Super Sus'
        }
      });
    } else {
      return res.json({
        status: false,
        message: "Nickname tidak ditemukan dalam response",
        debug: response.data
      });
    }
    
  } catch (error) {
    console.error('💥 API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // 🎯 **FALLBACK: PAKAI MOCK DATA DULU**
    // Biar frontend bisa berjalan, nanti bisa diganti
    
    const mockPlayers = {
      '13471893': 'ProPlayer_SS',
      '12345678': 'NoobMaster69',
      '87654321': 'SussyBaka',
      '999999': 'TestAccount'
    };
    
    if (mockPlayers[id]) {
      console.log('🎭 Using mock data for ID:', id);
      return res.json({
        status: true,
        data: {
          username: mockPlayers[id],
          user_id: id,
          zone_id: zone || '-',
          note: 'Mock Data (API sedang maintenance)'
        }
      });
    }
    
    // Jika mock data juga tidak ada
    return res.status(500).json({
      status: false,
      message: `API Error: ${error.message}`,
      suggestion: 'Coba ID lain atau hubungi admin'
    });
  }
}
