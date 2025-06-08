import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { JsonPipe } from '@angular/common';
import { getActiveConsumer } from '@angular/core/primitives/signals';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Error en el servicio de usuario:', error);
    return throwError(() => error);
  }

  ListarUsuarios(): Observable<Usuario[]> {
    const body = JSON.stringify({ 
      accion: 'ListarUsuarios' 
    });
    return this.http.post<Usuario[]>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  ObtenerIdUsuario(id: number): Observable<Usuario> {
    const body = JSON.stringify({
      accion: "ObtenerIdUsuario",
      id: id
    });
    return this.http.post<Usuario>(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  InsertarUsuario(usuario: Usuario) {
    let p = JSON.parse(JSON.stringify(usuario));
    p.accion = 'InsertarUsuario';
    p.usuario = usuario;
    console.log(p);
    return this.http.post<Usuario[]>(this.url, JSON.stringify(p));
  }

  RegistrarUsuario(usuario: Usuario): Observable<any> {
    const body = JSON.stringify({
      accion: 'RegistrarUsuario',
      usuario: usuario
    });
    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  EditarUsuario(usuario: Usuario): Observable<any> {
    const body = JSON.stringify({
      accion: "EditarUsuario",
      usuario: usuario
    });
    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  EliminarUsuario(id: number): Observable<any> {
    const body = JSON.stringify({
      accion: "BorrarUsuario",
      id: id,
      listado: 'OK'
    });
    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }

  login(email: string, password: string): Observable<any> {
    const body = JSON.stringify({
      accion: 'IniciarSesion',
      email: email,
      password: password
    });
    return this.http.post(`${this.url}/servicios.php`, body, {
      headers: this.createHeaders()
    }).pipe(
      retry(3),
      catchError(this.handleError)
    );
  }
}