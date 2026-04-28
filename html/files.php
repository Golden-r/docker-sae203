<?php
require_once 'auth.php';

header('Content-Type: application/json');

$filesDir = __DIR__ . '/files/';
$files = [];
$authenticated = isAuthenticated();

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$basePath = dirname($_SERVER['SCRIPT_NAME']);

if (is_dir($filesDir)) {
    $allFiles = scandir($filesDir);
    foreach ($allFiles as $file) {
        if ($file === '.' || $file === '..') continue;
        $filepath = $filesDir . $file;
        if (is_file($filepath)) {
            $fileData = [
                'name' => $file,
                'size' => filesize($filepath),
                'date' => date('Y-m-d H:i:s', filemtime($filepath))
            ];
            // URL seulement si authentifié
            if ($authenticated) {
                $fileData['url'] = $protocol . '://' . $host . $basePath . '/download.php?file=' . urlencode($file);
                $fileData['canDelete'] = true;
            }
            $files[] = $fileData;
        }
    }
}

// Sort par date décroissante
usort($files, function ($a, $b) {
    return strcmp($b['date'], $a['date']);
});

echo json_encode(['success' => true, 'authenticated' => $authenticated, 'files' => $files]);

