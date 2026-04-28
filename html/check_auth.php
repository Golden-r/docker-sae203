<?php
require_once 'auth.php';

requireAuth();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'authenticated' => true]);