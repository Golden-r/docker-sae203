<?php
/**
 * Helper d'authentification SafeShare
 */

$VALID_USER = 'sae203';
$VALID_PASS = 'crokeur2pied67';

function getAuthCredentials() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    // Pour Apache + mod_php avec PHP_AUTH_USER déjà défini
    if (isset($_SERVER['PHP_AUTH_USER']) && isset($_SERVER['PHP_AUTH_PW'])) {
        return [
            'user' => $_SERVER['PHP_AUTH_USER'],
            'pass' => $_SERVER['PHP_AUTH_PW']
        ];
    }
    
    // Lecture manuelle du header Authorization
    if (strpos($authHeader, 'Basic ') === 0) {
        $credentials = base64_decode(substr($authHeader, 6));
        if ($credentials !== false && strpos($credentials, ':') !== false) {
            list($user, $pass) = explode(':', $credentials, 2);
            return ['user' => $user, 'pass' => $pass];
        }
    }
    
    return null;
}

function isAuthenticated() {
    global $VALID_USER, $VALID_PASS;
    $creds = getAuthCredentials();
    if ($creds === null) return false;
    return ($creds['user'] === $VALID_USER && $creds['pass'] === $VALID_PASS);
}

function requireAuth() {
    if (!isAuthenticated()) {
        header('WWW-Authenticate: Basic realm="SafeShare"');
        header('HTTP/1.0 401 Unauthorized');
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Authentification requise']);
        exit;
    }
}

