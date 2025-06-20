<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'vendor/autoload.php';
require_once 'config.php';
require_once 'modelos.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

$modelo = new Modelo();

// Log function
function logError($message, $data = null) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if ($data !== null) {
        $logMessage .= " - Data: " . json_encode($data);
    }
    error_log($logMessage);
}

// Asegurarse de que el directorio uploads existe
if (!file_exists('uploads')) {
    if (!mkdir('uploads', 0777, true)) {
        logError("Error al crear el directorio uploads");
        http_response_code(500);
        echo json_encode(['error' => 'No se pudo crear el directorio de uploads']);
        exit;
    }
    chmod('uploads', 0777);  // Asegurar permisos después de la creación
    // También crear un archivo index.html vacío para prevenir listado de directorios
    file_put_contents('uploads/index.html', '');
    logError("Directorio uploads creado exitosamente");
}

// Si se recibe una petición GET para una imagen
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['image'])) {
    $imagePath = 'uploads/' . basename($_GET['image']);
    logError("Intentando servir imagen: " . $imagePath);
    if (file_exists($imagePath)) {
        $mime = mime_content_type($imagePath);
        header('Content-Type: ' . $mime);
        readfile($imagePath);
        exit;
    }
    logError("Imagen no encontrada: " . $imagePath);
    http_response_code(404);
    echo json_encode(['error' => 'Image not found']);
    exit;
}

//  Si se recibe una petición POST con el parámetro 'accion' igual a 'SubirImagen',
//  se procesa la subida de una imagen.
if (isset($_POST['accion']) && $_POST['accion'] === 'SubirImagen') {
    try {
        logError("Iniciando subida de imagen", $_POST);
        logError("FILES array", $_FILES);

        //  Comprobamos que se ha enviado un archivo y un id de usuario.
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

        // Validar el tipo de archivo
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        $fileType = mime_content_type($_FILES['imagen']['tmp_name']);
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception("Tipo de archivo no permitido: {$fileType}. Solo se permiten imágenes JPEG, PNG, GIF y WEBP.");
        }

        $resultado = $modelo->SubirImagen(
            $_FILES['imagen'],
            $_POST['id_usuario'],
            $_POST['titulo']
        );

        logError("Imagen subida exitosamente", $resultado);
        echo json_encode($resultado);
    } catch (Exception $e) {
        logError("Error al subir imagen: " . $e->getMessage());
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ]);
    }
    exit;
}

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log the request method and content type
logError("Request Method: " . $_SERVER['REQUEST_METHOD']);
logError("Content Type: " . $_SERVER['CONTENT_TYPE']);

// Get the raw POST data
$rawData = file_get_contents('php://input');
logError("Raw input data: " . $rawData);

//  Convertimos a un objeto php:
$objeto = json_decode($rawData);

if ($objeto !== null) {
    try {
        logError("Acción recibida", $objeto);
        
    switch ($objeto->accion) {
            case 'ListarImagenesAdmitidas':
                $imagenes = $modelo->ListarImagenesAdmitidas();
                logError("Enviando respuesta ListarImagenesAdmitidas", $imagenes);
                echo json_encode($imagenes);
                break;

            case 'VotarImagen':
                if (!isset($objeto->id_imagen) || !isset($objeto->id_usuario)) {
                    logError("Faltan parámetros necesarios para votar", [
                        'id_imagen' => $objeto->id_imagen ?? 'no definido',
                        'id_usuario' => $objeto->id_usuario ?? 'no definido'
                    ]);
                    throw new Exception("Faltan parámetros necesarios para votar");
                }
                logError("Procesando voto", [
                    'id_imagen' => $objeto->id_imagen,
                    'id_usuario' => $objeto->id_usuario
                ]);
                $resultado = $modelo->VotarImagen($objeto->id_imagen, $objeto->id_usuario);
                logError("Enviando respuesta VotarImagen", $resultado);
                echo json_encode($resultado);
                break;

            case 'ObtenerVotosUsuario':
                if (!isset($objeto->id_usuario)) {
                    throw new Exception("Falta el ID de usuario");
                }
                $votos = $modelo->ObtenerVotosUsuario($objeto->id_usuario);
                logError("Enviando respuesta ObtenerVotosUsuario", $votos);
                echo json_encode($votos);
                break;

        //Listar
        case 'ListarUsuarios':
            print json_encode($modelo->ListarUsuarios());
            break;

        case 'ListarImagenes':
            print json_encode($modelo->ListarImagenes());
            break;

        case 'ListarImagenesAdmitidas':
            print json_encode($modelo->ListarImagenesAdmitidas());
            break;

        case 'ObtenerIdUsuario':
            print json_encode($modelo->ObtenerIdUsuario($objeto->id));
            break;

        case 'ObtenerImagenesPorUsuario':
            print json_encode($modelo->ObtenerImagenesPorUsuario($objeto->id_usuario));
            break;

        //Insertar
        case 'InsertarUsuario':
            $modelo->InsertarUsuario($objeto->usuario);
            break;

        case 'RegistrarUsuario':
            $modelo->RegistrarUsuario($objeto->usuario);
            break;

        //Modificar (Actualizar)
        case 'EditarUsuario':
            $modelo->EditarUsuario($objeto->usuario);
            break;

        case 'ValidarImagen':
            $modelo->ValidarImagen($objeto->id_imagen, $objeto->estado);
            break;

        //Borrar
        case 'BorrarUsuario':
            $modelo->BorrarUsuario($objeto->id);
            if ($objeto->listado == "OK")
                print json_encode($modelo->ListarUsuarios());
            else
                print '{"result":"OK"}';
            break;

        case 'BorrarImagen':
            $modelo->BorrarImagen($objeto->id_imagen);
            break;

        // Iniciar sesión
        case 'IniciarSesion':
            $modelo->IniciarSesion($objeto);
            break;

            default:
                logError("Acción no reconocida", $objeto->accion);
                http_response_code(400);
                echo json_encode(["error" => "Acción no reconocida"]);
                break;
        }
    } catch (Exception $e) {
        logError("Error en servicios.php: " . $e->getMessage());
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
} else {
    logError("Error decodificando JSON", ["error" => json_last_error_msg()]);
    http_response_code(400);
    echo json_encode(["error" => "Datos JSON inválidos: " . json_last_error_msg()]);
}
