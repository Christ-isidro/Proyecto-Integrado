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
      console.warn('getImageUrl called with empty path');
      return '';
    }
    
    console.log('getImageUrl input:', relativePath);

    // Si ya es una URL completa, devolverla
    if (relativePath.startsWith('http')) {
      console.log('URL is already complete:', relativePath);
      return relativePath;
    }

    // Limpiar la ruta y obtener solo el nombre del archivo
    const fileName = relativePath
      .replace(/^\/+/, '')
      .replace(/\\/g, '/')
      .replace(/^(images|uploads)\//, '')
      .split('/')
      .pop();
    
    // Construir la URL usando el endpoint de servir imágenes
    const fullUrl = `${this.baseImagePath}/servicios.php?image=${fileName}`;
    
    console.log('Generated image URL:', {
      originalPath: relativePath,
      fileName: fileName,
      fullUrl: fullUrl,
      isProduction: this.isProduction
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

    console.log('Uploading image with data:', {
      id_usuario,
      titulo,
      fileName: file.name,
      fileSize: file.size
    });

    return this.http.post(`${this.url}/servicios.php`, formData, {
      reportProgress: true,
      observe: 'events',
      withCredentials: true,
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    }).pipe(
      tap(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round(100 * event.loaded / (event.total || event.loaded));
          console.log('Upload progress:', progress + '%');
        } else if (event.type === HttpEventType.Response) {
          console.log('Upload complete response:', event.body);
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
