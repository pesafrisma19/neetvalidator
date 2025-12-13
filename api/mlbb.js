<?php
header('Content-Type: application/json');

// ====== AKTIFKAN LOG ======
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/mlbb_error.log');

// ====== AMBIL PARAMETER ======
$user_id   = $_GET['user_id']   ?? null;
$server_id = $_GET['server_id'] ?? null;

if (!$user_id || !$server_id) {
    echo json_encode([
        'success' => false,
        'message' => 'user_id dan server_id wajib'
    ]);
    exit;
}

// ====== URL MOBAPAY ======
$url = "https://api.mobapay.com/api/app_shop"
    . "?app_id=100000"
    . "&game_user_key={$user_id}"
    . "&game_server_key={$server_id}"
    . "&country=ID"
    . "&language=en";

// ====== CURL ======
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
