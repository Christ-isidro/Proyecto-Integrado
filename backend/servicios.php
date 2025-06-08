<?php
// Habilitar reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Función para registrar errores
function logError($message, $data = null) {
    $logMessage = date('Y-m-d H:i:s') . " - servicios.php - " . $message;
    if ($data !== null) {
        $logMessage .= " - Data: " . json_encode($data);
    }
    error_log($logMessage);
}

// Configurar CORS y headers por defecto
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una petición de imagen, manejarla con serve-image.php
if ($_SERVER['REQUEST_METHOD'] === 'GET' && (
    isset($_GET['image']) || 
    (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], '/uploads/') !== false)
)) {
    require_once 'serve-image.php';
    exit();
}

// Para todas las demás peticiones, usar Content-Type JSON
header('Content-Type: application/json; charset=UTF-8');

// Si es una solicitud OPTIONS, terminar aquí
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'vendor/autoload.php';
require_once 'config.php';
require_once 'modelos.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$modelo = new Modelo();

// Asegurarse de que el directorio uploads existe
if (!file_exists(UPLOADS_DIR)) {
    if (!mkdir(UPLOADS_DIR, 0777, true)) {
        logError("Error al crear el directorio uploads");
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el directorio de uploads']);
        exit;
    }
    chmod(UPLOADS_DIR, 0777);
    logError("Directorio uploads creado exitosamente");
}

// Manejar la subida de imágenes
if (isset($_POST['accion']) && $_POST['accion'] === 'SubirImagen') {
    try {
        logError("Iniciando subida de imagen", $_POST);
        logError("FILES array", $_FILES);

        if (!isset($_FILES['imagen'])) {
            throw new Exception('No se ha enviado ninguna imagen.');
        }

        if (!isset($_POST['id_usuario'])) {
            throw new Exception('No se ha especificado el ID de usuario.');
        }

        if ($_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            $uploadErrors = array(
                UPLOAD_ERR_INI_SIZE => 'El archivo excede el tamaño máximo permitido por PHP.',
                UPLOAD_ERR_FORM_SIZE => 'El archivo excede el tamaño máximo permitido por el formulario.',
                UPLOAD_ERR_PARTIAL => 'El archivo se subió parcialmente.',
                UPLOAD_ERR_NO_FILE => 'No se subió ningún archivo.',
                UPLOAD_ERR_NO_TMP_DIR => 'Falta la carpeta temporal.',
                UPLOAD_ERR_CANT_WRITE => 'Error al escribir el archivo.',
                UPLOAD_ERR_EXTENSION => 'Una extensión de PHP detuvo la subida.'
            );
            $errorMessage = isset($uploadErrors[$_FILES['imagen']['error']]) 
                ? $uploadErrors[$_FILES['imagen']['error']]
                : 'Error desconocido al subir el archivo.';
            throw new Exception($errorMessage);
        }

        $resultado = $modelo->SubirImagen(
            $_FILES['imagen'],
            $_POST['id_usuario'],
            $_POST['titulo']
        );

        logError("Imagen subida exitosamente", $resultado);
        echo json_encode($resultado);
        exit();
    } catch (Exception $e) {
        logError("Error al subir imagen: " . $e->getMessage());
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
        exit();
    }
}

// Obtener el raw POST data para otras peticiones
$rawData = file_get_contents('php://input');
logError("Raw input data: " . $rawData);

// Convertir a objeto PHP
$objeto = json_decode($rawData);

if ($objeto === null && json_last_error() !== JSON_ERROR_NONE) {
    logError("Error al decodificar JSON: " . json_last_error_msg());
    http_response_code(400);
    echo json_encode(['error' => 'Datos JSON inválidos: ' . json_last_error_msg()]);
    exit();
}

if ($objeto !== null) {
    try {
        logError("Acción recibida", (array)$objeto);
        
        switch ($objeto->accion) {
            case 'IniciarSesion':
                try {
                    $resultado = $modelo->IniciarSesion($objeto);
                    echo json_encode($resultado);
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;

            case 'ListarImagenesAdmitidas':
                $imagenes = $modelo->ListarImagenesAdmitidas();
                echo json_encode($imagenes);
                break;

            case 'VotarImagen':
                if (!isset($objeto->id_imagen) || !isset($objeto->id_usuario)) {
                    throw new Exception("Faltan parámetros necesarios para votar");
                }
                $resultado = $modelo->VotarImagen($objeto->id_imagen, $objeto->id_usuario);
                echo json_encode($resultado);
                break;

            case 'ObtenerVotosUsuario':
                if (!isset($objeto->id_usuario)) {
                    throw new Exception("Falta el ID de usuario");
                }
                $votos = $modelo->ObtenerVotosUsuario($objeto->id_usuario);
                echo json_encode($votos);
                break;

            case 'ListarUsuarios':
                echo json_encode($modelo->ListarUsuarios());
                break;

            case 'ListarImagenes':
                echo json_encode($modelo->ListarImagenes());
                break;

            case 'ObtenerIdUsuario':
                echo json_encode($modelo->ObtenerIdUsuario($objeto->id));
                break;

            case 'ObtenerImagenesPorUsuario':
                echo json_encode($modelo->ObtenerImagenesPorUsuario($objeto->id_usuario));
                break;

            case 'ValidarImagen':
                $modelo->ValidarImagen($objeto->id_imagen, $objeto->estado);
                echo json_encode(['success' => true]);
                break;

            case 'BorrarImagen':
                $modelo->BorrarImagen($objeto->id_imagen);
                break;

            default:
                logError("Acción no válida", ['accion' => $objeto->accion]);
                http_response_code(400);
                echo json_encode(['error' => 'Acción no válida']);
                break;
        }
    } catch (Exception $e) {
        logError("Error en la petición: " . $e->getMessage());
        http_response_code(400);
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    logError("No se recibieron datos válidos");
    http_response_code(400);
    echo json_encode(['error' => 'No se recibieron datos válidos']);
}
