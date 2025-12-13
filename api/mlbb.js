<?php
header('Content-Type: application/json');

// ===== INPUT DARI WEBSITE =====
$userId   = $_GET['user_id']   ?? null;
$serverId = $_GET['server_id'] ?? null;

if (!$userId || !$serverId) {
    echo json_encode([
        'success' => false,
        'message' => 'User ID dan Server ID wajib diisi'
    ]);
    exit;
}

// ===== DATA MOBAPAY =====
$postData = http_build_query([
    'app_id'          => '100000',
    'game_user_key'   => $userId,
    'game_server_key' => $serverId,
    'country'         => 'ID',
    'language'        => 'en',
    'network'         => 'net'
]);

$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL            => 'https://www.mobapay.com/api/game/check', // SESUAI REQUEST KAMU
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $postData,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT        => 15,
    CURLOPT_HTTPHEADER     => [
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept: application/json',
        'Referer: https://www.mobapay.com/mlbb/?r=ID'
    ]
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode([
        'success' => false,
        'message' => 'Gagal koneksi ke Mobapay'
    ]);
    curl_close($ch);
    exit;
}

curl_close($ch);

// ===== PARSE RESPONSE =====
$data = json_decode($response, true);

if (
    !isset($data['user_info']) ||
    $data['user_info']['code'] != 0
) {
    echo json_encode([
        'success' => false,
        'message' => 'ID MLBB tidak valid'
    ]);
    exit;
}

// ===== SUCCESS =====
echo json_encode([
    'success'  => true,
    'nickname' => $data['user_info']['user_name']
]);
