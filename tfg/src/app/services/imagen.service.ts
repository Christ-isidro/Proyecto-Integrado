import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
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
  private url = environment.apiUrl;
  private isProduction = window.location.hostname !== 'localhost';

  constructor(
    private http: HttpClient
  ) {
    console.log('ImagenService initialized with:', {
      url: this.url,
      isProduction: this.isProduction,
      hostname: window.location.hostname
    });
  }

  getImageUrl(relativePath: string): string {
    if (!relativePath) return '';
    
    // Si ya es una URL completa, devolverla
    if (relativePath.startsWith('http')) {
      return relativePath;
    }

    // Asegurarse de que la ruta use el formato correcto
    const cleanPath = relativePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/')
      .replace(/^(images|uploads)\//, '');

    // Construir la URL completa según el entorno
    const baseUrl = this.isProduction
      ? 'https://proyecto-integrado.onrender.com/uploads/'
      : 'http://localhost/Proyecto%20Integrado/backend/uploads/';

    const fullUrl = baseUrl + cleanPath;
    
    console.log('Generated image URL:', {
      relativePath,
      cleanPath,
      fullUrl,
      isProduction: this.isProduction
    });

    return fullUrl;
  }

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(this.url, p).pipe(
      tap(imagenes => {
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      })
    );
  }

  ListarImagenesAdmitidas() {
    let p = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });
    return this.http.post<Imagen[]>(this.url, p).pipe(
      tap(imagenes => {
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      })
    );
  }

  ObtenerImagenesPorUsuario(id_usuario: number) {
    let p = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<Imagen[]>(this.url, p).pipe(
      tap(imagenes => {
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

    return this.http.post(this.url, formData).pipe(
      tap(response => console.log('Upload response:', response)),
      catchError(this.handleError)
    );
  }

  eliminarImagen(id_imagen: number) {
    let p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post<Imagen>(this.url, p);
  }

  ValidarImagen(id_imagen: number, estado: string) {
    let p = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado
    });
    return this.http.post<Imagen>(this.url, p);
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
