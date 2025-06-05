<?php
header("Content-Type: application/json; charset=UTF-8");
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Origin: *');
header('Acces-Control-Allow-Headers: *');
header("Access-Control-Allow-Origin: *"); // allow request from all origin
header('Access-Control-Allow-Credentials: true');
header("Access-Control-Allow-Methods: GET,HEAD,OPTIONS,POST,PUT");
header("Access-Control-Allow-Headers: Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, Authorization");

header('Content-Type: application/json');  //  Todo se devolverá en formato JSON.

require 'vendor/autoload.php';
require_once 'config.php';


use \Firebase\JWT\JWT;
use \Firebase\JWT\Key;


require_once 'modelos.php';
$modelo = new Modelo();


//  Si se recibe una petición POST con el parámetro 'accion' igual a 'SubirImagen',
//  se procesa la subida de una imagen.
if (isset($_POST['accion']) && $_POST['accion'] === 'SubirImagen') {
    //  Comprobamos que se ha enviado un archivo y un id de usuario.
    if (isset($_FILES['imagen']) && isset($_POST['id_usuario'])) {
        //  Llamamos al método SubirImagen del modelo, pasándole el archivo y el id del usuario.
        //  El método SubirImagen se encargará de procesar la imagen y guardarla en el servidor.
        $modelo->SubirImagen(
            $_FILES['imagen'],
            $_POST['id_usuario']
        );
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Datos incompletos.']);
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
