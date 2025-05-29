import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Usuario } from '../models/usuario';
import { JsonPipe } from '@angular/common';
import { getActiveConsumer } from '@angular/core/primitives/signals';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private url: string = environment.url;

  constructor(private http: HttpClient) { }

  ListarUsuarios() {
    let p = JSON.stringify({ accion: 'ListarUsuarios' });
    return this.http.post<Usuario[]>(this.url, p);
  }

  ObtenerIdUsuario(id: number) {
    let p = JSON.stringify({
      accion: "ObtenerIdUsuario",
      id: id
    });
    return this.http.post<Usuario>(this.url, p);
  }

  InsertarUsuario(usuario: Usuario) {
    let p = JSON.parse(JSON.stringify(usuario));
    p.accion = 'InsertarUsuario';
    p.usuario = usuario;
    console.log(p);
    return this.http.post<Usuario[]>(this.url, JSON.stringify(p));
  }

  RegistrarUsuario(usuario: Usuario) {
    let p = JSON.parse(JSON.stringify(usuario));
    p.accion = 'RegistrarUsuario';
    p.usuario = usuario;
    console.log(p);
    return this.http.post<Usuario[]>(this.url, JSON.stringify(p));
  }

  EditarUsuario(usuario: Usuario) {
    let p = JSON.parse(JSON.stringify(usuario));
    p.accion = "EditarUsuario";
    p.usuyario = usuario;
    console.log(p);
    return this.http.post<Usuario[]>(this.url, JSON.stringify(p));
  }

  EliminarUsuario(id: number) {
    let p = JSON.stringify({
      accion: "BorrarUsuario",
      id: id,
      listado: 'OK'
    });
    return this.http.post<Usuario[]>(this.url, p);
  }

  login(email: string, password: string) {
    return this.http.post<any>(this.url, {
      accion: 'IniciarSesion',
      email,
      password
    });
  }

  SubirImagen(){
    
  }

}