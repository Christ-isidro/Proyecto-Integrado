<?php
header('Access-Control-Allow-Origin: https://proyecto-integrado-rouge.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require 'vendor/autoload.php';
require_once 'config.php';

use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;

require_once 'modelos.php';
$modelo = new Modelo();

// Asegurarse de que el directorio uploads existe
$uploadsDir = __DIR__ . '/uploads';
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0777, true);
}

//  Si se recibe una petición POST con el parámetro 'accion' igual a 'SubirImagen',
//  se procesa la subida de una imagen.
if (isset($_POST['accion']) && $_POST['accion'] === 'SubirImagen') {
    try {
        //  Comprobamos que se ha enviado un archivo y un id de usuario.
        if (isset($_FILES['imagen']) && isset($_POST['id_usuario'])) {
            // Verificar el tipo de archivo
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            $mime_type = finfo_file($finfo, $_FILES['imagen']['tmp_name']);
            finfo_close($finfo);

            if (strpos($mime_type, 'image/') !== 0) {
                throw new Exception('El archivo debe ser una imagen.');
            }

            //  Llamamos al método SubirImagen del modelo
            $resultado = $modelo->SubirImagen(
                $_FILES['imagen'],
                $_POST['id_usuario'],
                titulo: $_POST['titulo']
            );

            // Enviamos la respuesta
            echo json_encode($resultado);
        } else {
            throw new Exception('Datos incompletos.');
        }
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
$datos = file_get_contents('php://input');  //  $datos es un string, y no un objeto php
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
