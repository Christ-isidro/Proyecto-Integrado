import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Usuario } from '../models/usuario';
import { JsonPipe } from '@angular/common';
import { getActiveConsumer } from '@angular/core/primitives/signals';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private url: string = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private createHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  ListarUsuarios() {
    const p = JSON.stringify({ accion: 'ListarUsuarios' });
    return this.http.post<Usuario[]>(`${this.url}/servicios.php`, p, {
      headers: this.createHeaders()
    });
  }

  ObtenerIdUsuario(id: number) {
    const p = JSON.stringify({
      accion: "ObtenerIdUsuario",
      id: id
    });
    return this.http.post<Usuario>(`${this.url}/servicios.php`, p, {
      headers: this.createHeaders()
    });
  }

  InsertarUsuario(usuario: Usuario) {
    const p = {
      accion: 'InsertarUsuario',
      usuario: usuario
    };
    return this.http.post<Usuario[]>(`${this.url}/servicios.php`, JSON.stringify(p), {
      headers: this.createHeaders()
    });
  }

  RegistrarUsuario(usuario: Usuario) {
    const p = {
      accion: 'RegistrarUsuario',
      usuario: usuario
    };
    return this.http.post<Usuario[]>(`${this.url}/servicios.php`, JSON.stringify(p), {
      headers: this.createHeaders()
    });
  }

  EditarUsuario(usuario: Usuario) {
    const p = {
      accion: "EditarUsuario",
      usuario: usuario
    };
    return this.http.post<Usuario[]>(`${this.url}/servicios.php`, JSON.stringify(p), {
      headers: this.createHeaders()
    });
  }

  EliminarUsuario(id: number) {
    const p = JSON.stringify({
      accion: "BorrarUsuario",
      id: id,
      listado: 'OK'
    });
    return this.http.post<Usuario[]>(`${this.url}/servicios.php`, p, {
      headers: this.createHeaders()
    });
  }

  login(email: string, password: string): Observable<any> {
    const p = JSON.stringify({
      accion: 'IniciarSesion',
      usuario: {
        email: email,
        password: password
      }
    });
    
    console.log('Enviando petición de login:', p);
    
    return this.http.post<any>(`${this.url}/servicios.php`, p, {
      headers: this.createHeaders()
    }).pipe(
      tap(response => console.log('Respuesta del servidor:', response))
    );
  }
}