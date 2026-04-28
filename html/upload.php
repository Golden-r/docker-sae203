<?php
header('Content-Type: application/json');

$uploadDir = __DIR__ . '/files/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    $error = $_FILES['file']['error'] ?? 'Aucun fichier reçu';
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Erreur upload: ' . $error]);
    exit;
}

$file = $_FILES['file'];
$originalName = basename($file['name']);
$extension = pathinfo($originalName, PATHINFO_EXTENSION);

// Generate a random unique filename
$randomName = bin2hex(random_bytes(8)) . ($extension ? '.' . $extension : '');
$targetPath = $uploadDir . $randomName;

// Ensure upload directory exists
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0775, true);
}

if (move_uploaded_file($file['tmp_name'], $targetPath)) {
    chmod($targetPath, 0644);

    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $downloadLink = $protocol . '://' . $host . dirname($_SERVER['SCRIPT_NAME']) . '/download.php?file=' . urlencode($randomName);

    echo json_encode([
        'success' => true,
        'link' => $downloadLink,
        'filename' => $originalName
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Échec de l\'enregistrement du fichier']);
}

