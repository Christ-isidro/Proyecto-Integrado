<?php
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');
header('Access-Control-Allow-Credentials: true');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
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
if (!file_exists('uploads')) {
    mkdir('uploads', 0777, true);
    // También crear un archivo index.html vacío para prevenir listado de directorios
    file_put_contents('uploads/index.html', '');
}

// Si se recibe una petición GET para una imagen
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['image'])) {
    $imagePath = 'uploads/' . basename($_GET['image']);
    if (file_exists($imagePath)) {
        $mime = mime_content_type($imagePath);
        header('Content-Type: ' . $mime);
        readfile($imagePath);
        exit;
    }
    http_response_code(404);
    echo json_encode(['error' => 'Image not found']);
    exit;
}

//  Si se recibe una petición POST con el parámetro 'accion' igual a 'SubirImagen',
//  se procesa la subida de una imagen.
if (isset($_POST['accion']) && $_POST['accion'] === 'SubirImagen') {
    try {
        //  Comprobamos que se ha enviado un archivo y un id de usuario.
        if (!isset($_FILES['imagen']) || !isset($_POST['id_usuario'])) {
            throw new Exception('Datos incompletos.');
        }

        if ($_FILES['imagen']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('Error al subir el archivo.');
        }

        // Validar el tipo de archivo
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        $fileType = mime_content_type($_FILES['imagen']['tmp_name']);
        if (!in_array($fileType, $allowedTypes)) {
            throw new Exception('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF y WEBP.');
        }

        $resultado = $modelo->SubirImagen(
            $_FILES['imagen'],
            $_POST['id_usuario'],
            $_POST['titulo']
        );

        echo json_encode($resultado);
    } catch (Exception $e) {
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
    switch ($objeto->accion) {
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
}
