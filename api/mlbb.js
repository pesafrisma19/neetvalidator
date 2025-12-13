<?php
header('Content-Type: application/json');

$id   = $_GET['user_id']   ?? null;
$zone = $_GET['server_id'] ?? null;

if (!$id || !$zone) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID dan Server ID wajib diisi'
    ]);
    exit;
}

$url = 'https://api.mobapay.com/api/app_shop?' . http_build_query([
    'app_id'          => '100000',
    'game_user_key'   => $id,
    'game_server_key' => $zone,
    'country'         => 'ID',
    'language'        => 'en'
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        'User-Agent: Mozilla/5.0',
        'Accept: application/json',
        'x-lang: en',
        'Origin: https://www.mobapay.com',
        'Referer: https://www.mobapay.com/'
    ]
]);

$response = curl_exec($ch);

if ($response === false) {
    echo json_encode([
        'success' => false,
        'message' => 'Gagal menghubungi server Mobapay'
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

// === VALIDASI SESUAI NODEJS KAMU ===
if (
    !isset($data['code']) ||
    $data['code'] != 0 ||
    !isset($data['data']['user_info']) ||
    $data['data']['user_info']['code'] != 0
) {
    echo json_encode([
        'success' => false,
        'message' => 'ID MLBB tidak valid'
    ]);
    exit;
}

// === HASIL ===
echo json_encode([
    'success'  => true,
    'nickname' => $data['data']['user_info']['user_name']
]);
