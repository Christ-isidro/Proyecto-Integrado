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
    if (!relativePath) {
      console.error('getImageUrl: Ruta vacía');
      return '';
    }
    
    console.log('getImageUrl - Ruta recibida:', relativePath);

    // Si ya es una URL completa, devolverla
    if (relativePath.startsWith('http')) {
      console.log('getImageUrl - URL completa detectada:', relativePath);
      return relativePath;
    }

    // Extraer solo el nombre del archivo
    const fileName = relativePath.split('/').pop();
    if (!fileName) {
      console.error('getImageUrl - No se pudo extraer el nombre del archivo de:', relativePath);
      return '';
    }

    // Construir la URL usando el endpoint de servir imágenes
    const fullUrl = `${this.baseImagePath}/servicios.php?image=${encodeURIComponent(fileName)}`;
    
    console.log('getImageUrl - URL generada:', {
      rutaOriginal: relativePath,
      nombreArchivo: fileName,
      urlCompleta: fullUrl,
      baseImagePath: this.baseImagePath
    });

    // Verificar que la URL es accesible
    fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          console.error('getImageUrl - Error al acceder a la imagen:', {
            status: response.status,
            statusText: response.statusText,
            url: fullUrl
          });
        }
      })
      .catch(error => {
        console.error('getImageUrl - Error de red al verificar la imagen:', error);
      });

    return fullUrl;
  }

  ListarImagenes() {
    console.log('ListarImagenes - Iniciando petición');
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p).pipe(
      tap(imagenes => {
        console.log('ListarImagenes - Respuesta recibida:', imagenes);
        // Transformar las URLs de las imágenes
        imagenes.forEach(img => {
          if (img.ruta) {
            console.log('ListarImagenes - Procesando imagen:', {
              rutaOriginal: img.ruta,
              urlGenerada: this.getImageUrl(img.ruta)
            });
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
    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, p).pipe(
      tap(imagenes => {
        console.log('ListarImagenesAdmitidas response:', imagenes);
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
      catchError(error => {
        console.error('Error detallado de subida:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error,
          url: error.url,
          headers: error.headers?.keys?.() || [],
          type: error.type
        });
        return this.handleError(error);
      })
    );
  }

  eliminarImagen(id_imagen: number) {
    let p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post<Imagen>(`${this.url}/servicios.php`, p);
  }

  ValidarImagen(id_imagen: number, estado: string) {
    let p = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado
    });
    return this.http.post<Imagen>(`${this.url}/servicios.php`, p);
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
