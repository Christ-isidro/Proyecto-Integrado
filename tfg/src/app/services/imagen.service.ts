import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Imagen } from '../models/imagen';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ImagenService {
  private url: string = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {
    console.log('ImagenService initialized with URL:', this.url);
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en el servicio de imágenes:', {
      error: error.error,
      status: error.status,
      message: error.message
    });
    return throwError(() => error);
  }

  ListarImagenes(): Observable<Imagen[]> {
    console.log('Solicitando lista de imágenes a:', this.url);
    const p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(this.url, p).pipe(
      catchError(this.handleError)
    );
  }

  ListarImagenesAdmitidas(): Observable<Imagen[]> {
    console.log('Solicitando imágenes admitidas a:', this.url);
    const p = JSON.stringify({
      accion: "ListarImagenesAdmitidas"
    });
    return this.http.post<Imagen[]>(this.url, p).pipe(
      catchError(this.handleError)
    );
  }

  ObtenerImagenesPorUsuario(id_usuario: number): Observable<Imagen[]> {
    console.log('Solicitando imágenes del usuario:', id_usuario);
    const p = JSON.stringify({
      accion: "ObtenerImagenesPorUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<Imagen[]>(this.url, p).pipe(
      catchError(this.handleError)
    );
  }

  uploadImage(file: File, id_usuario: number, titulo: string): Observable<any> {
    console.log('Iniciando subida de imagen:', {
      url: this.url,
      id_usuario,
      titulo,
      fileName: file.name,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      fileType: file.type
    });

    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('id_usuario', id_usuario.toString());
    formData.append('titulo', titulo);
    formData.append('accion', 'SubirImagen');

    return this.http.post(this.url, formData).pipe(
      catchError(this.handleError)
    );
  }

  eliminarImagen(id_imagen: number): Observable<any> {
    const p = JSON.stringify({
      accion: "BorrarImagen",
      id_imagen: id_imagen
    });
    return this.http.post(this.url, p).pipe(
      catchError(this.handleError)
    );
  }

  ValidarImagen(id_imagen: number, estado: string): Observable<Imagen> {
    const p = JSON.stringify({
      accion: "ValidarImagen",
      id_imagen: id_imagen,
      estado: estado
    });
    return this.http.post<Imagen>(this.url, p).pipe(
      catchError(this.handleError)
    );
  }

  votarImagen(id_imagen: number, id_usuario: number): Observable<{success: boolean, message: string}> {
    const p = JSON.stringify({
      accion: "VotarImagen",
      id_imagen: id_imagen,
      id_usuario: id_usuario
    });
    return this.http.post<{success: boolean, message: string}>(this.url, p).pipe(
      catchError(this.handleError)
    );
  }

  obtenerVotosUsuario(id_usuario: number): Observable<number[]> {
    const p = JSON.stringify({
      accion: "ObtenerVotosUsuario",
      id_usuario: id_usuario
    });
    return this.http.post<number[]>(this.url, p).pipe(
      catchError(this.handleError)
    );
  }
}
