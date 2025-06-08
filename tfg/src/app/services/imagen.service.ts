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

  getImageUrl(base64String: string): string {
    // Si ya es una cadena base64 completa, devolverla tal cual
    if (base64String.startsWith('data:image/')) {
      return base64String;
    }
    // Si por alguna razón no es base64, devolver una imagen por defecto
    return 'assets/images/default.png';
  }

  ListarImagenes(): Observable<Imagen[]> {
    const body = JSON.stringify({
      accion: "ListarImagenes"
    });

    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  ListarImagenesAdmitidas(): Observable<Imagen[]> {
    const body = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });

    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  ObtenerImagenesPorUsuario(id_usuario: number): Observable<Imagen[]> {
    const body = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });

    return this.http.post<Imagen[]>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
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
