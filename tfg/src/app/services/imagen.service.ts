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
  constructor(
    private http: HttpClient,
  ) { }

  ListarImagenes() {
    let p = JSON.stringify({
      accion: "ListarImagenes"
    });
    return this.http.post<Imagen[]>(this.url, p);
  }

  ListarImagenesAdmitidas() {
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

    const apiUrl = this.url;
    console.log('Uploading image to:', apiUrl);

    return this.http.post(`${apiUrl}/subir_imagen.php`, formData).pipe(
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
