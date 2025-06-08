<?php
// Detectar si estamos en el entorno de producción (onrender.com)
$isProduction = (strpos($_SERVER['HTTP_HOST'] ?? '', 'onrender.com') !== false);

// URLs base
if ($isProduction) {
    define('BASE_URL', 'https://proyecto-integrado.onrender.com');
} else {
    define('BASE_URL', 'http://localhost/Proyecto%20Integrado/backend');
}

// Configuración de directorios
define('UPLOADS_DIR', __DIR__ . DIRECTORY_SEPARATOR . 'uploads');
define('UPLOADS_URL', '/uploads/');

// Configuración de la base de datos
if ($isProduction) {
    // Configuración para PostgreSQL en producción
    define('DB_HOST', 'dpg-cnm7vdgl5elc73f2p7h0-a.oregon-postgres.render.com');
    define('DB_NAME', 'proyecto_integrado');
    define('DB_USER', 'admin');
    define('DB_PASS', 'password');
    define('DB_PORT', '5432');
    define('DB_TYPE', 'pgsql');
} else {
    // Configuración para MySQL en desarrollo local
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'proyecto_integrado');
    define('DB_USER', 'root');
    define('DB_PASS', '');
    define('DB_PORT', '3306');
    define('DB_TYPE', 'mysql');
}

// Configuración de CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

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
