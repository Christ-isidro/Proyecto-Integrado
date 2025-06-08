export interface Imagen {
    id_imagen: number;
    titulo: string;
    id_usuario: number;
    ruta: string; // Ahora contendrá la cadena base64
    estado: 'pendiente' | 'admitido' | 'rechazado';
    mime_type?: string;
    nombre_original?: string;
    updated_at?: string;
    votos?: number;
    nombre_usuario?: string;
}
