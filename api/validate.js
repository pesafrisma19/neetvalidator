// Vercel Serverless Function untuk menangani permintaan validasi
// File ini HARUS disimpan di dalam folder 'api' di root proyek GitHub Anda.

/**
 * Logika Scraping MoBAPay untuk Mobile Legends Bang Bang (MLBB)
 * Endpoint ini tampaknya meniru permintaan browser untuk mendapatkan data pengguna dan status barang.
 * TIDAK memerlukan API Key/Secret yang disimpan di Environment Variables Vercel.
 * * @param {string} id - Player ID MLBB
 * @param {string} zone - Server/Region ID MLBB
 * @returns {Promise<{code: number, status: boolean, data: object, message: string}>}
 */
const mobapayServiceMLBB = async (id, zone) => {
    // URL yang Anda berikan, meniru permintaan aplikasi/web MoBAPay
    const url = `https://api.mobapay.com/api/app_shop?app_id=100000&game_user_key=${id}&game_server_key=${zone}&country=ID&language=en`;

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                // Header-header ini penting untuk meniru permintaan yang valid
                'User-Agent': 'Mozilla/5.0',
                Accept: 'application/json',
                'x-lang': 'en',
                origin: 'https://www.mobapay.com',
                referer: 'https://www.mobapay.com/',
            },
        });

        const json = await res.json();

        // Cek status respons JSON dan status info pengguna
        if (json.code === 0 && json.data?.user_info?.code === 0) {
            const username = json.data.user_info.user_name || 'Username Tidak Diketahui';

            // Menggabungkan semua daftar item untuk menemukan status limit
            const allGoods = [
                ...(json.data.goods || []),
                ...(json.data.shop_info?.good_list || []),
                ...(json.data.shop_info?.shelf_location || []).flatMap(s => s.goods || []),
            ];

            // Mapping ID MLBB untuk paket diamond yang memiliki limit
            const idMap = {
                126306: '50+50💎',
                126307: '150+150💎',
                126315: '250+250💎',
                126316: '500+500💎',
            };

            const statusMap = {};
            for (const idKey in idMap) {
                const item = allGoods.find(g => g.id == idKey);

                if (!item) {
                    statusMap[idKey] = '❓ Tidak ditemukan';
                    continue;
                }

                // Cek field goods_limit.reached_limit
                if (item.goods_limit?.reached_limit) {
                    statusMap[idKey] = '❌ Sudah dibeli';
                } else {
                    statusMap[idKey] = '✅ Tersedia';
                }
            }

            return {
                code: 200,
                status: true,
                data: {
                    username,
                    user_id: id,
                    zone,
                    // Sertakan status map agar bisa ditampilkan di frontend (jika diupdate)
                    diamond_status: statusMap, 
                },
            };
        }

        return {
            code: 404,
            status: false,
            message: 'ID tidak ditemukan atau tidak valid',
        };
    } catch (err) {
        console.error('MLBB error:', err);
        return {
            code: 500,
            status: false,
            message: 'Internal Server Error',
        };
    }
};


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

    const { gameId, playerId, serverRegion } = req.body;

    // --- KEAMANAN DAN VALIDASI INPUT SISI SERVER ---
    if (!gameId || !playerId) {
        return res.status(400).json({ success: false, message: 'ID Game dan Player ID harus diisi.' });
    }
    
    if (gameId !== 'mlbb') {
        // Jika Anda ingin mendukung game lain (seperti PUBG), tambahkan logika validasi di sini
        return res.status(400).json({ success: false, message: `Validasi untuk game ${gameId} belum didukung oleh backend ini.` });
    }
    
    if (!serverRegion) {
        return res.status(400).json({ success: false, message: 'Server Region wajib diisi untuk MLBB.' });
    }

    // --- PANGGIL LOGIKA SCRAPING/VALIDASI MLBB ---
    try {
        const validationResult = await mobapayServiceMLBB(playerId, serverRegion);

        if (validationResult.status) {
            // Sukses: Ubah format respons agar cocok dengan yang diharapkan frontend
            return res.status(200).json({ 
                success: true, 
                username: validationResult.data.username, 
                gameName: 'Mobile Legends Bang Bang', 
                message: `Username ditemukan: ${validationResult.data.username}`,
                // Kirim detail diamond status, meskipun frontend tidak menampilkannya
                diamondStatus: validationResult.data.diamond_status, 
            });
            
        } else {
            // Gagal: ID tidak valid
            return res.status(200).json({ 
                success: false, 
                username: null, 
                gameName: 'Mobile Legends Bang Bang', 
                message: validationResult.message || 'Validasi gagal. ID Game atau Server tidak ditemukan.' 
            });
        }

    } catch (error) {
        // Tangani error teknis (jaringan, timeout, error kode)
        console.error('Error in Vercel Function validation:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Terjadi kesalahan internal server. Coba lagi atau hubungi admin.' 
        });
    }
};
