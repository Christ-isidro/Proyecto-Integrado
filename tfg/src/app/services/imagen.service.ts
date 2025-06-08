import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Imagen } from '../models/imagen';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, retry, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private url = environment.apiUrl;
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

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en el servicio de imágenes:', {
      error: error.error,
      status: error.status,
      message: error.message
    });

    let errorMessage = 'Ha ocurrido un error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
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

    // Limpiar la ruta de cualquier prefijo no deseado
    let cleanPath = relativePath
      .replace(/^\/+/, '')  // Eliminar slashes iniciales
      .replace(/\\/g, '/'); // Reemplazar backslashes por forward slashes

    // Si la ruta ya contiene 'uploads', extraer solo el nombre del archivo
    if (cleanPath.includes('uploads/')) {
      cleanPath = cleanPath.split('uploads/').pop() || '';
    }

    // Construir la URL completa usando serve-image.php
    const fullUrl = `${this.baseImagePath}/serve-image.php?file=${encodeURIComponent(cleanPath)}`;
    
    console.log('Generated image URL:', {
      originalPath: relativePath,
      cleanPath: cleanPath,
      fullUrl: fullUrl,
      baseImagePath: this.baseImagePath
    });

    return fullUrl;
  }

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p).pipe(
      tap(imagenes => {
        console.log('ListarImagenes response:', imagenes);
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      })
    );
  }

  ListarImagenesAdmitidas(): Observable<Imagen[]> {
    const body = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });

    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3), // Reintentar hasta 3 veces
      tap(imagenes => {
        console.log('Respuesta de ListarImagenesAdmitidas:', imagenes);
        if (Array.isArray(imagenes)) {
          imagenes.forEach(img => {
            if (img && img.ruta) {
              img.ruta = this.getImageUrl(img.ruta);
            }
          });
        } else {
          console.error('La respuesta no es un array:', imagenes);
        }
      }),
      catchError(this.handleError)
    );
  }

  ObtenerImagenesPorUsuario(id_usuario: number) {
    let p = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p).pipe(
      tap(imagenes => {
        console.log('ObtenerImagenesPorUsuario response:', imagenes);
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      })
    );
  }

  uploadImage(file: File, id_usuario: number, titulo: string): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('titulo', titulo);
    formData.append('accion', 'SubirImagen');

    console.log('Iniciando subida de imagen:', {
      url: `${this.url}/servicios.php`,
      id_usuario,
      titulo,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });

    return this.http.post(`${this.url}/servicios.php`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      retry(3),
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round(100 * event.loaded / (event.total || event.loaded));
          console.log('Progreso de subida:', {
            progress: `${progress}%`,
            loaded: `${(event.loaded / 1024 / 1024).toFixed(2)}MB`,
            total: event.total ? `${(event.total / 1024 / 1024).toFixed(2)}MB` : 'desconocido'
          });
        } else if (event.type === HttpEventType.Response) {
          console.log('Respuesta del servidor:', event.body);
        }
      }),
      catchError(this.handleError)
    );
  }

  eliminarImagen(id_imagen: number): Observable<any> {
    const body = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });

    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  ValidarImagen(id_imagen: number, estado: string): Observable<any> {
    const body = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado
    });

    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  votarImagen(id_imagen: number, id_usuario: number): Observable<any> {
    const body = JSON.stringify({
      accion: "VotarImagen",
      id_imagen: id_imagen,
      id_usuario: id_usuario
    });

    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  obtenerVotosUsuario(id_usuario: number): Observable<number[]> {
    const body = JSON.stringify({
      accion: "ObtenerVotosUsuario",
      id_usuario: id_usuario
    });

    return this.http.post<number[]>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
}
