<?php
require_once 'auth.php';

requireAuth();

$filesDir = __DIR__ . '/files/';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$filename = $input['file'] ?? ($_POST['file'] ?? '');

if (empty($filename)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Nom de fichier manquant']);
    exit;
}

$filename = basename($filename);
$filepath = $filesDir . $filename;

if (!file_exists($filepath) || !is_file($filepath)) {
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Fichier non trouvé']);
    exit;
}

if (unlink($filepath)) {
    header('Content-Type: application/json');
    echo json_encode(['success' => true, 'message' => 'Fichier supprimé']);
} else {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Échec de la suppression']);
}