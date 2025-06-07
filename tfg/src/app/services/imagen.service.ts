import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Imagen } from '../models/imagen';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';

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

  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    
    // Si ya es una URL completa, devolverla
    if (relativePath.startsWith('http')) {
      return relativePath;
    }

    // Asegurarse de que la ruta use el formato correcto y siempre use uploads
    const cleanPath = relativePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/')
      .replace(/^(images|uploads)\//, '');
    
    // Construir la URL completa siempre usando uploads
    const fullUrl = `${this.baseImagePath}/uploads/${cleanPath}`;
    
    console.log('Generated image URL:', {
      relativePath,
      cleanPath,
      fullUrl,
      isProduction: this.isProduction
    });

    return fullUrl;
  }

  ListarImagenes(): Observable<Imagen[]> {
    return this.http.get<Imagen[]>(`${this.url}/listar_imagenes.php`).pipe(
      map(response => Array.isArray(response) ? response : []),
      tap(imagenes => {
        console.log('Imágenes recibidas:', imagenes);
        if (imagenes && Array.isArray(imagenes)) {
          imagenes.forEach(img => {
            if (img && img.ruta) {
              img.ruta = this.getImageUrl(img.ruta);
            }
          });
        }
      }),
      catchError(this.handleError)
    );
  }

  ListarImagenesAdmitidas(): Observable<Imagen[]> {
    return this.http.get<Imagen[]>(`${this.url}/listar_imagenes_admitidas.php`).pipe(
      map(response => Array.isArray(response) ? response : []),
      tap(imagenes => {
        console.log('Imágenes admitidas recibidas:', imagenes);
        if (imagenes && Array.isArray(imagenes)) {
          imagenes.forEach(img => {
            if (img && img.ruta) {
              img.ruta = this.getImageUrl(img.ruta);
            }
          });
        }
      }),
      catchError(this.handleError)
    );
  }

  ObtenerImagenesPorUsuario(id_usuario: number): Observable<Imagen[]> {
    return this.http.get<Imagen[]>(`${this.url}/obtener_imagenes_por_usuario.php?id_usuario=${id_usuario}`).pipe(
      map(response => Array.isArray(response) ? response : []),
      tap(imagenes => {
        console.log('Imágenes de usuario recibidas:', imagenes);
        if (imagenes && Array.isArray(imagenes)) {
          imagenes.forEach(img => {
            if (img && img.ruta) {
              img.ruta = this.getImageUrl(img.ruta);
            }
          });
        }
      }),
      catchError(this.handleError)
    );
  }

  uploadImage(file: File, id_usuario: number, titulo: string): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('titulo', titulo);

    return this.http.post(`${this.url}/subir_imagen.php`, formData).pipe(
      tap(response => console.log('Upload response:', response)),
      catchError(this.handleError)
    );
  }

  eliminarImagen(id_imagen: number): Observable<any> {
    return this.http.post(`${this.url}/borrar_imagen.php`, { id_imagen }).pipe(
      catchError(this.handleError)
    );
  }

  ValidarImagen(id_imagen: number, estado: string): Observable<any> {
    return this.http.post(`${this.url}/validar_imagen.php`, { id_imagen, estado }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Image service error:', error);
    let errorMessage = 'Ha ocurrido un error con la imagen.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
