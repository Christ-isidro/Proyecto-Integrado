// Configuración de CORS
header('Access-Control-Allow-Origin: https://proyecto-integrado-rouge.vercel.app');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Si es una solicitud OPTIONS (preflight), responder inmediatamente
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// ... existing code ... 