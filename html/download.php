<?php
require_once 'auth.php';

requireAuth();

$filesDir = __DIR__ . '/files/';

if (!isset($_GET['file']) || empty($_GET['file'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Nom de fichier manquant']);
    exit;
}

$filename = basename($_GET['file']);
$filepath = $filesDir . $filename;

if (!file_exists($filepath) || !is_file($filepath)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Fichier non trouvé']);
    exit;
}

// Détection du type MIME du fichier
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mimeType = $finfo->file($filepath) ?: 'application/octet-stream';

header('Content-Type: ' . $mimeType);
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Content-Length: ' . filesize($filepath));
header('Cache-Control: no-cache, must-revalidate');

readfile($filepath);
exit;