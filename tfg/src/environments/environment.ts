declare const process: any; // Para acceder a process.env en tiempo de compilación

const isProduction = window.location.hostname !== 'localhost';

export const environment = {
    production: false,
    apiUrl: 'https://proyecto-integrado.onrender.com',
    imageBaseUrl: 'https://proyecto-integrado.onrender.com/uploads'
};
