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
  private url: string;
  private baseImagePath: string;
  private isProduction: boolean;

  constructor(private http: HttpClient) {
    this.isProduction = window.location.hostname !== 'localhost';
    
    if (this.isProduction) {
      this.url = 'https://proyecto-integrado.onrender.com/backend';
      this.baseImagePath = this.url;
    } else {
      this.url = 'http://localhost/Proyecto%20Integrado/backend';
      this.baseImagePath = 'http://localhost/Proyecto%20Integrado/backend';
    }

    console.log('ImagenService initialized:', {
      isProduction: this.isProduction,
      url: this.url,
      baseImagePath: this.baseImagePath
    });
  }

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      withCredentials: true
    };
  }

  getImageUrl(relativePath: string): string {
    if (!relativePath) {
      console.error('getImageUrl: Ruta vacía');
      return '';
    }
    
    console.log('getImageUrl - Ruta recibida:', relativePath);

    // Si ya es una URL completa, pero es una URL antigua, actualizarla
    if (relativePath.startsWith('http')) {
      const fileName = relativePath.split('image=').pop();
      if (fileName) {
        console.log('getImageUrl - Extrayendo nombre de archivo de URL antigua:', fileName);
        return this.constructImageUrl(fileName);
      }
      return relativePath;
    }

    // Extraer solo el nombre del archivo
    const fileName = relativePath.split('/').pop();
    if (!fileName) {
      console.error('getImageUrl - No se pudo extraer el nombre del archivo de:', relativePath);
      return '';
    }

    return this.constructImageUrl(fileName);
  }

  private constructImageUrl(fileName: string): string {
    // Construir la URL usando el endpoint de servir imágenes
    const fullUrl = `${this.baseImagePath}/servicios.php?image=${encodeURIComponent(fileName)}`;
    
    console.log('getImageUrl - URL generada:', {
      nombreArchivo: fileName,
      urlCompleta: fullUrl,
      baseImagePath: this.baseImagePath
    });

    return fullUrl;
  }

  ListarImagenes() {
    console.log('ListarImagenes - Iniciando petición');
    const data = {
      accion: "ListarImagenes"
    };
    
    return this.http.post<Imagen[]>(
      `${this.url}/servicios.php`,
      JSON.stringify(data),
      this.getHttpOptions()
    ).pipe(
      tap(imagenes => {
        console.log('ListarImagenes - Respuesta recibida:', imagenes);
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

    return this.http.post(
      `${this.url}/servicios.php`,
      formData,
      {
        reportProgress: true,
        observe: 'events',
        withCredentials: true
      }
    ).pipe(
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
          error: error.error
        });
        return throwError(() => error);
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
