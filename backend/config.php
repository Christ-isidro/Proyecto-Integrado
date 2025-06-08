<?php
// Definir la ruta base del proyecto
define('BASE_PATH', __DIR__);
define('UPLOADS_DIR', BASE_PATH . DIRECTORY_SEPARATOR . 'uploads');
define('UPLOADS_URL', '/backend/uploads/');

// Asegurarse de que el directorio uploads existe
if (!file_exists(UPLOADS_DIR)) {
    if (!mkdir(UPLOADS_DIR, 0777, true)) {
        error_log("Error creating uploads directory");
    } else {
        chmod(UPLOADS_DIR, 0777);
    }
}
