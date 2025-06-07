<?php
require_once 'modelos.php';

$modelo = new Modelo();

try {
    // Actualizar todas las rutas de imágenes de images/ a uploads/
    $resultado = $modelo->ActualizarRutasImagenes();
    
    if ($resultado) {
        echo "Rutas actualizadas correctamente de 'images/' a 'uploads/'";
    } else {
        echo "No se pudieron actualizar las rutas";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
} 