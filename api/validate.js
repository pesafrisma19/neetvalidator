// Vercel Serverless Function untuk menangani permintaan validasi
// File ini HARUS disimpan di dalam folder 'api' di root proyek GitHub Anda.

// Import library 'node-fetch' jika Anda menggunakan environment Node.js non-Vercel, 
// tapi di lingkungan Vercel atau Node.js modern, 'fetch' sudah tersedia secara global.

/**
 * Handle HTTP requests (POST method expected from frontend).
 * @param {import('@vercel/node').VercelRequest} req - Vercel Request object
 * @param {import('@vercel/node').VercelResponse} res - Vercel Response object
 */
module.exports = async (req, res) => {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Metode tidak diizinkan. Gunakan POST.' });
    }

    // Ambil data dari frontend (index.html)
    const { gameId, playerId, serverRegion } = req.body;

    // --- KEAMANAN DAN VALIDASI INPUT SISI SERVER ---
    if (!gameId || !playerId) {
        return res.status(400).json({ success: false, message: 'ID Game dan Game ID harus diisi.' });
    }
    
    // Asumsikan kita hanya peduli dengan MLBB untuk demo API sungguhan
    if (gameId !== 'mlbb') {
        return res.status(400).json({ success: false, message: `Validasi untuk game ${gameId} belum didukung oleh backend ini.` });
    }

    // --- KONFIGURASI API KEY (CRUCIAL!) ---
    // Gunakan Vercel Environment Variables untuk menyimpan API Key Anda dengan aman.
    // Contoh: Tambahkan variabel lingkungan bernama MOBAPAY_API_KEY dan MOBAPAY_SECRET_KEY
    const MOBAPAY_API_KEY = process.env.MOBAPAY_API_KEY || 'YOUR_MOCK_API_KEY';
    const MOBAPAY_SECRET_KEY = process.env.MOBAPAY_SECRET_KEY || 'YOUR_MOCK_SECRET';
    
    // URL API Validator MoBAPay (GANTI dengan URL API yang sebenarnya)
    const validationUrl = 'https://api.mobapay.com/v1/user/check'; // Contoh URL

    try {
        // --- LOGIKA PANGGILAN API KE MOBA-PAY/PIHAK KETIGA ---
        
        // 1. Siapkan data yang diperlukan oleh API MoBAPay (Contoh Struktur)
        const apiPayload = {
            id: playerId,
            zone: serverRegion, // Untuk MLBB, ini adalah Server ID
            // Parameter lain seperti signature/timestamp mungkin diperlukan
            api_key: MOBAPAY_API_KEY,
            // Anda mungkin perlu membuat signature menggunakan secret key
            // signature: generateSignature(apiPayload, MOBAPAY_SECRET_KEY) 
        };

        // 2. Kirim permintaan POST ke API Pihak Ketiga
        console.log(`Sending validation request for MLBB ID: ${playerId}, Zone: ${serverRegion}`);
        
        // Catatan: Kami menggunakan fetch bawaan Node.js di Vercel
        const apiResponse = await fetch(validationUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Header otorisasi tambahan jika diperlukan
            },
            body: JSON.stringify(apiPayload),
            timeout: 5000 // Timeout 5 detik
        });
        
        const apiResult = await apiResponse.json();

        // 3. Proses Hasil dari API MoBAPay (Contoh Pemrosesan)
        if (apiResponse.ok && apiResult.status === 'success') {
            const username = apiResult.data.username; // Ganti dengan struktur respons MoBAPay yang sebenarnya
            
            // Beri respons sukses kembali ke frontend
            return res.status(200).json({ 
                success: true, 
                username: username, 
                gameName: 'Mobile Legends Bang Bang', 
                message: `Username ditemukan: ${username}` 
            });
            
        } else {
            // Tangani kegagalan dari API Pihak Ketiga
            const errorMessage = apiResult.message || 'ID tidak valid atau error dari layanan pihak ketiga.';
            
            // Beri respons gagal kembali ke frontend
            return res.status(200).json({ // Status 200 karena respons dari backend berhasil diterima
                success: false, 
                username: null, 
                gameName: 'Mobile Legends Bang Bang', 
                message: errorMessage 
            });
        }

    } catch (error) {
        // Tangani error teknis (jaringan, timeout, error kode, dll.)
        console.error('Error in Vercel Function validation:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan internal server saat memvalidasi ID.' 
        });
    }
};
