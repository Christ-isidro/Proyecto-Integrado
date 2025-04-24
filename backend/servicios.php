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

require_once 'modelos.php';
$modelo = new Modelo();


//  Con esta línea recogemos los datos (en formato JSON), enviados por el cliente:
$datos = file_get_contents('php://input');  //  $datos es un string, y no un objeto php
//  Lo convertimos a un objeto php:
$objeto = json_decode($datos);

if ($objeto != null) {
    switch ($objeto -> accion) {

        //Listar
        case 'ListarUsuarios':
            print json_encode($modelo->ListarUsuarios());
            break;


        //Insertar
        case 'InsertarUsuario':
            $modelo->InsertarUsuario($objeto->usuario);
            break;
    }
}
