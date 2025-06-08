declare const process: any; // Para acceder a process.env en tiempo de compilación

const isProduction = window.location.hostname !== 'localhost';

export const environment = {
    production: false,
    apiUrl: 'http://localhost/Proyecto%20Integrado/backend',
    imageUrl: isProduction
        ? 'https://proyecto-integrado.onrender.com'
        : 'http://localhost/Proyecto%20Integrado/backend'
};
