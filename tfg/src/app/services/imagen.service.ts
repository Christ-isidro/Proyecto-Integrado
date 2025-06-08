import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Imagen } from '../models/imagen';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private url: string = environment.apiUrl;
  private isProduction = window.location.hostname !== 'localhost';
  private baseImagePath = this.isProduction 
    ? 'https://proyecto-integrado.onrender.com'
    : 'http://localhost/Proyecto%20Integrado/backend';

  constructor(
    private http: HttpClient
  ) {
    console.log('ImagenService initialized with:', {
      url: this.url,
      isProduction: this.isProduction,
      hostname: window.location.hostname,
      baseImagePath: this.baseImagePath
    });
  }

  getImageUrl(relativePath: string): string {
    if (!relativePath) {
      console.warn('getImageUrl called with empty path');
      return '';
    }
    
    console.log('getImageUrl input:', relativePath);

    // Si ya es una URL completa, devolverla
    if (relativePath.startsWith('http')) {
      console.log('URL is already complete:', relativePath);
      return relativePath;
    }

    // Si la ruta comienza con /backend/, construir la URL completa
    if (relativePath.startsWith('/backend/')) {
      const fullUrl = `${this.baseImagePath}${relativePath}`;
      console.log('Generated image URL from backend path:', fullUrl);
      return fullUrl;
    }

    // Para rutas antiguas o diferentes formatos
    const fileName = relativePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/')
      .replace(/^(images|uploads)\//, '')
      .split('/')
      .pop() || '';

    // Construir la URL usando el endpoint de servir imágenes
    const fullUrl = `${this.baseImagePath}/backend/uploads/${encodeURIComponent(fileName)}`;
    
    console.log('Generated image URL:', {
      originalPath: relativePath,
      fileName: fileName,
      fullUrl: fullUrl,
      baseImagePath: this.baseImagePath
    });

    return fullUrl;
  }

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  ListarImagenesAdmitidas() {
    console.log('Solicitando imágenes admitidas');
    let p = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  ObtenerImagenesPorUsuario(id_usuario: number) {
    let p = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  uploadImage(file: File, id_usuario: number, titulo: string): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('titulo', titulo);
    formData.append('accion', 'SubirImagen');

    console.log('Iniciando subida de imagen:', {
      url: this.url,
      id_usuario,
      titulo,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });

    return this.http.post(this.url, formData);
  }

  eliminarImagen(id_imagen: number) {
    let p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post(this.url, p);
  }

  ValidarImagen(id_imagen: number, estado: string) {
    let p = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado
    });
    return this.http.post<Imagen>(this.url, p);
  }

  votarImagen(id_imagen: number, id_usuario: number) {
    let p = JSON.stringify({
      accion: "VotarImagen",
      id_imagen: id_imagen,
      id_usuario: id_usuario
    });
    return this.http.post<{success: boolean, message: string}>(this.url, p);
  }

  obtenerVotosUsuario(id_usuario: number) {
    let p = JSON.stringify({
      accion: "ObtenerVotosUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<number[]>(this.url, p);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en el servicio de imágenes:', {
      error: error.error,
      status: error.status,
      message: error.message
    });
    return throwError(() => error);
  }
}
