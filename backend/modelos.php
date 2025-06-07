<?php
require_once 'vendor/autoload.php';
require_once 'config.php';


use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Modelo
{
    private $pdo;
    private $jwt_key = 'clave_secreta_segura'; // Cámbiala en producción

    public function __CONSTRUCT()
    {
        try {
            $opciones = array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION);
            
            // Check if PDO PostgreSQL driver is available
            if (!in_array('pgsql', PDO::getAvailableDrivers())) {
                throw new Exception('PostgreSQL PDO driver is not installed');
            }
            
            $this->pdo = new PDO(
                'pgsql:host=ep-withered-pond-a9sxaz90-pooler.gwc.azure.neon.tech;port=5432;dbname=neondb;sslmode=require',
                'neondb_owner',
                'npg_h3HgPyqM0kse',
                $opciones
            );
        } catch (Exception $e) {
            // Return proper JSON error response
            header('Content-Type: application/json');
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
            exit;
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

    public function ListarImagenes()
    {
        try {
            $consulta = "SELECT imagenes.*, usuarios.nombre AS nombre_usuario FROM imagenes JOIN usuarios ON imagenes.id_usuario = usuarios.id";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_OBJ);
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function ListarImagenesAdmitidas()
    {
        try {
            $consulta = "SELECT imagenes.*, usuarios.nombre AS nombre_usuario FROM imagenes JOIN usuarios ON imagenes.id_usuario = usuarios.id WHERE imagenes.estado = 'admitido'";
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
                $datos->rol,
                $datos->id
            ));
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function ValidarImagen($id_imagen, $estado)
    {
        try {
            $consulta = "UPDATE imagenes SET estado = ? WHERE id_imagen = ?";
            $this->pdo->prepare($consulta)->execute(array(
                $estado,
                $id_imagen
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

    public function BorrarImagen($id_imagen)
    {
        // 1. Obtener la ruta de la imagen
        $stmt = $this->pdo->prepare("SELECT ruta FROM imagenes WHERE id_imagen = ?");
        $stmt->execute([$id_imagen]);
        $imagen = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($imagen && isset($imagen['ruta'])) {
            $ruta = __DIR__ . '/' . $imagen['ruta'];
            // 2. Eliminar el archivo físico si existe
            if (file_exists($ruta)) {
                unlink($ruta);
            }
        }

        // 3. Eliminar el registro de la base de datos
        $stmt = $this->pdo->prepare("DELETE FROM imagenes WHERE id_imagen = ?");
        $stmt->execute([$id_imagen]);

        echo json_encode(['success' => true]);
        exit;
    }

    //Inicio de sesion
    public function IniciarSesion($datos)
    {
        try {
            // 1. Busca el usuario por email en la base de datos
            $sql = "SELECT * FROM usuarios WHERE email = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$datos->email]);
            $usuario = $stmt->fetch(PDO::FETCH_OBJ);

            // 2. Si el usuario existe y la contraseña es correcta
            if ($usuario && password_verify($datos->password, $usuario->password)) {
                // 3. Prepara el payload del JWT con datos del usuario y tiempos de expiración
                $payload = [
                    'iat' => time(), // Fecha de emisión
                    'exp' => time() + (60 * 60 * 24), // Expira en 24 horas
                    'data' => [
                        'id' => $usuario->id,
                        'email' => $usuario->email,
                        'nombre' => $usuario->nombre,
                        'rol' => $usuario->rol
                    ]
                ];

                // 4. Genera el token JWT usando la clave secreta
                $jwt = JWT::encode($payload, $this->jwt_key, 'HS256');

                // 5. Devuelve el token y los datos del usuario en formato JSON
                echo json_encode([
                    'success' => true,
                    'token' => $jwt,
                    'usuario' => $payload['data']
                ]);
            } else {
                // 6. Si no existe el usuario o la contraseña es incorrecta, devuelve error
                echo json_encode(['success' => false, 'message' => 'Credenciales inválidas']);
            }
        } catch (Exception $e) {
            // 7. Si ocurre algún error, devuelve error 500 y el mensaje
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    }

    public function ActualizarRutasImagenes()
    {
        try {
            $consulta = "UPDATE imagenes SET ruta = REPLACE(ruta, 'images/', 'uploads/')";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute();
            return true;
        } catch (Exception $e) {
            die($e->getMessage());
        }
    }

    public function SubirImagen($imagen, $id_usuario, $titulo)
    {
        try {
            if (!isset($imagen['tmp_name']) || !is_uploaded_file($imagen['tmp_name'])) {
                throw new Exception('No se ha subido ningún archivo válido.');
            }

            $target_dir = __DIR__ . "/uploads/";
            if (!file_exists($target_dir)) {
                mkdir($target_dir, 0777, true);
            }

            $imageFileType = strtolower(pathinfo($imagen["name"], PATHINFO_EXTENSION));
            $unique_filename = "photo_" . uniqid() . "." . $imageFileType;
            $target_file = $target_dir . $unique_filename;
            
            // Solo guardamos la ruta relativa en la base de datos
            $ruta_relativa = "uploads/" . $unique_filename;

            // Verificar el tipo de archivo
            $allowed_types = ['jpg', 'jpeg', 'png', 'gif'];
            if (!in_array($imageFileType, $allowed_types)) {
                throw new Exception('Solo se permiten archivos JPG, JPEG, PNG y GIF.');
            }

            if (!move_uploaded_file($imagen["tmp_name"], $target_file)) {
                throw new Exception('Error al mover el archivo subido.');
            }

            $sql = "INSERT INTO imagenes (id_usuario, titulo, ruta, estado) VALUES (?, ?, ?, 'pendiente')";
            $stmt = $this->pdo->prepare($sql);
            
            if (!$stmt->execute([$id_usuario, $titulo, $ruta_relativa])) {
                // Si falla la inserción en la BD, eliminamos el archivo
                if (file_exists($target_file)) {
                    unlink($target_file);
                }
                throw new Exception('Error al guardar en la base de datos');
            }

            return [
                "success" => true, 
                "message" => "Imagen subida correctamente",
                "ruta" => $ruta_relativa,
                "id_imagen" => $this->pdo->lastInsertId()
            ];

        } catch (Exception $e) {
            error_log("Error en SubirImagen: " . $e->getMessage());
            return [
                "success" => false,
                "message" => $e->getMessage()
            ];
        }
    }
}
