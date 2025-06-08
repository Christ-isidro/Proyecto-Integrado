<?php
// Definir la ruta base del proyecto
define('BASE_PATH', __DIR__);
define('UPLOADS_DIR', BASE_PATH . DIRECTORY_SEPARATOR . 'uploads');
define('UPLOADS_URL', '/backend/uploads/');

// Configuración de la base de datos PostgreSQL
$db_config = [
    'host' => getenv('PGHOST') ?: 'localhost',
    'port' => getenv('PGPORT') ?: '5432',
    'dbname' => getenv('PGDATABASE') ?: 'nombre_base_datos',
    'user' => getenv('PGUSER') ?: 'usuario',
    'password' => getenv('PGPASSWORD') ?: 'contraseña'
];

try {
    $dsn = "pgsql:host={$db_config['host']};port={$db_config['port']};dbname={$db_config['dbname']}";
    $pdo = new PDO($dsn, $db_config['user'], $db_config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    error_log("Error de conexión: " . $e->getMessage());
    die("Error de conexión a la base de datos");
}

// Asegurarse de que el directorio uploads existe
if (!file_exists(UPLOADS_DIR)) {
    if (!mkdir(UPLOADS_DIR, 0777, true)) {
        error_log("Error creating uploads directory");
    } else {
        chmod(UPLOADS_DIR, 0777);
    }
}
