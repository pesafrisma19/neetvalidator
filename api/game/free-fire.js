// File: api/game/free-fire.js - Contoh validasi sederhana
export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      status: false,
      message: "ID wajib diisi"
    });
  }
  
  // Simulasi validasi sederhana
  // Ganti dengan API asli Free Fire nanti
  if (id.length >= 6) {
    return res.json({
      status: true,
      data: {
        username: `FF_Player_${id}`,
        user_id: id,
        zone_id: '-'
      }
    });
  } else {
    return res.json({
      status: false,
      message: "ID Free Fire tidak valid"
    });
  }
}
