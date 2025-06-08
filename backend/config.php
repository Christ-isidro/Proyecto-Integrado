<?php
// Definir la ruta base del proyecto
define('BASE_PATH', __DIR__);
define('UPLOADS_DIR', BASE_PATH . DIRECTORY_SEPARATOR . 'uploads');

// Determinar la URL base del backend
$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https://' : 'http://';
$host = $_SERVER['HTTP_HOST'];
define('BASE_URL', $protocol . $host);
define('UPLOADS_URL', '/uploads/');

// Asegurarse de que el directorio uploads existe
if (!file_exists(UPLOADS_DIR)) {
    if (!mkdir(UPLOADS_DIR, 0777, true)) {
        error_log("Error creating uploads directory");
    } else {
        chmod(UPLOADS_DIR, 0777);
        
        // Crear .htaccess si no existe
        $htaccess = UPLOADS_DIR . DIRECTORY_SEPARATOR . '.htaccess';
        if (!file_exists($htaccess)) {
            file_put_contents($htaccess, "Options +FollowSymLinks\nRewriteEngine On\n\n# Allow direct access to image files\n<FilesMatch \"\.(jpg|jpeg|png|gif|webp)$\">\n    Order Allow,Deny\n    Allow from all\n</FilesMatch>\n\n# Set CORS headers for images\n<IfModule mod_headers.c>\n    Header set Access-Control-Allow-Origin \"*\"\n    Header set Access-Control-Allow-Methods \"GET, OPTIONS\"\n    Header set Access-Control-Allow-Headers \"Content-Type\"\n</IfModule>\n\n# Prevent directory listing\nOptions -Indexes");
        }
    }
}
