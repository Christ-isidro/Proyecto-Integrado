<?php
require_once 'modelos.php';

$modelo = new Modelo();

try {
    // Actualizar las rutas que comienzan con /backend/uploads/
    $consulta = "UPDATE imagenes SET ruta = REGEXP_REPLACE(ruta, '^/backend/uploads/', 'uploads/')";
    $stmt = $modelo->pdo->prepare($consulta);
    $stmt->execute();
    
    // Actualizar las rutas que comienzan con /uploads/
    $consulta = "UPDATE imagenes SET ruta = REGEXP_REPLACE(ruta, '^/uploads/', 'uploads/')";
    $stmt = $modelo->pdo->prepare($consulta);
    $stmt->execute();
    
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