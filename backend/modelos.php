<?php
require_once 'vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Modelo
{
    private $pdo;
    private $jwt_key = 'clave_secreta_segura'; // Cámbiala en producción

    public function __CONSTRUCT()
    {
        try {
            $opciones = array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8");
            $this->pdo = new PDO('mysql:host=localhost;dbname=rally_tfg', 'root', '', $opciones);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    //Listar
    public function ListarUsuarios()
    {
        try {
            $consulta = "SELECT * FROM usuarios";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function ObtenerIdUsuario($id)
    {
        try {
            $consulta = "Select u.id, nombre , email , password, rol, i.id_imagen
					From usuarios u LEFT JOIN imagenes i ON(u.id = i.id_usuario) Where u.id = ?";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute(array($id));
            return ($stmt->fetch(PDO::FETCH_OBJ));
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function ObtenerImagenesPorUsuario($id_usuario)
    {
        try {
            $consulta = "SELECT * FROM imagenes WHERE id_usuario = ?";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute([$id_usuario]);
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }


    //Insertar
    public function InsertarUsuario($datos)
    {
        try {
            $hashed_password = password_hash($datos->password, PASSWORD_BCRYPT);

            $consulta = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
            $this->pdo->prepare($consulta)->execute(array(
                $datos->nombre,
                $datos->email,
                $hashed_password,
                $datos->rol
            ));
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function RegistrarUsuario($datos)
    {
        try {
            $hashed_password = password_hash($datos->password, PASSWORD_BCRYPT);

            $consulta = "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)";
            $this->pdo->prepare($consulta)->execute([
                $datos->nombre,
                $datos->email,
                $hashed_password,
                'participante' // siempre asigna este rol
            ]);

            //  Respuesta de éxito
            echo json_encode(["success" => true, "message" => "Usuario registrado correctamente."]);
        } catch (Exception $exception) {
            //  Manejo de errores con respuesta JSON
            http_response_code(500);
            echo json_encode(["success" => false, "error" => $exception->getMessage()]);
        }
    }


    //Modificar (Actualizar)
    public function EditarUsuario($datos)
    {
        try {
            $hashed_password = password_hash($datos->password, PASSWORD_BCRYPT);

            $consulta = "UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?";

            $this->pdo->prepare($consulta)->execute(array(
                $datos->nombre,
                $datos->email,
                $hashed_password,
                $datos->rol
            ));
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    //Borrar
    public function BorrarUsuario($id)
    {
        try {
            $stm = $this->pdo->prepare("DELETE FROM usuarios WHERE id = ?");
            $stm->execute(array($id));
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    //Inicio de sesion
    public function IniciarSesion($datos)
    {
        try {
            $sql = "SELECT * FROM usuarios WHERE email = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$datos->email]);
            $usuario = $stmt->fetch(PDO::FETCH_OBJ);

            if ($usuario && password_verify($datos->password, $usuario->password)) {
                $payload = [
                    'iat' => time(),
                    'exp' => time() + (60 * 60 * 24),
                    'data' => [
                        'id' => $usuario->id,
                        'email' => $usuario->email,
                        'nombre' => $usuario->nombre,
                        'rol' => $usuario->rol
                    ]
                ];

                $jwt = JWT::encode($payload, $this->jwt_key, 'HS256');

                echo json_encode([
                    'success' => true,
                    'token' => $jwt,
                    'usuario' => $payload['data']
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function SubirImagen()
    {
        try {
            // Verifica si hay archivo y datos
            if (!isset($_FILES['imagen']) || !isset($_POST['id_usuario'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
                return;
            }

            $id_usuario = $_POST['id_usuario'];
            $imagen = $_FILES['imagen'];
            $nombreArchivo = basename($imagen['name']);
            $directorio = 'images/';

            // Crear nombre único para evitar conflictos
            $nombreUnico = uniqid() . "_" . $nombreArchivo;
            $rutaFinal = $directorio . $nombreUnico;

            // Mover imagen al servidor
            if (move_uploaded_file($imagen['tmp_name'], $rutaFinal)) {
                // Guardar ruta en la base de datos con estado "pendiente"
                $consulta = "INSERT INTO imagenes (id_usuario, ruta, estado) VALUES (?, ?, 'pendiente')";
                $stmt = $this->pdo->prepare($consulta);
                $stmt->execute([$id_usuario, $rutaFinal]);

                echo json_encode(['success' => true, 'ruta' => $rutaFinal]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'No se pudo guardar la imagen']);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
