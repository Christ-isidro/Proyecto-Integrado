<?php
require_once 'modelos.php';

$modelo = new Modelo();

try {
    // Actualizar todas las rutas para usar la URL completa del backend
    $baseUrl = 'https://proyecto-integrado.onrender.com/uploads';
    
    // Primero, normalizar todas las rutas a formato simple
    $consulta = "UPDATE imagenes SET ruta = REGEXP_REPLACE(ruta, '^.*uploads/', 'uploads/')";
    $stmt = $modelo->pdo->prepare($consulta);
    $stmt->execute();
    
    // Luego, añadir la URL base
    $consulta = "UPDATE imagenes SET ruta = CONCAT(:base_url, '/', ruta)";
    $stmt = $modelo->pdo->prepare($consulta);
    $stmt->execute(['base_url' => rtrim($baseUrl, '/')]);
    
    echo "Rutas actualizadas correctamente\n";
    
    // Mostrar las rutas actualizadas
    $consulta = "SELECT id_imagen, ruta FROM imagenes";
    $stmt = $modelo->pdo->prepare($consulta);
    $stmt->execute();
    $imagenes = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\nRutas actuales:\n";
    foreach ($imagenes as $imagen) {
        echo "ID: " . $imagen['id_imagen'] . " - Ruta: " . $imagen['ruta'] . "\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
} 