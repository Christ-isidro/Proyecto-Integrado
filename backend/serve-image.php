<?php
// Habilitar reporte de errores para depuración
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Función para registrar errores
function logError($message) {
    error_log(date('Y-m-d H:i:s') . " - " . $message);
}

// Obtener el nombre del archivo de la URL
$filename = basename($_SERVER['REQUEST_URI']);

// Construir la ruta completa al archivo
$filepath = __DIR__ . '/uploads/' . $filename;

logError("Attempting to serve image: " . $filepath);

// Verificar si el archivo existe
if (!file_exists($filepath)) {
    logError("File not found: " . $filepath);
    header("HTTP/1.0 404 Not Found");
    exit("File not found");
}

// Obtener el tipo MIME del archivo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $filepath);
finfo_close($finfo);

// Verificar que sea una imagen
$allowed_types = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
];

if (!in_array($mime_type, $allowed_types)) {
    logError("Invalid file type: " . $mime_type);
    header("HTTP/1.0 403 Forbidden");
    exit("Invalid file type");
}

// Configurar las cabeceras CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Configurar el tipo de contenido
header('Content-Type: ' . $mime_type);

// Servir la imagen
readfile($filepath); 