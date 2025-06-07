<?php
$requestPath = $_SERVER['REQUEST_URI'];
$filePath = basename($requestPath);

// Si el archivo existe, servirlo con el tipo MIME correcto
if (file_exists($filePath)) {
    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
    
    // Definir tipos MIME para imágenes
    $mimeTypes = [
        'jpg' => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'png' => 'image/png',
        'gif' => 'image/gif',
        'webp' => 'image/webp'
    ];
    
    if (isset($mimeTypes[$extension])) {
        // Establecer las cabeceras CORS
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
        
        // Establecer el tipo MIME correcto
        header('Content-Type: ' . $mimeTypes[$extension]);
        
        // Servir el archivo
        readfile($filePath);
        exit;
    }
}

// Si el archivo no existe o no es una imagen, devolver 404
header('HTTP/1.0 404 Not Found');
echo 'File not found'; 