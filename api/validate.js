<?php
header('Content-Type: application/json');

$id = $_GET['id'] ?? '';
$server = $_GET['server'] ?? '';

if (!$id || !$server) {
    echo json_encode([
        'success' => false,
        'message' => 'ID atau Server kosong'
    ]);
    exit;
}

// 🔴 SIMULASI (nanti ganti API asli MLBB)
if (strlen($id) < 6) {
    echo json_encode([
        'success' => false,
        'message' => 'ID tidak valid'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'username' => 'NeetPlayer_' . substr($id, -3)
    ]);
}
