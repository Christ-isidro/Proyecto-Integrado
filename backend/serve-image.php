<?php
// Habilitar reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Función para registrar errores
function logError($message) {
    error_log(date('Y-m-d H:i:s') . " - serve-image.php - " . $message);
}

// Configurar CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Verificar que se proporcionó un nombre de archivo
if (empty($imagePath)) {
    logError("No se proporcionó nombre de archivo");
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'No file specified']);
    exit();
}

// Construir la ruta completa del archivo
$filepath = __DIR__ . '/uploads/' . $imagePath;
logError("Intentando servir archivo: " . $filepath);

// Verificar que el archivo existe
if (!file_exists($filepath)) {
    logError("Archivo no encontrado: " . $filepath);
    http_response_code(404);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'File not found']);
    exit();
}

// Verificar que el archivo está dentro del directorio uploads
$realpath = realpath($filepath);
$uploadsDir = realpath(__DIR__ . '/uploads');
if (strpos($realpath, $uploadsDir) !== 0) {
    logError("Intento de acceso a archivo fuera del directorio uploads");
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Access denied']);
    exit();
}

// Obtener el tipo MIME del archivo
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime_type = finfo_file($finfo, $filepath);
finfo_close($finfo);

// Verificar que es una imagen y establecer el Content-Type correcto
$allowed_types = [
    'image/jpeg' => ['jpg', 'jpeg'],
    'image/png' => ['png'],
    'image/gif' => ['gif'],
    'image/webp' => ['webp']
];

$extension = strtolower(pathinfo($filepath, PATHINFO_EXTENSION));
$is_allowed = false;

foreach ($allowed_types as $mime => $exts) {
    if (in_array($extension, $exts)) {
        $mime_type = $mime;
        $is_allowed = true;
        break;
    }
}

if (!$is_allowed) {
    logError("Tipo de archivo no permitido: " . $mime_type);
    http_response_code(403);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid file type']);
    exit();
}

// Asegurarse de que no hay salida previa
if (ob_get_level()) ob_end_clean();

// Configurar las cabeceras para la imagen
header('Content-Type: ' . $mime_type);
header('Content-Length: ' . filesize($filepath));
header('Cache-Control: public, max-age=31536000');
header('Expires: ' . gmdate('D, d M Y H:i:s \G\M\T', time() + 31536000));
header('Last-Modified: ' . gmdate('D, d M Y H:i:s \G\M\T', filemtime($filepath)));

// Enviar la imagen
readfile($filepath);
exit(); 