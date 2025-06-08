<?php
// Configuración de CORS
header('Access-Control-Allow-Origin: https://proyecto-integrado-tfg.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuración de errores
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Configuración de contenido
header('Content-Type: application/json; charset=UTF-8');

require 'vendor/autoload.php';
require_once 'config.php';
require_once 'modelos.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$modelo = new Modelo();

// Log function
function logError($message, $data = null) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if ($data) {
        $logMessage .= " - Data: " . json_encode($data);
    }
    error_log($logMessage . "\n", 3, "upload_errors.log");
}

// Asegurarse de que el directorio uploads existe
$uploadsDir = __DIR__ . '/uploads';
if (!file_exists($uploadsDir)) {
    if (!mkdir($uploadsDir, 0777, true)) {
        logError("Error al crear el directorio uploads");
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el directorio de uploads']);
        exit;
    }
    chmod($uploadsDir, 0777);
    file_put_contents($uploadsDir . '/index.html', '');
    logError("Directorio uploads creado exitosamente");
}

// Si se recibe una petición GET para una imagen
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['image'])) {
    try {
        $fileName = basename($_GET['image']);
        $imagePath = $uploadsDir . '/' . $fileName;
        
        logError("Solicitud de imagen recibida: " . $fileName);
        
        if (!file_exists($imagePath)) {
            logError("Archivo no encontrado: " . $imagePath);
            http_response_code(404);
            echo json_encode(['error' => 'Image not found']);
            exit;
        }

        $mime = mime_content_type($imagePath);
        header('Content-Type: ' . $mime);
        header('Access-Control-Allow-Origin: https://proyecto-integrado-tfg.vercel.app');
        
        if (!readfile($imagePath)) {
            throw new Exception("Error al leer el archivo");
        }
        exit;
    } catch (Exception $e) {
        logError("Error al servir imagen: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(['error' => 'Error serving image: ' . $e->getMessage()]);
        exit;
    }
}

try {
    // Procesar datos POST
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_POST['accion']) && $_POST['accion'] === 'SubirImagen') {
            logError("Iniciando proceso de subida de imagen");
            
            if (!isset($_FILES['imagen'])) {
                throw new Exception('No se ha enviado ninguna imagen.');
            }

            $resultado = $modelo->SubirImagen(
                $_FILES['imagen'],
                $_POST['id_usuario'],
                $_POST['titulo']
            );

            echo json_encode($resultado);
            exit;
        }

        // Procesar JSON
        $datos = file_get_contents('php://input');
        $objeto = json_decode($datos);

        if ($objeto === null && json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Error al decodificar JSON: ' . json_last_error_msg());
        }

        if ($objeto) {
            switch ($objeto->accion) {
                case 'ListarImagenes':
                    echo json_encode($modelo->ListarImagenes());
                    break;
                // ... resto de casos ...
                default:
                    throw new Exception('Acción no reconocida');
            }
        }
    }
} catch (Exception $e) {
    logError("Error en servicios.php: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'success' => false
    ]);
}
