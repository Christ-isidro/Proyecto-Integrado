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
            error_log("Iniciando ListarImagenesAdmitidas");
            
            if (!$this->pdo) {
                error_log("Error: No hay conexión a la base de datos");
                return [];
            }

            $checkQuery = "SELECT COUNT(*) FROM imagenes WHERE estado IN ('admitida', 'admitido')";
            $count = $this->pdo->query($checkQuery)->fetchColumn();
            error_log("Número de imágenes admitidas encontradas: " . $count);

            if ($count == 0) {
                error_log("No hay imágenes admitidas en la base de datos");
                return [];
            }
            
            $consulta = "SELECT i.*, u.nombre as nombre_usuario, 
                        COALESCE((SELECT COUNT(*) FROM votos v WHERE v.id_imagen = i.id_imagen), 0) as votos 
                        FROM imagenes i 
                        LEFT JOIN usuarios u ON i.id_usuario = u.id 
                        WHERE i.estado IN ('admitida', 'admitido') 
                        ORDER BY i.id_imagen DESC";
            
            error_log("Ejecutando consulta: " . $consulta);
            
            $resultado = $this->pdo->query($consulta);
            if (!$resultado) {
                $error = $this->pdo->errorInfo();
                error_log("Error en la consulta: " . json_encode($error));
                return [];
            }
            
            $imagenes = $resultado->fetchAll(PDO::FETCH_ASSOC);
            error_log("Imágenes encontradas: " . count($imagenes));
            
            foreach ($imagenes as &$img) {
                error_log("Imagen ID: " . $img['id_imagen'] . 
                         ", Usuario: " . $img['nombre_usuario'] . 
                         ", Estado: " . $img['estado'] . 
                         ", Votos: " . $img['votos'] .
                         ", Primeros 100 caracteres de ruta: " . substr($img['ruta'], 0, 100));
            }
            
            return $imagenes;
        } catch (Exception $e) {
            error_log("Error en ListarImagenesAdmitidas: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return [];
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

            // Validar el tamaño del archivo
            $maxFileSize = 20 * 1024 * 1024; // 20MB en bytes
            if ($imagen['size'] > $maxFileSize) {
                throw new Exception('El archivo excede el tamaño máximo permitido de 20MB.');
            }

            // Validar el tipo de archivo
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
            $fileType = mime_content_type($imagen['tmp_name']);
            if (!in_array($fileType, $allowedTypes)) {
                throw new Exception('Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG, GIF y WEBP.');
            }

            // Leer el archivo y convertirlo a base64
            $imageData = file_get_contents($imagen['tmp_name']);
            $base64Image = base64_encode($imageData);
            $base64WithMime = 'data:' . $fileType . ';base64,' . $base64Image;

            error_log("Subiendo imagen - Tipo: " . $fileType . 
                     ", Tamaño original: " . strlen($imageData) . 
                     ", Tamaño base64: " . strlen($base64WithMime) . 
                     ", Primeros 100 caracteres: " . substr($base64WithMime, 0, 100));

            // Insertar en la base de datos usando el campo ruta para el base64
            $sql = "INSERT INTO imagenes (id_usuario, titulo, ruta, estado) VALUES (?, ?, ?, 'pendiente') RETURNING id_imagen";
            $stmt = $this->pdo->prepare($sql);
            
            if (!$stmt->execute([$id_usuario, $titulo, $base64WithMime])) {
                throw new Exception('Error al guardar en la base de datos');
            }

            $id_imagen = $stmt->fetchColumn();

            return [
                "success" => true, 
                "message" => "Imagen subida correctamente",
                "id_imagen" => $id_imagen
            ];

        } catch (Exception $e) {
            error_log("Error en SubirImagen: " . $e->getMessage());
            throw $e;
        }
    }

    public function VotarImagen($id_imagen, $id_usuario)
    {
        try {
            // Validar que los IDs no sean nulos o 0
            if (!$id_imagen || !is_numeric($id_imagen) || $id_imagen <= 0) {
                error_log("ID de imagen inválido: " . var_export($id_imagen, true));
                return ["success" => false, "message" => "ID de imagen inválido"];
            }
            
            if (!$id_usuario || !is_numeric($id_usuario) || $id_usuario <= 0) {
                error_log("ID de usuario inválido: " . var_export($id_usuario, true));
                return ["success" => false, "message" => "ID de usuario inválido"];
            }

            // Verificar que la imagen existe
            $consultaImagen = "SELECT id_imagen FROM imagenes WHERE id_imagen = ?";
            $stmtImagen = $this->pdo->prepare($consultaImagen);
            $stmtImagen->execute([$id_imagen]);
            if (!$stmtImagen->fetch()) {
                error_log("La imagen no existe: " . $id_imagen);
                return ["success" => false, "message" => "La imagen no existe"];
            }

            // Verificar que el usuario existe
            $consultaUsuario = "SELECT id FROM usuarios WHERE id = ?";
            $stmtUsuario = $this->pdo->prepare($consultaUsuario);
            $stmtUsuario->execute([$id_usuario]);
            if (!$stmtUsuario->fetch()) {
                error_log("El usuario no existe: " . $id_usuario);
                return ["success" => false, "message" => "El usuario no existe"];
            }

            // Verificar si ya existe el voto
            $consultaVoto = "SELECT id_voto FROM votos WHERE id_imagen = ? AND id_usuario = ?";
            $stmtVoto = $this->pdo->prepare($consultaVoto);
            $stmtVoto->execute([$id_imagen, $id_usuario]);
            if ($stmtVoto->fetch()) {
                error_log("Voto duplicado - Usuario: $id_usuario, Imagen: $id_imagen");
                return ["success" => false, "message" => "Ya has votado esta imagen"];
            }

            // Insertar el voto
            $consulta = "INSERT INTO votos (id_imagen, id_usuario) VALUES (?, ?) RETURNING id_voto";
            $stmt = $this->pdo->prepare($consulta);
            
            error_log("Intentando insertar voto - Usuario: $id_usuario, Imagen: $id_imagen");
            if ($stmt->execute([$id_imagen, $id_usuario])) {
                $id_voto = $stmt->fetchColumn();
                error_log("Voto registrado exitosamente. ID del voto: " . $id_voto);
                return [
                    "success" => true, 
                    "message" => "Voto registrado correctamente",
                    "id_voto" => $id_voto
                ];
            } else {
                $error = $stmt->errorInfo();
                error_log("Error al insertar voto: " . json_encode($error));
                return ["success" => false, "message" => "Error al registrar el voto"];
            }
        } catch (Exception $e) {
            error_log("Error en VotarImagen: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            return ["success" => false, "message" => "Error al procesar el voto: " . $e->getMessage()];
        }
    }

    public function ObtenerVotosUsuario($id_usuario)
    {
        try {
            if (!$id_usuario) {
                return [];
            }

            $consulta = "SELECT id_imagen FROM votos WHERE id_usuario = $1";
            $stmt = $this->pdo->prepare($consulta);
            $stmt->execute([$id_usuario]);
            return $stmt->fetchAll(PDO::FETCH_COLUMN) ?: [];
        } catch (Exception $e) {
            error_log("Error en ObtenerVotosUsuario: " . $e->getMessage());
            return [];
        }
    }
}
