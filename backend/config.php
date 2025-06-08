<?php
// Load environment variables if .env file exists
if (file_exists(__DIR__ . '/.env')) {
    $envFile = file_get_contents(__DIR__ . '/.env');
    $lines = explode("\n", $envFile);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0 || empty(trim($line))) continue;
        list($key, $value) = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($value);
    }
}

// Detect environment
$isProduction = (getenv('ENVIRONMENT') === 'production' || 
                (strpos($_SERVER['HTTP_HOST'] ?? '', 'onrender.com') !== false));

// Base URL configuration
define('BASE_URL', getenv('BASE_URL') ?: 
    ($isProduction ? 'https://' . ($_SERVER['HTTP_HOST'] ?? '') : 'http://localhost/Proyecto%20Integrado/backend'));

// Directory configuration
define('UPLOADS_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'uploads');
define('UPLOADS_URL', '/uploads/');

// Database configuration
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'proyecto_integrado');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');
define('DB_PORT', getenv('DB_PORT') ?: ($isProduction ? '5432' : '3306'));
define('DB_TYPE', getenv('DB_TYPE') ?: ($isProduction ? 'pgsql' : 'mysql'));

// CORS configuration
header('Access-Control-Allow-Origin: ' . (getenv('ALLOWED_ORIGINS') ?: '*'));
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Ensure uploads directory exists
if (!file_exists(UPLOADS_DIR)) {
    if (!mkdir(UPLOADS_DIR, 0777, true)) {
        error_log("Error creating uploads directory");
    } else {
        chmod(UPLOADS_DIR, 0777);
        
        // Create .htaccess if it doesn't exist
        $htaccess = UPLOADS_DIR . DIRECTORY_SEPARATOR . '.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Options +FollowSymLinks\nRewriteEngine On\n\n# Allow direct access to image files\n<FilesMatch \"\.(jpg|jpeg|png|gif|webp)$\">\n    Order Allow,Deny\n    Allow from all\n</FilesMatch>\n\n# Set CORS headers for images\n<IfModule mod_headers.c>\n    Header set Access-Control-Allow-Origin \"*\"\n    Header set Access-Control-Allow-Methods \"GET, OPTIONS\"\n    Header set Access-Control-Allow-Headers \"Content-Type\"\n</IfModule>\n\n# Prevent directory listing\nOptions -Indexes");
        }
    }
}
