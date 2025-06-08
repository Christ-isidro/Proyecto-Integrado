<?php
header('Content-Type: application/json; charset=UTF-8');

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
    if ($data) {
        $logMessage .= " - Data: " . json_encode($data);
    }
    error_log($logMessage . "\n", 3, "upload_errors.log");
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

//  Con esta línea recogemos los datos (en formato JSON), enviados por el cliente:
$datos = file_get_contents('php://input');
//  Lo convertimos a un objeto php:
$objeto = json_decode($datos);

if ($objeto != null) {
    try {
        error_log("Acción recibida: " . $objeto->accion);
        
        switch ($objeto->accion) {
            case 'ListarImagenesAdmitidas':
                $imagenes = $modelo->ListarImagenesAdmitidas();
                error_log("Enviando respuesta ListarImagenesAdmitidas: " . json_encode($imagenes));
                print json_encode($imagenes);
                break;

            case 'VotarImagen':
                $resultado = $modelo->VotarImagen($objeto->id_imagen, $objeto->id_usuario);
                error_log("Enviando respuesta VotarImagen: " . json_encode($resultado));
                print json_encode($resultado);
                break;

            case 'ObtenerVotosUsuario':
                $votos = $modelo->ObtenerVotosUsuario($objeto->id_usuario);
                error_log("Enviando respuesta ObtenerVotosUsuario: " . json_encode($votos));
                print json_encode($votos);
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
        }
    } catch (Exception $e) {
        error_log("Error en servicios.php: " . $e->getMessage());
        http_response_code(500);
        print json_encode(["error" => $e->getMessage()]);
    }
} else {
    error_log("No se recibió ningún objeto JSON válido");
    http_response_code(400);
    print json_encode(["error" => "No se recibió ningún objeto JSON válido"]);
}
