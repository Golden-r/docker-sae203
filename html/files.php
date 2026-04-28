<?php
header('Content-Type: application/json');

$filesDir = __DIR__ . '/files/';
$files = [];

$protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'];
$basePath = dirname($_SERVER['SCRIPT_NAME']);

if (is_dir($filesDir)) {
    $allFiles = scandir($filesDir);
    foreach ($allFiles as $file) {
        if ($file === '.' || $file === '..') continue;
        $filepath = $filesDir . $file;
        if (is_file($filepath)) {
            $files[] = [
                'name' => $file,
                'url' => $protocol . '://' . $host . $basePath . '/files/' . urlencode($file),
                'size' => filesize($filepath),
                'date' => date('Y-m-d H:i:s', filemtime($filepath))
            ];
        }
    }
}

// Un sort par date
usort($files, function ($a, $b) {
    return strcmp($b['date'], $a['date']);
});

echo json_encode(['success' => true, 'files' => $files]);

