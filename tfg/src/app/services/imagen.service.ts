import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Imagen } from '../models/imagen';
import { JsonPipe } from '@angular/common';
import { Usuario } from '../models/usuario';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, retry } from 'rxjs/operators';

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

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
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

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p, { headers: this.getHeaders() }).pipe(
      retry(3),
      tap(imagenes => {
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  ListarImagenesAdmitidas() {
    let p = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p, { headers: this.getHeaders() }).pipe(
      retry(3),
      tap(imagenes => {
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  ObtenerImagenesPorUsuario(id_usuario: number) {
    let p = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p, { headers: this.getHeaders() }).pipe(
      retry(3),
      tap(imagenes => {
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            img.ruta = this.getImageUrl(img.ruta);
          }
        });
      }),
      catchError(this.handleError)
    );
  }

  uploadImage(file: File, id_usuario: number, titulo: string): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('titulo', titulo);
    formData.append('accion', 'SubirImagen');

    console.log('Uploading image with data:', {
      id_usuario,
      titulo,
      fileName: file.name,
      fileSize: file.size,
      url: `${this.url}/servicios.php`
    });

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    });

    return this.http.post(`${this.url}/servicios.php`, formData, {
      headers: headers,
      reportProgress: true,
      observe: 'events',
      withCredentials: false
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log('Upload progress:', event);
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete:', event);
        }
      }),
      catchError(error => {
        console.error('Upload error:', error);
        return this.handleError(error);
      })
    );
  }

  eliminarImagen(id_imagen: number) {
    let p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post<Imagen>(`${this.url}/servicios.php`, p, { headers: this.getHeaders() }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  ValidarImagen(id_imagen: number, estado: string) {
    let p = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado
    });
    return this.http.post<Imagen>(`${this.url}/servicios.php`, p, { headers: this.getHeaders() }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Image service error:', error);
    let errorMessage = 'Ha ocurrido un error con la imagen.';

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error del cliente: ${error.error.message}`;
    } else if (error.status === 0) {
      // Error de conexión/CORS
      errorMessage = 'Error de conexión. Por favor, verifica tu conexión a internet o inténtalo más tarde.';
    } else if (error.status === 502) {
      // Bad Gateway
      errorMessage = 'El servidor no está disponible en este momento. Por favor, inténtalo más tarde.';
    } else {
      // Otros errores del servidor
      errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}
